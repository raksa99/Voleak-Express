import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuthRole } from '../context/AuthRoleContext';
import { resolveDispute } from '../lib/supabaseClient';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Camera,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DisputesView({ disputes = [], setDisputes, products = [], users = [] }) {
  const { t } = useLanguage();
  const { isManager, selectedBranchId, currentUser } = useAuthRole();
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState(null);

  // Scoped disputes
  const scopedDisputes = isManager
    ? disputes.filter((d) => d.branch_id === selectedBranchId)
    : disputes;

  const handleResolve = (disputeId, action) => {
    resolveDispute(disputeId, action, currentUser.name);
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === disputeId
          ? {
              ...d,
              status: action === 'accept' ? 'resolved_accepted' : 'resolved_rejected',
              resolved_at: new Date().toISOString(),
            }
          : d
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          <span>{t('disputesTitle')}</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {t('disputesSubtitle')}
        </p>
      </div>

      {/* Disputes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scopedDisputes.length === 0 ? (
          <div className="col-span-2 p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-semibold">No active delivery discrepancies or open disputes.</p>
          </div>
        ) : (
          scopedDisputes.map((dsp) => {
            const prod = products.find((p) => p.id === dsp.product_id) || { name: 'Item' };
            const coop = users.find((u) => u.id === dsp.cooperator_id) || { full_name: 'Cooperator Shop' };
            const isOpen = dsp.status === 'open';

            return (
              <div
                key={dsp.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 hover:border-rose-500/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">
                      DSP
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{dsp.id.toUpperCase()}</h4>
                      <p className="text-[10px] text-slate-400">Shop: {coop.full_name}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      isOpen
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {dsp.status.toUpperCase()}
                  </span>
                </div>

                {/* Dispute Breakdown */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400">{t('thExpected')}</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{dsp.qty_expected}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">{t('thReceived')}</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{dsp.qty_received}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">{t('thDifference')}</span>
                    <div className="font-extrabold text-rose-500">{dsp.difference}</div>
                  </div>
                </div>

                {/* Reason & Evidence */}
                <div className="text-xs space-y-2">
                  <p className="text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-white">Reason: </span>
                    {dsp.reason}
                  </p>

                  {dsp.evidence_photo_url && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPhotoUrl(dsp.evidence_photo_url)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-500" />
                        <span>{t('thEvidence')}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Settlement Actions */}
                {isOpen && (
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleResolve(dsp.id, 'reject')}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
                    >
                      {t('btnResolveReject')}
                    </button>
                    <button
                      onClick={() => handleResolve(dsp.id, 'accept')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('btnResolveAccept')}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Photo Preview Modal */}
      <AnimatePresence>
        {selectedPhotoUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-2xl space-y-3"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-500" />
                  <span>Dispute Photo Evidence</span>
                </h3>
                <button
                  onClick={() => setSelectedPhotoUrl(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <img
                src={selectedPhotoUrl}
                alt="Dispute evidence"
                className="w-full h-64 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
