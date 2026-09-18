import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  TrendingUp,
  Package,
  Truck,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  ShieldCheck,
  Fuel,
  RefreshCw,
  Download,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  Navigation,
  Scale,
  Thermometer,
  Boxes,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
} from 'recharts';

// --- RICH MOCK ANALYTICS DATA ---

// 12 Months Financial & Volume Analytics
const monthlyTrendData = [
  { month: 'Jan', revenue: 48200, cod: 21500, tonnage: 290, waybills: 940, expense: 22400 },
  { month: 'Feb', revenue: 52400, cod: 24100, tonnage: 310, waybills: 1020, expense: 23100 },
  { month: 'Mar', revenue: 61000, cod: 28900, tonnage: 380, waybills: 1190, expense: 26500 },
  { month: 'Apr', revenue: 58900, cod: 26300, tonnage: 360, waybills: 1140, expense: 25200 },
  { month: 'May', revenue: 67500, cod: 31200, tonnage: 420, waybills: 1310, expense: 28000 },
  { month: 'Jun', revenue: 72800, cod: 34500, tonnage: 460, waybills: 1420, expense: 29800 },
  { month: 'Jul', revenue: 78400, cod: 37900, tonnage: 495, waybills: 1540, expense: 31500 },
  { month: 'Aug', revenue: 84250, cod: 41800, tonnage: 540, waybills: 1680, expense: 33400 },
  { month: 'Sep', revenue: 89100, cod: 44200, tonnage: 575, waybills: 1760, expense: 35100 },
  { month: 'Oct', revenue: 95400, cod: 48600, tonnage: 620, waybills: 1890, expense: 37200 },
  { month: 'Nov', revenue: 102300, cod: 52100, tonnage: 670, waybills: 2040, expense: 39800 },
  { month: 'Dec', revenue: 114500, cod: 59800, tonnage: 750, waybills: 2280, expense: 43500 },
];

// 30 Days Trend Data
const thirtyDaysData = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const baseRev = 2200 + Math.sin(i / 2) * 600 + Math.random() * 400;
  const baseCod = 1100 + Math.cos(i / 2) * 350 + Math.random() * 250;
  const tonnage = 15 + Math.sin(i / 3) * 4 + Math.random() * 3;
  const waybills = Math.floor(45 + Math.sin(i / 2) * 15 + Math.random() * 10);
  return {
    day: `Day ${day}`,
    revenue: Math.round(baseRev),
    cod: Math.round(baseCod),
    tonnage: Number(tonnage.toFixed(1)),
    waybills,
    expense: Math.round(baseRev * 0.4),
  };
});

// 7 Days Trend Data
const sevenDaysData = [
  { day: 'Mon', revenue: 3840, cod: 1950, tonnage: 24.5, waybills: 78, expense: 1520 },
  { day: 'Tue', revenue: 4210, cod: 2180, tonnage: 27.2, waybills: 86, expense: 1650 },
  { day: 'Wed', revenue: 4890, cod: 2540, tonnage: 31.8, waybills: 98, expense: 1920 },
  { day: 'Thu', revenue: 4620, cod: 2310, tonnage: 29.4, waybills: 92, expense: 1810 },
  { day: 'Fri', revenue: 5680, cod: 3120, tonnage: 38.0, waybills: 118, expense: 2250 },
  { day: 'Sat', revenue: 5120, cod: 2780, tonnage: 34.6, waybills: 104, expense: 2010 },
  { day: 'Sun', revenue: 3450, cod: 1620, tonnage: 21.0, waybills: 68, expense: 1380 },
];

// Corridor Provincial Freight Throughput
const corridorData = [
  {
    corridor: 'Phnom Penh ⇄ Sihanoukville Port',
    delivered: 420,
    inTransit: 85,
    customs: 14,
    tonnage: 340,
  },
  {
    corridor: 'Phnom Penh ⇄ Siem Reap Hub',
    delivered: 340,
    inTransit: 62,
    customs: 6,
    tonnage: 215,
  },
  {
    corridor: 'Phnom Penh ⇄ Bavet / Vietnam SEZ',
    delivered: 290,
    inTransit: 48,
    customs: 22,
    tonnage: 280,
  },
  {
    corridor: 'Phnom Penh ⇄ Poipet / Thai Border',
    delivered: 260,
    inTransit: 41,
    customs: 18,
    tonnage: 245,
  },
  {
    corridor: 'Phnom Penh ⇄ Battambang Agri-Hub',
    delivered: 210,
    inTransit: 34,
    customs: 4,
    tonnage: 195,
  },
  {
    corridor: 'Phnom Penh ⇄ Kampong Cham Corridor',
    delivered: 160,
    inTransit: 28,
    customs: 3,
    tonnage: 145,
  },
];

// Cargo Categories Breakdown
const cargoCategories = [
  { name: 'Garment & Footwear', value: 38, tons: 540, color: '#f59e0b', count: 640 },
  { name: 'Cold-Chain Produce & Food', value: 24, tons: 340, color: '#06b6d4', count: 405 },
  { name: 'Heavy Machinery & Materials', value: 18, tons: 255, color: '#8b5cf6', count: 304 },
  { name: 'Electronics & Auto Parts', value: 12, tons: 170, color: '#10b981', count: 202 },
  { name: 'E-Commerce & Express Parcels', value: 8, tons: 115, color: '#ec4899', count: 135 },
];

// Weekly Dispatch & Load Saturation
const weeklyVelocity = [
  { day: 'Mon', trucks: 18, capacity: 82, onTime: 98 },
  { day: 'Tue', trucks: 22, capacity: 88, onTime: 97 },
  { day: 'Wed', trucks: 26, capacity: 94, onTime: 99 },
  { day: 'Thu', trucks: 24, capacity: 91, onTime: 96 },
  { day: 'Fri', trucks: 28, capacity: 98, onTime: 98 },
  { day: 'Sat', trucks: 25, capacity: 89, onTime: 95 },
  { day: 'Sun', trucks: 16, capacity: 74, onTime: 100 },
];

// Custom Glowing Tooltip for Charts
function CustomChartTooltip({ active, payload, label, unit = '' }) {
  if (active && payload && payload.length) {
    return (
      <div className="p-3.5 rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl text-xs space-y-2 min-w-[180px]">
        <div className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono">Live</span>
        </div>
        <div className="space-y-1.5">
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
                <span className="text-slate-400 font-medium capitalize">{item.name}:</span>
              </div>
              <span className="font-bold text-white font-mono">
                {item.name.toLowerCase().includes('tonnage')
                  ? `${item.value} Tons`
                  : item.name.toLowerCase().includes('waybill')
                  ? `${item.value} WB`
                  : `${item.value}${unit}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export default function OverviewView({
  setActiveTab,
  trips = [],
  bookings = [],
  users = [],
  buses = [],
  incidents = [],
}) {
  const { t } = useLanguage();

  // State Controls
  const [timeRange, setTimeRange] = useState('12M'); // '7D' | '30D' | '12M'
  const [activeChartMetric, setActiveChartMetric] = useState('tonnage'); // 'tonnage' | 'waybills'
  const [corridorViewMode, setCorridorViewMode] = useState('volume'); // 'volume' | 'tonnage'
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(null);
  const [manifestFilter, setManifestFilter] = useState('all'); // 'all' | 'in_progress' | 'completed'
  const [manifestSearch, setManifestSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dynamic Chart Dataset based on TimeRange
  const activeTrendData = useMemo(() => {
    switch (timeRange) {
      case '7D':
        return sevenDaysData;
      case '30D':
        return thirtyDaysData;
      case '12M':
      default:
        return monthlyTrendData;
    }
  }, [timeRange]);

  // Aggregate Metrics
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0) || 84250;
  const totalCod = bookings.reduce((sum, b) => sum + (b.cod_amount || 0), 0) || 36890;
  const activeTripsCount = trips.filter((tr) => tr.status === 'in_progress').length || 18;
  const activeBusesCount = buses.filter((b) => b.status === 'active').length || 24;
  const openIncidentsCount = incidents.filter((i) => i.status !== 'resolved').length;
  const totalWaybills = bookings.length > 0 ? bookings.length : 1420;
  const totalTonnage = 540.8;

  // Filtered trips for live manifest table
  const filteredTrips = useMemo(() => {
    let list = trips.length > 0 ? trips : [
      {
        id: 'TRK-901',
        route_name: 'Phnom Penh ⇄ Sihanoukville Port',
        bus_plate: 'PP-3A-8899',
        driver_name: 'Sokha Rith',
        status: 'in_progress',
        speed_kmh: 74,
        weight_loaded_percent: 92,
        cargo_type: '40ft Container Garments',
        origin: 'PP Special Economic Zone',
        destination: 'Sihanoukville Port Terminal 2',
        eta: '1h 25m',
      },
      {
        id: 'TRK-902',
        route_name: 'Phnom Penh ⇄ Siem Reap Hub',
        bus_plate: 'PP-3B-4421',
        driver_name: 'Chan Dara',
        status: 'in_progress',
        speed_kmh: 68,
        weight_loaded_percent: 85,
        cargo_type: 'Cold-Chain Dairy & Fresh Produce',
        origin: 'Phnom Penh Cold Facility',
        destination: 'Siem Reap Central Depot',
        eta: '2h 10m',
      },
      {
        id: 'TRK-903',
        route_name: 'Phnom Penh ⇄ Bavet Border SEZ',
        bus_plate: 'PP-3C-7712',
        driver_name: 'Vannak Heng',
        status: 'in_progress',
        speed_kmh: 62,
        weight_loaded_percent: 96,
        cargo_type: 'Export Electronics & Wiring',
        origin: 'Kandal Industrial Park',
        destination: 'Bavet International Gate',
        eta: '45m',
      },
      {
        id: 'TRK-904',
        route_name: 'Phnom Penh ⇄ Poipet Thai Gate',
        bus_plate: 'PP-3D-5509',
        driver_name: 'Kimleang Men',
        status: 'completed',
        speed_kmh: 0,
        weight_loaded_percent: 0,
        cargo_type: 'Machinery Spare Parts',
        origin: 'Phnom Penh Central Hub',
        destination: 'Poipet Customs Clearance',
        eta: 'Arrived',
      },
    ];

    if (manifestFilter !== 'all') {
      list = list.filter((item) => item.status === manifestFilter);
    }
    if (manifestSearch.trim()) {
      const q = manifestSearch.toLowerCase();
      list = list.filter(
        (item) =>
          item.id?.toLowerCase().includes(q) ||
          item.route_name?.toLowerCase().includes(q) ||
          item.bus_plate?.toLowerCase().includes(q) ||
          item.driver_name?.toLowerCase().includes(q) ||
          item.cargo_type?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [trips, manifestFilter, manifestSearch]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="space-y-7 pb-12">
      {/* 1. TOP EXECUTIVE COMMAND BANNER & CONTROLS */}
      <div className="relative p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-sky-500/10 dark:from-amber-500/10 dark:via-slate-900/90 dark:to-sky-950/40 border border-amber-500/30 shadow-lg backdrop-blur-xl overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-center shadow-xl shadow-amber-500/30 shrink-0 ring-4 ring-amber-500/20">
              <Truck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Top Sports Textile Freight Command Center
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Highway Telemetry
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl font-medium">
                Real-time regional logistics intelligence across Cambodian National Highways, SEZ industrial zones, and container port terminals.
              </p>
            </div>
          </div>

          {/* Quick Actions & Interval Toggles */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-end lg:self-center">
            {/* Time Filter Pills */}
            <div className="p-1 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-1">
              {['7D', '30D', '12M'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    timeRange === range
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {range === '7D' ? '7 Days' : range === '30D' ? '30 Days' : '12 Months'}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              title="Refresh Live Telemetry"
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
            </button>

            {/* Create Waybill Button */}
            <button
              onClick={() => setActiveTab('bookings')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-extrabold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('actionBookTicket')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FOUR EXECUTIVE LOGISTICS KPI METRIC CARDS WITH SPARKLINE TRENDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Waybills & Consignments */}
        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => setActiveTab('bookings')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md cursor-pointer transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-amber-500 transition-colors">
              Waybills Shipped
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {totalWaybills.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[10px] font-extrabold text-amber-500 flex items-center bg-amber-500/10 px-1.5 py-0.5 rounded">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +24.1%
              </span>
              <span className="text-[10px] text-slate-400">96.8% SLA</span>
            </div>
          </div>
          <div className="h-10 mt-3 -mx-2 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sevenDaysData}>
                <Bar dataKey="waybills" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Card 4: Trucks on Highway */}
        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => setActiveTab('liveMap')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md cursor-pointer transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-sky-500 transition-colors">
              Active on Highway
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1.5">
              <span>{activeTripsCount}</span>
              <span className="text-xs text-slate-400 font-medium">/ {activeBusesCount} Trucks</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[10px] font-extrabold text-sky-500 flex items-center bg-sky-500/10 px-1.5 py-0.5 rounded">
                87.5% Active
              </span>
              <span className="text-[10px] text-slate-400">GPS Tracked</span>
            </div>
          </div>
          {/* Animated Pulse Line */}
          <div className="h-10 mt-3 flex items-center justify-center">
            <div className="w-full flex items-center gap-1 px-1">
              {[40, 70, 95, 60, 85, 100, 75, 90, 65, 80].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-gradient-to-t from-sky-500/40 to-sky-500 rounded-full animate-pulse"
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Card 5: Total Tonnage Hauled */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Cargo Tonnage
            </span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {totalTonnage} <span className="text-xs text-slate-400 font-semibold">Tons</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[10px] font-extrabold text-orange-500 flex items-center bg-orange-500/10 px-1.5 py-0.5 rounded">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +15.3%
              </span>
              <span className="text-[10px] text-slate-400">Avg 89% Payload</span>
            </div>
          </div>
          <div className="h-10 mt-3 -mx-2 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sevenDaysData}>
                <Area type="monotone" dataKey="tonnage" stroke="#f97316" strokeWidth={2} fill="#f97316" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Card 6: On-Time Delivery SLA */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              On-Time SLA
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              98.6%
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[10px] font-extrabold text-teal-500 flex items-center bg-teal-500/10 px-1.5 py-0.5 rounded">
                +1.2% SLA
              </span>
              <span className="text-[10px] text-slate-400">Lead 3.6h avg</span>
            </div>
          </div>
          <div className="h-10 mt-3 -mx-2 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sevenDaysData}>
                <Line type="monotone" dataKey="waybills" stroke="#14b8a6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* 3. MAIN INTERACTIVE ANALYTICS STUDIO (FULL GRAPH - AREA / MULTI-LINE) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative">
        {/* Header with Metric & Filter Selectors */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Logistics & Freight Throughput Analytics
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Multi-dimensional telemetry tracking cargo payload tonnage, fleet velocity, and consignment dispatch curves.
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-1">
              <button
                onClick={() => setActiveChartMetric('tonnage')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeChartMetric === 'tonnage'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Cargo Tonnage (Tons)
              </button>
              <button
                onClick={() => setActiveChartMetric('waybills')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeChartMetric === 'waybills'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Consignments Count
              </button>
            </div>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="h-80 sm:h-96 w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            {activeChartMetric === 'tonnage' ? (
              <AreaChart data={activeTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTonnage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                <XAxis
                  dataKey={timeRange === '12M' ? 'month' : 'day'}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val} T`}
                />
                <Tooltip content={<CustomChartTooltip unit=" Tons" />} />
                <Area
                  type="monotone"
                  dataKey="tonnage"
                  name="Payload Tonnage Hauled"
                  stroke="#f97316"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorTonnage)"
                />
              </AreaChart>
            ) : (
              <BarChart data={activeTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                <XAxis
                  dataKey={timeRange === '12M' ? 'month' : 'day'}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomChartTooltip unit=" Waybills" />} />
                <Bar dataKey="waybills" name="Factory Consignments" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Bottom Chart Performance Insights Row */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-slate-400">Peak Transit Month</span>
            <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">December (1,840 Tons)</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-slate-400">Avg Daily Tonnage</span>
            <p className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">48.5 Tons / Day</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-slate-400">Fleet Capacity Load</span>
            <p className="text-sm sm:text-base font-extrabold text-amber-500 mt-0.5">89.2% Utilization</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-slate-400">Weighbridge SLA</span>
            <p className="text-sm sm:text-base font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">99.4% Compliance</p>
          </div>
        </div>
      </div>

      {/* 4. TWO COMPREHENSIVE GRAPHS: REGIONAL CORRIDORS & CARGO CATEGORIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-7">
        {/* Left (2 Cols): Regional Highway Corridors Throughput */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-sky-500" />
                  <span>Industrial Highway Corridor Throughput</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Breakdown by delivered cargo, active highway transit, and customs inspection.
                </p>
              </div>

              {/* View Toggle */}
              <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                <button
                  onClick={() => setCorridorViewMode('volume')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    corridorViewMode === 'volume'
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Waybills
                </button>
                <button
                  onClick={() => setCorridorViewMode('tonnage')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    corridorViewMode === 'tonnage'
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Tonnage
                </button>
              </div>
            </div>

            {/* Bar Chart Container */}
            <div className="h-72 sm:h-80 w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                {corridorViewMode === 'volume' ? (
                  <BarChart
                    data={corridorData}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis
                      dataKey="corridor"
                      type="category"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      width={140}
                      tickFormatter={(name) => name.split(' ⇄ ')[1] || name}
                    />
                    <Tooltip content={<CustomChartTooltip unit=" WB" />} />
                    <Legend wrapperStyle={{ paddingTop: 10, fontSize: 11 }} />
                    <Bar dataKey="delivered" name="Delivered Cargo" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="inTransit" name="In Transit" stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="customs" name="Customs Check" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                ) : (
                  <BarChart
                    data={corridorData}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis
                      dataKey="corridor"
                      type="category"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      width={140}
                      tickFormatter={(name) => name.split(' ⇄ ')[1] || name}
                    />
                    <Tooltip content={<CustomChartTooltip unit=" Tons" />} />
                    <Bar dataKey="tonnage" name="Total Payload (Tons)" fill="#f97316" radius={[0, 6, 6, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Route Status Footnote */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Sihanoukville Express Expressway Open (Avg 2.5 hrs)
            </span>
            <button
              onClick={() => setActiveTab('routes')}
              className="text-amber-500 hover:text-amber-600 font-bold flex items-center gap-1"
            >
              Corridors Map <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right (1 Col): Cargo Classification & Donut Chart */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <PieIcon className="w-5 h-5 text-amber-500" />
                  <span>Freight Cargo Mix</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Payload classification by industry</p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                100%
              </span>
            </div>

            {/* Donut Chart with Centered Metric */}
            <div className="relative h-56 w-full mt-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cargoCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={84}
                    paddingAngle={4}
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveCategoryIndex(index)}
                    onMouseLeave={() => setActiveCategoryIndex(null)}
                  >
                    {cargoCategories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="none"
                        style={{
                          transform: activeCategoryIndex === index ? 'scale(1.05)' : 'scale(1)',
                          transformOrigin: 'center',
                          transition: 'transform 0.2s ease',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip unit="%" />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Centered Dynamic Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Hauled</span>
                <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">1,420 T</span>
                <span className="text-[10px] font-semibold text-amber-500">5 Categories</span>
              </div>
            </div>

            {/* Legend Breakdown List */}
            <div className="mt-4 space-y-2">
              {cargoCategories.map((cat, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setActiveCategoryIndex(idx)}
                  onMouseLeave={() => setActiveCategoryIndex(null)}
                  className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                    activeCategoryIndex === idx
                      ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-600 shadow-sm'
                      : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-100 dark:border-slate-700/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono">{cat.tons} Tons</span>
                    <span className="font-extrabold text-slate-900 dark:text-white font-mono">{cat.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. WEEKLY DISPATCH VELOCITY & HIGHWAY TELEMETRY MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-7">
        {/* Weekly Dispatch Rhythm & Load Saturation (Composed Chart) */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                <span>Weekly Dispatch Velocity & Fleet Capacity</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Trucks dispatched per day vs overall payload capacity load saturation (%)
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Avg 88.5% Load Saturation
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={weeklyVelocity} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}%`}
                  domain={[60, 100]}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 12, fontSize: 11 }} />
                <Bar
                  yAxisId="left"
                  dataKey="trucks"
                  name="Trucks Dispatched"
                  fill="#0ea5e9"
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="capacity"
                  name="Fleet Load %"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#f59e0b' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Lead-Time & Scorecards */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-500" />
                  <span>Fleet Operational SLA</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Real-time driver & transit safety scores</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {/* Metric 1 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-500" /> On-Time Dispatch SLA
                  </span>
                  <span className="font-mono font-bold text-emerald-500">98.4%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full" style={{ width: '98.4%' }} />
                </div>
              </div>

              {/* Metric 2 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Fuel className="w-3.5 h-3.5 text-amber-500" /> Fuel & Eco-Drive Index
                  </span>
                  <span className="font-mono font-bold text-amber-500">94.2%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: '94.2%' }} />
                </div>
              </div>

              {/* Metric 3 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-purple-500" /> Weighbridge Compliance
                  </span>
                  <span className="font-mono font-bold text-purple-500">99.1%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: '99.1%' }} />
                </div>
              </div>

              {/* Metric 4 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-cyan-500" /> Cold-Chain Integrity (-18°C)
                  </span>
                  <span className="font-mono font-bold text-cyan-500">100.0%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Customs & Border Green-Lane Active
                </span>
              </div>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. LIVE HIGHWAY TELEMETRY MANIFEST & RECENT WAYBILLS TABLE */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        {/* Table Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Live Truck Manifest & GPS Tracking Feed
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Active heavy trailers, speed monitoring, cargo payload tonnage, and real-time ETAs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Filter */}
            <div className="relative w-48 sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={manifestSearch}
                onChange={(e) => setManifestSearch(e.target.value)}
                placeholder="Filter plate, route, driver..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            {/* Status Pills */}
            <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
              <button
                onClick={() => setManifestFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  manifestFilter === 'all'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setManifestFilter('in_progress')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  manifestFilter === 'in_progress'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                On Highway
              </button>
              <button
                onClick={() => setManifestFilter('completed')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  manifestFilter === 'completed'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Arrived
              </button>
            </div>

            <button
              onClick={() => setActiveTab('liveMap')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>Full GPS Map</span>
            </button>
          </div>
        </div>

        {/* Manifest Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-400">
                <th className="pb-3 pl-2">Manifest ID & Plate</th>
                <th className="pb-3">Corridor & Terminal</th>
                <th className="pb-3">Lead Driver</th>
                <th className="pb-3">Cargo Spec</th>
                <th className="pb-3">Payload Load</th>
                <th className="pb-3">Telemetry Speed</th>
                <th className="pb-3">Status / ETA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredTrips.map((tr) => (
                <tr key={tr.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                        {tr.id?.slice(-3) || 'TRK'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white font-mono">{tr.id}</span>
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-mono font-semibold">{tr.bus_plate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{tr.route_name}</p>
                      <p className="text-[10px] text-slate-400">{tr.origin} → {tr.destination}</p>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{tr.driver_name}</span>
                  </td>
                  <td className="py-3.5">
                    <span className="text-slate-600 dark:text-slate-400">{tr.cargo_type || 'Industrial Freight'}</span>
                  </td>
                  <td className="py-3.5">
                    <div className="w-28">
                      <div className="flex items-center justify-between text-[10px] mb-1 font-mono">
                        <span className="text-slate-400">Load</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{tr.weight_loaded_percent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            tr.weight_loaded_percent > 90 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${tr.weight_loaded_percent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-sky-500" />
                      {tr.speed_kmh} km/h
                    </span>
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tr.status === 'in_progress'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-500/10 text-slate-500'
                        }`}
                      >
                        {tr.status === 'in_progress' ? 'On Highway' : tr.status}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 font-medium">{tr.eta || '35m'}</span>
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
