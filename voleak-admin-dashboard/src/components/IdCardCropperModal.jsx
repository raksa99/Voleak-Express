import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Crop, Check, RotateCcw, ZoomIn, ZoomOut, Sparkles } from 'lucide-react';
import { ID_CARD_ASPECT_RATIO, cropImageWithRect } from '../lib/idCardProcessor';

export default function IdCardCropperModal({
  isOpen,
  onClose,
  originalImage,
  initialCropRect,
  onApplyCrop,
}) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // Crop box in percentage of displayed image [0..100]
  const [cropBox, setCropBox] = useState({ x: 10, y: 15, width: 80, height: 80 / ID_CARD_ASPECT_RATIO });
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState(null); // 'move' | 'se' | 'sw' | 'ne' | 'nw'
  const [dragStart, setDragStart] = useState({ mouseX: 0, mouseY: 0, box: null });
  const [imgNaturalSize, setImgNaturalSize] = useState({ width: 0, height: 0 });

  // Initialize crop rect from initialCropRect or default center 1.586 box
  const initCropBox = useCallback((natW, natH) => {
    if (!natW || !natH) return;
    if (initialCropRect && initialCropRect.width > 0) {
      setCropBox({
        x: (initialCropRect.x / natW) * 100,
        y: (initialCropRect.y / natH) * 100,
        width: (initialCropRect.width / natW) * 100,
        height: (initialCropRect.height / natH) * 100,
      });
    } else {
      // Center ID-1 box
      const targetAspect = ID_CARD_ASPECT_RATIO;
      const imgAspect = natW / natH;
      let wPercent = 80;
      let hPercent = (wPercent * imgAspect) / targetAspect;
      if (hPercent > 85) {
        hPercent = 80;
        wPercent = (hPercent * targetAspect) / imgAspect;
      }
      setCropBox({
        x: (100 - wPercent) / 2,
        y: (100 - hPercent) / 2,
        width: wPercent,
        height: hPercent,
      });
    }
  }, [initialCropRect]);

  const handleImageLoad = (e) => {
    const natW = e.target.naturalWidth;
    const natH = e.target.naturalHeight;
    setImgNaturalSize({ width: natW, height: natH });
    initCropBox(natW, natH);
  };

  // Dragging & Resizing logic
  const handleMouseDown = (e, handleType) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragHandle(handleType);
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      box: { ...cropBox },
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const deltaXPercent = ((e.clientX - dragStart.mouseX) / rect.width) * 100;
    const deltaYPercent = ((e.clientY - dragStart.mouseY) / rect.height) * 100;

    const imgAspect = (imgNaturalSize.width || rect.width) / (imgNaturalSize.height || rect.height);
    const box = dragStart.box;

    if (dragHandle === 'move') {
      let newX = Math.max(0, Math.min(100 - box.width, box.x + deltaXPercent));
      let newY = Math.max(0, Math.min(100 - box.height, box.y + deltaYPercent));
      setCropBox((prev) => ({ ...prev, x: newX, y: newY }));
    } else if (dragHandle === 'se') {
      let newWidth = Math.max(20, Math.min(100 - box.x, box.width + deltaXPercent));
      let newHeight = (newWidth * imgAspect) / ID_CARD_ASPECT_RATIO;
      if (box.y + newHeight <= 100) {
        setCropBox((prev) => ({ ...prev, width: newWidth, height: newHeight }));
      }
    } else if (dragHandle === 'sw') {
      let newWidth = Math.max(20, Math.min(box.x + box.width, box.width - deltaXPercent));
      let newHeight = (newWidth * imgAspect) / ID_CARD_ASPECT_RATIO;
      let newX = box.x + (box.width - newWidth);
      if (newX >= 0 && box.y + newHeight <= 100) {
        setCropBox({ x: newX, y: box.y, width: newWidth, height: newHeight });
      }
    } else if (dragHandle === 'ne') {
      let newWidth = Math.max(20, Math.min(100 - box.x, box.width + deltaXPercent));
      let newHeight = (newWidth * imgAspect) / ID_CARD_ASPECT_RATIO;
      let newY = box.y + (box.height - newHeight);
      if (newY >= 0) {
        setCropBox({ x: box.x, y: newY, width: newWidth, height: newHeight });
      }
    } else if (dragHandle === 'nw') {
      let newWidth = Math.max(20, Math.min(box.x + box.width, box.width - deltaXPercent));
      let newHeight = (newWidth * imgAspect) / ID_CARD_ASPECT_RATIO;
      let newX = box.x + (box.width - newWidth);
      let newY = box.y + (box.height - newHeight);
      if (newX >= 0 && newY >= 0) {
        setCropBox({ x: newX, y: newY, width: newWidth, height: newHeight });
      }
    }
  }, [isDragging, dragHandle, dragStart, imgNaturalSize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragHandle(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleSave = async () => {
    if (!imgNaturalSize.width || !imgNaturalSize.height) return;
    const pixelRect = {
      x: Math.round((cropBox.x / 100) * imgNaturalSize.width),
      y: Math.round((cropBox.y / 100) * imgNaturalSize.height),
      width: Math.round((cropBox.width / 100) * imgNaturalSize.width),
      height: Math.round((cropBox.height / 100) * imgNaturalSize.height),
    };

    const cropped = await cropImageWithRect(originalImage, pixelRect);
    onApplyCrop(cropped, pixelRect);
    onClose();
  };

  const handleReset = () => {
    initCropBox(imgNaturalSize.width, imgNaturalSize.height);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Adjust ID Card Crop Area
              </h3>
              <p className="text-[11px] text-slate-400">
                Drag and align the box around the Cambodian National ID Card (1.58:1 ratio)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Viewport */}
        <div
          ref={containerRef}
          className="relative bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center select-none border border-slate-800 max-h-[60vh]"
        >
          <div className="relative inline-block">
            <img
              ref={imgRef}
              src={originalImage}
              alt="Card to crop"
              onLoad={handleImageLoad}
              className="max-h-[55vh] w-auto object-contain block opacity-85"
              draggable={false}
            />

            {/* Dark Mask around crop box */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at center, transparent 0%, rgba(15, 23, 42, 0.75) 100%)`,
              }}
            />

            {/* Crop Boundary Box */}
            <div
              onMouseDown={(e) => handleMouseDown(e, 'move')}
              className="absolute border-2 border-sky-400 rounded-lg shadow-2xl cursor-move group transition-all"
              style={{
                left: `${cropBox.x}%`,
                top: `${cropBox.y}%`,
                width: `${cropBox.width}%`,
                height: `${cropBox.height}%`,
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.65)',
              }}
            >
              {/* Aspect Ratio Label */}
              <div className="absolute -top-7 left-1 px-2 py-0.5 rounded-md bg-sky-500 text-white font-mono text-[10px] font-bold shadow-sm pointer-events-none flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>ID Card (1.58 : 1)</span>
              </div>

              {/* Grid Guides */}
              <div className="w-full h-full grid grid-cols-3 grid-rows-3 pointer-events-none opacity-30">
                <div className="border-r border-b border-white/50" />
                <div className="border-r border-b border-white/50" />
                <div className="border-b border-white/50" />
                <div className="border-r border-b border-white/50" />
                <div className="border-r border-b border-white/50" />
                <div className="border-b border-white/50" />
                <div className="border-r border-white/50" />
                <div className="border-r border-white/50" />
                <div />
              </div>

              {/* Resize Corner Handles (All 4 Corners) */}
              <div
                onMouseDown={(e) => handleMouseDown(e, 'nw')}
                className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-sky-500 rounded-xs cursor-nwse-resize shadow-md hover:scale-110 z-10"
              />
              <div
                onMouseDown={(e) => handleMouseDown(e, 'ne')}
                className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-sky-500 rounded-xs cursor-nesw-resize shadow-md hover:scale-110 z-10"
              />
              <div
                onMouseDown={(e) => handleMouseDown(e, 'sw')}
                className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-sky-500 rounded-xs cursor-nesw-resize shadow-md hover:scale-110 z-10"
              />
              <div
                onMouseDown={(e) => handleMouseDown(e, 'se')}
                className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-sky-500 rounded-xs cursor-nwse-resize shadow-md hover:scale-110 z-10"
              />
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Crop
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-500 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all"
            >
              <Check className="w-4 h-4" />
              Apply Crop & Scan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
