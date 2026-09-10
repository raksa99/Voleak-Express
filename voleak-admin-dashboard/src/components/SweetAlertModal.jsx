import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, CheckCircle2, X, Sparkles } from 'lucide-react';

export default function SweetAlertModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  text = "You won't be able to revert this deletion!",
  confirmButtonText = 'Yes, delete it!',
  cancelButtonText = 'Cancel',
  itemName = '',
  itemSubtext = '',
  itemAvatar = '',
  iconType = 'warning', // 'warning' | 'danger' | 'info'
}) {
  const [status, setStatus] = useState('confirm'); // 'confirm' | 'deleting' | 'success'

  const handleConfirm = async () => {
    setStatus('deleting');
    try {
      if (onConfirm) {
        await onConfirm();
      }
      setStatus('success');
      setTimeout(() => {
        setStatus('confirm');
        onClose();
      }, 1600);
    } catch (err) {
      console.error(err);
      setStatus('confirm');
    }
  };

  const handleCancel = () => {
    if (status === 'deleting') return;
    setStatus('confirm');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop with Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCancel}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-all"
        />

        {/* Modal Dialog with SweetAlert Spring Bounce */}
        <motion.div
          initial={{ scale: 0.75, opacity: 0, y: 20 }}
          animate={{
            scale: [0.75, 1.03, 1],
            opacity: 1,
            y: 0,
            transition: { type: 'spring', damping: 20, stiffness: 350 },
          }}
          exit={{ scale: 0.8, opacity: 0, y: 20, transition: { duration: 0.15 } }}
          className="relative z-10 w-full max-w-md p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-center"
        >
          {/* Top Ambient Glow */}
          <div
            className={`absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
              status === 'success' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
            }`}
          />

          {status === 'confirm' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* SweetAlert Animated Warning Icon */}
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                {/* Expanding Shockwave Ring */}
                <motion.div
                  animate={{
                    scale: [1, 1.25, 1],
                    opacity: [0.8, 0.2, 0.8],
                  }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-full border-4 border-rose-500/30"
                />

                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500/20 to-orange-500/20 border-2 border-rose-500/40 text-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/25">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <Trash2 className="w-8 h-8 text-rose-500 stroke-[2.2]" />
                  </motion.div>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {text}
                </p>
              </div>

              {/* Target Item Card */}
              {itemName && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3 text-left">
                  {itemAvatar ? (
                    <img
                      src={itemAvatar}
                      alt={itemName}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-rose-500/30 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-500 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-md shadow-rose-500/20">
                      {itemName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="overflow-hidden flex-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {itemName}
                    </h4>
                    {itemSubtext && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {itemSubtext}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all border border-slate-200 dark:border-slate-700"
                >
                  {cancelButtonText}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white font-extrabold text-xs shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{confirmButtonText}</span>
                </button>
              </div>
            </motion.div>
          )}

          {status === 'deleting' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 space-y-4"
            >
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-rose-500"
                />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Deleting Record...
              </h4>
              <p className="text-xs text-slate-400">
                Removing data permanently from database
              </p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: [0.8, 1.08, 1],
                transition: { type: 'spring', damping: 15 },
              }}
              className="py-6 space-y-4"
            >
              {/* SweetAlert Animated Checkmark */}
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.4 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 ring-4 ring-emerald-500/20"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 400 }}
                  >
                    <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                  </motion.div>
                </motion.div>
              </div>

              <div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white">
                  Deleted Successfully!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  The user has been deleted from the directory.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
