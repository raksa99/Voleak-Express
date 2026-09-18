import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { checkSupabaseConnection } from '../lib/supabaseClient';
import {
  Sun,
  Moon,
  Globe,
  Search,
  Bell,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  ChevronDown,
  Truck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header({ searchVal, setSearchVal, activeTabTitle }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const { lang, toggleLanguage, t } = useLanguage();
  const [isConnected, setIsConnected] = useState(true);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Container Truck #TRK-901 departed Phnom Penh Hub', time: '10m ago' },
    { id: 2, text: 'Waybill #VKX-8801-KH arrived at Siem Reap Hub', time: '25m ago' },
  ]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  useEffect(() => {
    checkSupabaseConnection().then((res) => setIsConnected(res));
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-300">
      {/* Left: Active Tab Title & Breadcrumb */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {activeTabTitle}
          </h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Top Sports Textile • Truck & Cargo Logistics
          </p>
        </div>
      </div>

      {/* Center: Quick Search Bar */}
      <div className="hidden md:flex items-center w-72 lg:w-96 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all duration-200"
        />
      </div>

      {/* Right Controls: Database status, Language, Theme, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Supabase Connection Status Pill */}
        <div
          className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            isConnected
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            ></span>
          </span>
          {isConnected ? t('connected') : t('disconnected')}
        </div>

        {/* Language Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all"
          >
            <Globe className="w-4 h-4 text-amber-500" />
            <span>{lang === 'en' ? '🇬🇧 English' : '🇰🇭 ភាសាខ្មែរ'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {showLangMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-40 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50"
              >
                <button
                  onClick={() => {
                    if (lang !== 'en') toggleLanguage();
                    setShowLangMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                    lang === 'en'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span>🇬🇧 English</span>
                  {lang === 'en' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />}
                </button>
                <button
                  onClick={() => {
                    if (lang !== 'km') toggleLanguage();
                    setShowLangMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold mt-1 ${
                    lang === 'km'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span>🇰🇭 ភាសាខ្មែរ</span>
                  {lang === 'km' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dark/Light Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title="Toggle Light/Dark Theme"
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>

        {/* Notifications Icon Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all"
          >
            <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-3 z-50"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Logistics Alerts
                  </h4>
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-bold">
                    {notifications.length} new
                  </span>
                </div>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/50 text-xs"
                    >
                      <p className="font-medium text-slate-800 dark:text-slate-200">{n.text}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Info Pill */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-amber-500/20">
            BL
          </div>
          <div className="hidden xl:block">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              Bong Leak
            </h4>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
              {t('adminProfile')}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
