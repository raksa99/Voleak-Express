/**
 * DAGPS Cloud Real-time Fleet Telemetry Service
 * Integrates with DAGPS.net tracking platform for GPS hardware (GT06, etc.)
 */

import { syncGpsTrackerToSupabase } from './supabaseClient';

export const DEFAULT_DAGPS_CONFIG = {
  baseUrl: 'http://www.dagps.net',
  fatherId: '09fa24a6-a6e4-4fcf-9de8-2564774a92c7',
  loginId: '09fa24a6-a6e4-4fcf-9de8-2564774a92c7',
  custId: '09fa24a6-a6e4-4fcf-9de8-2564774a92c7',
  schoolId: '09fa24a6-a6e4-4fcf-9de8-2564774a92c7',
  mds: '',
  originalUrl:
    'http://www.dagps.net/user/index.aspx?father_id=09fa24a6-a6e4-4fcf-9de8-2564774a92c7&login_id=09fa24a6-a6e4-4fcf-9de8-2564774a92c7',
  accountPhone: '0967982573',
  accountPassword: '123456',
  autoRefresh: true,
  autoRefreshInterval: 5, // 5 seconds dynamic polling
  assignedTruckPlate: '',
  deviceAssignments: {},
  customDevices: [],
};

const STORAGE_KEY = 'voleak_dagps_config';
const KNOWN_DEVICES_KEY = 'voleak_known_gps_devices';
const ADDRESS_CACHE_KEY = 'voleak_dagps_address_cache';

/**
 * Get all current device-to-truck assignments
 */
export function getDeviceAssignments() {
  const config = getDagpsConfig();
  return config.deviceAssignments || {};
}

/**
 * Assign a specific GPS device (by IMEI or device ID) to a chosen truck plate
 */
export function assignDeviceToTruck(imeiOrId, plateNumber) {
  const config = getDagpsConfig();
  const assignments = { ...(config.deviceAssignments || {}) };
  if (plateNumber && plateNumber !== 'unassigned') {
    assignments[imeiOrId] = plateNumber;
    syncGpsTrackerToSupabase(imeiOrId, plateNumber).catch((e) => console.warn('Supabase sync warning:', e));
  } else {
    delete assignments[imeiOrId];
    syncGpsTrackerToSupabase(imeiOrId, null).catch((e) => console.warn('Supabase sync warning:', e));
  }
  return saveDagpsConfig({ ...config, deviceAssignments: assignments });
}

/**
 * Resolve the assigned truck plate for a device
 */
export function getAssignedTruckPlate(device, assignments = {}) {
  if (!device) return '';
  if (device.imei && assignments[device.imei]) return assignments[device.imei];
  if (device.userName && assignments[device.userName]) return assignments[device.userName];
  if (device.id && assignments[device.id]) return assignments[device.id];
  return '';
}

/**
 * Get cached known GPS devices for instant dropdown population
 */
export function getCachedGpsDevices() {
  try {
    const raw = localStorage.getItem(KNOWN_DEVICES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}
  return [];
}

/**
 * Save known GPS devices cache
 */
export function saveCachedGpsDevices(devices) {
  try {
    if (Array.isArray(devices) && devices.length > 0) {
      localStorage.setItem(KNOWN_DEVICES_KEY, JSON.stringify(devices));
    }
  } catch (e) {}
}

/**
 * Add or update an additional standalone GPS tracker
 */
export function addCustomGpsDevice(deviceData) {
  const config = getDagpsConfig();
  const customDevices = Array.isArray(config.customDevices) ? [...config.customDevices] : [];
  const existingIdx = customDevices.findIndex(
    (d) => d.imei === deviceData.imei || (deviceData.id && d.id === deviceData.id)
  );

  const cleanDevice = {
    id: deviceData.id || `dev-${deviceData.imei || Date.now()}`,
    userName: deviceData.userName || deviceData.name || `GT06-${deviceData.imei?.slice(-4) || 'GPS'}`,
    imei: deviceData.imei,
    deviceModel: deviceData.deviceModel || 'GT06',
    plateNumber: deviceData.plateNumber || '',
    accountUrl: deviceData.accountUrl || '',
    battery: deviceData.battery || 85,
    motionStatus: deviceData.motionStatus || 'Parking',
    speed: deviceData.speed || 0,
    latitude: Number(deviceData.latitude) || 11.5564,
    longitude: Number(deviceData.longitude) || 104.9282,
    address: deviceData.address || 'Phnom Penh, Cambodia',
    ...deviceData,
  };

  if (existingIdx >= 0) {
    customDevices[existingIdx] = cleanDevice;
  } else {
    customDevices.push(cleanDevice);
  }

  // Update assignments
  const assignments = { ...(config.deviceAssignments || {}) };
  if (cleanDevice.plateNumber && cleanDevice.imei) {
    assignments[cleanDevice.imei] = cleanDevice.plateNumber;
    syncGpsTrackerToSupabase(cleanDevice.imei, cleanDevice.plateNumber).catch((e) => console.warn('Supabase sync warning:', e));
  }

  return saveDagpsConfig({
    ...config,
    customDevices,
    deviceAssignments: assignments,
  });
}

/**
 * Remove an extra custom GPS tracker
 */
export function removeCustomGpsDevice(imei) {
  const config = getDagpsConfig();
  const customDevices = (config.customDevices || []).filter((d) => d.imei !== imei);
  const assignments = { ...(config.deviceAssignments || {}) };
  delete assignments[imei];
  syncGpsTrackerToSupabase(imei, null).catch((e) => console.warn('Supabase sync warning:', e));
  return saveDagpsConfig({
    ...config,
    customDevices,
    deviceAssignments: assignments,
  });
}

/**
 * Parse any DAGPS URL (login URL, index URL, monitor URL) to extract tokens
 */
export function parseDagpsUrl(urlStr) {
  if (!urlStr || typeof urlStr !== 'string') return null;
  try {
    const raw = urlStr.trim();
    const url = new URL(raw.startsWith('http') ? raw : `http://${raw}`);
    const fatherId = url.searchParams.get('father_id') || url.searchParams.get('fatherId') || '';
    const loginId = url.searchParams.get('login_id') || url.searchParams.get('school_id') || '';
    const custId = url.searchParams.get('custid') || loginId || fatherId;
    const schoolId = url.searchParams.get('school_id') || fatherId || loginId;
    const mds = url.searchParams.get('mds') || '';

    return {
      baseUrl: `${url.protocol}//${url.host}`,
      fatherId: fatherId || loginId,
      loginId: loginId || fatherId,
      custId: custId || fatherId,
      schoolId: schoolId || fatherId,
      mds,
      originalUrl: raw,
    };
  } catch (err) {
    console.warn('Failed to parse DAGPS URL:', err);
    return null;
  }
}

/**
 * Get current DAGPS configuration from localStorage or defaults
 */
export function getDagpsConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_DAGPS_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Error reading DAGPS config from localStorage', e);
  }
  return { ...DEFAULT_DAGPS_CONFIG };
}

/**
 * Save DAGPS configuration to localStorage
 */
export function saveDagpsConfig(newConfig) {
  try {
    const merged = { ...getDagpsConfig(), ...newConfig };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('dagps_config_updated', { detail: merged }));
    return merged;
  } catch (e) {
    console.warn('Error saving DAGPS config to localStorage', e);
    return newConfig;
  }
}

/**
 * Convert heading degrees into compass direction string
 */
export function getHeadingCompass(degrees) {
  const deg = Number(degrees) || 0;
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return `${directions[index]} (${Math.round(deg)}°)`;
}

/**
 * In-memory & localStorage cached reverse geocoding for Cambodian GPS coordinates
 */
const addressMemoryCache = new Map();

export async function reverseGeocodeCambodia(lat, lon) {
  if (!lat || !lon) return 'Unknown Location';
  const roundedLat = Number(lat).toFixed(4);
  const roundedLon = Number(lon).toFixed(4);
  const cacheKey = `${roundedLat},${roundedLon}`;

  if (addressMemoryCache.has(cacheKey)) {
    return addressMemoryCache.get(cacheKey);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'VoleakExpress-FleetDashboard/1.0',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const hamlet = addr.hamlet || addr.suburb || '';
      const village = addr.village || addr.neighbourhood || '';
      const district = addr.town || addr.city_district || addr.county || '';
      const province = addr.state || addr.city || 'Phnom Penh';

      const parts = [hamlet, village, district, province].filter(Boolean);
      const formatted = parts.length > 0 ? parts.join(', ') : (data.display_name || `${Number(lat).toFixed(5)}°N, ${Number(lon).toFixed(5)}°E`);
      addressMemoryCache.set(cacheKey, formatted);
      return formatted;
    }
  } catch (err) {
    // Graceful fallback
  }

  const fallback = `${Number(lat).toFixed(5)}°N, ${Number(lon).toFixed(5)}°E`;
  addressMemoryCache.set(cacheKey, fallback);
  return fallback;
}

/**
 * Parse raw DAGPS records using the response key mapping
 */
export function parseDagpsDevice(record, key) {
  if (!record || !key) return null;

  const getVal = (colName) => {
    const idx = key[colName];
    return idx !== undefined && idx !== null ? record[idx] : undefined;
  };

  const latitude = Number(getVal('weidu') || getVal('lweidu') || 0);
  const longitude = Number(getVal('jingdu') || getVal('ljingdu') || 0);
  const speed = Number(getVal('su') || 0);
  const heading = Number(getVal('hangxiang') || 0);
  const statenumberRaw = String(getVal('statenumber') || '');
  const stateParts = statenumberRaw.split(',');

  // statenumber format: "17.675,0,0,,70,11.31,10,100,0,0,0,0,0,0,0,23,0,,Parking,0,0"
  const batteryFromState = parseFloat(stateParts[4]) || 0;
  const batteryElectric = Number(getVal('electric') || 0);
  const battery = batteryFromState > 0 ? batteryFromState : batteryElectric;
  const voltage = stateParts[5] ? `${parseFloat(stateParts[5]).toFixed(2)}V` : '';
  const satellites = parseInt(stateParts[6], 10) || 0;
  const gsmSignal = parseInt(stateParts[7], 10) || 0;
  
  // Find status keyword (Parking, Moving, Static, etc.)
  const knownStatusWord = stateParts.find((p) =>
    ['parking', 'moving', 'static', 'idle', 'stop', 'driving'].includes((p || '').trim().toLowerCase())
  );
  const motionStatus = knownStatusWord
    ? (knownStatusWord.charAt(0).toUpperCase() + knownStatusWord.slice(1).toLowerCase())
    : (speed > 0 ? 'Moving' : 'Parking');

  const gpsTimeMs = Number(getVal('datetime') || 0);
  const heartTimeMs = Number(getVal('heart_time') || 0);
  const serverTimeMs = Number(getVal('server_time') || 0);

  // Consider online if heartbeat was within last 2 hours
  const isOnline = Date.now() - heartTimeMs < 1000 * 60 * 60 * 2;

  const describe = String(getVal('describe') || '');
  const iccid = describe.replace(/ICCID:\s*/i, '').trim();

  const id = String(getVal('user_id') || getVal('sim_id') || '');
  const userName = String(getVal('user_name') || '');
  const imei = String(getVal('sim_id') || '');
  const productType = String(getVal('product_type') || '');

  return {
    id,
    userName,
    imei,
    productType,
    deviceModel: productType || 'GT06',
    latitude,
    longitude,
    speed,
    heading,
    compass: getHeadingCompass(heading),
    battery: Math.min(100, Math.max(0, Math.round(battery))),
    voltage,
    satellites,
    gsmSignal,
    motionStatus,
    iccid,
    deptName: String(getVal('deptname') || ''),
    plateNumber: String(getVal('plateNumber') || ''),
    isOnline,
    lastGpsTime: gpsTimeMs ? new Date(gpsTimeMs).toISOString() : new Date().toISOString(),
    lastHeartbeatTime: heartTimeMs ? new Date(heartTimeMs).toISOString() : new Date().toISOString(),
    serverTime: serverTimeMs ? new Date(serverTimeMs).toISOString() : new Date().toISOString(),
    statusFlag: String(getVal('status') || ''),
    rawStatenumber: statenumberRaw,
  };
}

/**
 * Fetch raw data via JSONP directly from DAGPS server in browser (bypasses CORS)
 */
function fetchViaJsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = `dagps_jsonp_cb_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const script = document.createElement('script');

    const cleanUrl = url.replace(/&callback=[^&]*/, '');
    script.src = `${cleanUrl}&callback=${callbackName}`;
    script.async = true;

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('DAGPS JSONP request timed out'));
    }, 12000);

    function cleanup() {
      clearTimeout(timeout);
      delete window[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    }

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = (err) => {
      cleanup();
      reject(new Error('Failed to load DAGPS JSONP script'));
    };

    document.head.appendChild(script);
  });
}

/**
 * Auto-authenticate to DAGPS and update local config with fresh token
 */
export async function authenticateDagps(accountPhone, password) {
  const currentConfig = getDagpsConfig();
  const phone = accountPhone || currentConfig.accountPhone || '0967982573';
  const pass = password || currentConfig.accountPassword || '123456';

  try {
    const res = await fetch(`/api/dagps-login?account=${encodeURIComponent(phone)}&password=${encodeURIComponent(pass)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.mds) {
        const conf = getDagpsConfig();
        const updated = saveDagpsConfig({
          ...conf,
          mds: data.mds,
          loginId: data.loginId || conf.loginId,
          schoolId: data.loginId || conf.schoolId,
          custId: data.loginId || conf.custId,
        });
        return { success: true, mds: data.mds, config: updated };
      }
    }
  } catch (err) {
    console.warn('Frontend authenticateDagps error:', err);
  }
  return { success: false };
}

/**
 * Fetch live GPS data from DAGPS.
 * Uses Vite proxy endpoint (/api/dagps-track) if available, with automatic JSONP fallback and token renewal.
 */
export async function fetchDagpsGpsData(configOverride = {}, isRetry = false) {
  const config = { ...getDagpsConfig(), ...configOverride };
  const { schoolId, custId, mds, fatherId, loginId } = config;

  const actualSchoolId = schoolId || fatherId || loginId;
  const actualCustId = custId || actualSchoolId;
  const actualMds = mds;

  const queryParams = new URLSearchParams({
    school_id: actualSchoolId,
    custid: actualCustId,
    mds: actualMds,
    mapType: 'GOOGLE',
    option: 'en',
    currentid: actualCustId,
    custTreeCheck: 'false',
  }).toString();

  let rawJson = null;
  let fetchMethod = 'proxy';

  // 1. Try local proxy endpoint first
  try {
    const proxyUrl = `/api/dagps-track?${queryParams}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(proxyUrl, { signal: timer.signal });
    clearTimeout(timer);

    if (res.ok) {
      const text = await res.text();
      // If the response is wrapped in callback or pure JSON
      if (text.trim().startsWith('{')) {
        rawJson = JSON.parse(text);
      } else {
        const jsonMatch = text.match(/^[a-zA-Z0-9_.]+\s*\(([\s\S]+)\)\s*;?$/);
        if (jsonMatch) {
          rawJson = JSON.parse(jsonMatch[1]);
        }
      }
    }
  } catch (proxyErr) {
    console.info('DAGPS Proxy fetch did not complete, checking alternatives...', proxyErr.message);
  }

  // 2. If proxy didn't return valid records, try auto-login re-auth once
  if ((!rawJson || !rawJson.key || !Array.isArray(rawJson.records)) && !isRetry) {
    console.log('[DAGPS Service] Attempting token refresh via auto-auth...');
    const authResult = await authenticateDagps(config.accountPhone, config.accountPassword);
    if (authResult.success) {
      return fetchDagpsGpsData({ ...configOverride, mds: authResult.mds }, true);
    }
  }

  // 3. Fallback to direct JSONP if proxy completely failed
  if (!rawJson) {
    try {
      fetchMethod = 'jsonp';
      const directUrl = `${config.baseUrl}/TrackService.aspx?method=getUserAndGPSInfoUtc&${queryParams}`;
      rawJson = await fetchViaJsonp(directUrl);
    } catch (jsonpErr) {
      console.warn('DAGPS JSONP fetch also failed:', jsonpErr.message);
    }
  }

  if (!rawJson || !rawJson.key || !Array.isArray(rawJson.records)) {
    throw new Error('Invalid or empty response received from DAGPS server.');
  }

  // Parse devices and match user chosen truck assignments
  const assignments = config.deviceAssignments || {};
  const devices = await Promise.all(
    rawJson.records.map(async (rec) => {
      const dev = parseDagpsDevice(rec, rawJson.key);
      if (dev && dev.latitude && dev.longitude) {
        dev.address = await reverseGeocodeCambodia(dev.latitude, dev.longitude);
      }
      dev.plateNumber = getAssignedTruckPlate(dev, assignments) || config.assignedTruckPlate || '';
      return dev;
    })
  );

  // Merge extra custom devices registered by the user
  if (Array.isArray(config.customDevices) && config.customDevices.length > 0) {
    for (const cust of config.customDevices) {
      if (!devices.some((d) => d.imei === cust.imei)) {
        devices.push({
          ...cust,
          plateNumber: getAssignedTruckPlate(cust, assignments) || cust.plateNumber || '',
        });
      }
    }
  }

  const validDevices = devices.filter(Boolean);
  saveCachedGpsDevices(validDevices);

  // Automatically persist each discovered GPS tracker to Supabase!
  for (const dev of validDevices) {
    if (dev.imei) {
      syncGpsTrackerToSupabase(dev.imei, dev.plateNumber, {
        deviceModel: dev.productType || dev.deviceModel || 'GT06',
        simPhone: dev.simPhone || config.accountPhone,
        battery: dev.battery,
        motionStatus: dev.motionStatus,
        speed: dev.speed,
        latitude: dev.latitude,
        longitude: dev.longitude,
      }).catch((err) => console.info('[Supabase auto-sync info]', err.message));
    }
  }

  const result = {
    success: true,
    devices: validDevices,
    deviceCount: validDevices.length,
    fetchMethod,
    timestamp: new Date().toISOString(),
    raw: rawJson,
  };

  // Dispatch browser event so any listening view can update seamlessly
  try {
    window.dispatchEvent(new CustomEvent('dagps_telemetry_updated', { detail: result }));
  } catch (e) {
    // ignore in non-browser context
  }

  return result;
}

/**
 * Start background polling for DAGPS live telemetry
 */
export function startDagpsLivePolling(callback, intervalSeconds = 10) {
  let isMounted = true;
  let timerId = null;

  const run = async () => {
    try {
      const data = await fetchDagpsGpsData();
      if (isMounted && callback) {
        callback(null, data);
      }
    } catch (err) {
      if (isMounted && callback) {
        callback(err, null);
      }
    }
  };

  run();
  timerId = setInterval(run, Math.max(3, intervalSeconds) * 1000);

  return () => {
    isMounted = false;
    if (timerId) clearInterval(timerId);
  };
}
