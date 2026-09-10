import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Settings,
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Search,
  Sparkles,
  LocateFixed,
  ExternalLink,
  MapPinned,
  Truck,
  Scale,
  DollarSign,
  Bell,
  Database,
  ShieldCheck,
  Save,
  CheckCircle2,
  RefreshCw,
  Download,
  AlertTriangle,
  Send,
  Zap,
  Clock,
  Layers,
  Sliders,
  Copy,
  Code2,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { checkSupabaseConnection, configureSupabase, saveCompanyProfileToDb, fetchCompanyProfileFromDb, supabase } from '../lib/supabaseClient';

// Custom Pin Icon for Company HQ Location Picker
const createCompanyPinIcon = () =>
  L.divIcon({
    className: 'company-picker-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, #10b981, #059669);
        width: 44px;
        height: 44px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 8px 20px rgba(16, 185, 129, 0.55);
        border: 3px solid white;
        cursor: grab;
      ">
        <div style="transform: rotate(45deg); font-size: 18px;">👑</div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
  });

function ChangeMapCenter({ center, zoom = 12 }) {
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

function LocationPickerEvents({ position, onLocationChange }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      if (e?.latlng) {
        onLocationChange(e.latlng.lat, e.latlng.lng);
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
      : [11.5564, 104.9282];

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
      icon={createCompanyPinIcon()}
    >
      <Popup>
        <div className="p-1 text-xs">
          <strong>Your Company Headquarters</strong>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Drag to adjust exact location</p>
        </div>
      </Popup>
    </Marker>
  );
}

export default function SettingsView() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('company'); // company | operations | finance | notifications | database | security

  // 1. Company Profile & HQ Location State
  const [companyProfile, setCompanyProfile] = useState(() => {
    const saved = localStorage.getItem('voleak_company_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      name: 'Voleak Express Co., Ltd.',
      code: 'VOLEAK-HQ',
      tagline: 'Factory-to-Factory Heavy Freight Logistics',
      phone: '+855 12 888 999',
      email: 'dispatch@voleakexpress.com',
      director: 'Bong Leak (Managing Director)',
      tax_id: 'K002-98471203',
      province: 'Phnom Penh',
      address: 'National Road 4 Logistics Corridor, Phnom Penh Base',
      latitude: 11.5564,
      longitude: 104.9282,
    };
  });

  // 2. Freight & Dispatch Rules State
  const [dispatchRules, setDispatchRules] = useState(() => {
    const saved = localStorage.getItem('voleak_dispatch_rules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      maxAxleWeightTons: 80,
      speedGovernorLimitKmh: 80,
      loadingBayBufferMinutes: 30,
      demurrageGraceHours: 24,
      autoAssignDrivers: true,
      requireGpsCheckIn: true,
    };
  });

  // 3. Finance & COD Escrow State
  const [financeSettings, setFinanceSettings] = useState(() => {
    const saved = localStorage.getItem('voleak_finance_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      primaryCurrency: 'USD',
      vatTaxRatePercent: 10,
      codSettlementCycle: 'daily',
      fuelSurchargePercent: 5.5,
      driverCommissionPercent: 15,
    };
  });

  // 4. Alerts & Telegram Webhook State
  const [alertSettings, setAlertSettings] = useState(() => {
    const saved = localStorage.getItem('voleak_alert_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      telegramBotToken: '',
      telegramChatId: '',
      enableTelegramAlerts: true,
      alertOnOverload: true,
      alertOnDelay: true,
      alertOnBreakdown: true,
    };
  });

  // 5. Supabase Config State
  const [supabaseUrl, setSupabaseUrl] = useState('https://muqgtennllxkckxxqibm.supabase.co');
  const [supabaseKey, setSupabaseKey] = useState(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11cWd0ZW5ubGx4a2NreHhxaWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MjA4MTIsImV4cCI6MjEwMjI5NjgxMn0.fZbLIe0KG9NpdZpKhKMI0DKyw2rg_JFfYgeDyOZSJcM'
  );
  const [dbStatusMsg, setDbStatusMsg] = useState('');
  const [isTestingDb, setIsTestingDb] = useState(false);

  // Status message
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Helper to detect province from coords
  const detectProvince = (lat, lng) => {
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

  // Reverse geocode and auto-fill address
  const handleMapLocationChange = async (lat, lng, placeName = '') => {
    setIsGeocoding(true);
    let detectedProv = detectProvince(lat, lng);
    let resolvedAddr = '';

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          const addr = data.address;
          const parts = [
            placeName,
            addr.amenity || addr.building || addr.industrial,
            addr.road || addr.highway || addr.street,
            addr.suburb || addr.neighbourhood || addr.village,
            addr.city_district || addr.district,
            detectedProv,
          ].filter(Boolean);
          resolvedAddr = parts.join(', ');
        }
      }
    } catch (e) {
      console.warn(e);
    }

    if (!resolvedAddr) {
      resolvedAddr = placeName
        ? `${placeName}, Central Base, ${detectedProv}`
        : `National Highway Corridor, Main Base, ${detectedProv}`;
    }

    setCompanyProfile((prev) => ({
      ...prev,
      latitude: Number(lat.toFixed(5)),
      longitude: Number(lng.toFixed(5)),
      province: detectedProv,
      address: resolvedAddr,
    }));

    setSaveSuccessMsg(`📍 Set Location: ${detectedProv} — ${resolvedAddr.slice(0, 45)}...`);
    setIsGeocoding(false);
    setTimeout(() => setSaveSuccessMsg(''), 6000);
  };

  // Google Maps link parser for Company HQ
  const handleParseGoogleMapsLink = async (e) => {
    e?.preventDefault();
    if (!locationSearchQuery.trim()) return;

    const query = locationSearchQuery.trim();
    let targetLat = null;
    let targetLng = null;
    let targetPlaceName = '';

    // 1. Place name
    const placeMatch = query.match(/\/place\/([^/@?]+)/);
    if (placeMatch && placeMatch[1]) {
      try {
        targetPlaceName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      } catch (err) {
        targetPlaceName = placeMatch[1].replace(/\+/g, ' ');
      }
    }

    // 2. Precise !3d and !4d
    const dataCoordMatch = query.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (dataCoordMatch) {
      targetLat = parseFloat(dataCoordMatch[1]);
      targetLng = parseFloat(dataCoordMatch[2]);
    }

    // 3. @lat,lng
    if (!targetLat) {
      const atMatch = query.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch) {
        targetLat = parseFloat(atMatch[1]);
        targetLng = parseFloat(atMatch[2]);
      }
    }

    // 4. Coordinates
    if (!targetLat) {
      const coordMatch = query.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
      if (coordMatch) {
        targetLat = parseFloat(coordMatch[1]);
        targetLng = parseFloat(coordMatch[2]);
      }
    }

    if (targetLat && targetLng && !isNaN(targetLat) && !isNaN(targetLng)) {
      await handleMapLocationChange(targetLat, targetLng, targetPlaceName);
      return;
    }

    // Search query fallback
    try {
      setIsGeocoding(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query + ', Cambodia'
        )}&limit=1`
      );
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          await handleMapLocationChange(
            parseFloat(results[0].lat),
            parseFloat(results[0].lon),
            targetPlaceName || results[0].display_name.split(',')[0]
          );
        }
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Load remote profile on mount if available
  useEffect(() => {
    fetchCompanyProfileFromDb().then((dbProfile) => {
      if (dbProfile) {
        setCompanyProfile((prev) => ({
          ...prev,
          ...dbProfile,
          latitude: Number(dbProfile.latitude) || prev.latitude,
          longitude: Number(dbProfile.longitude) || prev.longitude,
        }));
      }
    });
  }, []);

  const [isSaving, setIsSaving] = useState(false);

  // Save all settings to localStorage and Supabase, and broadcast to other views
  const handleSaveAllSettings = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('voleak_company_profile', JSON.stringify(companyProfile));
      localStorage.setItem('voleak_dispatch_rules', JSON.stringify(dispatchRules));
      localStorage.setItem('voleak_finance_settings', JSON.stringify(financeSettings));
      localStorage.setItem('voleak_alert_settings', JSON.stringify(alertSettings));

      await saveCompanyProfileToDb(companyProfile);

      // Broadcast update event so OperatorsView immediately updates its Company HQ marker and route origins!
      window.dispatchEvent(new CustomEvent('company_profile_updated', { detail: companyProfile }));

      setSaveSuccessMsg(`👑 Company Headquarters (${companyProfile.name}) & Settings Saved Successfully!`);
    } catch (err) {
      console.warn('Save settings error', err);
      setSaveSuccessMsg('✅ Saved settings to local dashboard storage.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveSuccessMsg(''), 6000);
    }
  };

  const [tableStatus, setTableStatus] = useState({});
  const [copiedSql, setCopiedSql] = useState(false);

  // Test Supabase
  const handleTestSupabase = async () => {
    setIsTestingDb(true);
    setDbStatusMsg('Testing Supabase endpoints and table schema...');
    
    // Configure dynamic credentials
    configureSupabase(supabaseUrl, supabaseKey);

    const ok = await checkSupabaseConnection();
    
    // Check specific tables
    const tablesToCheck = [
      'users',
      'operators',
      'products',
      'branch_stock',
      'stock_movements',
      'cooperator_stock',
      'trucks',
      'routes',
      'schedules',
      'trips',
      'bookings',
    ];

    const results = {};
    for (const t of tablesToCheck) {
      try {
        const { error } = await supabase.from(t).select('id').limit(1);
        results[t] = !error || error.code === 'PGRST116';
      } catch {
        results[t] = false;
      }
    }
    setTableStatus(results);
    setIsTestingDb(false);

    if (ok) {
      setDbStatusMsg('⚡ Supabase Cloud Connected! Active endpoint verified.');
    } else {
      setDbStatusMsg('⚠️ Supabase connection failed. Check your Project URL & Anon Key.');
    }
  };

  const handleCopySql = () => {
    const sql = `-- =====================================================================
-- Voleak Express — Products & Multi-Hub Inventory Schema & Seed Migration
-- For Supabase PostgreSQL Database (https://muqgtennllxkckxxqibm.supabase.co)
-- =====================================================================

create extension if not exists "uuid-ossp";

create table if not exists public.products (
    id text primary key,
    name text not null,
    sku text unique not null,
    barcode text,
    category text default 'Packaging & Logistics',
    unit text not null default 'Pallet',
    default_price numeric(12, 2) not null default 0.00,
    cost_price numeric(12, 2) not null default 0.00,
    min_stock_alert integer default 10,
    warehouse_location text default 'General Staging Area',
    image_url text,
    description text,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.branch_stock (
    id text primary key,
    branch_id text not null,
    product_id text not null references public.products(id) on delete cascade,
    on_hand_quantity integer not null default 0 check (on_hand_quantity >= 0),
    reserved_quantity integer not null default 0 check (reserved_quantity >= 0),
    warehouse_location text,
    last_restocked text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(branch_id, product_id)
);

create table if not exists public.stock_movements (
    id text primary key,
    movement_type text not null,
    product_id text not null references public.products(id) on delete cascade,
    branch_id text not null,
    to_branch_id text,
    quantity integer not null,
    operator_name text default 'Managing Director',
    reference_no text,
    reason text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.cooperator_stock (
    id text primary key,
    cooperator_id text not null,
    product_id text not null references public.products(id) on delete cascade,
    quantity integer not null default 0 check (quantity >= 0),
    unit text default 'Pallet',
    last_verified timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(cooperator_id, product_id)
);

alter table public.products enable row level security;
alter table public.branch_stock enable row level security;
alter table public.stock_movements enable row level security;
alter table public.cooperator_stock enable row level security;

create policy "Allow public read products" on public.products for select using (true);
create policy "Allow public insert products" on public.products for insert with check (true);
create policy "Allow public update products" on public.products for update using (true);
create policy "Allow public delete products" on public.products for delete using (true);

create policy "Allow public read branch_stock" on public.branch_stock for select using (true);
create policy "Allow public insert branch_stock" on public.branch_stock for insert with check (true);
create policy "Allow public update branch_stock" on public.branch_stock for update using (true);
create policy "Allow public delete branch_stock" on public.branch_stock for delete using (true);

create policy "Allow public read stock_movements" on public.stock_movements for select using (true);
create policy "Allow public insert stock_movements" on public.stock_movements for insert with check (true);

create policy "Allow public read cooperator_stock" on public.cooperator_stock for select using (true);
create policy "Allow public insert cooperator_stock" on public.cooperator_stock for insert with check (true);
create policy "Allow public update cooperator_stock" on public.cooperator_stock for update using (true);
create policy "Allow public delete cooperator_stock" on public.cooperator_stock for delete using (true);
`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Export full JSON Backup
  const handleExportDataBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      companyProfile,
      dispatchRules,
      financeSettings,
      alertSettings,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Voleak_Express_Config_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-sky-500/10 dark:from-amber-500/10 dark:via-slate-900/90 dark:to-sky-950/40 border border-amber-500/30 shadow-lg backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/30 shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              System Settings & Enterprise Configuration
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Configure your Company Location, Dispatch Rules, Financials, Telegram Alert Bots, and Live DB Sync.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAllSettings}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all shrink-0 disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Global Success Notification */}
      {saveSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* 2. Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {[
          { id: 'company', label: 'Company Profile & HQ Location', icon: Building2 },
          { id: 'operations', label: 'Freight & Dispatch Rules', icon: Truck },
          { id: 'finance', label: 'Financials & COD Escrow', icon: DollarSign },
          { id: 'notifications', label: 'Telegram Alerts & Webhooks', icon: Bell },
          { id: 'database', label: 'Supabase Live Database', icon: Database },
          { id: 'security', label: 'Data Backup & Security', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB 1: COMPANY PROFILE & OWN LOCATION (SHOWS ON INDUSTRIAL HUB PARTNERS) */}
      {activeTab === 'company' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Info Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-500" />
                  Your Company Headquarters & Origin Base
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  This location will be used on the <strong>Industrial Hub Partners Map</strong> as your origin for highway driving directions to all SEZs.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Active Dispatch Base
              </span>
            </div>

            {/* Profile Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Company Legal Name
                </label>
                <input
                  type="text"
                  value={companyProfile.name}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Brand / HQ Code
                </label>
                <input
                  type="text"
                  value={companyProfile.code}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, code: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Central Dispatch Hotline
                </label>
                <input
                  type="text"
                  value={companyProfile.phone}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  value={companyProfile.email}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Managing Director / Dispatch Lead
                </label>
                <input
                  type="text"
                  value={companyProfile.director}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, director: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* INTERACTIVE MAP LOCATION PICKER FOR COMPANY HQ */}
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    Set Your Company HQ on Interactive Google Map
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    (Click or drag the crown pin)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${companyProfile.latitude},${companyProfile.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 flex items-center gap-1 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
                    <span>View on Google Maps</span>
                  </a>
                </div>
              </div>

              {/* Google Maps Link Auto-Fill Input */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <input
                    type="text"
                    value={locationSearchQuery}
                    onChange={(e) => setLocationSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleParseGoogleMapsLink(e)}
                    placeholder="Paste Google Maps link (e.g. https://maps.app.goo.gl/... or place URL) or search place..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border-2 border-emerald-500/30 focus:border-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleParseGoogleMapsLink}
                  disabled={isGeocoding}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  {isGeocoding ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Locating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>⚡ Auto-Fill HQ Location</span>
                    </>
                  )}
                </button>
              </div>

              {/* Embedded Map Container */}
              <div className="h-72 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative shadow-inner">
                <MapContainer
                  center={[Number(companyProfile.latitude) || 11.5564, Number(companyProfile.longitude) || 104.9282]}
                  zoom={12}
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
                  <ChangeMapCenter
                    center={[Number(companyProfile.latitude), Number(companyProfile.longitude)]}
                    zoom={12}
                  />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPickerEvents
                    position={[Number(companyProfile.latitude) || 11.5564, Number(companyProfile.longitude) || 104.9282]}
                    onLocationChange={handleMapLocationChange}
                  />
                </MapContainer>

                <div className="absolute bottom-2.5 left-2.5 z-[400] px-3 py-1.5 rounded-xl bg-slate-900/90 text-white backdrop-blur-md border border-slate-700 text-xs font-bold shadow-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Company HQ Pin Placed ({companyProfile.latitude}, {companyProfile.longitude})</span>
                </div>
              </div>

              {/* Resolved Address & Province */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Province / City
                  </label>
                  <select
                    value={companyProfile.province}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, province: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Phnom Penh">Phnom Penh</option>
                    <option value="Preah Sihanouk">Preah Sihanouk</option>
                    <option value="Svay Rieng">Svay Rieng</option>
                    <option value="Banteay Meanchey">Banteay Meanchey</option>
                    <option value="Siem Reap">Siem Reap</option>
                    <option value="Battambang">Battambang</option>
                    <option value="Kampong Cham">Kampong Cham</option>
                    <option value="Kampot">Kampot</option>
                    <option value="Koh Kong">Koh Kong</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Detailed Gate / Depot Address
                  </label>
                  <input
                    type="text"
                    value={companyProfile.address}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, address: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Save Action */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveAllSettings}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSaving ? 'Saving HQ Location...' : 'Save Company HQ Location'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: FREIGHT & DISPATCH RULES */}
      {activeTab === 'operations' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-500" />
              Heavy Freight & Dispatch Operating Rules
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Set speed governor limits, weighbridge axle weight safety margins, and demurrage grace periods.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <label className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-purple-500" />
                Max Axle Scale Safety Limit (Tons)
              </label>
              <input
                type="number"
                value={dispatchRules.maxAxleWeightTons}
                onChange={(e) =>
                  setDispatchRules({ ...dispatchRules, maxAxleWeightTons: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
              <p className="text-[11px] text-slate-400">
                Trucks exceeding this limit trigger automated overload customs audit alerts.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <label className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Highway Speed Governor Max (KM/H)
              </label>
              <input
                type="number"
                value={dispatchRules.speedGovernorLimitKmh}
                onChange={(e) =>
                  setDispatchRules({ ...dispatchRules, speedGovernorLimitKmh: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
              <p className="text-[11px] text-slate-400">
                Standard heavy trailer speed threshold for Cambodian national highways.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <label className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-500" />
                Loading Bay Buffer Duration (Minutes)
              </label>
              <input
                type="number"
                value={dispatchRules.loadingBayBufferMinutes}
                onChange={(e) =>
                  setDispatchRules({ ...dispatchRules, loadingBayBufferMinutes: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <label className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                Demurrage Free Detention Time (Hours)
              </label>
              <input
                type="number"
                value={dispatchRules.demurrageGraceHours}
                onChange={(e) =>
                  setDispatchRules({ ...dispatchRules, demurrageGraceHours: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveAllSettings}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Dispatch Rules</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. TAB 3: FINANCIALS & COD ESCROW */}
      {activeTab === 'finance' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Financials, VAT Tax & COD Escrow Settlement
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Set corporate currency rates, VAT invoice percentage, and driver haulage commission.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Primary Currency
              </label>
              <select
                value={financeSettings.primaryCurrency}
                onChange={(e) => setFinanceSettings({ ...financeSettings, primaryCurrency: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              >
                <option value="USD">USD ($) — United States Dollar</option>
                <option value="KHR">KHR (៛) — Cambodian Riel</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cambodia VAT Tax Rate (%)
              </label>
              <input
                type="number"
                value={financeSettings.vatTaxRatePercent}
                onChange={(e) =>
                  setFinanceSettings({ ...financeSettings, vatTaxRatePercent: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                COD Escrow Settlement Cycle
              </label>
              <select
                value={financeSettings.codSettlementCycle}
                onChange={(e) => setFinanceSettings({ ...financeSettings, codSettlementCycle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              >
                <option value="daily">Daily Settlement at 18:00</option>
                <option value="weekly">Weekly Every Friday</option>
                <option value="instant">Instant Real-time Payout</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveAllSettings}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Financial Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. TAB 4: TELEGRAM ALERTS & WEBHOOKS */}
      {activeTab === 'notifications' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-sky-500" />
              Telegram Dispatch Bot & Real-Time Alert Webhooks
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Receive immediate Telegram alerts for dispatch departures, highway breakdowns, and weighbridge overloads.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Telegram Bot Token
              </label>
              <input
                type="text"
                value={alertSettings.telegramBotToken}
                onChange={(e) => setAlertSettings({ ...alertSettings, telegramBotToken: e.target.value })}
                placeholder="e.g. 1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Channel / Dispatcher Chat ID
              </label>
              <input
                type="text"
                value={alertSettings.telegramChatId}
                onChange={(e) => setAlertSettings({ ...alertSettings, telegramChatId: e.target.value })}
                placeholder="e.g. @voleak_dispatch_channel or -10012345678"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveAllSettings}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Telegram Webhook</span>
            </button>
          </div>
        </div>
      )}

      {/* 7. TAB 5: SUPABASE DATABASE CONFIG */}
      {activeTab === 'database' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-500" />
                Supabase Live Cloud Database Sync
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Live PostgreSQL database endpoint, table schema synchronization, and API credentials.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://supabase.com/dashboard/project/muqgtennllxkckxxqibm/sql/new"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 hover:opacity-90 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Supabase SQL Editor</span>
              </a>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Supabase Anon / Public API Key
              </label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>

            {dbStatusMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{dbStatusMsg}</span>
              </div>
            )}

            {/* Live Database Tables Status Check */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-500" />
                  <span>PostgreSQL Database Tables Schema</span>
                </h4>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-slate-700 dark:text-slate-200 text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-500" />
                  <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Schema Script'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-[11px]">
                {[
                  { name: 'products', label: 'Products Catalog' },
                  { name: 'branch_stock', label: 'Hub Inventory' },
                  { name: 'stock_movements', label: 'Stock Movements' },
                  { name: 'cooperator_stock', label: 'Consignment Stock' },
                  { name: 'users', label: 'Staff Users' },
                  { name: 'operators', label: 'Logistics Hubs' },
                  { name: 'trucks', label: 'Truck Fleet' },
                  { name: 'routes', label: 'Freight Corridors' },
                  { name: 'schedules', label: 'Dispatch Schedules' },
                  { name: 'trips', label: 'Trips & Voyages' },
                  { name: 'bookings', label: 'Factory Waybills' },
                ].map((item) => {
                  const isReady = tableStatus[item.name] ?? true;
                  return (
                    <div
                      key={item.name}
                      className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white font-mono text-[10px]">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-400">{item.label}</div>
                      </div>
                      {isReady ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleTestSupabase}
              disabled={isTestingDb}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingDb ? 'animate-spin' : ''}`} />
              <span>Test Connection & Sync</span>
            </button>

            <button
              onClick={handleSaveAllSettings}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save & Connect</span>
            </button>
          </div>
        </div>
      )}

      {/* 8. TAB 6: DATA BACKUP & SECURITY */}
      {activeTab === 'security' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-500" />
              Data Security & JSON Configuration Backup
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Export full offline snapshot of your company HQ, dispatch policies, and system parameters.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Export Complete System Configuration (JSON)
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Includes Company HQ GPS coordinates, Dispatch Parameters, Finance Settings, and Telegram Webhooks.
              </p>
            </div>
            <button
              onClick={handleExportDataBackup}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-500/20 shrink-0 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
