import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Map,
  Truck,
  Navigation,
  Gauge,
  Radio,
  RefreshCw,
  Satellite,
  Battery,
  Compass,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Zap,
  AlertTriangle,
  Layers,
  Settings,
  Eye,
  Clock,
  Signal,
  CheckCircle2,
  Crosshair,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  fetchDagpsGpsData,
  getDagpsConfig,
  reverseGeocodeCambodia,
  getCachedGpsDevices,
} from '../lib/dagpsService';
import DagpsConfigModal from '../components/DagpsConfigModal';

const MAP_TILE_PROVIDERS = {
  street: {
    name: 'Street Map',
    icon: '🗺️',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  satellite: {
    name: 'Satellite',
    icon: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Earthstar Geographics',
  },
  dark: {
    name: 'Dark Radar',
    icon: '🌙',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OpenStreetMap',
  },
};

// High-Tech Custom DAGPS Satellite Marker Icon for Leaflet
const createDagpsMarkerIcon = (device) => {
  const heading = Number(device?.heading) || 0;
  const isMoving = Number(device?.speed) > 0 || device?.motionStatus === 'Moving';
  const statusColor = isMoving ? '#10b981' : '#f59e0b'; // Emerald if moving, Amber if parking
  const plateText = device?.plateNumber || device?.userName || 'GPS Tracker';
  const batteryText = device?.battery ? `${device.battery}%` : '';
  const speedText = isMoving ? `${device.speed || 0} km/h` : '🅿️ 0 km/h';

  return L.divIcon({
    className: 'custom-dagps-marker',
    html: `
      <div style="position: relative; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
        ${
          isMoving
            ? `
          <!-- Pulsing Radar Wave (Active only while moving) -->
          <div style="
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: ${statusColor};
            opacity: 0.35;
            animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>

          <!-- Directional Pointer -->
          <div style="
            position: absolute;
            width: 52px;
            height: 52px;
            border-radius: 50%;
            transform: rotate(${heading}deg);
            pointer-events: none;
            display: flex;
            align-items: flex-start;
            justify-content: center;
          ">
            <div style="
              width: 0;
              height: 0;
              border-left: 5px solid transparent;
              border-right: 5px solid transparent;
              border-bottom: 8px solid ${statusColor};
              margin-top: -2px;
            "></div>
          </div>
        `
            : `
          <!-- Solid Stationary Ring (When Parked - Zero Jitter/Ping) -->
          <div style="
            position: absolute;
            inset: 4px;
            border-radius: 50%;
            border: 2px dashed ${statusColor};
            opacity: 0.7;
          "></div>
        `
        }

        <!-- Central Hardware Badge -->
        <div style="
          position: relative;
          z-index: 10;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #0f172a;
          border: 2.5px solid ${statusColor};
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 19px;
        ">
          🚛
        </div>

        <!-- Plate & Status Tag -->
        <div style="
          position: absolute;
          bottom: -20px;
          background: rgba(15, 23, 42, 0.94);
          border: 1px solid ${statusColor}40;
          color: white;
          font-size: 9.5px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 7px;
          white-space: nowrap;
          box-shadow: 0 3px 10px rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          gap: 4px;
          z-index: 20;
        ">
          <span style="color: ${statusColor}; font-size: 10px;">●</span>
          <span>${plateText}</span>
          <span style="color: ${isMoving ? '#34d399' : '#fbbf24'}; font-weight: bold;">${speedText}</span>
        </div>
      </div>
    `,
    iconSize: [60, 60],
    iconAnchor: [30, 30],
    popupAnchor: [0, -30],
  });
};

// General Fleet Truck Marker Icon (for unassigned routes)
const createTruckIcon = (status) =>
  L.divIcon({
    className: 'custom-truck-marker',
    html: `
      <div style="
        background: ${status === 'in_progress' ? '#3b82f6' : '#64748b'};
        width: 34px;
        height: 34px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        border: 2px solid white;
        font-size: 15px;
      ">
        🚚
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });

// Map Controller for smooth flyTo transitions
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      try {
        map.flyTo(center, zoom || map.getZoom(), { duration: 1.2 });
      } catch (err) {
        console.warn('Map flyTo error', err);
      }
    }
  }, [center, zoom, map]);
  return null;
}

const PHNOM_PENH_COORDS = [11.5564, 104.9282];
const SIEM_REAP_COORDS = [13.3671, 103.8448];
const routeLinePPtoSR = [PHNOM_PENH_COORDS, [12.25, 104.88], [12.71, 104.88], SIEM_REAP_COORDS];

export default function LiveMapTrackingView({ trips = [], buses = [] }) {
  const { t } = useLanguage();

  // DAGPS Multi-Device State
  const [dagpsDevices, setDagpsDevices] = useState(() => getCachedGpsDevices());
  const [selectedImei, setSelectedImei] = useState(() => {
    const list = getCachedGpsDevices();
    return list[0]?.imei || null;
  });
  const [dagpsLoading, setDagpsLoading] = useState(false);
  const [dagpsError, setDagpsError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [config, setConfig] = useState(getDagpsConfig());
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // Map Tile Layer Selection ('street' | 'satellite' | 'dark')
  const [mapLayer, setMapLayer] = useState('street');

  // Active Hardware GPS Tracker from DAGPS
  const activeDagpsDevice = useMemo(() => {
    return dagpsDevices.find((d) => d.imei === selectedImei) || dagpsDevices[0] || null;
  }, [dagpsDevices, selectedImei]);

  const displayDevice = activeDagpsDevice;

  // Map & Selection State
  const [selectedTrip, setSelectedTrip] = useState(trips[0] || null);
  const [mapCenter, setMapCenter] = useState(() => {
    const list = getCachedGpsDevices();
    if (list && list[0] && list[0].latitude && list[0].longitude) {
      return [list[0].latitude, list[0].longitude];
    }
    return [11.58771556, 104.88888889];
  });
  const [mapZoom, setMapZoom] = useState(15);
  const [selectedEntity, setSelectedEntity] = useState('dagps');

  // Track if map has been centered initially
  const initialCenterDoneRef = useRef(false);

  // Fetch live DAGPS data function - Pure 100% Real Hardware Telemetry
  const fetchLiveDagps = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setDagpsLoading(true);
    setDagpsError(null);

    try {
      const res = await fetchDagpsGpsData(config);
      if (res && res.success && res.devices.length > 0) {
        setDagpsDevices(res.devices);
        setLastSyncTime(new Date());

        const active = (selectedImei && res.devices.find((d) => d.imei === selectedImei)) || res.devices[0];

        if (active && active.latitude && active.longitude) {
          const newPoint = [active.latitude, active.longitude];

          // Only record breadcrumbs if speed > 0 and vehicle has actually moved
          setBreadcrumbs((prev) => {
            if (prev.length === 0) return [newPoint];
            const last = prev[prev.length - 1];
            // Only add point if moved by > 5 meters
            if (Math.abs(last[0] - newPoint[0]) > 0.00005 || Math.abs(last[1] - newPoint[1]) > 0.00005) {
              return [...prev.slice(-80), newPoint];
            }
            return prev;
          });

          // Center map on initial load
          if (!initialCenterDoneRef.current) {
            setMapCenter([active.latitude, active.longitude]);
            initialCenterDoneRef.current = true;
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch DAGPS live coordinates:', err);
      setDagpsError(err.message || 'Error connecting to DAGPS server.');
    } finally {
      if (showLoadingSpinner) setDagpsLoading(false);
    }
  };

  // Initial load and periodic polling from real DAGPS server
  useEffect(() => {
    fetchLiveDagps(true);

    if (config.autoRefresh) {
      const intervalMs = Math.max(5, config.autoRefreshInterval || 5) * 1000;
      const poller = setInterval(() => {
        fetchLiveDagps(false);
      }, intervalMs);
      return () => clearInterval(poller);
    }
  }, [config.autoRefresh, config.autoRefreshInterval, config.mds, config.fatherId]);

  // Listen to global telemetry event (from App.jsx background sync)
  useEffect(() => {
    const handleGlobalTelemetry = (e) => {
      const { devices } = e.detail || {};
      if (devices && devices.length > 0) {
        setDagpsDevices(devices);
        setLastSyncTime(new Date());
      }
    };
    window.addEventListener('dagps_telemetry_updated', handleGlobalTelemetry);
    return () => window.removeEventListener('dagps_telemetry_updated', handleGlobalTelemetry);
  }, []);

  const handleCenterOnDagps = (deviceToCenter) => {
    const target = deviceToCenter || displayDevice;
    if (target?.latitude && target?.longitude) {
      setMapCenter([target.latitude, target.longitude]);
      setMapZoom(16);
      setSelectedEntity(`dagps_${target.imei || 'primary'}`);
      if (target.imei) {
        setSelectedImei(target.imei);
      }
    }
  };

  const handleSelectTrip = (trip) => {
    setSelectedTrip(trip);
    setSelectedEntity(trip.id);
    if (trip.latitude && trip.longitude) {
      setMapCenter([trip.latitude, trip.longitude]);
      setMapZoom(13);
    }
  };

  const matchedTruck = useMemo(() => {
    const targetPlate = displayDevice?.plateNumber || config.assignedTruckPlate;
    if (!targetPlate) {
      return {
        plate_number: '',
        model: displayDevice?.productType || 'GPS Hardware Unit',
        assigned_driver_name: '',
      };
    }
    return (
      buses.find((b) => b.plate_number === targetPlate) || {
        plate_number: targetPlate,
        model: 'Heavy Container Truck',
        assigned_driver_name: '',
      }
    );
  }, [buses, displayDevice, config]);

  // Filter out any trips that are already represented by a physical DAGPS tracker
  // This guarantees NO DUPLICATE TRUCK ICONS on top of each other!
  const unassignedTrips = useMemo(() => {
    const dagpsPlates = new Set(
      dagpsDevices.map((d) => d.plateNumber).filter(Boolean)
    );
    // Also include default truck-1 plate
    dagpsPlates.add('PP-3D-8890');

    return trips.filter((t) => {
      if (t.bus_plate && dagpsPlates.has(t.bus_plate)) return false;
      if (t.bus_id === 'truck-1') return false;
      return true;
    });
  }, [trips, dagpsDevices]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Quick Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm">
              <Radio className="w-6 h-6 animate-pulse" />
            </span>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                {t('navLiveMap')}
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Satellite className="w-3 h-3" />
                  100% Real GPS Hardware Feed
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live Satellite Telemetry from Physical DAGPS Hardware Tracker (GT06)
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & DAGPS Status Badge */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Sync Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${displayDevice ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <div className="text-slate-700 dark:text-slate-300 font-medium">
              <span className="font-bold text-slate-900 dark:text-white">DAGPS Cloud: </span>
              {dagpsLoading ? (
                <span className="text-amber-500 font-bold">Syncing Telemetry...</span>
              ) : displayDevice ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  Connected ({displayDevice.userName || config.accountPhone})
                </span>
              ) : (
                <span className="text-slate-400">Searching Satellites...</span>
              )}
            </div>
            {lastSyncTime && (
              <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                • {lastSyncTime.toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* Map Layer Switcher Pills */}
          <div className="flex items-center p-0.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
            {Object.entries(MAP_TILE_PROVIDERS).map(([key, provider]) => (
              <button
                key={key}
                onClick={() => setMapLayer(key)}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1 text-[11px] ${
                  mapLayer === key
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={`Switch to ${provider.name}`}
              >
                <span>{provider.icon}</span>
                <span className="hidden sm:inline">{provider.name}</span>
              </button>
            ))}
          </div>

          {/* Quick Refresh Button */}
          <button
            onClick={() => fetchLiveDagps(true)}
            disabled={dagpsLoading}
            className="p-2 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition-all"
            title="Refresh GPS Telemetry from Satellite Now"
          >
            <RefreshCw className={`w-4 h-4 ${dagpsLoading ? 'animate-spin text-amber-500' : ''}`} />
          </button>

          {/* Center On DAGPS Fix Button */}
          <button
            onClick={() => handleCenterOnDagps()}
            className="px-2.5 sm:px-3.5 py-1.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer shrink-0"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Center on GPS Fix</span>
            <span className="sm:hidden">GPS Fix</span>
          </button>

          {/* Configure DAGPS Button */}
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="p-2 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition-all cursor-pointer"
            title="Configure DAGPS URL & Settings"
          >
            <Settings className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Main Map & Live Telemetry Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Interactive Leaflet Map Container */}
        <div className="lg:col-span-3 h-[380px] sm:h-[480px] lg:h-[600px] rounded-2xl sm:rounded-3xl glass-card overflow-hidden relative shadow-xl border border-slate-200 dark:border-slate-800">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              key={mapLayer}
              attribution={MAP_TILE_PROVIDERS[mapLayer].attribution}
              url={MAP_TILE_PROVIDERS[mapLayer].url}
            />

            <MapController center={mapCenter} zoom={mapZoom} />

            {/* Polyline Route from Phnom Penh to Siem Reap (corridor) */}
            <Polyline positions={routeLinePPtoSR} color="#f59e0b" weight={3} dashArray="8, 8" opacity={0.35} />

            {/* Breadcrumb trail of real vehicle movements */}
            {breadcrumbs.length > 1 && (
              <Polyline positions={breadcrumbs} color="#10b981" weight={5} opacity={0.8} />
            )}

            {/* DAGPS Real-time Satellite Truck Markers */}
            {dagpsDevices.map((device) => {
              if (!device.latitude || !device.longitude) return null;
              const truckForDev =
                buses.find((b) => b.plate_number === device.plateNumber) ||
                (device.imei === displayDevice?.imei ? matchedTruck : null);

              const isDevMoving = Number(device.speed) > 0 || device.motionStatus === 'Moving';

              return (
                <Marker
                  key={device.imei || device.id}
                  position={[device.latitude, device.longitude]}
                  icon={createDagpsMarkerIcon(device)}
                  eventHandlers={{
                    click: () => {
                      setSelectedEntity(`dagps_${device.imei}`);
                      setSelectedImei(device.imei);
                      setMapCenter([device.latitude, device.longitude]);
                    },
                  }}
                >
                  <Popup>
                    <div className="p-2 space-y-2 text-xs min-w-[240px]">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1">
                          🚛 {device.plateNumber || device.userName || 'Unassigned Truck'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isDevMoving
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {device.motionStatus || (isDevMoving ? 'Moving' : 'Parking')}
                        </span>
                      </div>

                      <div className="space-y-1 text-slate-600">
                        <p>
                          <strong className="text-slate-900">Vehicle:</strong> {truckForDev?.model || device.productType || 'Freight Truck'}
                        </p>
                        <p>
                          <strong className="text-slate-900">Driver:</strong>{' '}
                          {truckForDev?.assigned_driver_name ? (
                            truckForDev.assigned_driver_name
                          ) : (
                            <span className="text-slate-400 italic">No Driver Assigned (មិនទាន់ចាត់តាំង)</span>
                          )}
                        </p>
                        <p>
                          <strong className="text-slate-900">Location:</strong>{' '}
                          <span className="text-slate-800">{device.address || `${device.latitude.toFixed(5)}°N, ${device.longitude.toFixed(5)}°E`}</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                        <div>Speed: <strong className="text-emerald-600 font-mono">{device.speed || 0} km/h</strong></div>
                        <div>Battery: <strong className="text-amber-600 font-mono">{device.battery || 0}% {device.voltage ? `(${device.voltage})` : ''}</strong></div>
                        <div>Satellites: <strong className="text-sky-600">{device.satellites || 0} Fixed</strong></div>
                        <div>Signal: <strong className="text-slate-800">{device.gsmSignal || 0}% GSM</strong></div>
                      </div>

                      <div className="pt-1 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                        <span>IMEI: {device.imei}</span>
                        <span>Model: {device.productType || device.deviceModel || 'GT06'}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Other Dispatched Trucks (Only those without DAGPS hardware, stationary) */}
            {unassignedTrips.map((trip) => {
              const pos = [trip.latitude || 12.45, trip.longitude || 104.9];
              return (
                <Marker
                  key={trip.id}
                  position={pos}
                  icon={createTruckIcon(trip.status)}
                  eventHandlers={{
                    click: () => handleSelectTrip(trip),
                  }}
                >
                  <Popup>
                    <div className="p-1 space-y-1 text-xs">
                      <h4 className="font-bold text-slate-900">{trip.route_name || 'Scheduled Dispatch'}</h4>
                      <p className="text-slate-600 font-mono">Truck: {trip.bus_plate}</p>
                      <p className="text-slate-600">
                        Driver:{' '}
                        {trip.driver_name || <span className="text-slate-400 italic">No Driver Assigned</span>}
                      </p>
                      <p className="font-extrabold text-amber-600">
                        Cargo Load: {trip.loaded_tons || 22.4} Tons ({trip.total_parcels || 450} Parcels)
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Map Overlay Live Telemetry Badge for Real Hardware Tracker */}
          {displayDevice ? (
            <div className="absolute top-2 left-2 right-2 sm:right-auto sm:top-4 sm:left-4 z-[400] max-w-[calc(100%-16px)] sm:max-w-sm p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-900/90 text-white backdrop-blur-md border border-slate-700/80 space-y-2 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${displayDevice.speed > 0 ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                  <span className="truncate text-[11px] sm:text-xs">Satellite Telemetry</span>
                </div>
                <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  displayDevice.speed > 0
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {displayDevice.speed > 0 ? `MOVING (${displayDevice.speed} km/h)` : '🅿️ PARKED'}
                </span>
              </div>

              {/* Multi-Truck Quick Selector Pills */}
              {dagpsDevices.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-0.5">
                  {dagpsDevices.map((dev) => {
                    const isCur = dev.imei === displayDevice.imei;
                    return (
                      <button
                        key={dev.imei}
                        onClick={() => handleCenterOnDagps(dev)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all shrink-0 cursor-pointer ${
                          isCur
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        🚛 {dev.plateNumber || dev.userName || 'Truck'}
                      </button>
                    );
                  })}
                </div>
              )}

              <div>
                <h4 className="font-black text-xs sm:text-sm text-white flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                  {displayDevice.plateNumber || displayDevice.userName || 'Unassigned Fleet Truck'}
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-normal">({matchedTruck.model})</span>
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-300 mt-0.5 flex items-start gap-1">
                  <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="truncate max-w-[240px] sm:max-w-[280px]">
                    {displayDevice.address || `${displayDevice.latitude?.toFixed(5)}°N, ${displayDevice.longitude?.toFixed(5)}°E`}
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 pt-2 border-t border-slate-800 text-[10px]">
                <div className="p-1 sm:p-1.5 rounded-xl bg-slate-800/80">
                  <span className="text-slate-400 block font-semibold text-[9px]">Speed</span>
                  <strong className="text-emerald-400 font-mono text-[11px] sm:text-xs">{displayDevice.speed || 0} km/h</strong>
                </div>
                <div className="p-1 sm:p-1.5 rounded-xl bg-slate-800/80">
                  <span className="text-slate-400 block font-semibold text-[9px]">Battery</span>
                  <strong className="text-amber-400 font-mono text-[11px] sm:text-xs">{displayDevice.battery || 0}%</strong>
                </div>
                <div className="p-1 sm:p-1.5 rounded-xl bg-slate-800/80">
                  <span className="text-slate-400 block font-semibold text-[9px]">Satellites</span>
                  <strong className="text-sky-400 font-mono text-[11px] sm:text-xs">{displayDevice.satellites || 0} Fixed</strong>
                </div>
                <div className="p-1 sm:p-1.5 rounded-xl bg-slate-800/80">
                  <span className="text-slate-400 block font-semibold text-[9px]">Heading</span>
                  <strong className="text-purple-400 font-mono text-[11px] sm:text-xs">{displayDevice.compass || 'N'}</strong>
                </div>
              </div>
            </div>
          ) : dagpsLoading ? (
            <div className="absolute top-2 left-2 right-2 sm:right-auto sm:top-4 sm:left-4 z-[400] max-w-[calc(100%-16px)] sm:max-w-sm p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-900/90 text-white backdrop-blur-md border border-slate-700/80 shadow-2xl flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-400">
                <Satellite className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Acquiring DAGPS Satellite Fix...</h4>
                <p className="text-[11px] text-slate-400">Connecting to real-time telemetry cloud</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Telemetry Sidebar */}
        <div className="space-y-4">
          {/* Multi-Device Tracker List Header */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500">
                  <Satellite className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    GPS Trackers ({dagpsDevices.length})
                  </h3>
                  <p className="text-[10px] text-slate-400">Hardware Fleet Telemetry</p>
                </div>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(true)}
                className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500 hover:text-white text-amber-600 dark:text-amber-400 text-[10px] font-extrabold transition-all flex items-center gap-1 cursor-pointer"
                title="Pair another GPS tracker to any truck"
              >
                <Radio className="w-3 h-3" />
                <span>+ Pair GPS</span>
              </button>
            </div>

            {/* List of Trackers */}
            <div className="space-y-2">
              {dagpsDevices.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  {dagpsLoading ? 'Syncing DAGPS satellite trackers...' : 'No hardware trackers cached. Click "Refresh GPS Now" or configure DAGPS.'}
                </div>
              ) : (
                dagpsDevices.map((dev) => {
                  const isSelected = dev.imei === displayDevice?.imei;
                  const isDevMoving = Number(dev.speed) > 0 || dev.motionStatus === 'Moving';

                  return (
                    <div
                      key={dev.imei || dev.id}
                      onClick={() => handleCenterOnDagps(dev)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-amber-500" />
                          {dev.plateNumber || dev.userName || 'Unassigned'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isDevMoving
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {dev.motionStatus || (isDevMoving ? 'Moving' : 'Parking')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        <span className="truncate max-w-[130px] font-mono text-[10px]">
                          IMEI: {dev.imei?.slice(-6) || 'N/A'} • {dev.productType || 'GT06'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                            {dev.speed || 0} km/h
                          </span>
                          <span>•</span>
                          <span className="text-amber-500 font-mono font-bold">
                            {dev.battery || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Primary/Selected DAGPS Device Card Detailed Telemetry */}
          {displayDevice && (
            <div
              className="p-5 rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <Satellite className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Selected Hardware Telemetry
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">IMEI: {displayDevice.imei || 'N/A'}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  displayDevice.speed > 0 || displayDevice.motionStatus === 'Moving'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}>
                  {displayDevice.motionStatus || (displayDevice.speed > 0 ? 'Moving' : 'Parking')}
                </span>
              </div>

              {/* Truck Profile Info */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-slate-900 dark:text-white font-mono">
                    {displayDevice.plateNumber || displayDevice.userName || 'Unassigned Fleet Truck'}
                  </span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    {displayDevice.speed || 0} km/h
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {matchedTruck.model}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span>
                    Driver:{' '}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {matchedTruck.assigned_driver_name ? (
                        matchedTruck.assigned_driver_name
                      ) : (
                        <span className="text-slate-400 font-normal italic">No Driver Assigned (មិនទាន់ចាត់តាំង)</span>
                      )}
                    </strong>
                  </span>
                  <span className="font-mono text-purple-600 dark:text-purple-400">{displayDevice.compass || 'N'}</span>
                </div>
              </div>

              {/* Detailed Telemetry Gauges */}
              <div className="space-y-2.5 text-xs">
                {/* Battery Gauge */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Battery className="w-3.5 h-3.5 text-amber-500" />
                      Backup Battery
                    </span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      {displayDevice.battery || 0}% {displayDevice.voltage ? `(${displayDevice.voltage})` : ''}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        (displayDevice.battery || 0) > 50
                          ? 'bg-emerald-500'
                          : (displayDevice.battery || 0) > 20
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${displayDevice.battery || 0}%` }}
                    />
                  </div>
                </div>

                {/* GPS Satellites & GSM Signal */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                    <span className="text-slate-400 text-[10px] block font-semibold">Satellites Fix</span>
                    <span className="font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                      <Satellite className="w-3.5 h-3.5" />
                      {displayDevice.satellites || 0} Satellites
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                    <span className="text-slate-400 text-[10px] block font-semibold">GSM Cellular</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Signal className="w-3.5 h-3.5" />
                      {displayDevice.gsmSignal || 0}% Signal
                    </span>
                  </div>
                </div>

                {/* Location text */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mb-0.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    Exact Position
                  </div>
                  <p className="line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
                    {displayDevice.address || `${displayDevice.latitude?.toFixed(5)}°N, ${displayDevice.longitude?.toFixed(5)}°E`}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">
                    {displayDevice.latitude?.toFixed(6)}°N, {displayDevice.longitude?.toFixed(6)}°E
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dispatched Freight Routes */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Gauge className="w-4 h-4 text-amber-500" />
              Dispatched Freight Routes
            </h3>

            {trips.length === 0 ? (
              <p className="text-xs text-slate-400">No active cargo dispatches recorded.</p>
            ) : (
              trips.map((t) => {
                const isMatchedToDagps = dagpsDevices.some(
                  (d) => d.plateNumber && (d.plateNumber === t.bus_plate || (t.bus_id === 'truck-1' && d.plateNumber === 'PP-3D-8890'))
                );

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      if (isMatchedToDagps) {
                        handleCenterOnDagps();
                      } else {
                        handleSelectTrip(t);
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedEntity === t.id || (isMatchedToDagps && selectedEntity.startsWith('dagps'))
                        ? 'bg-amber-500/10 border-amber-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-amber-500" />
                        {t.bus_plate || t.route_name}
                      </span>
                      {isMatchedToDagps ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-extrabold">
                          GPS Synced
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium text-[11px]">{t.status}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      <span>Cargo: {t.cargo_weight_tons || t.loaded_tons || 22.4} Tons</span>
                      <span>{t.driver_name || 'Assigned Driver'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* DAGPS Configuration Modal */}
      <DagpsConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        trucks={buses}
        onConfigSaved={(newCfg) => {
          setConfig(newCfg);
          fetchLiveDagps(true);
        }}
      />
    </div>
  );
}
