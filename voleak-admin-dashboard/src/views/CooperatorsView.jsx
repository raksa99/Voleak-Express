import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Handshake,
  Building2,
  Building,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Truck,
  Package,
  Calendar,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  Star,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  DollarSign,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileText,
  Warehouse,
  ArrowRight,
  Navigation,
  Scale,
  Route as RouteIcon,
  Upload,
  Camera,
  RefreshCw,
  Copy,
  Check,
  Database,
  Image as ImageIcon,
} from 'lucide-react';
import {
  fetchCooperators,
  syncCooperatorsToSupabase,
  checkCooperatorsTableStatus,
  addLocalCooperator,
  updateLocalCooperator,
  deleteLocalCooperator,
  syncHubAndCorridorLocation,
  COOPERATORS_SQL_MIGRATION,
} from '../lib/supabaseClient';
import SweetAlertModal from '../components/SweetAlertModal';

// Preset Verified Corporate Logos for Quick Selection
const PRESET_COOPERATOR_LOGOS = [
  {
    label: 'Textiles & Mills',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&q=80',
  },
  {
    label: 'Apparel & Garments',
    url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=300&q=80',
  },
  {
    label: 'Chemicals & Drums',
    url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=300&q=80',
  },
  {
    label: 'Factory Machinery',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80',
  },
  {
    label: 'Heavy Logistics',
    url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=300&q=80',
  },
  {
    label: 'Cold Chain / Hub',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=300&q=80',
  },
];

export default function CooperatorsView({
  cooperators = [],
  setCooperators,
  operators = [],
  routes = [],
  searchVal = '',
  setActiveTab,
  onRefresh,
}) {
  const { t } = useLanguage();

  const allOperators = Array.isArray(operators) ? operators : [];
  const allRoutes = Array.isArray(routes) ? routes : [];

  // Local state if not provided from props
  const [localList, setLocalList] = useState(cooperators || []);
  const items = Array.isArray(cooperators) ? cooperators : (localList || []);
  const updateList = setCooperators || setLocalList;

  const [industryFilter, setIndustryFilter] = useState('all');
  const [hubFilter, setHubFilter] = useState('all');
  const [selectedCooperator, setSelectedCooperator] = useState(null);
  const [detailTab, setDetailTab] = useState('overview'); // 'overview' | 'shipments' | 'financials'
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCooperator, setEditingCooperator] = useState(null);
  const [deletingCooperator, setDeletingCooperator] = useState(null);

  // Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [tableStatus, setTableStatus] = useState({ checked: false, exists: false, count: 0 });
  const [copiedSql, setCopiedSql] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4500);
  };

  const refreshTableStatus = async () => {
    const status = await checkCooperatorsTableStatus();
    setTableStatus({ checked: true, exists: status.exists, count: status.count });
    return status;
  };

  useEffect(() => {
    refreshTableStatus();
  }, []);

  const handleSyncDatabase = async () => {
    setIsSyncing(true);
    try {
      const status = await checkCooperatorsTableStatus();
      setTableStatus({ checked: true, exists: status.exists, count: status.count });

      if (!status.exists) {
        showToast('⚠️ Supabase table "public.cooperators" not created yet. Please copy the SQL migration and run it in Supabase SQL editor.');
        setIsSyncing(false);
        return;
      }

      // Upsert local items to Supabase cloud
      const syncRes = await syncCooperatorsToSupabase(items);
      if (!syncRes.success) {
        console.warn('Sync warning', syncRes.error);
      }

      // Fetch fresh items from Supabase
      const fresh = await fetchCooperators();
      if (fresh && fresh.length > 0) {
        updateList(fresh);
      }

      if (onRefresh) {
        await onRefresh();
      }

      const updatedStatus = await checkCooperatorsTableStatus();
      setTableStatus({ checked: true, exists: true, count: updatedStatus.count || fresh?.length || items.length });
      showToast(`⚡ Synced with Supabase: ${fresh?.length || items.length} Cooperators synchronized with cloud database.`);
    } catch (err) {
      console.warn('Sync error', err);
      showToast('⚠️ Sync failed. Please check Supabase credentials.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyMigrationSql = () => {
    navigator.clipboard.writeText(COOPERATORS_SQL_MIGRATION);
    setCopiedSql(true);
    showToast('📋 Cooperators SQL Schema script copied to clipboard!');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Form State
  const defaultHub = allOperators[0] || null;
  const defaultRoute = allRoutes[0] || null;

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [geoFeedback, setGeoFeedback] = useState('');

  const initialFormState = {
    name: '',
    short_name: '',
    code: '',
    industry: 'Garments & Textiles',
    category: 'Garment & Apparel Manufacturing',
    operator_id: defaultHub?.id || 'op-1',
    hub_name: '',
    primary_corridor: '',
    google_maps_link: '',
    contact_person: '',
    contact_title: '',
    phone: '',
    email: '',
    address: '',
    province: '',
    latitude: null,
    longitude: null,
    tier: 'Gold Partner',
    discount_rate: '',
    payment_terms: 'Net 30 Days',
    credit_limit: 0.85,
    sell_price_kg: 0.85,
    current_balance: 0,
    tax_id: '',
    logo_url: '',
    notes: '',
    status: 'active',
  };

  const [formData, setFormData] = useState(initialFormState);

  const resetForm = () => {
    setFormData(initialFormState);
    setGeoFeedback('');
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (cop) => {
    setEditingCooperator(cop);
    setGeoFeedback('');
    const effectiveSellPrice =
      cop.sell_price_kg !== undefined
        ? cop.sell_price_kg
        : cop.credit_limit !== undefined && cop.credit_limit < 100
        ? cop.credit_limit
        : 0.85;

    setFormData({
      name: cop.name || '',
      short_name: cop.short_name || '',
      code: cop.code || '',
      industry: cop.industry || 'Garments & Textiles',
      category: cop.category || 'Garment & Apparel Manufacturing',
      operator_id: cop.operator_id || allOperators[0]?.id || 'op-1',
      hub_name: cop.hub_name || allOperators.find((o) => o.id === cop.operator_id)?.name || allOperators[0]?.name || '',
      primary_corridor: cop.primary_corridor || allRoutes[0]?.name || 'Phnom Penh Central Hub ⇄ Sihanoukville Port Deep Sea Terminal',
      google_maps_link: cop.google_maps_link || (cop.latitude && cop.longitude ? `https://www.google.com/maps?q=${cop.latitude},${cop.longitude}` : ''),
      contact_person: cop.contact_person || '',
      contact_title: cop.contact_title || 'Procurement & Logistics Director',
      phone: cop.phone || '',
      email: cop.email || '',
      address: cop.address || '',
      province: cop.province || 'Phnom Penh',
      latitude: cop.latitude || 11.5564,
      longitude: cop.longitude || 104.9282,
      tier: cop.tier || 'Gold Partner',
      discount_rate: cop.discount_rate || '10% Off',
      payment_terms: cop.payment_terms || 'Net 30 Days',
      credit_limit: effectiveSellPrice,
      sell_price_kg: effectiveSellPrice,
      current_balance: cop.current_balance || 0,
      tax_id: cop.tax_id || '',
      logo_url: cop.logo_url || '',
      notes: cop.notes || '',
      status: cop.status || 'active',
    });
  };

  // Helper to detect province from coords
  const detectProvinceFromCoords = (lat, lng) => {
    if (lat >= 11.42 && lat <= 11.75 && lng >= 104.72 && lng <= 105.08) return 'Phnom Penh';
    if (lat >= 10.4 && lat <= 10.95 && lng >= 103.3 && lng <= 104.05) return 'Preah Sihanouk';
    if (lat >= 10.9 && lat <= 11.35 && lng >= 105.65 && lng <= 106.35) return 'Svay Rieng';
    if (lat >= 13.4 && lat <= 13.95 && lng >= 102.35 && lng <= 103.35) return 'Banteay Meanchey';
    if (lat >= 13.1 && lat <= 13.7 && lng >= 103.55 && lng <= 104.25) return 'Siem Reap';
    if (lat >= 12.8 && lat <= 13.4 && lng >= 102.85 && lng <= 103.55) return 'Battambang';
    if (lat >= 11.8 && lat <= 12.3 && lng >= 105.15 && lng <= 105.85) return 'Kampong Cham';
    if (lat >= 10.4 && lat <= 10.9 && lng >= 104.0 && lng <= 104.6) return 'Kampot';
    return 'Phnom Penh';
  };

  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Parse Google Maps Link or Location query, auto-detect location and link to nearest Hub & Corridor
  const parseAndLinkGoogleMapsLocation = async (queryInput) => {
    if (!queryInput || !queryInput.trim()) return;
    const query = queryInput.trim();
    setIsDetectingLocation(true);
    setGeoFeedback('Detecting location from Google Maps...');

    let targetLat = null;
    let targetLng = null;
    let targetPlaceName = '';

    // 0. Resolve shortened or full Google Maps URLs via backend resolver
    if (query.startsWith('http')) {
      try {
        const resolveRes = await fetch(`/api/resolve-maps-location?url=${encodeURIComponent(query)}`);
        if (resolveRes.ok) {
          const resData = await resolveRes.json();
          if (resData.lat && resData.lng) {
            targetLat = Number(resData.lat);
            targetLng = Number(resData.lng);
          }
          if (resData.placeName) {
            targetPlaceName = resData.placeName;
          }
        }
      } catch (err) {
        console.warn('[Resolve maps URL fallback to client parsing]', err);
      }
    }

    // 1. Extract place name from Google Maps URL if present: /place/Name/@lat,lng
    const placeNameMatch = query.match(/\/place\/([^/@?]+)/);
    if (placeNameMatch && placeNameMatch[1]) {
      try {
        targetPlaceName = decodeURIComponent(placeNameMatch[1].replace(/\+/g, ' '));
      } catch (err) {
        targetPlaceName = placeNameMatch[1].replace(/\+/g, ' ');
      }
    }

    // 2. !3d and !4d precise coordinate parameters in Google Maps URL
    const dataCoordMatch = query.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (dataCoordMatch) {
      targetLat = parseFloat(dataCoordMatch[1]);
      targetLng = parseFloat(dataCoordMatch[2]);
    }

    // 3. @lat,lng format
    if (!targetLat) {
      const atMatch = query.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch) {
        targetLat = parseFloat(atMatch[1]);
        targetLng = parseFloat(atMatch[2]);
      }
    }

    // 4. query parameter (?q=lat,lng or &query=lat,lng or &ll=lat,lng)
    if (!targetLat) {
      const qCoordMatch = query.match(/[?&](?:q|ll|query|center)=(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
      if (qCoordMatch) {
        targetLat = parseFloat(qCoordMatch[1]);
        targetLng = parseFloat(qCoordMatch[2]);
      }
    }

    // 5. Direct comma-separated coordinates: "11.5564, 104.9282"
    if (!targetLat) {
      const rawCoordMatch = query.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
      if (rawCoordMatch) {
        targetLat = parseFloat(rawCoordMatch[1]);
        targetLng = parseFloat(rawCoordMatch[2]);
      }
    }

    let detectedProvince = 'Phnom Penh';
    let resolvedAddress = targetPlaceName || '';

    // If coordinates found
    if (targetLat && targetLng && !isNaN(targetLat) && !isNaN(targetLng)) {
      detectedProvince = detectProvinceFromCoords(targetLat, targetLng);
      if (!resolvedAddress) {
        resolvedAddress = `${detectedProvince} Industrial Zone, Cambodia`;
      }

      // Try reverse geocode via Nominatim
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${targetLat}&lon=${targetLng}&accept-language=en`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.display_name) {
            resolvedAddress = targetPlaceName || data.display_name.split(',').slice(0, 3).join(',').trim();
            if (data.address?.state) detectedProvince = data.address.state.replace(/ Province| Municipality/g, '');
            else if (data.address?.city) detectedProvince = data.address.city;
          }
        }
      } catch (e) {
        // Fallback already assigned
      }
    } else {
      // 6. Search Nominatim text query
      try {
        const searchRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query + ', Cambodia'
          )}&limit=1`
        );
        if (searchRes.ok) {
          const results = await searchRes.json();
          if (results && results.length > 0) {
            targetLat = parseFloat(results[0].lat);
            targetLng = parseFloat(results[0].lon);
            detectedProvince = detectProvinceFromCoords(targetLat, targetLng);
            resolvedAddress = targetPlaceName || results[0].display_name.split(',').slice(0, 3).join(',').trim();
          }
        }
      } catch (e) {
        // search fallback
      }
    }

    // Default coordinates if nothing matched
    if (!targetLat || isNaN(targetLat)) {
      targetLat = 11.5564;
      targetLng = 104.9282;
      resolvedAddress = query;
    }

    // Use Short Display Name or Company Name
    const shortName = (formData.short_name || formData.name || targetPlaceName || 'Factory').trim();
    const companyName = (formData.name || targetPlaceName || resolvedAddress || 'Partner Factory').trim();

    setGeoFeedback(`📍 Syncing Hub & Corridor for [${shortName}] to Supabase...`);

    let bestHub = null;
    let corridorName = '';

    try {
      const synced = await syncHubAndCorridorLocation({
        short_name: shortName,
        factory_name: companyName,
        address: resolvedAddress || query,
        latitude: targetLat,
        longitude: targetLng,
        province: detectedProvince,
        phone: formData.phone,
      });

      if (synced && synced.hub) {
        bestHub = synced.hub;
        corridorName = synced.route?.name || `Phnom Penh HQ ⇄ ${shortName} (${detectedProvince})`;
      }
    } catch (err) {
      console.warn('[Sync hub error]', err);
    }

    if (!bestHub) {
      bestHub = {
        id: `hub-${Date.now()}`,
        name: `[${shortName}] ${detectedProvince} Logistics Hub`,
      };
      corridorName = `Top Sports HQ ⇄ ${shortName} (${detectedProvince})`;
    }

    setFormData((prev) => ({
      ...prev,
      google_maps_link: query,
      latitude: Number(targetLat.toFixed(5)),
      longitude: Number(targetLng.toFixed(5)),
      province: detectedProvince,
      address: resolvedAddress || prev.address,
      operator_id: bestHub.id,
      hub_name: bestHub.name,
      primary_corridor: corridorName,
    }));

    setGeoFeedback(`📍 Synced to Supabase: Hub "${bestHub.name}" • Corridor "${corridorName}"`);
    setIsDetectingLocation(false);
    setTimeout(() => setGeoFeedback(''), 9000);
  };

  // Upload or Change Logo from local device
  const handleLogoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logo_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper when selecting a Hub in the Add/Edit form
  const handleHubSelect = (hubId) => {
    const selected = allOperators.find((o) => o.id === hubId);
    if (!selected) return;

    // Find a matching corridor connected to this hub
    const matchedRoute = allRoutes.find(
      (r) =>
        r.operator_id === hubId ||
        r.destination?.toLowerCase().includes(selected.name?.toLowerCase()) ||
        (selected.province && r.destination?.toLowerCase().includes(selected.province?.toLowerCase()))
    ) || allRoutes[0];

    setFormData((prev) => ({
      ...prev,
      operator_id: selected.id,
      hub_name: selected.name,
      province: selected.province || prev.province,
      address: prev.address ? prev.address : selected.address,
      latitude: selected.latitude || prev.latitude,
      longitude: selected.longitude || prev.longitude,
      primary_corridor: matchedRoute ? matchedRoute.name : prev.primary_corridor,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const genCode =
      formData.code ||
      `COP-${formData.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

    const newCop = await addLocalCooperator({
      ...formData,
      code: genCode,
      total_waybills: 0,
      total_tonnage: 0,
      total_spend: 0,
      cod_collected: 0,
      rating: 5.0,
      logo_url:
        formData.logo_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=f59e0b&color=0f172a&bold=true`,
      active_shipments: [
        {
          id: `VKX-WAY-${Math.floor(1000 + Math.random() * 9000)}`,
          destination: formData.hub_name || 'Phnom Penh Central Freight Hub',
          tonnage: '20.0 Tons',
          fee: 350,
          status: 'Scheduled',
        },
      ],
    });

    updateList([newCop, ...items]);
    setShowAddModal(false);
    resetForm();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCooperator || !formData.name) return;

    const payload = {
      ...formData,
      logo_url:
        formData.logo_url ||
        editingCooperator.logo_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=f59e0b&color=0f172a&bold=true`,
    };

    const updated = await updateLocalCooperator(editingCooperator.id, payload);
    updateList(items.map((c) => (c.id === editingCooperator.id ? { ...c, ...updated } : c)));

    if (selectedCooperator && selectedCooperator.id === editingCooperator.id) {
      setSelectedCooperator({ ...selectedCooperator, ...updated });
    }

    setEditingCooperator(null);
    resetForm();
  };

  const handleDelete = async () => {
    if (!deletingCooperator) return;
    await deleteLocalCooperator(deletingCooperator.id);
    updateList(items.filter((c) => c.id !== deletingCooperator.id));

    if (selectedCooperator && selectedCooperator.id === deletingCooperator.id) {
      setSelectedCooperator(null);
    }
    setDeletingCooperator(null);
  };

  // Filter Logic
  const filteredCooperators = useMemo(() => {
    return items.filter((cop) => {
      const matchesIndustry =
        industryFilter === 'all' || cop.industry?.toLowerCase().includes(industryFilter.toLowerCase());
      
      const matchesHub =
        hubFilter === 'all' ||
        cop.operator_id === hubFilter ||
        cop.hub_name?.toLowerCase().includes(hubFilter.toLowerCase()) ||
        cop.province?.toLowerCase().includes(hubFilter.toLowerCase());

      const query = (searchVal || '').toLowerCase().trim();
      const matchesSearch =
        !query ||
        cop.name?.toLowerCase().includes(query) ||
        (cop.short_name && cop.short_name.toLowerCase().includes(query)) ||
        cop.code?.toLowerCase().includes(query) ||
        cop.contact_person?.toLowerCase().includes(query) ||
        cop.phone?.includes(query) ||
        cop.email?.toLowerCase().includes(query) ||
        cop.address?.toLowerCase().includes(query) ||
        cop.province?.toLowerCase().includes(query) ||
        cop.hub_name?.toLowerCase().includes(query) ||
        cop.primary_corridor?.toLowerCase().includes(query);

      return matchesIndustry && matchesHub && matchesSearch;
    });
  }, [items, industryFilter, hubFilter, searchVal]);

  // KPI Computations
  const totalCooperators = items.length;
  const totalTonnage = items.reduce((acc, curr) => acc + (Number(curr.total_tonnage) || 0), 0);
  const totalFreightSpend = items.reduce((acc, curr) => acc + (Number(curr.total_spend) || 0), 0);
  const totalCodDisbursed = items.reduce((acc, curr) => acc + (Number(curr.cod_collected) || 0), 0);

  const getTierBadge = (tierName) => {
    const t = (tierName || '').toLowerCase();
    if (t.includes('platinum') || t.includes('vip')) {
      return {
        label: tierName || 'VIP Platinum',
        cls: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
      };
    }
    if (t.includes('gold')) {
      return {
        label: tierName || 'Gold Partner',
        cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      };
    }
    if (t.includes('silver')) {
      return {
        label: tierName || 'Silver Partner',
        cls: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/30',
      };
    }
    return {
      label: tierName || 'Standard Enterprise',
      cls: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
    };
  };

  // Find linked hub object for a given cooperator
  const getLinkedHub = (cop) => {
    if (!cop) return allOperators[0];
    return (
      allOperators.find((o) => o.id === cop.operator_id) ||
      allOperators.find((o) => o.name === cop.hub_name) ||
      allOperators.find((o) => o.province && cop.province && o.province.toLowerCase() === cop.province.toLowerCase()) ||
      allOperators[0]
    );
  };

  // Find linked corridor route for a given cooperator
  const getLinkedRoute = (cop) => {
    if (!cop) return allRoutes[0];
    return (
      allRoutes.find((r) => r.name === cop.primary_corridor) ||
      allRoutes.find((r) => r.destination?.toLowerCase().includes(cop.province?.toLowerCase())) ||
      allRoutes[0]
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-sky-500/10 dark:from-amber-500/10 dark:via-slate-900/90 dark:to-sky-950/40 border border-amber-500/30 shadow-lg backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/30 shrink-0">
            <Handshake className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              {t('cooperatorsTitle') || 'Cooperators & Enterprise SEZ Clients'}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Partner manufacturing plants, SEZ corporate accounts, connected freight corridors, and multi-hub logistics contracts.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSyncDatabase}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 shrink-0"
            title="Synchronize cooperators and corporate accounts with live Supabase PostgreSQL database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync with Supabase'}</span>
          </button>

          {setActiveTab && (
            <button
              onClick={() => setActiveTab('operators')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm shrink-0"
            >
              <Building2 className="w-4 h-4 text-amber-500" />
              <span>SEZ Hubs & Corridors</span>
            </button>
          )}

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg shadow-amber-500/25 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('addCooperatorBtn') || '+ Add Cooperator'}</span>
          </button>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-slate-900/95 dark:bg-slate-800/95 text-white border border-slate-700 shadow-xl flex items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold">{toastMsg}</span>
          </div>
          <button
            onClick={() => setToastMsg(null)}
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Supabase Schema Status Alert Banner */}
      {tableStatus.checked && !tableStatus.exists && (
        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Supabase Table</span>
                <code className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono text-[11px]">public.cooperators</code>
                <span>Not Found in Schema Cache</span>
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                Run the <strong>Cooperators SQL Migration</strong> script once in your Supabase SQL Editor to enable live cloud persistence and Flutter synchronization.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={handleCopyMigrationSql}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-500/40 hover:border-amber-500 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Copy className="w-3.5 h-3.5 text-amber-500" />
              <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy Migration SQL'}</span>
            </button>
            <a
              href="https://supabase.com/dashboard/project/muqgtennllxkckxxqibm/sql/new"
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm hover:opacity-90"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Supabase SQL</span>
            </a>
          </div>
        </div>
      )}

      {/* Live Connected Status Pill */}
      {tableStatus.checked && tableStatus.exists && (
        <div className="flex items-center justify-between text-xs px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold">Live Supabase Cloud Connected</span>
            <span className="text-slate-400">•</span>
            <span>Table <code className="font-mono font-bold">public.cooperators</code> is active ({tableStatus.count} corporate accounts synced)</span>
          </div>
          <button
            onClick={handleSyncDatabase}
            disabled={isSyncing}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Refresh Cloud</span>
          </button>
        </div>
      )}

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Enterprise Partners</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalCooperators}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Shipped Tonnage</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {totalTonnage.toLocaleString()} <span className="text-xs font-bold text-slate-400">Tons</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Connected SEZ Hubs</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {tableStatus.count || items.length} <span className="text-xs font-bold text-slate-400">Hubs</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <Warehouse className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Freight Corridors</p>
            <p className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
              {tableStatus.count || items.length} <span className="text-xs font-bold text-slate-400">Routes</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
            <RouteIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Industries' },
            { id: 'Garments', label: 'Garments & Apparel' },
            { id: 'Electronics', label: 'Electronics & Tech' },
            { id: 'Agriculture', label: 'Agriculture & Produce' },
            { id: 'Food', label: 'Food & Beverage' },
            { id: 'Manufacturing', label: 'Industrial' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setIndustryFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                industryFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Hub Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Warehouse className="w-3.5 h-3.5 text-amber-500" />
          <select
            value={hubFilter}
            onChange={(e) => setHubFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All SEZ Hubs & Regions</option>
            {allOperators.map((hub) => (
              <option key={hub.id} value={hub.id}>
                {hub.name} ({hub.province})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cooperators Data Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5 rounded-l-xl">Cooperator / Enterprise Client</th>
                <th className="p-3.5">Factory Location</th>
                <th className="p-3.5">Key Contact</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCooperators.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No cooperators found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCooperators.map((cop) => {
                  const logoUrl =
                    cop.logo_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(cop.name)}&background=f59e0b&color=0f172a&bold=true`;

                  return (
                    <tr
                      key={cop.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedCooperator(cop)}
                    >
                      {/* Company */}
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <img
                            src={logoUrl}
                            alt={cop.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-sm"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cop.name)}&background=f59e0b&color=0f172a`;
                            }}
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                              {cop.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                              <span className="font-semibold text-amber-600 dark:text-amber-400">{cop.code}</span>
                              <span>•</span>
                              <span>{cop.industry}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Factory Location */}
                      <td className="p-3.5">
                        {cop.google_maps_link ? (
                          <a
                            href={
                              cop.google_maps_link.startsWith('http')
                                ? cop.google_maps_link
                                : `https://www.google.com/maps?q=${cop.latitude || 11.5564},${cop.longitude || 104.9282}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-start gap-1.5 text-sky-600 dark:text-sky-400 hover:underline max-w-[200px]"
                          >
                            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                            <span className="truncate font-medium">
                              {cop.address || cop.province || '—'}
                            </span>
                            <ExternalLink className="w-3 h-3 shrink-0 mt-0.5" />
                          </a>
                        ) : (
                          <div className="flex items-start gap-1.5 max-w-[200px]">
                            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                            <span className="truncate text-slate-700 dark:text-slate-300 font-medium">
                              {cop.address || cop.province || '—'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="p-3.5">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{cop.contact_person || '—'}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{cop.phone}</p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            cop.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}
                        >
                          {cop.status || 'active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedCooperator(cop)}
                          className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 transition-all"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(cop)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
                          title="Edit Cooperator"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                        </button>
                        <button
                          onClick={() => setDeletingCooperator(cop)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-all"
                          title="Delete Cooperator"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DETAILED VIEW MODAL / SLIDE-OVER FOR COOPERATOR */}
      {/* ========================================================================= */}
      {selectedCooperator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
            {/* Header Banner */}
            <div className="relative p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950 text-white rounded-t-3xl border-b border-amber-500/20 overflow-hidden">
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <button
                  onClick={() => openEditModal(selectedCooperator)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </button>
                <button
                  onClick={() => setSelectedCooperator(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="relative group shrink-0">
                  <img
                    src={
                      selectedCooperator.logo_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCooperator.name)}&background=f59e0b&color=0f172a&bold=true`
                    }
                    alt={selectedCooperator.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500/40 shadow-xl shrink-0 bg-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => openEditModal(selectedCooperator)}
                    className="absolute inset-0 bg-black/60 text-white rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-[10px] font-semibold backdrop-blur-xs"
                    title="Change Logo"
                  >
                    <Camera className="w-4 h-4 mb-0.5" />
                    Change
                  </button>
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {selectedCooperator.code}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {selectedCooperator.tier || 'VIP Partner'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ⭐ {selectedCooperator.rating || '4.9'} / 5.0
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight truncate text-white">
                    {selectedCooperator.name}
                  </h3>
                  <p className="text-xs text-slate-300 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      {selectedCooperator.address}, {selectedCooperator.province}
                    </span>
                  </p>
                </div>
              </div>

              {/* Decorative Glow */}
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl"></div>
            </div>

            {/* Sub Nav Tabs */}
            <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              {[
                { id: 'overview', label: 'Company Overview & Connected Hub', icon: Building },
                { id: 'shipments', label: 'Shipment Manifests (Waybills)', icon: Package },
                { id: 'financials', label: 'Volume & Operational SLA', icon: Layers },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setDetailTab(t.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                      detailTab === t.id
                        ? 'border-amber-500 text-amber-500 dark:text-amber-400'
                        : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Body Content */}
            <div className="p-6 space-y-6 flex-1">
              {/* TAB 1: OVERVIEW */}
              {detailTab === 'overview' && (
                <div className="space-y-6">
                  {/* Grid details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Primary Contact Person */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
                      <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-500" /> Key Account Contact
                      </p>
                      <div className="space-y-1">
                        <p className="text-base font-bold text-slate-900 dark:text-white">
                          {selectedCooperator.contact_person}
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                          {selectedCooperator.contact_title || 'Procurement & Logistics Director'}
                        </p>
                      </div>
                      <div className="pt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                        <p className="flex items-center gap-2 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedCooperator.phone}
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedCooperator.email}
                        </p>
                      </div>
                    </div>

                    {/* Logistics & Service Level Classification */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
                      <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> Logistics Service Classification
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-slate-400">Service Level</p>
                          <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                            {selectedCooperator.payment_terms || 'Dedicated Priority Freight'}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Industry Category</p>
                          <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                            {selectedCooperator.industry || 'Garments & Textiles'}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-slate-400">Factory / Plant Location</p>
                          {selectedCooperator.google_maps_link ? (
                            <a
                              href={selectedCooperator.google_maps_link.startsWith('http') ? selectedCooperator.google_maps_link : `https://www.google.com/maps?q=${selectedCooperator.latitude || 11.5564},${selectedCooperator.longitude || 104.9282}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 font-semibold text-sky-600 dark:text-sky-400 hover:underline mt-0.5 truncate"
                            >
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{selectedCooperator.address || selectedCooperator.province}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                              {selectedCooperator.address || selectedCooperator.province || 'N/A'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                </div>
                </div>
              )}

              {/* TAB 2: SHIPMENTS & WAYBILLS */}
              {detailTab === 'shipments' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Recent Waybill Consignments
                    </h4>
                    <span className="text-xs text-slate-400">
                      Total {selectedCooperator.total_waybills || 0} shipments completed
                    </span>
                  </div>

                  {selectedCooperator.active_shipments && selectedCooperator.active_shipments.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                      {selectedCooperator.active_shipments.map((ship, idx) => (
                        <div
                          key={idx}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-mono font-bold text-xs">
                              <Package className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-mono font-bold text-slate-900 dark:text-white">
                                {ship.id}
                              </p>
                              <p className="text-xs text-slate-400 flex items-center gap-1">
                                <span>Destination:</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{ship.destination}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs font-mono">
                            <div>
                              <span className="text-slate-400">Tonnage: </span>
                              <span className="font-bold text-slate-900 dark:text-white">{ship.tonnage}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Priority: </span>
                              <span className="font-bold text-emerald-500">Express Freight</span>
                            </div>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                ship.status === 'Delivered' || ship.status === 'Completed'
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              }`}
                            >
                              {ship.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      No active shipments recorded for this partner yet.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: VOLUME & OPERATIONAL SLA */}
              {detailTab === 'financials' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Total Waybills Shipped</p>
                      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                        {(selectedCooperator.total_waybills || 18).toLocaleString()} <span className="text-xs font-bold">WB</span>
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20">
                      <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase">Payload Capacity Utilization</p>
                      <p className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
                        94.8% <span className="text-xs font-bold">Optimal</span>
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                      <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase">Total Shipped Mass</p>
                      <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                        {selectedCooperator.total_tonnage || 0} Tons
                      </p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Shipping Reliability & Service SLA
                    </h5>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-600 dark:text-slate-300">On-Time Highway Transit Rate</span>
                        <span className="text-emerald-500 font-bold">99.4%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="w-[99.4%] h-full bg-emerald-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT COOPERATOR MODAL */}
      {/* ========================================================================= */}
      {(showAddModal || editingCooperator) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Handshake className="w-5 h-5 text-amber-500" />
                {editingCooperator ? 'Edit Cooperator Details' : 'Add New Cooperator / Enterprise Partner'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCooperator(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingCooperator ? handleUpdate : handleCreate} className="space-y-4 text-xs">
              {/* Corporate Brand Logo Uploader & Selector */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    Corporate Brand Logo
                  </label>
                  {formData.logo_url && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, logo_url: '' }))}
                      className="text-[11px] text-rose-500 hover:text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <X className="w-3 h-3" /> Reset to Default Avatar
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Live Avatar Preview */}
                  <div className="relative group shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-slate-900 shadow-md flex items-center justify-center">
                      <img
                        src={
                          formData.logo_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'Cooperator')}&background=f59e0b&color=0f172a&bold=true`
                        }
                        alt="Logo Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'Cooperator')}&background=f59e0b&color=0f172a&bold=true`;
                        }}
                      />
                    </div>
                    <label
                      htmlFor="cooperator-logo-file-input"
                      className="absolute inset-0 bg-black/60 text-white rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-[10px] font-semibold"
                      title="Upload Logo"
                    >
                      <Camera className="w-4 h-4 mb-0.5" />
                      Upload
                    </label>
                  </div>

                  {/* Actions: File Upload & URL Input */}
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <label
                        htmlFor="cooperator-logo-file-input"
                        className="cursor-pointer px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/30 flex items-center gap-1.5 transition-all text-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload Image File
                      </label>
                      <input
                        id="cooperator-logo-file-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoFileUpload}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'Cooperator')}&background=f59e0b&color=0f172a&bold=true`;
                          setFormData((prev) => ({ ...prev, logo_url: avatarUrl }));
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-200/60 dark:bg-slate-700/60 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-all text-xs flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Auto Avatar
                      </button>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={formData.logo_url}
                        onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                        placeholder="Or enter logo web image URL (https://...)"
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                      />
                    </div>
                  </div>
                </div>

              </div>


              {/* Row 1: Company Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company / Factory Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Manhattan Textile Mills Ltd"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Short Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.short_name}
                    onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                    placeholder="e.g. Manhattan Garments"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Row 2: Industry Category & Payment Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Industry Category
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Garments & Textiles">Garments & Textiles</option>
                    <option value="Electronics & High-Tech">Electronics & High-Tech</option>
                    <option value="Agriculture & Produce">Agriculture & Produce</option>
                    <option value="Food & Beverage / Retail">Food & Beverage / Retail</option>
                    <option value="Industrial Manufacturing">Industrial Manufacturing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Logistics Service Tier
                  </label>
                  <select
                    value={formData.payment_terms || 'Dedicated Priority Freight'}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Dedicated Priority Freight">Dedicated Priority Freight</option>
                    <option value="Express Daily Transit">Express Daily Transit</option>
                    <option value="Scheduled Weekly Dispatch">Scheduled Weekly Dispatch</option>
                    <option value="High-Capacity Container Transit">High-Capacity Container Transit</option>
                    <option value="Direct SEZ Corridor Line">Direct SEZ Corridor Line</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Contact Person */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Key Contact Person
                </label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  placeholder="e.g. Mr. Kenji Takahashi"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Row 4: Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+855 23 881 200"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="procurement@company.kh"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Row 5: Google Maps Link / Factory Location & Auto-Linked Hub/Corridor */}
              <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span>Google Maps Link / Factory Location</span>
                      <span className="text-rose-500">*</span>
                    </label>
                   </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={formData.google_maps_link || formData.address || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({ ...prev, google_maps_link: val, address: val }));
                        }}
                        onPaste={(e) => {
                          const pasted = e.clipboardData?.getData('text');
                          if (pasted) {
                            setTimeout(() => parseAndLinkGoogleMapsLocation(pasted), 100);
                          }
                        }}
                        placeholder="Paste Google Maps link (e.g. https://maps.app.goo.gl/... or @11.5564,104.9282 or address)"
                        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium shadow-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => parseAndLinkGoogleMapsLocation(formData.google_maps_link || formData.address)}
                      disabled={isDetectingLocation}
                      className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-sm shadow-amber-500/20 disabled:opacity-50"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                      <span>{isDetectingLocation ? 'Detecting...' : 'Detect & Link Hub'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Paste any Google Maps link, coordinates, or factory address to automatically map the location, link the nearest SEZ Hub, and assign the Freight Corridor.
                  </p>
                </div>

              </div>

              {/* Form Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCooperator(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                >
                  {editingCooperator ? 'Save Changes' : 'Create Cooperator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SweetAlert Modal for Delete */}
      <SweetAlertModal
        isOpen={!!deletingCooperator}
        onClose={() => setDeletingCooperator(null)}
        onConfirm={handleDelete}
        title="Delete Cooperator / Enterprise Partner?"
        text="You won't be able to revert this! The cooperator profile, connected freight corridor allocations, and shipping account will be permanently removed."
        confirmButtonText="Yes, delete cooperator!"
        cancelButtonText="Cancel"
        itemName={deletingCooperator?.name}
        itemSubtext={`${deletingCooperator?.code} • ${deletingCooperator?.hub_name || deletingCooperator?.province}`}
        itemAvatar={deletingCooperator?.logo_url}
      />
    </div>
  );
}
