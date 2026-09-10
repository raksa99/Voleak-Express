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

function DashboardContent() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
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
      const [u, cop, b, r, s, tr, bk, inc, op, p, bs, sm, cs] = await Promise.all([
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
      setUsers(u || []);
      setCooperators(cop || []);
      setBuses(b || []);
      setRoutes(r || []);
      setSchedules(s || []);
      setTrips(tr || []);
      setBookings(bk || []);
      setIncidents(inc || []);
      setOperators(op || []);
      setProducts(p || []);
      setBranchStock(bs || []);
      setStockMovements(sm || []);
      setCooperatorStock(cs || []);
    } catch (err) {
      console.warn('Data refresh error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();

    const handleSyncEvent = () => refreshData();
    window.addEventListener('supabase_sync_requested', handleSyncEvent);
    return () => window.removeEventListener('supabase_sync_requested', handleSyncEvent);
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
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky Header */}
        <Header
          searchVal={searchVal}
          setSearchVal={setSearchVal}
          activeTabTitle={getTabTitle()}
        />

        {/* View Switcher Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
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
                <UsersView users={users} setUsers={setUsers} searchVal={searchVal} />
              )}
              {activeTab === 'cooperators' && (
                <CooperatorsView
                  cooperators={cooperators}
                  setCooperators={setCooperators}
                  operators={operators}
                  routes={routes}
                  searchVal={searchVal}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === 'fleet' && <FleetView buses={buses} setBuses={setBuses} />}
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
                />
              )}
              {activeTab === 'bookings' && (
                <BookingsView
                  bookings={bookings}
                  setBookings={setBookings}
                  trips={trips}
                  users={users}
                />
              )}
              {activeTab === 'liveMap' && (
                <LiveMapTrackingView trips={trips} operators={operators} routes={routes} />
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
