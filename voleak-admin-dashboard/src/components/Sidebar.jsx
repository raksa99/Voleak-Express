import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  Users,
  Truck,
  Calendar,
  Package,
  Boxes,
  Map,
  ShieldAlert,
  Building2,
  Handshake,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }) {
  const { t } = useLanguage();

  const navItems = [
    { id: 'overview', label: t('navOverview'), icon: LayoutDashboard },
    { id: 'users', label: t('navUsers'), icon: Users },
    { id: 'cooperators', label: t('navCooperators') || 'Cooperators', icon: Handshake },
    { id: 'fleet', label: t('navFleet'), icon: Truck },
    { id: 'inventory', label: t('navInventory') || 'Cargo & Inventory', icon: Boxes },
    { id: 'schedules', label: t('navSchedules'), icon: Calendar },
    { id: 'bookings', label: t('navBookings'), icon: Package },
    { id: 'liveMap', label: t('navLiveMap'), icon: Map, badge: 'Live' },
    { id: 'incidents', label: t('navIncidents'), icon: ShieldAlert },
    { id: 'operators', label: t('navOperators'), icon: Building2 },
    { id: 'settings', label: t('navSettings'), icon: Settings },
  ];

  return (
    <aside
      className={`relative z-40 flex flex-col h-screen border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-20 px-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-sky-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25 shrink-0">
            <Truck className="w-5 h-5 animate-pulse" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-wider flex items-center gap-1">
                VOLEAK <span className="text-amber-500">EXPRESS</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Truck & Cargo Fleet
              </span>
            </div>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Nav Items List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative w-full flex items-center gap-3.5 px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'text-amber-500 dark:text-amber-400 font-semibold bg-amber-500/10 dark:bg-amber-500/15'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-amber-500 rounded-r-full" />
              )}
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`} />
              
              {!collapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {!collapsed && item.badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Banner */}
      {!collapsed && (
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-slate-900 to-amber-950 text-white relative overflow-hidden shadow-lg border border-amber-500/20">
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Truck & Cargo Express
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Full control over waybills, truck dispatch & live GPS cargo tracking.
            </p>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-amber-500/20 rounded-full blur-xl"></div>
        </div>
      )}
    </aside>
  );
}
