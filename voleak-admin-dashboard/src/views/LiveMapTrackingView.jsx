import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Map, Truck, Navigation, Gauge, Thermometer, ShieldCheck } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Custom Truck Marker Icon for Leaflet
const createTruckIcon = (status) =>
  L.divIcon({
    className: 'custom-truck-marker',
    html: `
      <div style="
        background: ${status === 'in_progress' ? '#f59e0b' : '#0284c7'};
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);
        border: 2px solid white;
        font-size: 20px;
      ">
        🚚
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

const PHNOM_PENH_COORDS = [11.5564, 104.9282];
const SIEM_REAP_COORDS = [13.3671, 103.8448];

const routeLinePPtoSR = [PHNOM_PENH_COORDS, [12.25, 104.88], [12.71, 104.88], SIEM_REAP_COORDS];

export default function LiveMapTrackingView({ trips = [] }) {
  const { t } = useLanguage();
  const [selectedTrip, setSelectedTrip] = useState(trips[0] || null);
  const [liveTrips, setLiveTrips] = useState(trips);

  // Simulate smooth live movement every 3 seconds for active freight trucks
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTrips((prevTrips) =>
        prevTrips.map((trip) => {
          if (trip.status === 'in_progress') {
            const latDelta = (Math.random() - 0.5) * 0.004;
            const lngDelta = (Math.random() - 0.5) * 0.004;
            return {
              ...trip,
              latitude: Number(trip.latitude || 11.5564) + latDelta,
              longitude: Number(trip.longitude || 104.9282) + lngDelta,
              speed_kmh: Math.floor(Math.random() * 15 + 70),
            };
          }
          return trip;
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Quick Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Map className="w-6 h-6" />
            </span>
            {t('navLiveMap')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time GPS Freight Fleet Tracking & Highway Telemetry
          </p>
        </div>

        {/* Truck Selection Pill */}
        {liveTrips.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('selectTripToTrack')}
            </span>
            <select
              value={selectedTrip?.id || ''}
              onChange={(e) =>
                setSelectedTrip(liveTrips.find((t) => t.id === e.target.value))
              }
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
            >
              {liveTrips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id}: {t.route_name} ({t.bus_plate})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Map & Live Telemetry Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Interactive Leaflet Map Container */}
        <div className="lg:col-span-3 h-[560px] rounded-3xl glass-card overflow-hidden relative shadow-xl border border-slate-200 dark:border-slate-800">
          <MapContainer
            center={[12.45, 104.5]}
            zoom={8}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Polyline Route */}
            <Polyline positions={routeLinePPtoSR} color="#f59e0b" weight={4} dashArray="8, 8" />

            {/* Live Moving Truck Markers */}
            {liveTrips.map((trip) => {
              const pos = [trip.latitude || 12.45, trip.longitude || 104.9];
              return (
                <Marker key={trip.id} position={pos} icon={createTruckIcon(trip.status)}>
                  <Popup>
                    <div className="p-1 space-y-1 text-xs">
                      <h4 className="font-bold text-slate-900">{trip.route_name}</h4>
                      <p className="text-slate-600 font-mono">Truck: {trip.bus_plate}</p>
                      <p className="text-slate-600">Driver: {trip.driver_name}</p>
                      <p className="font-extrabold text-amber-600">
                        Cargo Load: {trip.loaded_tons || 22.4} Tons ({trip.total_parcels || 450} Parcels)
                      </p>
                      <p className="font-extrabold text-sky-600">Speed: {trip.speed_kmh || 75} km/h</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Map Overlay Live Telemetry Badge */}
          {selectedTrip && (
            <div className="absolute top-4 left-4 z-20 p-4 rounded-2xl bg-slate-900/90 text-white backdrop-blur-md border border-slate-700 space-y-2 shadow-2xl">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Active Telemetry: {selectedTrip.id} - {selectedTrip.route_name}
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>Truck: <strong className="font-mono">{selectedTrip.bus_plate}</strong></div>
                <div>Driver: <strong>{selectedTrip.driver_name}</strong></div>
                <div>Cargo Load: <strong className="text-amber-400">{selectedTrip.loaded_tons || 22.4} Tons</strong></div>
                <div>Speed: <strong className="text-emerald-400 font-mono">{selectedTrip.speed_kmh || 78} km/h</strong></div>
              </div>
            </div>
          )}
        </div>

        {/* Telemetry Sidebar */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Gauge className="w-4 h-4 text-amber-500" />
              Live Highway Telemetry
            </h3>

            {liveTrips.length === 0 ? (
              <p className="text-xs text-slate-400">No active trucks in highway transit.</p>
            ) : (
              liveTrips.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTrip(t)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedTrip?.id === t.id
                      ? 'bg-amber-500/10 border-amber-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-900 dark:text-white truncate">{t.bus_plate || t.route_name}</span>
                    <span className="text-amber-500 font-extrabold">{t.speed_kmh || 76} km/h</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    <span>Load: {t.loaded_tons || 22.4} Tons</span>
                    <span className="text-emerald-600 font-semibold">{t.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
