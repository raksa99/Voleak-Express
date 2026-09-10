import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Warehouse, PlusCircle, Navigation, Clock, X, MapPin } from 'lucide-react';
import { addLocalRoute } from '../lib/supabaseClient';

export default function RoutesView({ routes, setRoutes }) {
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [distanceKm, setDistanceKm] = useState(300);
  const [durationMin, setDurationMin] = useState(360);

  const handleCreateRoute = (e) => {
    e.preventDefault();
    if (!origin || !destination) return;
    const newRoute = addLocalRoute({
      name: name || `${origin} → ${destination} Express Corridor`,
      origin,
      destination,
      distance_km: Number(distanceKm),
      duration_min: Number(durationMin),
      status: 'active',
      stops: [`${origin} Hub`, 'Midway Checkpoint', `${destination} Hub`],
    });
    setRoutes([newRoute, ...routes]);
    setShowAddModal(false);
    setOrigin('');
    setDestination('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-amber-500" />
            {t('routesTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('routesSubtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-lg shadow-amber-500/25 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          {t('addRouteBtn')}
        </button>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {routes.map((rt) => (
          <div
            key={rt.id}
            className="p-5 rounded-2xl glass-card space-y-4 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {rt.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Regional Cambodian Cargo Corridor
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                {rt.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Corridor Distance</span>
                <span className="font-bold text-slate-900 dark:text-white">{rt.distance_km} km</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Transit Lead Time</span>
                <span className="font-bold text-slate-900 dark:text-white">{Math.floor(rt.duration_min / 60)}h {rt.duration_min % 60}m</span>
              </div>
            </div>

            {/* Intermediate Checkpoints */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Hub Waypoints & Checkpoints ({rt.stops?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {rt.stops?.map((stop, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    {i + 1}. {stop}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Corridor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('addRouteBtn')}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoute} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Origin Hub
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phnom Penh Central Hub"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Destination Hub
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bavet Border Logistics Hub"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lead Time (min)
                  </label>
                  <input
                    type="number"
                    value={durationMin}
                    onChange={(e) => setDurationMin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
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
