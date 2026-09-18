import { createWorker } from 'tesseract.js';

// Standard ISO/IEC 7810 ID-1 Aspect Ratio (85.60mm x 53.98mm)
export const ID_CARD_ASPECT_RATIO = 1.586;

/**
 * Loads an image from a DataURL, Blob, or URL into an HTMLImageElement.
 */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image: ' + err));
    img.src = src;
  });
}

/**
 * Converts a File or Blob into a base64 Data URL.
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Automatically detects the bounding box of a rectangular ID card in an image
 * and crops it to the standard ID-1 card aspect ratio (1.586:1).
 *
 * @param {string} originalDataUrl - The base64 data URL of the original photo.
 * @returns {Promise<{ croppedDataUrl: string, originalDataUrl: string, cropRect: {x:number, y:number, width:number, height:number}, isCropped: boolean }>}
 */
export async function autoDetectAndCropCard(originalDataUrl) {
  const img = await loadImage(originalDataUrl);
  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  // Analysis scale: 800px max dimension provides fine edge resolution while remaining fast
  const maxDim = 800;
  const scale = Math.min(1, maxDim / Math.max(origW, origH));
  const dw = Math.round(origW * scale);
  const dh = Math.round(origH * scale);

  const canvas = document.createElement('canvas');
  canvas.width = dw;
  canvas.height = dh;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, dw, dh);

  const imgData = ctx.getImageData(0, 0, dw, dh);
  const data = imgData.data;

  const gray = new Float32Array(dw * dh);
  const mask = new Uint8Array(dw * dh);
  const gy = new Float32Array(dw * dh);
  const gx = new Float32Array(dw * dh);

  // 1. Color and Chroma Segmentation
  // Cambodian National ID cards are pale green/cyan/beige plastic documents.
  // In contrast, laptop aluminum and paper are neutral gray (|r - b| < 6),
  // and keyboards/wallets/desks are dark or have distinct characteristics.
  for (let y = 0; y < dh; y++) {
    const yOff = y * dw;
    for (let x = 0; x < dw; x++) {
      const idx = (yOff + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      gray[yOff + x] = lum;

      // Card plastic chroma: warm/greenish hue relative to blue channel
      const isWarmPlastic = (r >= 115 || g >= 115) && (r - b >= 9) && (g - b >= 7);
      if (isWarmPlastic) {
        mask[yOff + x] = 1;
      }
    }
  }

  // 2. Compute Sobel Gradients (gy for horizontal edges, gx for vertical edges)
  for (let y = 1; y < dh - 1; y++) {
    const yOff = y * dw;
    for (let x = 1; x < dw - 1; x++) {
      const idx = yOff + x;
      gy[idx] = Math.abs(gray[idx + dw] - gray[idx - dw]);
      gx[idx] = Math.abs(gray[idx + 1] - gray[idx - 1]);
    }
  }

  // 3. Horizontal Continuous Card Run Analysis
  // Measures contiguous runs of card plastic across each row, allowing small gaps for text/photos
  const maxGap = Math.round(dw * 0.08);
  const rowRuns = new Int32Array(dh);
  for (let y = 0; y < dh; y++) {
    let maxRun = 0, curRun = 0, gap = 0;
    const yOff = y * dw;
    for (let x = 0; x < dw; x++) {
      if (mask[yOff + x] === 1) {
        curRun += 1 + gap;
        gap = 0;
      } else {
        gap++;
        if (gap > maxGap) {
          if (curRun > maxRun) maxRun = curRun;
          curRun = 0;
          gap = 0;
        }
      }
    }
    if (curRun > maxRun) maxRun = curRun;
    rowRuns[y] = maxRun;
  }

  // Find contiguous vertical spans with significant card presence (run >= 22% of image width)
  const minCardWidth = Math.round(dw * 0.22);
  let cardY1 = -1, cardY2 = -1;
  let maxSpanLen = 0;
  let curY1 = -1;

  for (let y = 0; y < dh; y++) {
    if (rowRuns[y] >= minCardWidth) {
      if (curY1 === -1) curY1 = y;
    } else {
      if (curY1 !== -1) {
        const len = y - curY1;
        if (len > maxSpanLen && len >= dh * 0.10) {
          maxSpanLen = len;
          cardY1 = curY1;
          cardY2 = y - 1;
        }
        curY1 = -1;
      }
    }
  }
  if (curY1 !== -1 && (dh - curY1) > maxSpanLen && (dh - curY1) >= dh * 0.10) {
    cardY1 = curY1;
    cardY2 = dh - 1;
  }

  let leftX = -1, rightX = -1;

  // Refine card boundaries if detected via chroma
  if (cardY1 !== -1 && cardY2 !== -1) {
    // Refine top edge using horizontal gradient peak (gy) near cardY1
    let bestY1 = cardY1;
    let maxGY1 = -1;
    for (let y = Math.max(1, cardY1 - 8); y <= Math.min(dh - 2, cardY1 + 8); y++) {
      let sum = 0;
      for (let x = 0; x < dw; x++) sum += gy[y * dw + x];
      if (sum > maxGY1) { maxGY1 = sum; bestY1 = y; }
    }
    cardY1 = bestY1;

    // Refine bottom edge using horizontal gradient peak (gy) near cardY2
    let bestY2 = cardY2;
    let maxGY2 = -1;
    for (let y = Math.max(1, cardY2 - 8); y <= Math.min(dh - 2, cardY2 + 8); y++) {
      let sum = 0;
      for (let x = 0; x < dw; x++) sum += gy[y * dw + x];
      if (sum > maxGY2) { maxGY2 = sum; bestY2 = y; }
    }
    cardY2 = bestY2;

    // Horizontal bounds within the vertical card band
    const colHits = new Int32Array(dw);
    const spanH = cardY2 - cardY1 + 1;
    for (let y = cardY1; y <= cardY2; y++) {
      const yOff = y * dw;
      for (let x = 0; x < dw; x++) {
        if (mask[yOff + x] === 1) colHits[x]++;
      }
    }

    const minHits = spanH * 0.30;
    for (let x = 0; x < dw; x++) {
      if (colHits[x] >= minHits) {
        if (leftX === -1) leftX = x;
        rightX = x;
      }
    }

    // Refine left edge with vertical gradient peak (gx)
    let bestLeft = leftX;
    let maxGX1 = -1;
    for (let x = Math.max(1, leftX - 8); x <= Math.min(dw - 2, leftX + 8); x++) {
      let sum = 0;
      for (let y = cardY1; y <= cardY2; y++) sum += gx[y * dw + x];
      if (sum > maxGX1) { maxGX1 = sum; bestLeft = x; }
    }
    leftX = bestLeft;

    // Refine right edge with vertical gradient peak (gx)
    let bestRight = rightX;
    let maxGX2 = -1;
    for (let x = Math.max(1, rightX - 8); x <= Math.min(dw - 2, rightX + 8); x++) {
      let sum = 0;
      for (let y = cardY1; y <= cardY2; y++) sum += gx[y * dw + x];
      if (sum > maxGX2) { maxGX2 = sum; bestRight = x; }
    }
    rightX = bestRight;
  }

  // 4. Fallback: Edge Gradient Density if chroma segmentation was insufficient
  if (cardY1 === -1 || cardY2 === -1 || leftX === -1 || rightX === -1 || (rightX - leftX) < dw * 0.18) {
    const rowEnergy = new Float32Array(dh);
    const colEnergy = new Float32Array(dw);
    for (let y = 1; y < dh - 1; y++) {
      const yOff = y * dw;
      for (let x = 1; x < dw - 1; x++) {
        const e = gy[yOff + x] + gx[yOff + x];
        if (e > 25) {
          rowEnergy[y] += e;
          colEnergy[x] += e;
        }
      }
    }

    const yMargin = Math.floor(dh * 0.05);
    const xMargin = Math.floor(dw * 0.05);

    let topCand = yMargin;
    for (let y = yMargin; y < dh * 0.45; y++) {
      if (rowEnergy[y] > 150) { topCand = y; break; }
    }
    let botCand = dh - yMargin;
    for (let y = dh - yMargin; y > dh * 0.55; y--) {
      if (rowEnergy[y] > 150) { botCand = y; break; }
    }
    let leftCand = xMargin;
    for (let x = xMargin; x < dw * 0.45; x++) {
      if (colEnergy[x] > 150) { leftCand = x; break; }
    }
    let rightCand = dw - xMargin;
    for (let x = dw - xMargin; x > dw * 0.55; x--) {
      if (colEnergy[x] > 150) { rightCand = x; break; }
    }

    cardY1 = topCand;
    cardY2 = botCand;
    leftX = leftCand;
    rightX = rightCand;
  }

  // Convert detected coordinates back to original high-res scale
  const origLeft = Math.round(leftX / scale);
  const origRight = Math.round(rightX / scale);
  const origTop = Math.round(cardY1 / scale);
  const origBot = Math.round(cardY2 / scale);

  const rawW = Math.max(50, origRight - origLeft);
  const rawH = Math.max(30, origBot - origTop);
  const centerX = (origLeft + origRight) / 2;
  const centerY = (origTop + origBot) / 2;

  // Fit tightly to ISO/IEC 7810 ID-1 card aspect ratio (1.586 : 1)
  let cropW, cropH;
  if (rawW / rawH > ID_CARD_ASPECT_RATIO) {
    cropW = rawW;
    cropH = Math.round(cropW / ID_CARD_ASPECT_RATIO);
  } else {
    cropH = rawH;
    cropW = Math.round(cropH * ID_CARD_ASPECT_RATIO);
  }

  // Tight micro-margin (0.5%) ensures card's rounded corners are preserved without extra background
  const padW = Math.round(cropW * 0.005);
  const padH = Math.round(cropH * 0.005);
  cropW += padW * 2;
  cropH += padH * 2;

  let cropX = Math.round(centerX - cropW / 2);
  let cropY = Math.round(centerY - cropH / 2);

  // Strictly clamp inside original image boundaries
  cropX = Math.max(0, Math.min(cropX, origW - cropW));
  cropY = Math.max(0, Math.min(cropY, origH - cropH));
  cropW = Math.max(50, Math.min(cropW, origW - cropX));
  cropH = Math.max(30, Math.min(cropH, origH - cropY));

  // Perform High-Quality Crop onto Output Canvas
  const outCanvas = document.createElement('canvas');
  outCanvas.width = cropW;
  outCanvas.height = cropH;
  const outCtx = outCanvas.getContext('2d');
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = 'high';
  outCtx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  const croppedDataUrl = outCanvas.toDataURL('image/jpeg', 0.95);

  return {
    croppedDataUrl,
    originalDataUrl,
    cropRect: { x: cropX, y: cropY, width: cropW, height: cropH },
    isCropped: true,
  };
}

/**
 * Crops an image with explicit crop coordinates.
 */
export async function cropImageWithRect(originalDataUrl, rect) {
  const img = await loadImage(originalDataUrl);
  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  const cropX = Math.max(0, Math.min(rect.x, origW - 10));
  const cropY = Math.max(0, Math.min(rect.y, origH - 10));
  const cropW = Math.max(10, Math.min(rect.width, origW - cropX));
  const cropH = Math.max(10, Math.min(rect.height, origH - cropY));

  const outCanvas = document.createElement('canvas');
  outCanvas.width = cropW;
  outCanvas.height = cropH;
  const outCtx = outCanvas.getContext('2d');
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = 'high';
  outCtx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  return outCanvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Pre-processes an image for optimal OCR accuracy.
 * Enhances contrast, sharpens edges, and extracts MRZ slice if requested.
 */
function prepareCanvasForOcr(img, sliceBottomFraction = 0) {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;

  let startY = 0;
  let targetH = h;

  if (sliceBottomFraction > 0 && sliceBottomFraction < 1) {
    startY = Math.floor(h * (1 - sliceBottomFraction));
    targetH = h - startY;
  }

  // Scale up if resolution is low for better character segmentation
  const scale = targetH < 300 ? 2 : 1;
  const outW = w * scale;
  const outH = targetH * scale;

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, startY, w, targetH, 0, 0, outW, outH);

  // Apply contrast boost and binarization
  const imgData = ctx.getImageData(0, 0, outW, outH);
  const data = imgData.data;

  // Calculate average brightness
  let sumLum = 0;
  for (let i = 0; i < data.length; i += 4) {
    sumLum += (data[i] + data[i + 1] + data[i + 2]) / 3;
  }
  const avgLum = sumLum / (data.length / 4);

  // Contrast stretch
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // High contrast thresholding around average
    const factor = 1.4;
    let adjusted = (lum - avgLum) * factor + avgLum;
    adjusted = Math.max(0, Math.min(255, adjusted));

    data[i] = adjusted;
    data[i + 1] = adjusted;
    data[i + 2] = adjusted;
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Extracts the Cambodian National ID number from OCR raw text.
 * Recognizes:
 * 1. Biometric MRZ Line 1: `I<KHM010082573...` or `IDKHM010082573...`
 * 2. Labeled text: `ID: 010082573` or `No: 010082573` or `លេខ...`
 * 3. Standard Cambodian 9-digit format starting with `0`: `0[0-9]{8}`
 * 4. General 9-10 digit numbers
 */
export function extractCambodianIdDetails(text) {
  if (!text) return { idNumber: null, fullName: null, source: null };

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  let detectedId = null;
  let source = null;
  let detectedName = null;

  // 1. Check for MRZ (Machine Readable Zone)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // MRZ Line 1 pattern (e.g. IDKHM0909427597<<<<<, I<KHM090942759..., etc.)
    const mrzMatch = line.match(/(?:I[<D\sB]?[D\sB]?K[HMNE\s]{1,3}|IDKHM|1[<D\s]KHM)\s*([0-9OIlSB]{9})/i);
    if (mrzMatch) {
      let num = mrzMatch[1]
        .replace(/O/gi, '0')
        .replace(/[Il]/g, '1')
        .replace(/S/gi, '5')
        .replace(/B/g, '8');

      if (/^\d{9}$/.test(num)) {
        detectedId = num;
        source = 'MRZ Zone (Biometric Smart Card)';
      }
    }

    // MRZ Line 3 pattern (e.g. EM<<RAKSA<<<<<<<<<<<<<<<<<<<)
    if (line.includes('<<') && /[A-Z]{2,}/.test(line)) {
      const parts = line.split('<<').map((p) => p.replace(/<+/g, ' ').replace(/[^A-Za-z\s]/g, '').trim()).filter(Boolean);
      if (parts.length >= 2) {
        const p1 = parts[0].split(/\s+/)[0];
        const p2 = parts[1].split(/\s+/)[0];
        if (p1 && p2) detectedName = `${p1} ${p2}`.trim();
      } else if (parts.length === 1 && parts[0].length > 2) {
        detectedName = parts[0].replace(/<+/g, ' ').trim();
      }
    }
  }

  // 2. Check for standard Cambodian 9-digit ID starting with 0 (All Cambodian National IDs start with 0)
  if (!detectedId) {
    const cambodian9Match = text.match(/(?:^|\D)(0[0-9]{8})(?:\D|$)/);
    if (cambodian9Match) {
      detectedId = cambodian9Match[1];
      source = 'Card Printed ID Number';
    }
  }

  // 3. Check for labeled text (e.g. No: 010082573, ID: 010082573, លេខ: 010082573)
  if (!detectedId) {
    const labelMatch = text.match(/(?:No|Card|ID|លេខ|អត្តសញ្ញាណប័ណ្ណ)\D*([0-9OIlSB]{9,10})/i);
    if (labelMatch) {
      let num = labelMatch[1]
        .replace(/O/gi, '0')
        .replace(/[Il]/g, '1')
        .replace(/S/gi, '5')
        .replace(/B/g, '8');
      if (/^\d{9,10}$/.test(num)) {
        detectedId = num;
        source = 'Card Printed Field';
      }
    }
  }

  // 4. Any clean 9-10 digit sequence
  if (!detectedId) {
    const generalMatch = text.match(/\b([0-9]{9,10})\b/);
    if (generalMatch) {
      detectedId = generalMatch[1];
      source = 'Extracted ID Digits';
    }
  }

  return {
    idNumber: detectedId,
    fullName: detectedName,
    source,
  };
}

/**
 * Runs OCR on a Cambodian National ID card image using Tesseract.js.
 * Automatically scans both the bottom MRZ section (highest precision) and the full card.
 *
 * @param {string} imageDataUrl - Base64 DataURL of the card.
 * @param {Function} [onProgress] - Optional callback for OCR progress updates.
 * @returns {Promise<{ success: boolean, idNumber: string|null, fullName: string|null, rawText: string, source: string|null }>}
 */
export async function detectNationalIdNumber(imageDataUrl, onProgress) {
  let worker = null;
  try {
    if (onProgress) onProgress({ status: 'initializing', progress: 0.1, message: 'Initializing OCR Engine...' });

    worker = await createWorker('eng');
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<:.-/ ',
    });

    const img = await loadImage(imageDataUrl);

    // Pass 1: Scan bottom 38% (The MRZ zone, highest accuracy for biometric Cambodian IDs)
    if (onProgress) onProgress({ status: 'scanning_mrz', progress: 0.35, message: 'Reading Biometric MRZ Line...' });
    const mrzCanvas = prepareCanvasForOcr(img, 0.38);
    const mrzResult = await worker.recognize(mrzCanvas);

    let extracted = extractCambodianIdDetails(mrzResult.data.text);
    if (extracted.idNumber) {
      if (onProgress) onProgress({ status: 'done', progress: 1.0, message: 'ID Number Detected!' });
      return {
        success: true,
        idNumber: extracted.idNumber,
        fullName: extracted.fullName,
        rawText: mrzResult.data.text,
        source: extracted.source,
      };
    }

    // Pass 2: Scan full card if MRZ was not found
    if (onProgress) onProgress({ status: 'scanning_full', progress: 0.7, message: 'Scanning Card Text...' });
    const fullCanvas = prepareCanvasForOcr(img, 0);
    const fullResult = await worker.recognize(fullCanvas);

    extracted = extractCambodianIdDetails(fullResult.data.text);
    if (extracted.idNumber) {
      if (onProgress) onProgress({ status: 'done', progress: 1.0, message: 'ID Number Detected!' });
      return {
        success: true,
        idNumber: extracted.idNumber,
        fullName: extracted.fullName,
        rawText: fullResult.data.text,
        source: extracted.source,
      };
    }

    if (onProgress) onProgress({ status: 'completed_no_id', progress: 1.0, message: 'Scanning Complete' });
    return {
      success: false,
      idNumber: null,
      fullName: extracted.fullName,
      rawText: (mrzResult.data.text || '') + '\n' + (fullResult.data.text || ''),
      source: null,
    };
  } catch (err) {
    console.error('[ID Card OCR Error]', err);
    return {
      success: false,
      idNumber: null,
      fullName: null,
      rawText: '',
      error: err.message,
    };
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch (termErr) {
        console.warn('[Worker Terminate Warn]', termErr);
      }
    }
  }
}
