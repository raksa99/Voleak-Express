import React, { useState, useEffect } from 'react';
import {
  Radio,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Save,
  X,
  Battery,
  Satellite,
  Compass,
  MapPin,
  Truck,
  Cpu,
  Globe,
  Clock,
  Check,
  Copy,
  Plus,
  Trash2,
  Layers,
  Settings2,
} from 'lucide-react';
import {
  getDagpsConfig,
  saveDagpsConfig,
  parseDagpsUrl,
  fetchDagpsGpsData,
  getCachedGpsDevices,
  addCustomGpsDevice,
  removeCustomGpsDevice,
  DEFAULT_DAGPS_CONFIG,
} from '../lib/dagpsService';
import { syncGpsTrackerToSupabase } from '../lib/supabaseClient';

export default function DagpsConfigModal({ isOpen, onClose, onConfigSaved, onAssignmentChange, trucks = [] }) {
  if (!isOpen) return null;

  const currentConfig = getDagpsConfig();
  const [urlInput, setUrlInput] = useState(currentConfig.originalUrl || '');
  const [fatherId, setFatherId] = useState(currentConfig.fatherId || '');
  const [loginId, setLoginId] = useState(currentConfig.loginId || '');
  const [mds, setMds] = useState(currentConfig.mds || '');
  const [autoRefresh, setAutoRefresh] = useState(currentConfig.autoRefresh ?? true);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(currentConfig.autoRefreshInterval || 10);

  // Multi-Device Assignments: { [imeiOrDeviceId]: truckPlate }
  const [assignments, setAssignments] = useState(currentConfig.deviceAssignments || {});

  // Known / Available Devices
  const [knownDevices, setKnownDevices] = useState(getCachedGpsDevices());
  const [customDevices, setCustomDevices] = useState(currentConfig.customDevices || []);

  // Form to add another GPS device
  const [newTrackerImei, setNewTrackerImei] = useState('');
  const [newTrackerTruck, setNewTrackerTruck] = useState(trucks[0]?.plate_number || '');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Parse on URL change
  const handleUrlChange = (val) => {
    setUrlInput(val);
    const parsed = parseDagpsUrl(val);
    if (parsed) {
      if (parsed.fatherId) setFatherId(parsed.fatherId);
      if (parsed.loginId) setLoginId(parsed.loginId);
      if (parsed.mds) setMds(parsed.mds);
    }
  };

  // Test live connection
  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setTestError(null);

    try {
      const res = await fetchDagpsGpsData({
        fatherId,
        loginId,
        schoolId: fatherId || loginId,
        custId: loginId || fatherId,
        mds,
        deviceAssignments: assignments,
      });

      if (res && res.success && res.devices.length > 0) {
        setTestResult(res);
        setKnownDevices(res.devices);
      } else {
        setTestError('Connected, but no GPS devices returned in this DAGPS account.');
      }
    } catch (err) {
      setTestError(err.message || 'Failed to connect to DAGPS API. Please check token/mds.');
    } finally {
      setTesting(false);
    }
  };

  // Assign a device to a truck
  const handleDeviceTruckChange = async (deviceKey, plate) => {
    const targetPlate = !plate || plate === 'unassigned' ? null : plate;
    setAssignments((prev) => {
      const copy = { ...prev };
      if (!targetPlate) {
        delete copy[deviceKey];
      } else {
        copy[deviceKey] = targetPlate;
      }
      return copy;
    });

    // Immediately persist GPS IMEI to Supabase trucks table
    await syncGpsTrackerToSupabase(deviceKey, targetPlate);
  };

  // Add another GPS tracker manually by IMEI
  const handleAddCustomTracker = async (e) => {
    e.preventDefault();
    const cleanImei = newTrackerImei.trim();
    if (!cleanImei) return;

    const targetTruck = newTrackerTruck || trucks[0]?.plate_number || '';

    const newDev = {
      id: `dev-${cleanImei}`,
      userName: `GPS-${cleanImei.slice(-4)}`,
      imei: cleanImei,
      deviceModel: 'GT06',
      plateNumber: targetTruck,
      battery: 100,
      motionStatus: 'Parking',
      speed: 0,
      latitude: 11.567262,
      longitude: 104.894542,
      address: 'Phnom Penh, Cambodia',
    };

    const updated = addCustomGpsDevice(newDev);
    setCustomDevices(updated.customDevices || []);
    setAssignments(updated.deviceAssignments || {});

    // Persist new GPS IMEI to Supabase
    await syncGpsTrackerToSupabase(cleanImei, targetTruck);

    // Add to known devices list
    setKnownDevices((prev) => {
      if (prev.some((d) => d.imei === newDev.imei)) return prev;
      return [...prev, newDev];
    });

    if (onAssignmentChange) {
      onAssignmentChange(updated.deviceAssignments);
    }

    // Reset input fields
    setNewTrackerImei('');
  };

  const handleRemoveCustomTracker = async (imei) => {
    const updated = removeCustomGpsDevice(imei);
    setCustomDevices(updated.customDevices || []);
    setAssignments(updated.deviceAssignments || {});
    setKnownDevices((prev) => prev.filter((d) => d.imei !== imei));
    await syncGpsTrackerToSupabase(imei, null);
  };

  const handleSave = async () => {
    // Determine a primary fallback plate
    const firstAssigned = Object.values(assignments)[0] || trucks[0]?.plate_number || '';

    // Persist all active assignments to Supabase
    for (const [imei, plate] of Object.entries(assignments)) {
      if (imei && plate) {
        syncGpsTrackerToSupabase(imei, plate).catch(console.warn);
      }
    }

    const updated = saveDagpsConfig({
      originalUrl: urlInput.trim(),
      fatherId: fatherId.trim(),
      loginId: loginId.trim(),
      schoolId: (fatherId || loginId).trim(),
      custId: (loginId || fatherId).trim(),
      mds: mds.trim(),
      assignedTruckPlate: firstAssigned,
      deviceAssignments: assignments,
      customDevices,
      autoRefresh,
      autoRefreshInterval: Number(autoRefreshInterval) || 10,
    });

    setSaveSuccess(true);
    if (onAssignmentChange) onAssignmentChange(assignments);
    setTimeout(() => {
      setSaveSuccess(false);
      if (onConfigSaved) onConfigSaved(updated);
      onClose();
    }, 800);
  };

  const handleResetDefaults = () => {
    setUrlInput(DEFAULT_DAGPS_CONFIG.originalUrl);
    setFatherId(DEFAULT_DAGPS_CONFIG.fatherId);
    setLoginId(DEFAULT_DAGPS_CONFIG.loginId);
    setMds(DEFAULT_DAGPS_CONFIG.mds);
    setAssignments(DEFAULT_DAGPS_CONFIG.deviceAssignments);
    setAutoRefresh(DEFAULT_DAGPS_CONFIG.autoRefresh);
    setAutoRefreshInterval(DEFAULT_DAGPS_CONFIG.autoRefreshInterval);
    setTestResult(null);
    setTestError(null);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(urlInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Combine primary detected devices and custom devices for assignment list
  const allDevicesList = [...knownDevices];
  customDevices.forEach((cust) => {
    if (!allDevicesList.some((d) => d.imei === cust.imei)) {
      allDevicesList.push(cust);
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                DAGPS Cloud & Fleet Pairing
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Multi-Tracker
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connect satellite GPS trackers and assign each tracker to your chosen freight truck
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. SECTION: GPS DEVICE TO TRUCK PAIRINGS */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                GPS Trackers & Truck Pairing (ផ្ជាប់ GPS ជាមួយឡាន)
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
              {allDevicesList.length} Active {allDevicesList.length === 1 ? 'Tracker' : 'Trackers'}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Select which truck is tracked by each GPS device. If you have a new GPS, enter its 15-digit IMEI number below to pair it.
          </p>

          {/* Quick Add Form for New GPS IMEI */}
          <form
            onSubmit={handleAddCustomTracker}
            className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/25 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-amber-500" />
                <span>+ Add New GPS Tracker (បញ្ចូល GPS ថ្មីតាម IMEI)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">15-Digit IMEI</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
              <div className="sm:col-span-6 space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  GPS IMEI Number (លេខសម្គាល់ IMEI): <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 358878731425895"
                  value={newTrackerImei}
                  onChange={(e) => setNewTrackerImei(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Assign to Truck (ជ្រើសរើសឡាន):
                </label>
                <select
                  value={newTrackerTruck}
                  onChange={(e) => setNewTrackerTruck(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {trucks.map((t) => (
                    <option key={t.id || t.plate_number} value={t.plate_number}>
                      {t.plate_number} ({t.model?.slice(0, 18) || 'Truck'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add GPS</span>
                </button>
              </div>
            </div>
          </form>

          {/* List of Trackers & Truck Dropdowns */}
          <div className="space-y-2.5">
            {allDevicesList.map((dev) => {
              const deviceKey = dev.imei || dev.userName || dev.id;
              const assignedPlate = assignments[dev.imei] || assignments[dev.userName] || assignments[dev.id] || '';
              const isCustom = customDevices.some((c) => c.imei === dev.imei);

              return (
                <div
                  key={dev.id || dev.imei}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  {/* Device Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="p-1 rounded-lg bg-amber-500/10 text-amber-500">
                        <Satellite className="w-4 h-4" />
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm font-mono">
                        IMEI: <span className="text-amber-500">{dev.imei}</span>
                      </span>
                      {dev.userName && dev.userName !== dev.imei && (
                        <span className="text-[11px] font-bold text-slate-400 font-mono">
                          ({dev.userName})
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {dev.motionStatus || 'Online'}
                      </span>
                      {dev.battery && (
                        <span className="text-[10px] font-bold text-amber-500">
                          {dev.battery}% Bat
                        </span>
                      )}
                    </div>
                    {dev.address && (
                      <p className="text-[11px] text-slate-400 truncate max-w-md">
                        📍 {dev.address}
                      </p>
                    )}
                  </div>

                  {/* Truck Assignment Dropdown */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                        Assigned Truck (ឡាន):
                      </label>
                      <select
                        value={assignedPlate || 'unassigned'}
                        onChange={(e) => handleDeviceTruckChange(deviceKey, e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="unassigned">— Unassigned (មិនទាន់ផ្ជាប់) —</option>
                        {trucks.length > 0 ? (
                          trucks.map((truck) => (
                            <option key={truck.id || truck.plate_number} value={truck.plate_number}>
                              {truck.plate_number} ({truck.model?.slice(0, 20) || 'Truck'})
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No fleet trucks registered</option>
                        )}
                      </select>
                    </div>

                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomTracker(dev.imei)}
                        className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors mt-3"
                        title="Remove tracker"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLLAPSED ADVANCED DEVELOPER SETTINGS (HIDDEN BY DEFAULT) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium flex items-center gap-1.5 transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{showAdvancedSettings ? 'Hide Advanced DAGPS Credentials' : '⚙️ Advanced DAGPS Portal & Session Token (Optional)'}</span>
          </button>

          {showAdvancedSettings && (
            <div className="mt-4 space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs animate-fadeIn">
              {/* URL & Credential Configuration */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-amber-500" />
                    DAGPS Primary Portal URL
                  </label>
                  <button
                    onClick={handleCopyUrl}
                    className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy Current URL'}
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={urlInput}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="Paste DAGPS URL here"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              {/* Detailed Extracted Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Account / Father ID
                  </span>
                  <input
                    type="text"
                    value={fatherId}
                    onChange={(e) => setFatherId(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Login ID / Cust ID
                  </span>
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Session MDS Token
                  </span>
                  <input
                    type="text"
                    value={mds}
                    onChange={(e) => setMds(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Polling Interval Setting */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500" />
                    Automated Background GPS Polling
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Refresh satellite telemetry in real time
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      autoRefresh
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {autoRefresh ? 'Active' : 'Paused'}
                  </button>
                  <select
                    disabled={!autoRefresh}
                    value={autoRefreshInterval}
                    onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white disabled:opacity-50"
                  >
                    <option value={5}>Every 5 seconds</option>
                    <option value={10}>Every 10 seconds</option>
                    <option value={30}>Every 30 seconds</option>
                    <option value={60}>Every 1 minute</option>
                  </select>
                </div>
              </div>

              {/* Live Diagnostic Test */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      Live Connection Test
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={testing}
                    onClick={handleTestConnection}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                    {testing ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>

                {testError && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{testError}</span>
                  </div>
                )}

                {testResult && testResult.devices?.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Connected! Found {testResult.devices.length} GPS devices.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            Reset to Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg transition-all ${
                saveSuccess
                  ? 'bg-emerald-500 shadow-emerald-500/30'
                  : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30'
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved & Synced!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save & Apply All Assignments
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
