import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuthRole } from '../context/AuthRoleContext';
import { ScrollText, ShieldCheck, Clock, User, ArrowRight } from 'lucide-react';

export default function AuditLogView({ auditLogs = [] }) {
  const { t } = useLanguage();
  const { isAdmin } = useAuthRole();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-amber-500" />
            <span>{t('auditTitle')}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('auditSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>PostgreSQL Trigger Ledger Active</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">{t('thTimestamp')}</th>
                <th className="py-3.5 px-4">{t('thActor')}</th>
                <th className="py-3.5 px-4">{t('thActionType')}</th>
                <th className="py-3.5 px-4">{t('thEntity')}</th>
                <th className="py-3.5 px-4">{t('thChanges')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-amber-500" />
                      <span>{log.actor_name || 'System / Manager'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {log.entity} / {log.entity_id}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      {log.before && (
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 max-w-[150px] truncate">
                          {JSON.stringify(log.before)}
                        </span>
                      )}
                      {log.before && log.after && <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />}
                      {log.after && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 max-w-[180px] truncate">
                          {JSON.stringify(log.after)}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
