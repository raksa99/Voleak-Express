import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthRoleProvider } from './context/AuthRoleContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OverviewView from './views/OverviewView';
import UsersView from './views/UsersView';
import CooperatorsView from './views/CooperatorsView';
import FleetView from './views/FleetView';
import SchedulesTripsView from './views/SchedulesTripsView';
import BookingsView from './views/BookingsView';
import LiveMapTrackingView from './views/LiveMapTrackingView';
import IncidentsView from './views/IncidentsView';
import OperatorsView from './views/OperatorsView';
import InventoryView from './views/InventoryView';
import SettingsView from './views/SettingsView';
import ErrorBoundary from './components/ErrorBoundary';
import { LayoutDashboard, Truck, Map, Boxes, Menu } from 'lucide-react';
import {
  fetchUsers,
  fetchCooperators,
  fetchBuses,
  fetchRoutes,
  fetchSchedules,
  fetchTrips,
  fetchBookings,
  fetchIncidents,
  fetchOperators,
  fetchProducts,
  fetchBranchStock,
  fetchStockMovements,
  fetchCooperatorStock,
  initialBuses,
  initialProducts,
  initialBranchStock,
  initialStockMovements,
  initialCooperatorStock,
  initialUsers,
  initialCooperators,
  initialRoutes,
  initialSchedules,
  initialTrips,
  initialBookings,
  initialIncidents,
  initialOperators,
} from './lib/supabaseClient';
import { fetchDagpsGpsData } from './lib/dagpsService';

function DashboardContent() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  // State Stores
  const [users, setUsers] = useState(initialUsers);
  const [cooperators, setCooperators] = useState(initialCooperators);
  const [buses, setBuses] = useState(initialBuses);
  const [routes, setRoutes] = useState(initialRoutes);
  const [schedules, setSchedules] = useState(initialSchedules);
  const [trips, setTrips] = useState(initialTrips);
  const [bookings, setBookings] = useState(initialBookings);
  const [incidents, setIncidents] = useState(initialIncidents);
  const [operators, setOperators] = useState(initialOperators);
  const [products, setProducts] = useState(initialProducts);
  const [branchStock, setBranchStock] = useState(initialBranchStock);
  const [stockMovements, setStockMovements] = useState(initialStockMovements);
  const [cooperatorStock, setCooperatorStock] = useState(initialCooperatorStock);
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        fetchUsers(),
        fetchCooperators(),
        fetchBuses(),
        fetchRoutes(),
        fetchSchedules(),
        fetchTrips(),
        fetchBookings(),
        fetchIncidents(),
        fetchOperators(),
        fetchProducts(),
        fetchBranchStock(),
        fetchStockMovements(),
        fetchCooperatorStock(),
      ]);

      const [u, cop, b, r, s, tr, bk, inc, op, p, bs, sm, cs] = results.map((res) =>
        res.status === 'fulfilled' ? res.value : null
      );

      if (u) setUsers(u);
      if (cop) setCooperators(cop);
      if (b) setBuses(b);
      if (r) setRoutes(r);
      if (s) setSchedules(s);
      if (tr) setTrips(tr);
      if (bk) setBookings(bk);
      if (inc) setIncidents(inc);
      if (op) setOperators(op);
      if (p) setProducts(p);
      if (bs) setBranchStock(bs);
      if (sm) setStockMovements(sm);
      if (cs) setCooperatorStock(cs);
    } catch (err) {
      console.warn('Data refresh error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();

    // Fetch initial DAGPS telemetry and poll periodically in background
    fetchDagpsGpsData().catch((e) => console.info('Initial DAGPS ping:', e.message));
    const dagpsBgPoller = setInterval(() => {
      fetchDagpsGpsData().catch((e) => console.info('Background DAGPS poller:', e.message));
    }, 8000);

    const handleSyncEvent = () => refreshData();
    window.addEventListener('supabase_sync_requested', handleSyncEvent);

    // Sync live DAGPS hardware fix across trips and fleet for all assigned devices
    const handleDagpsUpdate = (e) => {
      const { devices } = e.detail || {};
      if (devices && devices.length > 0) {
        setTrips((prevTrips) =>
          prevTrips.map((t) => {
            const matchedDev = devices.find(
              (dev) =>
                dev.plateNumber &&
                (dev.plateNumber === t.bus_plate ||
                  (t.bus_id === 'truck-1' && dev.plateNumber === 'PP-3D-8890'))
            );
            if (matchedDev) {
              return {
                ...t,
                latitude: matchedDev.latitude,
                longitude: matchedDev.longitude,
                speed_kmh: matchedDev.speed,
                location_name: matchedDev.address,
                gps_synced: true,
                gps_battery: matchedDev.battery,
                gps_satellites: matchedDev.satellites,
                gps_status: matchedDev.motionStatus,
              };
            }
            return t;
          })
        );

        setBuses((prevBuses) =>
          prevBuses.map((b) => {
            const matchedDev = devices.find(
              (dev) =>
                dev.plateNumber &&
                (dev.plateNumber === b.plate_number ||
                  (b.id === 'truck-1' && dev.plateNumber === 'PP-3D-8890'))
            );
            if (matchedDev) {
              return {
                ...b,
                dagps_live: true,
                latitude: matchedDev.latitude,
                longitude: matchedDev.longitude,
                current_location: matchedDev.address,
                battery: matchedDev.battery,
                voltage: matchedDev.voltage,
                satellites: matchedDev.satellites,
                speed: matchedDev.speed,
                motion_status: matchedDev.motionStatus,
                imei: matchedDev.imei,
                last_gps_fix: matchedDev.lastGpsTime,
              };
            }
            return b;
          })
        );
      }
    };

    window.addEventListener('dagps_telemetry_updated', handleDagpsUpdate);

    return () => {
      clearInterval(dagpsBgPoller);
      window.removeEventListener('supabase_sync_requested', handleSyncEvent);
      window.removeEventListener('dagps_telemetry_updated', handleDagpsUpdate);
    };
  }, []);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview':
        return t('navOverview');
      case 'users':
        return t('navUsers');
      case 'cooperators':
        return t('navCooperators') || 'Cooperators';
      case 'fleet':
        return t('navFleet');
      case 'inventory':
        return t('navInventory') || 'Cargo & Inventory';
      case 'routes':
        return t('navRoutes');
      case 'schedules':
        return t('navSchedules');
      case 'bookings':
        return t('navBookings');
      case 'liveMap':
        return t('navLiveMap');
      case 'incidents':
        return t('navIncidents');
      case 'operators':
        return t('navOperators');
      case 'settings':
        return t('navSettings');
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Sticky Header */}
        <Header
          searchVal={searchVal}
          setSearchVal={setSearchVal}
          activeTabTitle={getTabTitle()}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* View Switcher Container */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-8 pb-20 md:pb-8">
          <ErrorBoundary>
            <div key={activeTab} className="transition-opacity duration-200">
              {activeTab === 'overview' && (
                <OverviewView
                  setActiveTab={setActiveTab}
                  trips={trips}
                  bookings={bookings}
                  users={users}
                  buses={buses}
                  incidents={incidents}
                />
              )}
              {activeTab === 'users' && (
                <UsersView
                  users={users}
                  setUsers={setUsers}
                  searchVal={searchVal}
                  buses={buses}
                  setBuses={setBuses}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === 'cooperators' && (
                <CooperatorsView
                  cooperators={cooperators}
                  setCooperators={setCooperators}
                  operators={operators}
                  routes={routes}
                  searchVal={searchVal}
                  setActiveTab={setActiveTab}
                  onRefresh={refreshData}
                />
              )}
              {activeTab === 'fleet' && (
                <FleetView
                  buses={buses}
                  setBuses={setBuses}
                  users={users}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === 'inventory' && (
                <InventoryView
                  products={products}
                  setProducts={setProducts}
                  branchStock={branchStock}
                  setBranchStock={setBranchStock}
                  stockMovements={stockMovements}
                  setStockMovements={setStockMovements}
                  cooperatorStock={cooperatorStock}
                  setCooperatorStock={setCooperatorStock}
                  operators={operators}
                  cooperators={cooperators}
                  onRefresh={refreshData}
                />
              )}
              {activeTab === 'schedules' && (
                <SchedulesTripsView
                  schedules={schedules}
                  setSchedules={setSchedules}
                  trips={trips}
                  setTrips={setTrips}
                  routes={routes}
                  buses={buses}
                  users={users}
                  cooperators={cooperators}
                />
              )}
              {activeTab === 'bookings' && (
                <BookingsView
                  bookings={bookings}
                  setBookings={setBookings}
                  trips={trips}
                  users={users}
                  cooperators={cooperators}
                />
              )}
              {activeTab === 'liveMap' && (
                <LiveMapTrackingView
                  trips={trips}
                  operators={operators}
                  routes={routes}
                  buses={buses}
                />
              )}
              {activeTab === 'incidents' && (
                <IncidentsView incidents={incidents} setIncidents={setIncidents} />
              )}
              {activeTab === 'operators' && (
                <OperatorsView
                  operators={operators}
                  setOperators={setOperators}
                  routes={routes}
                  setRoutes={setRoutes}
                  cooperators={cooperators}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === 'settings' && <SettingsView />}
            </div>
          </ErrorBoundary>
        </main>

        {/* Mobile Bottom Quick-Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-inset-bottom">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'overview'
                ? 'text-amber-500 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'fleet'
                ? 'text-amber-500 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Truck className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">Fleet</span>
          </button>

          <button
            onClick={() => setActiveTab('liveMap')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl relative transition-all ${
              activeTab === 'liveMap'
                ? 'text-amber-500 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="relative">
              <Map className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-1 ring-white dark:ring-slate-900" />
            </div>
            <span className="text-[10px] mt-0.5 font-medium">Live GPS</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'inventory'
                ? 'text-amber-500 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Boxes className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">Cargo</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            <span className="text-[10px] mt-0.5 font-medium">Menu</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthRoleProvider>
            <DashboardContent />
          </AuthRoleProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
