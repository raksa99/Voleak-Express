import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AlertTriangle, PlusCircle, CheckCircle, Clock, ShieldAlert, X } from 'lucide-react';

export default function IncidentsView({ incidents, setIncidents }) {
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);

  const [type, setType] = useState('delay');
  const [driverName, setDriverName] = useState('Chan Vanna');
  const [description, setDescription] = useState('');

  const handleReportIncident = (e) => {
    e.preventDefault();
    if (!description) return;

    const newInc = {
      id: `inc-${Date.now()}`,
      trip_id: 't-101',
      reported_by: 'u-3',
      driver_name: driverName,
      type,
      description,
      created_at: new Date().toISOString(),
      status: 'investigating',
    };

    setIncidents([newInc, ...incidents]);
    setShowAddModal(false);
    setDescription('');
  };

  const getIncidentBadge = (tp) => {
    switch (tp) {
      case 'breakdown':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
      case 'accident':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      default:
        return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            {t('incidentsTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('incidentsSubtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-lg shadow-amber-500/25 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          {t('reportIncidentBtn')}
        </button>
      </div>

      {/* Incident Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {incidents.map((inc) => (
          <div
            key={inc.id}
            className="p-5 rounded-2xl glass-card space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase">
                    {inc.type} Report
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Reported by: <span className="font-semibold text-slate-800 dark:text-slate-200">{inc.driver_name}</span>
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${getIncidentBadge(inc.type)}`}>
                {inc.type}
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              "{inc.description}"
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Time: {new Date(inc.created_at).toLocaleTimeString()}</span>
              <span className="font-bold text-emerald-500">Status: {inc.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Report Incident Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('reportIncidentBtn')}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportIncident} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Incident Category
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="delay">{t('typeDelay')}</option>
                  <option value="breakdown">{t('typeBreakdown')}</option>
                  <option value="accident">{t('typeAccident')}</option>
                  <option value="other">{t('typeOther')}</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  required
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe road delay, weather conditions, or vehicle issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-md"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
