import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuthRole } from '../context/AuthRoleContext';
import { createRoute } from '../lib/supabaseClient';
import {
  MapPin,
  Truck,
  PlusCircle,
  Calendar,
  Clock,
  CheckCircle2,
  Navigation,
  User,
  Store,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RouteBuilderView({ routes = [], setRoutes, users = [], orders = [] }) {
  const { t } = useLanguage();
  const { isManager, selectedBranchId, currentUser } = useAuthRole();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [routeCode, setRouteCode] = useState(`RT-${Date.now().toString().slice(-4)}`);

  const drivers = users.filter((u) => u.role === 'driver');

  const handleCreateRoute = () => {
    if (!selectedDriverId) return;
    const newRt = createRoute(
      {
        route_code: routeCode,
        branch_id: selectedBranchId || 'b-01',
        driver_id: selectedDriverId,
        date: new Date().toISOString().split('T')[0],
        status: 'assigned',
        stops: [
          { id: `rs-${Date.now()}`, order_id: 'ord-101', sequence: 1, eta: '10:00 AM', status: 'pending' },
        ],
      },
      currentUser.name
    );

    setRoutes((prev) => [newRt, ...prev]);
    setCreateModalOpen(false);
    setSelectedDriverId('');
  };

  return (
    <div className="space-y-6">
      {/* Header & New Route Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-500" />
            <span>{t('routesTitle')}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('routesSubtitle')}
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('createRouteBtn')}</span>
        </button>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {routes.map((rt) => {
          const driver = users.find((u) => u.id === rt.driver_id) || { full_name: 'Unassigned Driver' };

          return (
            <div
              key={rt.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 hover:border-indigo-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{rt.route_code}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{driver.full_name}</span>
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                  {rt.status.toUpperCase()}
                </span>
              </div>

              {/* Stop Sequence List (§4.4) */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Scheduled Delivery Stops ({rt.stops?.length || 0})
                </h4>
                <div className="space-y-2">
                  {rt.stops && rt.stops.length > 0 ? (
                    rt.stops.map((stop, idx) => (
                      <div
                        key={stop.id || idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-indigo-500 text-white font-bold text-[10px] flex items-center justify-center">
                            {stop.sequence}
                          </span>
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              Order #{stop.order_id}
                            </span>
                            <p className="text-[10px] text-slate-400">ETA: {stop.eta}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {stop.status || 'Pending'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No stops assigned yet.</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Route Modal */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-500" />
                <span>{t('createRouteBtn')}</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Route Code
                  </label>
                  <input
                    type="text"
                    value={routeCode}
                    onChange={(e) => setRouteCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Assign Driver
                  </label>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="">-- Select On-Duty Driver --</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.full_name} ({d.phone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleCreateRoute}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                >
                  Dispatch Route
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
