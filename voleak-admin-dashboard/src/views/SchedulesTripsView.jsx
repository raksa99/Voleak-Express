import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, PlusCircle, Play, CheckCircle, Clock, Truck, User, X, Scale } from 'lucide-react';
import { addLocalSchedule, updateTripStatus } from '../lib/supabaseClient';

export default function SchedulesTripsView({ schedules, setSchedules, trips, setTrips, routes, buses, users }) {
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);

  const [routeId, setRouteId] = useState(routes[0]?.id || 'r-1');
  const [busId, setBusId] = useState(buses[0]?.id || 'b-1');
  const [driverId, setDriverId] = useState('u-3');
  const [depTime, setDepTime] = useState('06:00');
  const [arrTime, setArrTime] = useState('12:00');
  const [price, setPrice] = useState(120.0);

  const handleCreateSchedule = (e) => {
    e.preventDefault();
    const newSch = addLocalSchedule({
      route_id: routeId,
      bus_id: busId,
      driver_id: driverId,
      conductor_id: 'u-4',
      departure_time: `${depTime}:00`,
      arrival_time: `${arrTime}:00`,
      days_of_week: '1,2,3,4,5,6,7',
      price: Number(price),
      status: 'active',
    });
    setSchedules([newSch, ...schedules]);
    setShowAddModal(false);
  };

  const handleStartTrip = (tripId) => {
    updateTripStatus(tripId, 'in_progress');
    setTrips(trips.map((t) => (t.id === tripId ? { ...t, status: 'in_progress', speed_kmh: 75 } : t)));
  };

  const handleEndTrip = (tripId) => {
    updateTripStatus(tripId, 'completed');
    setTrips(trips.map((t) => (t.id === tripId ? { ...t, status: 'completed', speed_kmh: 0 } : t)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            {t('schedulesTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('schedulesSubtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-lg shadow-amber-500/25 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          {t('addScheduleBtn')}
        </button>
      </div>

      {/* Active Truck Dispatches Operations Section */}
      <div className="p-6 rounded-2xl glass-card space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
          Live Daily Truck Dispatch & Voyage Manifests
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-500">{trip.id}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold ${
                    trip.status === 'in_progress'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : trip.status === 'completed'
                      ? 'bg-purple-500/10 text-purple-500'
                      : 'bg-amber-500/10 text-amber-500'
                  }`}
                >
                  {trip.status}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {trip.route_name || 'Phnom Penh Hub → Siem Reap Terminal'}
              </h4>

              <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center justify-between font-mono">
                  <span>Truck Plate:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{trip.bus_plate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Lead Driver:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{trip.driver_name}</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span>Loaded Cargo Weight:</span>
                  <span className="font-bold text-amber-500">{trip.loaded_tons || 22.4} Tons ({trip.total_parcels || 450} Parcels)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                {trip.status === 'scheduled' && (
                  <button
                    onClick={() => handleStartTrip(trip.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all"
                  >
                    <Play className="w-3.5 h-3.5" /> {t('startTripBtn')}
                  </button>
                )}

                {trip.status === 'in_progress' && (
                  <button
                    onClick={() => handleEndTrip(trip.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> {t('endTripBtn')}
                  </button>
                )}

                {trip.status === 'completed' && (
                  <span className="text-xs font-bold text-slate-400 text-center w-full">
                    ✓ Arrived & Unloaded at Hub
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Truck Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('addScheduleBtn')}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Express Corridor
                </label>
                <select
                  value={routeId}
                  onChange={(e) => setRouteId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.distance_km}km)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Freight Truck
                </label>
                <select
                  value={busId}
                  onChange={(e) => setBusId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.plate_number} - {b.model} ({b.capacity} Tons)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Departure Time
                  </label>
                  <input
                    type="time"
                    value={depTime}
                    onChange={(e) => setDepTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Est. Arrival Time
                  </label>
                  <input
                    type="time"
                    value={arrTime}
                    onChange={(e) => setArrTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Planned Cargo Capacity (Tons)
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 24.5"
                  defaultValue="20"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
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
