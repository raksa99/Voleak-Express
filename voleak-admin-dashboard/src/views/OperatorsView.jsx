import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Building2,
  PlusCircle,
  Phone,
  CheckCircle,
  X,
  Truck,
  Star,
  Edit2,
  Trash2,
  Building,
  ShieldCheck,
  MapPin,
  Sparkles,
  Navigation,
  ExternalLink,
  Map as MapIcon,
  Layers,
  Clock,
  Fuel,
  Coffee,
  Scale,
  Compass,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Crosshair,
  LocateFixed,
  MapPinned,
  Warehouse,
  ArrowRight,
  Handshake,
} from 'lucide-react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import {
  addLocalOperator,
  updateLocalOperator,
  deleteLocalOperator,
  addLocalRoute,
  updateLocalRoute,
  deleteLocalRoute,
} from '../lib/supabaseClient';
import SweetAlertModal from '../components/SweetAlertModal';
import { fetchCambodiaDomesticRoute } from '../lib/cambodiaRouter';

// Helper to reliably extract and display the Cooperator Short Display Name on Hubs & Corridors
export const getShortDisplayName = (item, cops = []) => {
  if (!item) return '';
  const bracketMatch = item.name?.match(/^\[(.*?)\]/);
  if (bracketMatch && bracketMatch[1]) return bracketMatch[1];
  const destMatch = item.destination?.match(/^\[(.*?)\]/);
  if (destMatch && destMatch[1]) return destMatch[1];
  const matched = (cops || []).find(
    (c) =>
      c.operator_id === item.id ||
      c.operator_id === item.operator_id ||
      c.hub_name === item.name ||
      c.primary_corridor === item.name ||
      (item.province && c.province && c.province.toLowerCase() === item.province.toLowerCase())
  );
  if (matched?.short_name) return matched.short_name;
  if (matched?.name) return matched.name;
  return item.short_name || '';
};

// Calculate distance between two GPS coordinates in KM (Haversine formula)
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return '0.0';
  const R = 6371;
  const dLat = ((Number(lat2) - Number(lat1)) * Math.PI) / 180;
  const dLon = ((Number(lon2) - Number(lon1)) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((Number(lat1) * Math.PI) / 180) *
      Math.cos((Number(lat2) * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

// Company Headquarters (Origin for Dispatch Routes - Top Sports Textile HQ)
const COMPANY_HQ = {
  name: 'Top Sports Textile HQ',
  code: 'TOPSPORT-HQ',
  latitude: 11.0479485,
  longitude: 106.1204302,
  address: 'Top Sports Textile, Bavet, Svay Rieng (https://maps.app.goo.gl/TmcZJHpCzd3KCjEr7)',
  manager_name: 'Bong Leak (Director)',
  manager_phone: '+855 12 888 999',
};

// Custom Leaflet Company HQ Marker
const createCompanyHQMarkerIcon = () =>
  L.divIcon({
    className: 'custom-hq-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, #10b981, #059669);
        width: 46px;
        height: 46px;
        border-radius: 14px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 8px 24px rgba(16, 185, 129, 0.55);
        border: 2.5px solid white;
        font-family: monospace;
        font-weight: 900;
        font-size: 9px;
        text-align: center;
        line-height: 1;
        cursor: pointer;
      ">
        <span style="font-size: 15px; margin-bottom: 2px;">🏢</span>
        <span>MY HQ</span>
      </div>
    `,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
  });

// Custom Leaflet Hub Marker
const createHubMarkerIcon = (status, code, isSelected = false) =>
  L.divIcon({
    className: 'custom-hub-marker',
    html: `
      <div style="
        background: ${
          isSelected
            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
            : status === 'active'
            ? 'linear-gradient(135deg, #f59e0b, #ea580c)'
            : '#64748b'
        };
        width: ${isSelected ? '50px' : '44px'};
        height: ${isSelected ? '50px' : '44px'};
        border-radius: 14px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: ${isSelected ? '0 0 0 4px rgba(239, 68, 68, 0.4), 0 10px 25px rgba(239, 68, 68, 0.6)' : '0 8px 20px rgba(245, 158, 11, 0.45)'};
        border: 2px solid white;
        font-family: monospace;
        font-weight: bold;
        font-size: 10px;
        text-align: center;
        line-height: 1;
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <span style="font-size: 14px; margin-bottom: 2px;">🏭</span>
        <span>${code ? code.split('-')[0] : 'SEZ'}</span>
      </div>
    `,
    iconSize: isSelected ? [50, 50] : [44, 44],
    iconAnchor: isSelected ? [25, 25] : [22, 22],
  });

// Draggable Pin Icon for Manager Location Picker
const createPickerPinIcon = () =>
  L.divIcon({
    className: 'custom-picker-marker',
    html: `
      <div style="
        background: #ef4444;
        width: 38px;
        height: 38px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 6px 16px rgba(239, 68, 68, 0.5);
        border: 3px solid white;
        cursor: grab;
      ">
        <div style="transform: rotate(45deg); font-size: 16px;">📍</div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
  });

// Recenter Map Helper
function ChangeMapView({ center, zoom = 8 }) {
  const map = useMap();
  const lat = Number(center?.[0]);
  const lng = Number(center?.[1]);

  useEffect(() => {
    if (!map) return;
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      try {
        map.setView([lat, lng], zoom);
      } catch (err) {
        console.warn('Map setView error', err);
      }
    }
  }, [lat, lng, zoom, map]);

  return null;
}

// Location Picker on Map for Manager
function LocationPickerEvents({ position, onLocationChange }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      if (e?.latlng) {
        const { lat, lng } = e.latlng;
        onLocationChange(lat, lng);
      }
    },
  });

  const validPos =
    Array.isArray(position) &&
    position.length === 2 &&
    typeof position[0] === 'number' &&
    typeof position[1] === 'number' &&
    !isNaN(position[0]) &&
    !isNaN(position[1])
      ? position
      : [COMPANY_HQ.latitude, COMPANY_HQ.longitude];

  return (
    <Marker
      position={validPos}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          if (marker) {
            const { lat, lng } = marker.getLatLng();
            onLocationChange(lat, lng);
          }
        },
      }}
      icon={createPickerPinIcon()}
    >
      <Popup>
        <div className="p-1 text-xs">
          <strong>Selected Location Pin</strong>
          <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Drag pin or click map to move</p>
        </div>
      </Popup>
    </Marker>
  );
}

export default function OperatorsView({
  operators = [],
  setOperators,
  routes = [],
  setRoutes,
  cooperators = [],
  setActiveTab: setDashboardTab,
}) {
  const { t } = useLanguage();

  const allCooperators = Array.isArray(cooperators) ? cooperators : [];

  // Active View Tab: 'driverMap' (Interactive Driver Map) | 'directory' (Cards) | 'corridors' (Industrial Corridors)
  const [activeTab, setActiveTab] = useState('driverMap');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOp, setEditingOp] = useState(null);
  const [deletingOp, setDeletingOp] = useState(null);
  const [selectedHubForDriver, setSelectedHubForDriver] = useState(null);

  // Integrated Industrial Corridors & Shipping Routes State
  const [localRoutes, setLocalRoutes] = useState(routes || []);
  const routesList = (routes && routes.length > 0) ? routes : (localRoutes || []);
  const updateRoutes = setRoutes || setLocalRoutes;

  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [deletingRoute, setDeletingRoute] = useState(null);
  const [corridorSearch, setCorridorSearch] = useState('');
  const [routeFormData, setRouteFormData] = useState({
    name: '',
    origin: '',
    destination: '',
    distance_km: 180,
    duration_min: 150,
    operator_id: '',
    stops: ['Primary Weighbridge', 'Expressway Toll Plaza'],
    status: 'active',
  });
  const [stopInput, setStopInput] = useState('');

  // Dynamic Company HQ loaded from Settings & localStorage (Default: Top Sports Textile HQ)
  const [companyHQ, setCompanyHQ] = useState(() => {
    const saved = localStorage.getItem('voleak_company_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Automatically migrate if using old default Phnom Penh coordinates
        if (
          !parsed.latitude ||
          (Math.abs(Number(parsed.latitude) - 11.5564) < 0.01 &&
            Math.abs(Number(parsed.longitude) - 104.9282) < 0.01)
        ) {
          const updated = { ...parsed, ...COMPANY_HQ };
          localStorage.setItem('voleak_company_profile', JSON.stringify(updated));
          return updated;
        }
        return parsed;
      } catch (e) {}
    }
    return COMPANY_HQ;
  });

  // Listen to live Company HQ updates from Settings tab
  useEffect(() => {
    const handleHQUpdate = (e) => {
      if (e.detail) {
        setCompanyHQ(e.detail);
      }
    };
    window.addEventListener('company_profile_updated', handleHQUpdate);
    return () => window.removeEventListener('company_profile_updated', handleHQUpdate);
  }, []);

  // Map Filter & Search State
  const [mapSearch, setMapSearch] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('all');

  // Location Picker Search / Parse State
  const [locationSearchQuery, setLocationSearchQuery] = useState('');

  // Real Driving Road Routing State
  const [realRoadRoute, setRealRoadRoute] = useState([]);
  const [routingStats, setRoutingStats] = useState({
    distanceKm: null,
    durationText: null,
    summary: null,
    loading: false,
  });

  // Calculate Real Road Highway Driving Path strictly along Cambodian National Highways
  useEffect(() => {
    if (!selectedHubForDriver) {
      setRealRoadRoute([]);
      setRoutingStats({ distanceKm: null, durationText: null, summary: null, loading: false });
      return;
    }

    let isMounted = true;
    const originLng = Number(companyHQ?.longitude) || COMPANY_HQ.longitude;
    const originLat = Number(companyHQ?.latitude) || COMPANY_HQ.latitude;
    const destLng = Number(selectedHubForDriver.longitude);
    const destLat = Number(selectedHubForDriver.latitude);

    if (isNaN(destLng) || isNaN(destLat)) return;

    setRoutingStats((prev) => ({ ...prev, loading: true }));

    fetchCambodiaDomesticRoute(originLng, originLat, destLng, destLat).then((result) => {
      if (!isMounted) return;
      setRealRoadRoute(result.coordinates);
      setRoutingStats({
        distanceKm: result.distanceKm,
        durationText: result.durationText,
        summary: result.summary,
        loading: false,
      });
    });

    return () => {
      isMounted = false;
    };
  }, [selectedHubForDriver, companyHQ]);

  // Form State with Detailed Location for Manager
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    province: 'Phnom Penh',
    address: '',
    latitude: 11.5564,
    longitude: 104.9282,
    contact: '',
    contact_phone: '',
    manager_name: '',
    manager_phone: '',
    operating_hours: '24/7 Gate Dispatch',
    loading_bays: 12,
    weighbridge_capacity: '80 Tons Axle Scale',
    fleet_count: 10,
    rating: 4.9,
    status: 'active',
    amenities: ['Driver Rest Lounge', 'Diesel Fuel Pump', '24/7 Security'],
  });

  // Only use live operators fetched from Supabase
  const allOperators = useMemo(() => {
    const list = Array.isArray(operators) ? operators : [];
    return list.map((op, idx) => ({
      ...op,
      id: op.id || `hub-${idx + 1}`,
      name: op.name || 'Industrial Logistics Hub',
      code: op.code || `HUB-${idx + 1}`,
      latitude: Number(op.latitude) || 11.5564,
      longitude: Number(op.longitude) || 104.9282,
      province: op.province || 'Phnom Penh',
      address: op.address || 'National Highway Logistics Corridor',
      manager_name: op.manager_name || 'Hub Dispatch Manager',
      manager_phone: op.manager_phone || op.contact_phone || '',
      operating_hours: op.operating_hours || '24/7 Gate Dispatch',
      loading_bays: Number(op.loading_bays) || 0,
      weighbridge_capacity: op.weighbridge_capacity || '80 Tons Axle Scale',
      fleet_count: Number(op.fleet_count) || 0,
      rating: Number(op.rating) || 5.0,
      status: op.status || 'active',
      amenities: op.amenities || ['Driver Rest Lounge', 'Diesel Fuel Pump', '24/7 Security'],
    }));
  }, [operators]);

  // Filtered operators for map and directory
  const filteredOperators = useMemo(() => {
    let list = allOperators;
    if (provinceFilter !== 'all') {
      list = list.filter((o) => o.province === provinceFilter);
    }
    if (mapSearch.trim()) {
      const q = mapSearch.toLowerCase();
      list = list.filter(
        (o) =>
          o.name?.toLowerCase().includes(q) ||
          o.code?.toLowerCase().includes(q) ||
          o.province?.toLowerCase().includes(q) ||
          o.address?.toLowerCase().includes(q) ||
          o.manager_name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allOperators, provinceFilter, mapSearch]);

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      province: 'Phnom Penh',
      address: '',
      latitude: 11.5564,
      longitude: 104.9282,
      contact: '',
      contact_phone: '',
      manager_name: '',
      manager_phone: '',
      operating_hours: '24/7 Gate Dispatch',
      loading_bays: 12,
      weighbridge_capacity: '80 Tons Axle Scale',
      fleet_count: 10,
      rating: 4.9,
      status: 'active',
      amenities: ['Driver Rest Lounge', 'Diesel Fuel Pump', '24/7 Security'],
    });
    setLocationSearchQuery('');
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (op) => {
    setEditingOp(op);
    setFormData({
      name: op.name || '',
      code: op.code || '',
      province: op.province || 'Phnom Penh',
      address: op.address || '',
      latitude: Number(op.latitude) || 11.5564,
      longitude: Number(op.longitude) || 104.9282,
      contact: op.contact || '',
      contact_phone: op.contact_phone || op.contact || '',
      manager_name: op.manager_name || '',
      manager_phone: op.manager_phone || op.contact_phone || '',
      operating_hours: op.operating_hours || '24/7 Gate Dispatch',
      loading_bays: op.loading_bays || 12,
      weighbridge_capacity: op.weighbridge_capacity || '80 Tons Axle Scale',
      fleet_count: op.fleet_count || 0,
      rating: op.rating || 5.0,
      status: op.status || 'active',
      amenities: op.amenities || ['Driver Rest Lounge', 'Diesel Fuel Pump', '24/7 Security'],
    });
    setLocationSearchQuery('');
  };

  // Live geocoding status
  const [geoSuccessMsg, setGeoSuccessMsg] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Helper: Detect Cambodian Province based on coordinate bounding box
  const detectCambodianProvince = (lat, lng) => {
    if (lat >= 11.42 && lat <= 11.75 && lng >= 104.72 && lng <= 105.08) return 'Phnom Penh';
    if (lat >= 10.40 && lat <= 10.95 && lng >= 103.30 && lng <= 104.05) return 'Preah Sihanouk';
    if (lat >= 10.90 && lat <= 11.35 && lng >= 105.65 && lng <= 106.35) return 'Svay Rieng';
    if (lat >= 13.40 && lat <= 13.95 && lng >= 102.35 && lng <= 103.35) return 'Banteay Meanchey';
    if (lat >= 13.10 && lat <= 13.70 && lng >= 103.55 && lng <= 104.25) return 'Siem Reap';
    if (lat >= 12.80 && lat <= 13.40 && lng >= 102.85 && lng <= 103.55) return 'Battambang';
    if (lat >= 11.80 && lat <= 12.30 && lng >= 105.15 && lng <= 105.85) return 'Kampong Cham';
    if (lat >= 10.40 && lat <= 10.90 && lng >= 104.00 && lng <= 104.60) return 'Kampot';
    if (lat >= 11.30 && lat <= 11.95 && lng >= 102.75 && lng <= 103.65) return 'Koh Kong';
    return 'Phnom Penh';
  };

  // Reverse geocode and auto-fill Province, Detailed Address & Gate Zone
  const autoFillAddressFromCoords = async (lat, lng, extractedPlaceName = '') => {
    setIsGeocoding(true);
    let detectedProvince = detectCambodianProvince(lat, lng);
    let resolvedAddress = '';
    let resolvedName = extractedPlaceName || '';

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          const addr = data.address;
          const osmState = (addr.state || addr.city || addr.province || '').toLowerCase();
          if (osmState.includes('sihanouk') || osmState.includes('kompong som')) {
            detectedProvince = 'Preah Sihanouk';
          } else if (osmState.includes('phnom penh')) {
            detectedProvince = 'Phnom Penh';
          } else if (osmState.includes('svay rieng') || osmState.includes('bavet')) {
            detectedProvince = 'Svay Rieng';
          } else if (
            osmState.includes('banteay meanchey') ||
            osmState.includes('poipet') ||
            osmState.includes('sisophon')
          ) {
            detectedProvince = 'Banteay Meanchey';
          } else if (osmState.includes('siem reap')) {
            detectedProvince = 'Siem Reap';
          } else if (osmState.includes('battambang')) {
            detectedProvince = 'Battambang';
          } else if (osmState.includes('kampong cham')) {
            detectedProvince = 'Kampong Cham';
          } else if (osmState.includes('kampot')) {
            detectedProvince = 'Kampot';
          } else if (osmState.includes('koh kong')) {
            detectedProvince = 'Koh Kong';
          }

          const parts = [
            extractedPlaceName,
            addr.amenity || addr.building || addr.industrial || addr.commercial,
            addr.road || addr.highway || addr.street,
            addr.suburb || addr.neighbourhood || addr.village || addr.quarter,
            addr.city_district || addr.county || addr.district,
            detectedProvince,
          ].filter(Boolean);

          resolvedAddress = parts.join(', ');
          if (!resolvedName && (addr.amenity || addr.building || addr.industrial)) {
            resolvedName = addr.amenity || addr.building || addr.industrial;
          }
        }
      }
    } catch (err) {
      console.warn('[Reverse geocoding error]', err);
    }

    if (!resolvedAddress) {
      resolvedAddress = extractedPlaceName
        ? `${extractedPlaceName}, Gate 1 Logistics Zone, ${detectedProvince}`
        : `National Highway Corridor, Gate Zone, ${detectedProvince}`;
    }

    setFormData((prev) => ({
      ...prev,
      latitude: Number(lat.toFixed(5)),
      longitude: Number(lng.toFixed(5)),
      province: detectedProvince,
      address: resolvedAddress,
      name: prev.name || resolvedName || prev.name,
    }));

    setGeoSuccessMsg(`✨ Auto-filled: ${detectedProvince} — ${resolvedAddress.slice(0, 50)}...`);
    setIsGeocoding(false);
    setTimeout(() => setGeoSuccessMsg(''), 7000);
  };

  // Handle map click or pin drag to choose location and auto-fill address
  const handleMapLocationChange = (lat, lng) => {
    autoFillAddressFromCoords(lat, lng);
  };

  // Parse location search or Google Maps URL / coordinates and auto-fill
  const handleSearchOrParseCoordinates = async (e) => {
    e?.preventDefault();
    if (!locationSearchQuery.trim()) return;

    const query = locationSearchQuery.trim();
    let targetLat = null;
    let targetLng = null;
    let targetPlaceName = '';

    // 1. Extract place name if present in Google Maps URL (e.g. /place/Place+Name/@lat,lng)
    const placeNameMatch = query.match(/\/place\/([^/@?]+)/);
    if (placeNameMatch && placeNameMatch[1]) {
      try {
        targetPlaceName = decodeURIComponent(placeNameMatch[1].replace(/\+/g, ' '));
      } catch (err) {
        targetPlaceName = placeNameMatch[1].replace(/\+/g, ' ');
      }
    }

    // 2. Check for Google Maps !3d and !4d precise pin parameters (e.g. !3d11.0479485!4d106.1204302)
    const dataCoordMatch = query.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (dataCoordMatch) {
      targetLat = parseFloat(dataCoordMatch[1]);
      targetLng = parseFloat(dataCoordMatch[2]);
    }

    // 3. Check for @lat,lng format in Google Maps link
    if (!targetLat) {
      const atMatch = query.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch) {
        targetLat = parseFloat(atMatch[1]);
        targetLng = parseFloat(atMatch[2]);
      }
    }

    // 4. Check for q=lat,lng or ll=lat,lng or query=lat,lng
    if (!targetLat) {
      const qCoordMatch = query.match(/[?&](?:q|ll|query|center)=(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
      if (qCoordMatch) {
        targetLat = parseFloat(qCoordMatch[1]);
        targetLng = parseFloat(qCoordMatch[2]);
      }
    }

    // 5. Check for direct comma-separated coordinates: "11.5234, 104.7812"
    if (!targetLat) {
      const rawCoordMatch = query.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
      if (rawCoordMatch) {
        targetLat = parseFloat(rawCoordMatch[1]);
        targetLng = parseFloat(rawCoordMatch[2]);
      }
    }

    // 6. If coordinates found, auto-fill immediately
    if (targetLat && targetLng && !isNaN(targetLat) && !isNaN(targetLng)) {
      await autoFillAddressFromCoords(targetLat, targetLng, targetPlaceName);
      return;
    }

    // 7. Search OpenStreetMap Nominatim for address or place query
    try {
      setIsGeocoding(true);
      const searchRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query + ', Cambodia'
        )}&limit=1`
      );
      if (searchRes.ok) {
        const results = await searchRes.json();
        if (results && results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lon = parseFloat(results[0].lon);
          await autoFillAddressFromCoords(lat, lon, targetPlaceName || results[0].display_name.split(',')[0]);
          return;
        }
      }
    } catch (err) {
      console.warn('Place search error', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Use current GPS location and auto-fill address
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          autoFillAddressFromCoords(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn('Geolocation failed or denied', err);
        }
      );
    }
  };

  const handleAddOperator = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const newOp = await addLocalOperator(formData);
    setOperators([newOp, ...operators]);
    setShowAddModal(false);
    resetForm();
    if (activeTab === 'driverMap') {
      setSelectedHubForDriver(newOp);
    }
  };

  const handleUpdateOperator = async (e) => {
    e.preventDefault();
    if (!editingOp || !formData.name) return;

    const updates = {
      ...formData,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      loading_bays: Number(formData.loading_bays),
      fleet_count: Number(formData.fleet_count),
      rating: Number(formData.rating),
    };

    await updateLocalOperator(editingOp.id, updates);
    setOperators(operators.map((op) => (op.id === editingOp.id ? { ...op, ...updates } : op)));
    setEditingOp(null);
    resetForm();
  };

  const handleDeleteOperator = async () => {
    if (!deletingOp) return;
    await deleteLocalOperator(deletingOp.id);
    setOperators(operators.filter((op) => op.id !== deletingOp.id));
    setDeletingOp(null);
    if (selectedHubForDriver?.id === deletingOp.id) {
      setSelectedHubForDriver(null);
    }
  };

  // Route Handlers
  const resetRouteForm = () => {
    const defaultOrigin = companyHQ?.name || COMPANY_HQ.name;
    const defaultDest = allOperators[0]?.name || '';
    setRouteFormData({
      name: '',
      origin: defaultOrigin,
      destination: defaultDest,
      distance_km: 167,
      duration_min: 150,
      operator_id: allOperators[0]?.id || '',
      stops: ['Top Sports Central Staging Base', 'NR1 Highway Weighbridge Toll Gate'],
      status: 'active',
    });
    setStopInput('');
  };

  const openAddRouteModal = () => {
    resetRouteForm();
    setShowAddRouteModal(true);
  };

  const openEditRouteModal = (rt) => {
    setEditingRoute(rt);
    setRouteFormData({
      name: rt.name || '',
      origin: rt.origin || '',
      destination: rt.destination || '',
      distance_km: rt.distance_km || 180,
      duration_min: rt.duration_min || (rt.duration_hours ? Math.round(rt.duration_hours * 60) : 150),
      operator_id: rt.operator_id || '',
      stops: rt.stops || [],
      status: rt.status || 'active',
    });
    setStopInput('');
  };

  const handleCreateRoute = async (e) => {
    e.preventDefault();
    if (!routeFormData.origin || !routeFormData.destination) return;

    const finalName =
      routeFormData.name || `${routeFormData.origin} ⇄ ${routeFormData.destination} Freight Corridor`;

    const newRt = await addLocalRoute({
      ...routeFormData,
      name: finalName,
    });

    updateRoutes([newRt, ...routesList]);
    setShowAddRouteModal(false);
    resetRouteForm();
  };

  const handleUpdateRoute = async (e) => {
    e.preventDefault();
    if (!editingRoute || !routeFormData.origin || !routeFormData.destination) return;

    const finalName =
      routeFormData.name || `${routeFormData.origin} ⇄ ${routeFormData.destination} Freight Corridor`;

    const updated = await updateLocalRoute(editingRoute.id, {
      ...routeFormData,
      name: finalName,
    });

    updateRoutes(routesList.map((r) => (r.id === editingRoute.id ? { ...r, ...updated } : r)));
    setEditingRoute(null);
    resetRouteForm();
  };

  const handleDeleteRoute = async () => {
    if (!deletingRoute) return;
    await deleteLocalRoute(deletingRoute.id);
    updateRoutes(routesList.filter((r) => r.id !== deletingRoute.id));
    setDeletingRoute(null);
  };

  const handleRouteOnMap = (rt) => {
    const matchedDest =
      allOperators.find(
        (o) =>
          o.name?.toLowerCase().includes(rt.destination.toLowerCase()) ||
          rt.destination.toLowerCase().includes(o.name?.toLowerCase()) ||
          (o.province && rt.destination.toLowerCase().includes(o.province.toLowerCase()))
      ) || allOperators[0];

    if (matchedDest) {
      setSelectedHubForDriver(matchedDest);
    }
    setActiveTab('driverMap');
  };

  const filteredRoutes = useMemo(() => {
    if (!corridorSearch) return routesList;
    const q = corridorSearch.toLowerCase().trim();
    return routesList.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.origin?.toLowerCase().includes(q) ||
        r.destination?.toLowerCase().includes(q) ||
        r.stops?.some((s) => s.toLowerCase().includes(q))
    );
  }, [routesList, corridorSearch]);

  const totalFleet = allOperators.reduce((sum, o) => sum + (Number(o.fleet_count) || 0), 0);
  const activeHubs = allOperators.filter((o) => o.status === 'active').length;
  const totalBays = allOperators.reduce((sum, o) => sum + (Number(o.loading_bays) || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER & VIEW MODE SWITCHER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-sky-500/10 dark:from-amber-500/10 dark:via-slate-900/90 dark:to-sky-950/40 border border-amber-500/30 shadow-lg backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/30 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                SEZ Industrial Hubs & Connected Freight Corridors
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Special Economic Zones, deep-sea container ports, regional depots, and connected highway freight corridors.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher & Add Action Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1">
            <button
              onClick={() => setActiveTab('driverMap')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'driverMap'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              <span>Driver GPS Map</span>
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'directory'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Hubs ({allOperators.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('corridors')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'corridors'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Warehouse className="w-4 h-4" />
              <span>Corridors ({routesList.length})</span>
            </button>
          </div>

          {/* Action Button */}
          {activeTab === 'corridors' ? (
            <button
              onClick={openAddRouteModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 transition-all shadow-lg shadow-amber-500/25 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Freight Corridor</span>
            </button>
          ) : (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 transition-all shadow-lg shadow-amber-500/25 shrink-0"
            >
              <MapPinned className="w-4 h-4" />
              <span>+ Add Hub Location</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. SUMMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Total Logistics Hubs</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{allOperators.length} Hubs</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Freight Corridors</p>
            <p className="text-2xl font-black text-amber-500 mt-0.5">{routesList.length} Connected</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Warehouse className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Active Partner Hubs</p>
            <p className="text-2xl font-black text-emerald-500 mt-0.5">{activeHubs} Active</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Container Loading Bays</p>
            <p className="text-2xl font-black text-sky-500 mt-0.5">{totalBays} Bays</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Assigned Heavy Fleet</p>
            <p className="text-2xl font-black text-amber-500 mt-0.5">{totalFleet} Trucks</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT: DRIVER MAP MODE OR DIRECTORY MODE */}
      {activeTab === 'driverMap' ? (
        /* ================= DRIVER & FLEET NAVIGATION MAP ================= */
        <div className="space-y-4">
          {/* Map Filters & Search Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={mapSearch}
                  onChange={(e) => setMapSearch(e.target.value)}
                  placeholder="Search hub name, SEZ, province, manager..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Province Filter */}
              <select
                value={provinceFilter}
                onChange={(e) => setProvinceFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">All Provinces</option>
                <option value="Phnom Penh">Phnom Penh</option>
                <option value="Preah Sihanouk">Preah Sihanouk (Port)</option>
                <option value="Svay Rieng">Svay Rieng (Bavet SEZ)</option>
                <option value="Banteay Meanchey">Banteay Meanchey (Poipet)</option>
                <option value="Siem Reap">Siem Reap</option>
                <option value="Battambang">Battambang</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 self-end md:self-center">
              <span className="flex items-center gap-1.5 font-bold text-amber-500">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                {filteredOperators.length} Hubs Visible on Map
              </span>
            </div>
          </div>

          {/* Map Layout: Interactive Map + Driver Dispatch Telemetry Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interactive Leaflet Map (2 Cols) */}
            <div className="lg:col-span-2 h-[560px] rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 relative">
              <MapContainer
                center={[12.45, 104.8]}
                zoom={7}
                scrollWheelZoom={true}
                className="w-full h-full"
              >
                <ChangeMapView
                  center={
                    selectedHubForDriver &&
                    !isNaN(Number(selectedHubForDriver.latitude)) &&
                    !isNaN(Number(selectedHubForDriver.longitude))
                      ? [Number(selectedHubForDriver.latitude), Number(selectedHubForDriver.longitude)]
                      : [
                          Number(companyHQ?.latitude) || COMPANY_HQ.latitude,
                          Number(companyHQ?.longitude) || COMPANY_HQ.longitude,
                        ]
                  }
                  zoom={selectedHubForDriver ? 11 : 7}
                />

                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* 1. Company Headquarters Marker (Origin) */}
                <Marker
                  position={[
                    Number(companyHQ?.latitude) || COMPANY_HQ.latitude,
                    Number(companyHQ?.longitude) || COMPANY_HQ.longitude,
                  ]}
                  icon={createCompanyHQMarkerIcon()}
                >
                  <Popup>
                    <div className="p-2 space-y-1 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        ORIGIN DISPATCH BASE
                      </span>
                      <h4 className="font-extrabold text-slate-900">{companyHQ?.name || 'Your Company HQ'}</h4>
                      <p className="text-slate-600 text-[11px]">{companyHQ?.address}</p>
                      <p className="text-slate-500 text-[10px]">Central Dispatch Hotline: {companyHQ?.phone || companyHQ?.manager_phone}</p>
                    </div>
                  </Popup>
                </Marker>

                {/* 2. Real Highway Road Route Polyline (Shown ONLY when an SEZ is clicked) */}
                {Array.isArray(realRoadRoute) && realRoadRoute.length > 0 && (
                  <Polyline
                    positions={realRoadRoute}
                    color="#f59e0b"
                    weight={6}
                    opacity={0.85}
                  />
                )}

                {/* 3. SEZ Industrial Hub Markers */}
                {filteredOperators
                  .filter((h) => !isNaN(Number(h.latitude)) && !isNaN(Number(h.longitude)))
                  .map((hub) => {
                    const lat = Number(hub.latitude);
                    const lng = Number(hub.longitude);
                    const isSelected =
                      selectedHubForDriver &&
                      (selectedHubForDriver.id === hub.id ||
                        (selectedHubForDriver.code === hub.code && selectedHubForDriver.name === hub.name));

                    return (
                      <Marker
                        key={hub.id || hub.code}
                        position={[lat, lng]}
                        icon={createHubMarkerIcon(hub.status, hub.code, isSelected)}
                        eventHandlers={{
                          click: () => setSelectedHubForDriver(hub),
                        }}
                      >
                        <Popup>
                          <div className="p-2 space-y-1.5 text-xs min-w-[200px]">
                            <div className="flex items-center justify-between border-b pb-1">
                              <span className="font-mono font-bold text-amber-600">{hub.code}</span>
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                                {hub.status}
                              </span>
                            </div>
                            {(() => {
                              const shortName = getShortDisplayName(hub, allCooperators);
                              if (!shortName) return null;
                              return (
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 font-extrabold text-[10px]">
                                  🏢 Short Name: {shortName}
                                </div>
                              );
                            })()}
                            <h4 className="font-bold text-slate-900">{hub.name}</h4>
                            <p className="text-slate-600 text-[11px]">{hub.address}</p>
                            <div className="pt-1 text-[11px] text-slate-500 font-medium">
                              Manager: <strong>{hub.manager_name}</strong> ({hub.manager_phone})
                            </div>
                            {(() => {
                              const shortName = getShortDisplayName(hub, allCooperators);
                              const matchingCop = allCooperators.find(
                                (c) =>
                                  c.operator_id === hub.id ||
                                  (hub.province && c.province && c.province.toLowerCase() === hub.province.toLowerCase())
                              );
                              if (!matchingCop && !shortName) return null;
                              return (
                                <div className="pt-1 text-[10px] text-purple-700 dark:text-purple-400 font-semibold flex items-center gap-1 border-t border-slate-100 dark:border-slate-800 mt-1">
                                  <Handshake className="w-3 h-3 text-purple-500" />
                                  <span>Partner: {shortName || matchingCop?.name}</span>
                                </div>
                              );
                            })()}
                            <div className="pt-2 flex items-center justify-between">
                              <span className="font-bold text-sky-600">{hub.loading_bays} Loading Bays</span>
                              <button
                                onClick={() => setSelectedHubForDriver(hub)}
                                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm transition-all"
                              >
                                <Navigation className="w-3 h-3" /> Show Road Route
                              </button>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
              </MapContainer>

              {/* Dynamic Live Route Banner Overlay (Shown when an SEZ is clicked) */}
              {selectedHubForDriver && (
                <div className="absolute top-4 left-4 z-[400] px-4 py-2.5 rounded-2xl bg-slate-950/90 text-white backdrop-blur-md border border-amber-500/40 text-xs shadow-2xl flex items-center gap-3 animate-fadeIn">
                  <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                  <div>
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      Real Driving Road Path Active
                    </p>
                    <p className="font-extrabold text-white text-xs">
                      {companyHQ?.name || 'Company HQ'} ➔ {selectedHubForDriver.name}
                      {routingStats.distanceKm && (
                        <span className="text-amber-400 font-mono ml-2">
                          ({routingStats.distanceKm} km • {routingStats.durationText})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Driver Navigation & Hub Dispatch Card (1 Col) */}
            <div className="space-y-4">
              {selectedHubForDriver ? (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-5">
                  {/* Selected Hub Title */}
                  <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {selectedHubForDriver.code}
                        </span>
                        {(() => {
                          const shortName = getShortDisplayName(selectedHubForDriver, allCooperators);
                          if (!shortName) return null;
                          return (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 shadow-sm">
                              🏢 {shortName}
                            </span>
                          );
                        })()}
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1.5">
                        {selectedHubForDriver.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        {selectedHubForDriver.address}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedHubForDriver(null)}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Real Driving Highway Route Stats from Company HQ */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shadow-md">
                          <Navigation className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                            Real Road Driving Distance
                          </span>
                          <p className="text-base font-black text-slate-900 dark:text-white">
                            {routingStats.loading
                              ? 'Calculating Road Route...'
                              : `${
                                  routingStats.distanceKm ||
                                  calculateDistanceKm(
                                    Number(companyHQ?.latitude) || COMPANY_HQ.latitude,
                                    Number(companyHQ?.longitude) || COMPANY_HQ.longitude,
                                    selectedHubForDriver.latitude,
                                    selectedHubForDriver.longitude
                                  )
                                } km`}
                          </p>
                        </div>
                      </div>

                      {routingStats.durationText && (
                        <div className="text-right">
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            Est. Driving Time
                          </span>
                          <p className="text-sm font-black text-emerald-500">
                            ~{routingStats.durationText}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-amber-500/20 text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium truncate">
                        <Compass className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        {routingStats.summary || 'Cambodian National Highway Corridor'}
                      </span>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${companyHQ?.latitude || COMPANY_HQ.latitude},${companyHQ?.longitude || COMPANY_HQ.longitude}&destination=${selectedHubForDriver.latitude},${selectedHubForDriver.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1 shrink-0 transition-all"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Google GPS Directions</span>
                      </a>
                    </div>
                  </div>

                  {/* Hub Manager Contact & Operating Hours */}
                  <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-amber-500" /> Hub Manager:
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {selectedHubForDriver.manager_name || 'Hub Dispatcher'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" /> Gate Hotline:
                      </span>
                      <a
                        href={`tel:${selectedHubForDriver.manager_phone || selectedHubForDriver.contact_phone}`}
                        className="font-mono font-bold text-emerald-500 hover:underline flex items-center gap-1"
                      >
                        {selectedHubForDriver.manager_phone || selectedHubForDriver.contact_phone || '—'}
                      </a>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-sky-500" /> Operating Schedule:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {selectedHubForDriver.operating_hours || '24/7 Gate Dispatch'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-purple-500" /> Axle Weighbridge:
                      </span>
                      <span className="font-semibold text-purple-500">
                        {selectedHubForDriver.weighbridge_capacity || '80 Tons Axle Scale'}
                      </span>
                    </div>
                  </div>

                  {/* Driver Amenities Checklist */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                      Driver Facilities & Amenities
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedHubForDriver.amenities || ['Driver Rest Lounge', 'Diesel Fuel Pump', '24/7 Security']).map(
                        (am, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            {am}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Prompt to Select a Hub */
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                    <Navigation className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Select Any Hub on the Map
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                      Click on any Cambodian logistics hub pin or choose from the list below to view exact gate instructions, manager phone, and GPS navigation.
                    </p>
                  </div>

                  {/* Quick Hub List Selector */}
                  <div className="space-y-2 text-left max-h-72 overflow-y-auto pt-2">
                    {filteredOperators.map((hub) => (
                      <div
                        key={hub.id || hub.code}
                        onClick={() => setSelectedHubForDriver(hub)}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-amber-500/10 hover:border-amber-500/40 border border-slate-100 dark:border-slate-700/60 cursor-pointer transition-all flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-mono font-bold text-xs">
                            {hub.code?.slice(0, 3)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block truncate max-w-[160px]">
                              {hub.name}
                            </span>
                            <span className="text-[10px] text-slate-400">{hub.province}</span>
                          </div>
                        </div>
                        <span className="font-mono text-amber-500 font-bold">
                          {calculateDistanceKm(
                            Number(companyHQ?.latitude) || COMPANY_HQ.latitude,
                            Number(companyHQ?.longitude) || COMPANY_HQ.longitude,
                            hub.latitude,
                            hub.longitude
                          )}{' '}
                          km
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'directory' ? (
        /* ================= HUB DIRECTORY (MANAGER VIEW) ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOperators.length === 0 ? (
            <div className="col-span-full p-12 text-center text-slate-400 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              No Industrial Logistics Hubs match your search. Click &quot;+ Add Hub & Pick Location on Map&quot; above.
            </div>
          ) : (
            filteredOperators.map((op) => (
              <div
                key={op.id || op.code}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 relative overflow-hidden transition-all hover:shadow-md hover:border-amber-500/30 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-extrabold shadow-md shadow-amber-500/20 shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      {(() => {
                        const shortName = getShortDisplayName(op, allCooperators);
                        if (!shortName) return null;
                        return (
                          <div className="mb-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 inline-flex items-center gap-1">
                              🏢 Short Name: {shortName}
                            </span>
                          </div>
                        );
                      })()}
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {op.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {op.code || 'HUB'}
                        </span>
                        <span className="text-[10px] font-semibold text-amber-500">{op.province}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      op.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    }`}
                  >
                    {op.status || 'active'}
                  </span>
                </div>

                {/* Hub Location & Address */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 text-xs space-y-1.5">
                  <p className="text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{op.address}</span>
                  </p>
                </div>

                {/* Manager & Operational Specs */}
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-500" /> Hub Manager:
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{op.manager_name || 'Operations Lead'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" /> Manager Phone:
                    </span>
                    <span className="font-mono font-medium">{op.manager_phone || op.contact_phone || '—'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-sky-500" /> Loading Bays:
                    </span>
                    <span className="font-bold text-sky-500">{op.loading_bays || 12} Bays</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-amber-500" /> Assigned Fleet:
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{op.fleet_count || 0} Trucks</span>
                  </div>

                  {(() => {
                    const matchingCop = allCooperators.find(
                      (c) =>
                        c.operator_id === op.id ||
                        (op.province && c.province && c.province.toLowerCase() === op.province.toLowerCase())
                    );
                    if (!matchingCop) return null;
                    return (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Handshake className="w-3.5 h-3.5 text-purple-500" /> SEZ Enterprise Client:
                        </span>
                        <button
                          onClick={() => {
                            if (setDashboardTab) setDashboardTab('cooperators');
                          }}
                          className="font-bold text-purple-600 dark:text-purple-400 hover:underline truncate max-w-[170px] text-left"
                          title="View in Cooperators"
                        >
                          {matchingCop.name}
                        </button>
                      </div>
                    );
                  })()}

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Warehouse className="w-3.5 h-3.5 text-amber-500" /> Connected Routes:
                    </span>
                    <button
                      onClick={() => {
                        setCorridorSearch(op.name);
                        setActiveTab('corridors');
                      }}
                      className="font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1"
                    >
                      <span>
                        {
                          routesList.filter(
                            (r) =>
                              r.operator_id === op.id ||
                              r.origin?.toLowerCase().includes(op.name?.toLowerCase()) ||
                              r.destination?.toLowerCase().includes(op.name?.toLowerCase()) ||
                              (op.province && (r.origin?.toLowerCase().includes(op.province?.toLowerCase()) || r.destination?.toLowerCase().includes(op.province?.toLowerCase())))
                          ).length
                        }{' '}
                        Corridors
                      </span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      setSelectedHubForDriver(op);
                      setActiveTab('driverMap');
                    }}
                    className="text-xs font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>View Driver Map</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(op)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
                      title="Edit Hub Location"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                    </button>
                    <button
                      onClick={() => setDeletingOp(op)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-all"
                      title="Delete Hub"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* ================= INDUSTRIAL FREIGHT CORRIDORS ================= */
        <div className="space-y-6">
          {/* Corridors Search & Action Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={corridorSearch}
                onChange={(e) => setCorridorSearch(e.target.value)}
                placeholder="Search freight corridors, highway numbers, origin or destination hubs..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              {corridorSearch && (
                <button
                  onClick={() => setCorridorSearch('')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200"
                >
                  Clear Filter
                </button>
              )}
              <button
                onClick={openAddRouteModal}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Add Freight Corridor</span>
              </button>
            </div>
          </div>

          {/* Corridors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRoutes.length === 0 ? (
              <div className="col-span-full p-12 text-center text-slate-400 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                No freight corridors match your search. Click &quot;+ Add Freight Corridor&quot; to connect industrial hubs.
              </div>
            ) : (
              filteredRoutes.map((rt) => {
                const hub = allOperators.find((o) => o.id === rt.operator_id);
                const durationHours = Math.floor(
                  (rt.duration_min || (rt.duration_hours ? rt.duration_hours * 60 : 180)) / 60
                );
                const durationMins =
                  (rt.duration_min || (rt.duration_hours ? rt.duration_hours * 60 : 180)) % 60;

                return (
                  <div
                    key={rt.id}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 relative overflow-hidden group hover:border-amber-500/50 transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/25 shrink-0">
                          <Navigation className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                              {rt.name}
                            </h3>
                            {(() => {
                              const shortName = getShortDisplayName(rt, allCooperators);
                              if (!shortName) return null;
                              return (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 shadow-sm shrink-0">
                                  🏢 {shortName}
                                </span>
                              );
                            })()}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Building className="w-3.5 h-3.5 text-amber-500" />
                            <span>Hub: {hub ? hub.name : 'Cambodian National Logistics Base'}</span>
                          </p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 shrink-0">
                        {rt.status || 'active'}
                      </span>
                    </div>

                    {/* Origin & Destination Route Connection */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-1.5 max-w-[45%]">
                          <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="truncate">{rt.origin}</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center px-2">
                          <div className="w-full border-t-2 border-dashed border-amber-500/40 relative flex items-center justify-center">
                            <Truck className="w-4 h-4 text-amber-500 bg-slate-50 dark:bg-slate-800 px-0.5 absolute -top-2" />
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 max-w-[45%] text-right justify-end">
                          <span className="truncate">{rt.destination}</span>
                          <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                        </div>
                      </div>
                    </div>

                    {/* Specs: Distance & Lead time */}
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                          Corridor Distance
                        </span>
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {rt.distance_km || 0} km
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                          Transit Lead Time
                        </span>
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {durationHours}h {durationMins > 0 ? `${durationMins}m` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Waypoints & Checkpoints */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Scale className="w-3 h-3 text-amber-500" />
                        Weighbridges & Toll Checkpoints ({rt.stops?.length || 0})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {rt.stops && rt.stops.length > 0 ? (
                          rt.stops.map((stop, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60"
                            >
                              {i + 1}. {stop}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">Direct Highway Transit</span>
                        )}
                      </div>
                    </div>

                    {/* Linked Cooperator / Factory Client with Short Display Name */}
                    {(() => {
                      const shortName = getShortDisplayName(rt, allCooperators);
                      const matchedCops = allCooperators.filter(
                        (c) =>
                          c.primary_corridor === rt.name ||
                          (rt.destination && c.province && rt.destination.toLowerCase().includes(c.province.toLowerCase()))
                      );
                      const displayPartner = shortName || matchedCops[0]?.short_name || matchedCops[0]?.name;
                      if (!displayPartner) return null;
                      return (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 flex items-center justify-between text-xs">
                          <span className="text-amber-800 dark:text-amber-300 flex items-center gap-1.5 text-[11px] font-semibold">
                            <Handshake className="w-3.5 h-3.5 text-amber-500" /> Short Display Name:
                          </span>
                          <button
                            onClick={() => {
                              if (setDashboardTab) setDashboardTab('cooperators');
                            }}
                            className="font-extrabold text-amber-600 dark:text-amber-400 hover:underline truncate max-w-[210px] text-right"
                            title="View in Cooperators tab"
                          >
                            🏢 {displayPartner}
                          </button>
                        </div>
                      );
                    })()}

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleRouteOnMap(rt)}
                        className="text-xs font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1.5 transition-colors"
                      >
                        <MapIcon className="w-3.5 h-3.5" />
                        <span>Show On Highway Map</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditRouteModal(rt)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
                          title="Edit Freight Corridor"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                        </button>
                        <button
                          onClick={() => setDeletingRoute(rt)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-all"
                          title="Delete Corridor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 4. ADD / EDIT FREIGHT CORRIDOR MODAL */}
      {(showAddRouteModal || editingRoute) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-amber-500" />
                {editingRoute ? 'Edit Freight Corridor' : 'Add New Industrial Freight Corridor'}
              </h3>
              <button
                onClick={() => {
                  setShowAddRouteModal(false);
                  setEditingRoute(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingRoute ? handleUpdateRoute : handleCreateRoute} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Corridor Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Phnom Penh ⇄ Sihanoukville Expressway Corridor"
                  value={routeFormData.name}
                  onChange={(e) => setRouteFormData({ ...routeFormData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Origin Hub / Plant <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="hubs-origin-list"
                    placeholder="e.g. Phnom Penh Central Hub"
                    value={routeFormData.origin}
                    onChange={(e) => setRouteFormData({ ...routeFormData, origin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <datalist id="hubs-origin-list">
                    {allOperators.map((o) => (
                      <option key={o.id} value={o.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Destination Hub / Port <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="hubs-dest-list"
                    placeholder="e.g. Sihanoukville Port Gateway"
                    value={routeFormData.destination}
                    onChange={(e) => setRouteFormData({ ...routeFormData, destination: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <datalist id="hubs-dest-list">
                    {allOperators.map((o) => (
                      <option key={o.id} value={o.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={routeFormData.distance_km}
                    onChange={(e) => setRouteFormData({ ...routeFormData, distance_km: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Transit Lead Time (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={routeFormData.duration_min}
                    onChange={(e) => setRouteFormData({ ...routeFormData, duration_min: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Associated Hub Partner
                </label>
                <select
                  value={routeFormData.operator_id}
                  onChange={(e) => setRouteFormData({ ...routeFormData, operator_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- National Logistics Corridor --</option>
                  {allOperators.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.province})
                    </option>
                  ))}
                </select>
              </div>

              {/* Checkpoints Builder */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Weighbridges & Intermediate Toll Checkpoints
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. NR4 Kampong Speu Weighbridge Gate"
                    value={stopInput}
                    onChange={(e) => setStopInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!stopInput.trim()) return;
                      setRouteFormData({
                        ...routeFormData,
                        stops: [...(routeFormData.stops || []), stopInput.trim()],
                      });
                      setStopInput('');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                  >
                    + Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  {routeFormData.stops && routeFormData.stops.length > 0 ? (
                    routeFormData.stops.map((st, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] flex items-center gap-1"
                      >
                        <span>{st}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setRouteFormData({
                              ...routeFormData,
                              stops: routeFormData.stops.filter((_, i) => i !== idx),
                            })
                          }
                          className="hover:text-rose-500"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-[11px]">No intermediate checkpoints added.</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddRouteModal(false);
                    setEditingRoute(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                >
                  {editingRoute ? 'Save Corridor' : 'Create Corridor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SweetAlert for Corridor Delete */}
      <SweetAlertModal
        isOpen={!!deletingRoute}
        onClose={() => setDeletingRoute(null)}
        onConfirm={handleDeleteRoute}
        title="Delete Freight Corridor?"
        text="You won't be able to revert this! The connected industrial highway shipping route and schedules will be disconnected."
        confirmButtonText="Yes, delete corridor!"
        cancelButtonText="Cancel"
        itemName={deletingRoute?.name}
        itemSubtext={`${deletingRoute?.origin} ⇄ ${deletingRoute?.destination} (${deletingRoute?.distance_km} km)`}
      />

      {/* 4. ADD / EDIT HUB LOCATION MODAL WITH GOOGLE MAP-STYLE PIN PICKER */}
      {(showAddModal || editingOp) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-4xl p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPinned className="w-5 h-5 text-amber-500" />
                  {editingOp ? 'Edit Industrial Hub & Choose on Map' : 'Add New Industrial Hub & Choose on Map (Manager)'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click or drag the pin anywhere on the Google Map picker to set the exact warehouse location.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingOp(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* INTERACTIVE MAP PIN PICKER SECTION */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    Interactive Map Pinpoint Location Picker
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                    (Click or drag the red pin)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 flex items-center gap-1 transition-all"
                  >
                    <LocateFixed className="w-3.5 h-3.5 text-sky-500" />
                    <span>My GPS</span>
                  </button>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${formData.latitude},${formData.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 flex items-center gap-1 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
                    <span>Verify on Google Maps</span>
                  </a>
                </div>
              </div>

              {/* Google Maps Link / Location Search Input with Auto-Fill */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                    <input
                      type="text"
                      value={locationSearchQuery}
                      onChange={(e) => setLocationSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchOrParseCoordinates(e)}
                      placeholder="Paste Google Maps link (e.g. https://maps.app.goo.gl/... or place link) or search place..."
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 focus:border-amber-500 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-medium"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchOrParseCoordinates}
                    disabled={isGeocoding}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    {isGeocoding ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Auto-Filling...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>⚡ Auto-Fill Province & Address</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Auto-Fill Live Feedback Notification */}
                {geoSuccessMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{geoSuccessMsg}</span>
                  </div>
                )}
              </div>

              {/* Embedded Leaflet Map for Pin Picking */}
              <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative shadow-inner">
                <MapContainer
                  center={[formData.latitude || 11.5564, formData.longitude || 104.9282]}
                  zoom={11}
                  minZoom={7}
                  maxZoom={18}
                  maxBounds={[
                    [9.9, 102.2],
                    [14.9, 107.9],
                  ]}
                  maxBoundsViscosity={1.0}
                  scrollWheelZoom={true}
                  className="w-full h-full"
                >
                  <ChangeMapView center={[formData.latitude, formData.longitude]} zoom={12} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPickerEvents
                    position={[formData.latitude || 11.5564, formData.longitude || 104.9282]}
                    onLocationChange={handleMapLocationChange}
                  />
                </MapContainer>

                {/* Selected Location Overlay Pill */}
                <div className="absolute bottom-2.5 left-2.5 z-[400] px-3 py-1.5 rounded-xl bg-slate-900/90 text-white backdrop-blur-md border border-slate-700 text-xs font-bold shadow-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Pin Placed on Map</span>
                </div>
              </div>
            </div>

            <form onSubmit={editingOp ? handleUpdateOperator : handleAddOperator} className="space-y-4 text-xs">
              {/* Row 1: Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hub / SEZ Park Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Phnom Penh SEZ Central Logistics Hub"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hub Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="PP-SEZ-01"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Location & Province */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Province / City <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Phnom Penh">Phnom Penh</option>
                    <option value="Preah Sihanouk">Preah Sihanouk (Port)</option>
                    <option value="Svay Rieng">Svay Rieng (Bavet SEZ)</option>
                    <option value="Banteay Meanchey">Banteay Meanchey (Poipet)</option>
                    <option value="Siem Reap">Siem Reap</option>
                    <option value="Battambang">Battambang</option>
                    <option value="Kampong Cham">Kampong Cham</option>
                    <option value="Kampot">Kampot</option>
                    <option value="Koh Kong">Koh Kong</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Detailed Address / Gate Zone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. National Road 4, PPSEZ Zone A-12, Pou Senchey"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Row 3: Manager Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hub Operations Manager Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sokha Rith"
                    value={formData.manager_name}
                    onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Manager Hotline / Gate Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+855 12 991 101"
                    value={formData.manager_phone}
                    onChange={(e) => setFormData({ ...formData, manager_phone: e.target.value, contact_phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Row 5: Operational Specs (Loading Bays, Operating Hours, Weighbridge) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Loading Bays
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.loading_bays}
                    onChange={(e) => setFormData({ ...formData, loading_bays: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Operating Schedule
                  </label>
                  <input
                    type="text"
                    placeholder="24/7 Gate Dispatch"
                    value={formData.operating_hours}
                    onChange={(e) => setFormData({ ...formData, operating_hours: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Weighbridge Axle Scale
                  </label>
                  <input
                    type="text"
                    placeholder="80 Tons Axle Scale"
                    value={formData.weighbridge_capacity}
                    onChange={(e) => setFormData({ ...formData, weighbridge_capacity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingOp(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold shadow-lg shadow-amber-500/25"
                >
                  {editingOp ? 'Save Location Changes' : 'Register Hub Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SweetAlert Animated Delete Modal */}
      <SweetAlertModal
        isOpen={!!deletingOp}
        onClose={() => setDeletingOp(null)}
        onConfirm={handleDeleteOperator}
        title="Delete Industrial Logistics Hub?"
        text="You won't be able to revert this! All attached loading bays and partner manifests will be disconnected."
        confirmButtonText="Yes, delete hub!"
        cancelButtonText="Cancel"
        itemName={deletingOp?.name}
        itemSubtext={`${deletingOp?.code || 'HUB'} • ${deletingOp?.province || 'Cambodia'} • ${deletingOp?.address || ''}`}
      />
    </div>
  );
}
