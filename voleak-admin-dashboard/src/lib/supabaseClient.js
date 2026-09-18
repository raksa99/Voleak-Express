import { createClient } from '@supabase/supabase-js';

// User's Live Supabase Configuration
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  localStorage.getItem('voleak_supabase_url') ||
  'https://muqgtennllxkckxxqibm.supabase.co';

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  localStorage.getItem('voleak_supabase_key') ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11cWd0ZW5ubGx4a2NreHhxaWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MjA4MTIsImV4cCI6MjEwMjI5NjgxMn0.fZbLIe0KG9NpdZpKhKMI0DKyw2rg_JFfYgeDyOZSJcM';

export let supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function configureSupabase(url, key) {
  if (url && key) {
    localStorage.setItem('voleak_supabase_url', url);
    localStorage.setItem('voleak_supabase_key', key);
    supabase = createClient(url, key);
  }
}

export let isSupabaseConnected = true;

export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
      isSupabaseConnected = false;
      return false;
    }
    isSupabaseConnected = true;
    return true;
  } catch {
    isSupabaseConnected = false;
    return false;
  }
}

// -------------------------------------------------------------
// Default Fallback Datasets for High-Availability
// -------------------------------------------------------------

export const DEFAULT_OPERATORS = [];

export const DEFAULT_USERS = [
  {
    id: 'u-1',
    full_name: 'Bong Leak',
    name: 'Bong Leak',
    email: 'director@voleakexpress.com',
    phone: '+855 12 888 999',
    role: 'admin',
    operator_id: 'op-1',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    national_id: '010001001',
    khmer_name: 'បង លក្ខណ៍',
    dob: '1988-01-10',
    gender: 'Male',
    address: 'Khan Daun Penh, Phnom Penh',
    id_expiry: '2038-01-10',
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'u-2',
    full_name: 'Sokha Meng',
    name: 'Sokha Meng',
    email: 'logistics.head@voleakexpress.com',
    phone: '+855 12 888 002',
    role: 'manager',
    operator_id: 'op-2',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    national_id: '010892415',
    khmer_name: 'ម៉េង សុខា',
    dob: '1994-08-15',
    gender: 'Male',
    address: 'Sangkat Boeung Keng Kang 1, Phnom Penh',
    id_expiry: '2034-08-15',
    id_card_image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'u-3',
    full_name: 'Dara Chan',
    name: 'Dara Chan',
    email: 'driver.dara@voleakexpress.com',
    phone: '+855 98 777 001',
    role: 'driver',
    operator_id: 'op-1',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    national_id: '020745192',
    khmer_name: 'ចាន់ ដារ៉ា',
    dob: '1996-03-22',
    gender: 'Male',
    address: 'Sangkat Svay Pao, Battambang',
    id_expiry: '2036-03-22',
    id_card_image: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'u-4',
    full_name: 'Vathanak Keo',
    name: 'Vathanak Keo',
    email: 'driver.vathanak@voleakexpress.com',
    phone: '+855 77 999 003',
    role: 'driver',
    operator_id: 'op-3',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'u-5',
    full_name: 'Bopha Long',
    name: 'Bopha Long',
    email: 'driver.bopha@voleakexpress.com',
    phone: '+855 88 444 004',
    role: 'driver',
    operator_id: 'op-4',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    created_at: '2026-08-01T08:00:00Z',
  },
];

export const DEFAULT_COOPERATORS = [];

export const DEFAULT_ROUTES = [];

export const DEFAULT_SCHEDULES = [
  {
    id: 's-1',
    route_id: 'r-1',
    bus_id: 'truck-1',
    driver_id: 'u-3',
    departure_time: '06:00 AM',
    arrival_time: '10:30 AM',
    days_of_week: 'Daily',
    price: 350,
    base_price: 350,
  },
  {
    id: 's-2',
    route_id: 'r-2',
    bus_id: 'truck-2',
    driver_id: 'u-4',
    departure_time: '08:30 AM',
    arrival_time: '11:50 AM',
    days_of_week: 'Daily',
    price: 280,
    base_price: 280,
  },
  {
    id: 's-3',
    route_id: 'r-3',
    bus_id: 'truck-3',
    driver_id: 'u-5',
    departure_time: '07:00 AM',
    arrival_time: '01:45 PM',
    days_of_week: 'Mon, Wed, Fri',
    price: 480,
    base_price: 480,
  },
];

export const DEFAULT_TRIPS = [
  {
    id: 'tr-1',
    trip_number: 'VKX-TRIP-901',
    route_id: 'r-1',
    bus_id: 'truck-1',
    driver_name: 'Dara Chan',
    status: 'in_progress',
    progress: 68,
    cargo_weight_tons: 28.5,
    cargo_type: '40ft Container - Top Sports Textile Fabric Export',
    departure_time: '2026-08-19 06:00 AM',
    estimated_arrival: '2026-08-19 10:30 AM',
    latitude: 10.6253,
    longitude: 103.5234,
  },
  {
    id: 'tr-2',
    trip_number: 'VKX-TRIP-902',
    route_id: 'r-2',
    bus_id: 'truck-2',
    driver_name: 'Sokha Meng',
    status: 'in_progress',
    progress: 42,
    cargo_weight_tons: 22.0,
    cargo_type: 'Heavy Container - Activewear Garment Consignment',
    departure_time: '2026-08-19 08:30 AM',
    estimated_arrival: '2026-08-19 11:50 AM',
    latitude: 11.0821,
    longitude: 105.8112,
  },
  {
    id: 'tr-3',
    trip_number: 'VKX-TRIP-903',
    route_id: 'r-3',
    bus_id: 'truck-3',
    driver_name: 'Vathanak Keo',
    status: 'scheduled',
    progress: 0,
    cargo_weight_tons: 25.0,
    cargo_type: 'Flatbed - Spandex Textile Rolls Delivery',
    departure_time: '2026-08-20 07:00 AM',
    estimated_arrival: '2026-08-20 01:45 PM',
    latitude: 11.5564,
    longitude: 104.9282,
  },
];

export const DEFAULT_BOOKINGS = [
  {
    id: 'WB-8810',
    trip_id: 'tr-1',
    sender: 'Top Sports Textile (TST Group)',
    receiver: 'Manhattan Textile Mills Ltd',
    passenger_name: 'Top Sports Textile (TST Group)',
    seat_number: '35 Rolls (1,750m)',
    total_price: 4850.0,
    status: 'confirmed',
    booking_channel: 'Direct Factory Contract',
    cod_amount: 0,
    qr_code: 'VKX-WB-8810-KH',
    booked_at: '2026-08-19T08:30:00Z',
  },
  {
    id: 'WB-8811',
    trip_id: 'tr-2',
    sender: 'Top Sports Textile (TST Group)',
    receiver: 'Crystal Garment International Ltd',
    passenger_name: 'Top Sports Textile (TST Group)',
    seat_number: '60 Cartons (6,000 pcs)',
    total_price: 8400.0,
    status: 'confirmed',
    booking_channel: 'Maritime Export Consignment',
    cod_amount: 0,
    qr_code: 'VKX-WB-8811-KH',
    booked_at: '2026-08-19T09:15:00Z',
  },
  {
    id: 'WB-8812',
    trip_id: 'tr-3',
    sender: 'Top Sports Textile (TST Group)',
    receiver: 'Shenzhou International SEZ Plant',
    passenger_name: 'Top Sports Textile (TST Group)',
    seat_number: '80 Rolls (4,000m)',
    total_price: 9600.0,
    status: 'confirmed',
    booking_channel: 'Cross-Border Freight',
    cod_amount: 0,
    qr_code: 'VKX-WB-8812-KH',
    booked_at: '2026-08-19T10:00:00Z',
  },
];

export const DEFAULT_INCIDENTS = [
  {
    id: 'inc-1',
    title: 'Heavy Monsoonal Rain - Expressway Section 2',
    description: 'Reduced visibility on National Expressway 1. All trailer pilots advised to maintain 60 km/h limit.',
    status: 'resolved',
    priority: 'medium',
    branch_id: 'op-1',
    created_at: '2026-08-19T07:15:00Z',
  },
  {
    id: 'inc-2',
    title: 'Bavet Border SEZ Gate Weighbridge Inspection',
    description: 'Routine Ministry of Transport calibration check scheduled for loading lane #2.',
    status: 'active',
    priority: 'low',
    branch_id: 'op-3',
    created_at: '2026-08-19T08:45:00Z',
  },
];

export const DEFAULT_BUSES = [
  {
    id: 'truck-1',
    plate_number: 'PP-3D-8890',
    model: 'Scania R450 Heavy 40ft Container Truck',
    capacity: 28,
    capacity_tons: 28,
    status: 'active',
    truck_type: 'Container Heavy Trailer (25T)',
    image_url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80',
    assigned_driver_name: 'Dara Chan',
    assigned_driver_phone: '+855 98 777 001',
    assigned_driver_email: 'driver.dara@voleakexpress.com',
    engine_power: '450 HP Diesel',
    next_inspection_date: '2026-12-31',
    insurance_policy_number: 'VKX-INS-8849-KH',
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'truck-2',
    plate_number: 'PP-3E-1234',
    model: 'Hino 700 Series Flatbed Heavy Hauler',
    capacity: 18,
    capacity_tons: 18,
    status: 'active',
    truck_type: 'Medium Cargo Truck (8T)',
    image_url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80',
    assigned_driver_name: 'Sokha Meng',
    assigned_driver_phone: '+855 12 888 002',
    assigned_driver_email: 'driver.sokha@voleakexpress.com',
    engine_power: '380 HP Diesel',
    next_inspection_date: '2026-11-30',
    insurance_policy_number: 'VKX-INS-4421-KH',
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'truck-3',
    plate_number: 'SHV-3B-9988',
    model: 'Isuzu Giga 40ft Port Container Carrier',
    capacity: 30,
    capacity_tons: 30,
    status: 'active',
    truck_type: 'Container Heavy Trailer (25T)',
    image_url: 'https://images.unsplash.com/photo-1501700493788-fa1a4fc9fe62?auto=format&fit=crop&w=800&q=80',
    assigned_driver_name: 'Vathanak Keo',
    assigned_driver_phone: '+855 77 999 003',
    assigned_driver_email: 'driver.vathanak@voleakexpress.com',
    engine_power: '480 HP Turbo Diesel',
    next_inspection_date: '2026-10-15',
    insurance_policy_number: 'VKX-INS-9912-KH',
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'truck-4',
    plate_number: 'BVT-3A-7766',
    model: 'Hyundai HD270 Cold-Chain Industrial Trailer',
    capacity: 15,
    capacity_tons: 15,
    status: 'maintenance',
    truck_type: 'Refrigerated Cold Truck (10T)',
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    assigned_driver_name: 'Bopha Long',
    assigned_driver_phone: '+855 88 444 004',
    assigned_driver_email: 'driver.bopha@voleakexpress.com',
    engine_power: '340 HP Diesel',
    next_inspection_date: '2026-09-20',
    insurance_policy_number: 'VKX-INS-3321-KH',
    created_at: '2026-08-01T08:00:00Z',
  },
];

export const initialBuses = DEFAULT_BUSES;
export const initialUsers = DEFAULT_USERS;
export const initialCooperators = DEFAULT_COOPERATORS;
export const initialRoutes = [];
export const initialSchedules = DEFAULT_SCHEDULES;
export const initialTrips = DEFAULT_TRIPS;
export const initialBookings = DEFAULT_BOOKINGS;
export const initialIncidents = DEFAULT_INCIDENTS;
export const initialOperators = [];

export async function fetchBuses() {
  try {
    const { data: trucksData, error: tErr } = await supabase.from('trucks').select('*').order('created_at', { ascending: false });
    if (!tErr && trucksData && trucksData.length > 0) {
      return trucksData.map((t) => ({
        ...t,
        capacity: Number(t.capacity || t.capacity_tons) || 25,
        capacity_tons: Number(t.capacity_tons || t.capacity) || 25,
      }));
    }
    const { data, error } = await supabase.from('buses').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return data.map((b) => ({
        ...b,
        capacity: Number(b.capacity || b.capacity_tons) || 25,
        capacity_tons: Number(b.capacity_tons || b.capacity) || 25,
      }));
    }
    return DEFAULT_BUSES;
  } catch {
    return DEFAULT_BUSES;
  }
}

export async function fetchUsers() {
  try {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) {
      return DEFAULT_USERS;
    }
    return data;
  } catch {
    return DEFAULT_USERS;
  }
}

export async function fetchRoutes() {
  try {
    const { data, error } = await supabase.from('routes').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('[Supabase fetchRoutes error]', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('[Supabase fetchRoutes catch]', err);
    return [];
  }
}

export async function fetchSchedules() {
  try {
    const { data, error } = await supabase.from('schedules').select('*, routes(*), buses(*)').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) {
      return DEFAULT_SCHEDULES;
    }
    return data;
  } catch {
    return DEFAULT_SCHEDULES;
  }
}

export async function fetchTrips() {
  try {
    const { data, error } = await supabase.from('trips').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) {
      return DEFAULT_TRIPS;
    }
    return data;
  } catch {
    return DEFAULT_TRIPS;
  }
}

export async function fetchBookings() {
  try {
    const { data, error } = await supabase.from('bookings').select('*').order('booked_at', { ascending: false });
    if (error || !data || data.length === 0) {
      return DEFAULT_BOOKINGS;
    }
    return data;
  } catch {
    return DEFAULT_BOOKINGS;
  }
}

export async function fetchIncidents() {
  try {
    const { data, error } = await supabase.from('incidents').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) {
      return DEFAULT_INCIDENTS;
    }
    return data;
  } catch {
    return DEFAULT_INCIDENTS;
  }
}

export async function fetchOperators() {
  try {
    const { data, error } = await supabase.from('operators').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('[Supabase fetchOperators error]', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('[Supabase fetchOperators catch]', err);
    return [];
  }
}

// -------------------------------------------------------------
// Live Database Mutations (Direct Inserts & Updates)
// -------------------------------------------------------------

export async function addLocalUser(newUser) {
  const payload = {
    full_name: newUser.full_name || newUser.name || 'Unnamed Staff',
    name: newUser.name || newUser.full_name || 'Unnamed Staff',
    email: newUser.email || null,
    phone: newUser.phone || null,
    role: newUser.role || 'driver',
    operator_id: newUser.operator_id || null,
    factory_name: newUser.factory_name || null,
    status: newUser.status || 'active',
    nationality: newUser.nationality || 'Cambodian',
    avatar: newUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.full_name || newUser.name || 'Staff')}&background=f59e0b&color=0f172a`,
    national_id: newUser.national_id || null,
    id_card_image: newUser.id_card_image || null,
    khmer_name: newUser.khmer_name || null,
    dob: newUser.dob || null,
    gender: newUser.gender || 'Male',
    address: newUser.address || null,
    id_expiry: newUser.id_expiry || null,
  };

  try {
    const { data, error } = await supabase.from('users').insert(payload).select().single();
    if (!error && data) return { ...payload, ...data };
    if (error) {
      console.warn('[Supabase addLocalUser inserting with core fields fallback]', error);
      const corePayload = {
        full_name: payload.full_name,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        role: payload.role,
        status: payload.status,
        nationality: payload.nationality,
        avatar: payload.avatar,
      };
      const { data: fbData } = await supabase.from('users').insert(corePayload).select().single();
      if (fbData) return { ...payload, ...fbData };
    }
  } catch (err) {
    console.warn('[Supabase addLocalUser fallback]', err);
  }

  return { ...payload, id: `u-${Date.now()}` };
}

export async function updateLocalUser(id, updates) {
  try {
    const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
    if (!error && data) return { ...updates, ...data };
    if (error) {
      console.warn('[Supabase updateLocalUser fallback with core fields]', error);
      const coreUpdates = {};
      ['full_name', 'name', 'email', 'phone', 'role', 'status', 'nationality', 'avatar'].forEach((k) => {
        if (updates[k] !== undefined) coreUpdates[k] = updates[k];
      });
      const { data: fbData } = await supabase.from('users').update(coreUpdates).eq('id', id).select().single();
      if (fbData) return { ...updates, ...fbData };
    }
  } catch (err) {
    console.warn('[Supabase updateLocalUser fallback]', err);
  }
  return { id, ...updates };
}

export async function deleteLocalUser(id) {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) {
    console.error('[Supabase deleteLocalUser error]', error);
    return false;
  }
  return true;
}

export async function addLocalOperator(newOp) {
  const payload = {
    name: newOp.name,
    code: newOp.code || `HUB-${Math.floor(Math.random() * 900 + 100)}`,
    contact: newOp.contact || null,
    contact_phone: newOp.contact_phone || newOp.contact || '',
    province: newOp.province || 'Phnom Penh',
    address: newOp.address || 'National Road 4, Special Economic Zone',
    latitude: Number(newOp.latitude) || 11.5564,
    longitude: Number(newOp.longitude) || 104.9282,
    manager_name: newOp.manager_name || 'Hub Operations Manager',
    manager_phone: newOp.manager_phone || newOp.contact_phone || '+855 12 888 777',
    operating_hours: newOp.operating_hours || '24/7 Gate Dispatch',
    loading_bays: Number(newOp.loading_bays) || 12,
    weighbridge_capacity: newOp.weighbridge_capacity || '80 Tons Axle Scale',
    amenities: newOp.amenities || ['Driver Rest Lounge', 'Fuel Station', 'Heavy Forklift', '24/7 Security'],
    fleet_count: Number(newOp.fleet_count) || 0,
    rating: Number(newOp.rating) || 5.0,
    status: newOp.status || 'active',
  };

  const { data, error } = await supabase.from('operators').insert(payload).select().single();
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('supabase_sync_requested'));
  if (error) {
    console.error('[Supabase addLocalOperator error]', error);
    return { ...payload, id: `hub-${Date.now()}` };
  }
  return data;
}

export async function updateLocalOperator(id, updates) {
  const { data, error } = await supabase.from('operators').update(updates).eq('id', id).select().single();
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('supabase_sync_requested'));
  if (error) {
    console.error('[Supabase updateLocalOperator error]', error);
    return { id, ...updates };
  }
  return data;
}

export async function deleteLocalOperator(id) {
  const { error } = await supabase.from('operators').delete().eq('id', id);
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('supabase_sync_requested'));
  if (error) {
    console.error('[Supabase deleteLocalOperator error]', error);
    return false;
  }
  return true;
}

export async function addLocalRoute(newRoute) {
  const payload = {
    id: newRoute.id || `r-${Date.now()}`,
    name: newRoute.name,
    origin: newRoute.origin,
    destination: newRoute.destination,
    distance_km: Number(newRoute.distance_km) || 0,
    duration_hours: Number(newRoute.duration_hours) || (newRoute.duration_min ? Number((newRoute.duration_min / 60).toFixed(1)) : 0),
    duration_min: Number(newRoute.duration_min) || (newRoute.duration_hours ? Math.round(newRoute.duration_hours * 60) : 0),
    stops: newRoute.stops || [],
    operator_id: newRoute.operator_id || 'op-1',
    status: newRoute.status || 'active',
  };

  const { data, error } = await supabase.from('routes').insert(payload).select().single();
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('supabase_sync_requested'));
  if (error) {
    console.error('[Supabase addLocalRoute error]', error);
    return payload;
  }
  return data;
}

export async function updateLocalRoute(id, updates) {
  const { data, error } = await supabase.from('routes').update(updates).eq('id', id).select().single();
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('supabase_sync_requested'));
  if (error) {
    console.error('[Supabase updateLocalRoute error]', error);
    return { id, ...updates };
  }
  return data;
}

export async function deleteLocalRoute(id) {
  const { error } = await supabase.from('routes').delete().eq('id', id);
  if (error) {
    console.error('[Supabase deleteLocalRoute error]', error);
    return false;
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('supabase_sync_requested'));
  }
  return true;
}

/**
 * Automatically creates and syncs a Hub (operator) and Corridor (route) in Supabase
 * when Google Maps location is detected or linked for a cooperator.
 * Stores and highlights the Short Display Name on both Hub and Corridor!
 */
export async function syncHubAndCorridorLocation({
  short_name,
  factory_name,
  address,
  latitude,
  longitude,
  province,
  phone,
}) {
  const shortDisplay = (short_name || factory_name || 'Factory').trim();
  const safeProvince = province || 'Phnom Penh';
  const latNum = Number(latitude) || 11.5564;
  const lngNum = Number(longitude) || 104.9282;

  // 1. Prepare Hub Payload with Short Display Name
  const hubId = `hub-${Date.now()}`;
  const cleanCode = shortDisplay.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5) || 'HUB';
  const hubCode = `${cleanCode}-${Math.floor(100 + Math.random() * 900)}`;
  const hubName = `[${shortDisplay}] ${safeProvince} Logistics Hub`;

  const hubPayload = {
    id: hubId,
    name: hubName,
    code: hubCode,
    province: safeProvince,
    address: address || `${safeProvince} Industrial Zone, Cambodia`,
    latitude: latNum,
    longitude: lngNum,
    manager_name: `${shortDisplay} Site Dispatch`,
    manager_phone: phone || '+855 12 888 777',
    contact_phone: phone || '+855 12 888 777',
    operating_hours: '24/7 Gate Dispatch',
    loading_bays: 12,
    weighbridge_capacity: '80 Tons Axle Scale',
    amenities: ['Driver Rest Lounge', 'Diesel Fuel Pump', '24/7 Security'],
    fleet_count: 2,
    rating: 5.0,
    status: 'active',
  };

  // 2. Insert into Supabase 'operators'
  let savedHub = hubPayload;
  try {
    const { data, error } = await supabase.from('operators').insert(hubPayload).select().single();
    if (!error && data) {
      savedHub = data;
    } else if (error) {
      console.warn('[Supabase syncHubAndCorridorLocation operator error]', error);
    }
  } catch (err) {
    console.warn('[Supabase syncHubAndCorridorLocation operator catch]', err);
  }

  // Calculate distance from Top Sports Textile HQ (11.0479485, 106.1204302)
  const originLat = 11.0479485;
  const originLng = 106.1204302;
  const R = 6371;
  const dLat = ((latNum - originLat) * Math.PI) / 180;
  const dLon = ((lngNum - originLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((originLat * Math.PI) / 180) *
      Math.cos((latNum * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distKm = Math.max(1, Math.round(R * c));
  const durHours = Number((distKm / 45).toFixed(1));
  const durMin = Math.round(durHours * 60);

  // 3. Prepare Route (Corridor) Payload with Short Display Name
  const routeId = `r-${Date.now()}`;
  const routeName = `Top Sports HQ ⇄ ${shortDisplay} (${safeProvince})`;
  const routePayload = {
    id: routeId,
    operator_id: savedHub.id,
    name: routeName,
    origin: 'Top Sports Textile HQ',
    destination: `[${shortDisplay}] ${address || safeProvince}`,
    distance_km: distKm,
    duration_min: durMin,
    duration_hours: durHours,
    status: 'active',
    stops: [
      'Top Sports Textile Central Base',
      safeProvince === 'Svay Rieng' ? 'Manhattan SEZ Gate' : 'NR1 Neak Loeung Toll Plaza',
      `${shortDisplay} Factory Loading Bay`,
    ],
  };

  // 4. Insert into Supabase 'routes'
  let savedRoute = routePayload;
  try {
    const { data, error } = await supabase.from('routes').insert(routePayload).select().single();
    if (!error && data) {
      savedRoute = data;
    } else if (error) {
      console.warn('[Supabase syncHubAndCorridorLocation route error]', error);
    }
  } catch (err) {
    console.warn('[Supabase syncHubAndCorridorLocation route catch]', err);
  }

  // 5. Dispatch global sync event so all views refresh immediately from Supabase
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('supabase_sync_requested'));
  }

  return { hub: savedHub, route: savedRoute };
}

export async function addLocalSchedule(newSchedule) {
  const payload = {
    id: `s-${Date.now()}`,
    route_id: newSchedule.route_id,
    bus_id: newSchedule.bus_id,
    driver_id: newSchedule.driver_id,
    departure_time: newSchedule.departure_time,
    arrival_time: newSchedule.arrival_time,
    days_of_week: newSchedule.days_of_week || 'Daily',
    price: newSchedule.price || 25,
    base_price: newSchedule.base_price || newSchedule.price || 25,
  };

  const { data, error } = await supabase.from('schedules').insert(payload).select().single();
  if (error) {
    console.error('[Supabase addLocalSchedule error]', error);
    return payload;
  }
  return data;
}

export async function addLocalBooking(newBooking) {
  const payload = {
    id: `WB-${Math.floor(Math.random() * 9000 + 1000)}`,
    trip_id: newBooking.trip_id,
    passenger_name: newBooking.passenger_name || newBooking.sender,
    sender: newBooking.sender || newBooking.passenger_name,
    receiver: newBooking.receiver || 'Siem Reap Hub',
    seat_number: newBooking.seat_number || '25 kg',
    status: newBooking.status || 'confirmed',
    total_price: newBooking.total_price || 15,
    booking_channel: newBooking.booking_channel || 'Express Parcel',
    cod_amount: newBooking.cod_amount || 0,
    qr_code: `VKX-${Date.now()}-KH`,
    booked_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('bookings').insert(payload).select().single();
  if (error) {
    console.error('[Supabase addLocalBooking error]', error);
    return payload;
  }
  return data;
}

export async function updateTripStatus(tripId, status) {
  const { data, error } = await supabase.from('trips').update({ status }).eq('id', tripId).select();
  if (error) {
    console.error('[Supabase updateTripStatus error]', error);
  }
  return data;
}

export async function saveCompanyProfileToDb(profile) {
  try {
    const payload = {
      id: 'primary_hq',
      name: profile.name || 'Top Sports Textile HQ',
      code: profile.code || 'TOPSPORT-HQ',
      tagline: profile.tagline || 'Top Sports Textile Heavy Freight Logistics',
      phone: profile.phone || '+855 12 888 999',
      email: profile.email || 'dispatch@voleakexpress.com',
      director: profile.director || 'Bong Leak (Managing Director)',
      tax_id: profile.tax_id || 'K002-98471203',
      province: profile.province || 'Svay Rieng',
      address: profile.address || 'https://maps.app.goo.gl/TmcZJHpCzd3KCjEr7 Top Sports Textile',
      latitude: Number(profile.latitude) || 11.0479485,
      longitude: Number(profile.longitude) || 106.1204302,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('company_profile').upsert(payload).select().single();
    if (error) {
      console.warn('[Supabase saveCompanyProfileToDb error]', error);
    }
    return data || payload;
  } catch (err) {
    console.warn('[saveCompanyProfileToDb catch]', err);
    return profile;
  }
}

export async function fetchCompanyProfileFromDb() {
  try {
    const { data, error } = await supabase.from('company_profile').select('*').eq('id', 'primary_hq').single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// Cooperators & Corporate Clients
// -------------------------------------------------------------

export const COOPERATORS_SQL_MIGRATION = `-- ============================================================
-- Voleak Express - Cooperators Table Schema Migration
-- For Supabase PostgreSQL (https://muqgtennllxkckxxqibm.supabase.co)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.cooperators (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    factory_name TEXT,
    short_name TEXT,
    code TEXT UNIQUE,
    industry TEXT DEFAULT 'Garments & Textiles',
    category TEXT DEFAULT 'Garment & Apparel Manufacturing',
    tier TEXT DEFAULT 'VIP Platinum Partner',
    discount_rate TEXT DEFAULT '15% Corporate Off',
    payment_terms TEXT DEFAULT 'Net 30 Days',
    credit_limit NUMERIC DEFAULT 50000.0,
    current_balance NUMERIC DEFAULT 12400.0,
    contact_person TEXT,
    contact_title TEXT,
    phone TEXT,
    email TEXT,
    tax_id TEXT,
    province TEXT DEFAULT 'Phnom Penh',
    address TEXT,
    latitude NUMERIC DEFAULT 11.5564,
    longitude NUMERIC DEFAULT 104.9282,
    operator_id TEXT DEFAULT 'hub-pp-01',
    hub_name TEXT DEFAULT 'Phnom Penh Central Freight Hub',
    primary_corridor TEXT DEFAULT 'Phnom Penh Central Hub ⇄ Sihanoukville Port Deep Sea Terminal',
    logo_url TEXT,
    rating NUMERIC DEFAULT 5.0,
    total_waybills INT DEFAULT 148,
    total_tonnage NUMERIC DEFAULT 420.5,
    total_spend NUMERIC DEFAULT 58200.0,
    cod_collected NUMERIC DEFAULT 18500.0,
    joined_date TEXT DEFAULT '2026-01-15',
    notes TEXT,
    status TEXT DEFAULT 'active',
    active_shipments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.cooperators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to cooperators" ON public.cooperators;
CREATE POLICY "Allow public read access to cooperators" ON public.cooperators FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access to cooperators" ON public.cooperators;
CREATE POLICY "Allow public insert access to cooperators" ON public.cooperators FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access to cooperators" ON public.cooperators;
CREATE POLICY "Allow public update access to cooperators" ON public.cooperators FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete access to cooperators" ON public.cooperators;
CREATE POLICY "Allow public delete access to cooperators" ON public.cooperators FOR DELETE USING (true);

INSERT INTO public.cooperators (
    id, name, factory_name, short_name, code, industry, category, tier, discount_rate, payment_terms,
    credit_limit, current_balance, contact_person, contact_title, phone, email, tax_id, province, address,
    latitude, longitude, operator_id, hub_name, primary_corridor, logo_url, rating, total_waybills,
    total_tonnage, total_spend, cod_collected, joined_date, notes, status, active_shipments
) VALUES (
    '55555555-5555-5555-5555-555555555555',
    'Top Sports Textile (TST Group)',
    'Manhattan Textile Mills Ltd',
    'Manhattan Garments',
    'COP-MANHATTAN-01',
    'Garments & Textiles',
    'Garment & Apparel Manufacturing',
    'VIP Platinum Partner',
    '15% Corporate Off',
    'Net 30 Days',
    50000.0,
    12400.0,
    'Mr. Kenji Takahashi',
    'Procurement & Supply Chain Director',
    '+855 23 881 200',
    'procurement@manhattanmills.kh',
    'K002-98471203',
    'Phnom Penh',
    'Phnom Penh Special Economic Zone (PPSEZ), National Road 4',
    11.5564,
    104.9282,
    'hub-pp-01',
    'Phnom Penh Central Freight Hub',
    'Phnom Penh Central Hub ⇄ Sihanoukville Port Deep Sea Terminal',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&q=80',
    5.0,
    148,
    420.5,
    58200.0,
    18500.0,
    '2026-01-15',
    'Primary PPSEZ partner with dedicated 40ft container dispatch direct to Sihanoukville Port Deep Sea Terminal.',
    'active',
    '[{"id":"VKX-WAY-1092","destination":"Sihanoukville Port Deep Sea Terminal","tonnage":"24.5 Tons","fee":420,"status":"In Transit"},{"id":"VKX-WAY-1094","destination":"Bavet Border Special Economic Zone Depot","tonnage":"18.0 Tons","fee":310,"status":"Delivered"}]'::jsonb
), (
    'cop-2',
    'Crystal Garment International Ltd',
    'Crystal Garment International Ltd',
    'Crystal Garments',
    'COP-CRYSTAL-02',
    'Garments & Textiles',
    'Activewear Export Partner',
    'Gold Partner',
    '10% Off',
    'Net 30 Days',
    35000.0,
    8200.0,
    'Ms. Lin Mei-Hua',
    'Export Logistics Head',
    '+855 34 934 888',
    'shipping@crystalgarments.kh',
    'K003-81927344',
    'Preah Sihanouk',
    'Port Maritime Zone 3, Sihanoukville Port SEZ Industrial Park',
    10.6253,
    103.5234,
    'hub-shv-02',
    'Sihanoukville Autonomous Port Deep Sea Terminal',
    'Phnom Penh Central Hub ⇄ Sihanoukville Port Deep Sea Terminal',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=300&q=80',
    4.9,
    96,
    310.0,
    41500.0,
    12300.0,
    '2026-02-10',
    'Deep-sea maritime terminal staging for international container export vessels and textile raw material intake.',
    'active',
    '[{"id":"VKX-WAY-2041","destination":"Phnom Penh Central Freight Hub","tonnage":"16.5 Tons","fee":380,"status":"Scheduled"}]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    factory_name = EXCLUDED.factory_name,
    short_name = EXCLUDED.short_name,
    contact_person = EXCLUDED.contact_person,
    phone = EXCLUDED.phone,
    logo_url = EXCLUDED.logo_url;
`;

export async function checkCooperatorsTableStatus() {
  try {
    const { count, error } = await supabase.from('cooperators').select('id', { count: 'exact', head: true });
    if (error) {
      const isMissing = error.code === 'PGRST205' || error.code === '42P01' || error.message?.includes('schema cache');
      return { exists: !isMissing, count: 0, error };
    }
    return { exists: true, count: typeof count === 'number' ? count : 0, error: null };
  } catch (err) {
    return { exists: false, count: 0, error: err };
  }
}

export function formatCooperatorPayload(cop) {
  return {
    id: cop.id || `cop-${Date.now()}`,
    name: cop.name || 'Enterprise Cooperator',
    factory_name: cop.factory_name || cop.name || 'Enterprise Cooperator',
    short_name: cop.short_name || cop.name?.split(' ')[0] || '',
    code: cop.code || `COP-${Math.floor(1000 + Math.random() * 9000)}`,
    industry: cop.industry || 'Garments & Textiles',
    category: cop.category || 'Garment & Apparel Manufacturing',
    tier: cop.tier || 'Gold Partner',
    discount_rate: cop.discount_rate || '10% Off',
    payment_terms: cop.payment_terms || 'Net 30 Days',
    credit_limit: Number(cop.credit_limit) || 30000,
    current_balance: Number(cop.current_balance) || 0,
    contact_person: cop.contact_person || '',
    contact_title: cop.contact_title || 'Procurement & Logistics Director',
    phone: cop.phone || '',
    email: cop.email || '',
    tax_id: cop.tax_id || '',
    province: cop.province || 'Phnom Penh',
    address: cop.address || '',
    latitude: Number(cop.latitude) || 11.5564,
    longitude: Number(cop.longitude) || 104.9282,
    operator_id: cop.operator_id || 'hub-pp-01',
    hub_name: cop.hub_name || 'Phnom Penh Central Freight Hub',
    primary_corridor: cop.primary_corridor || 'Phnom Penh Central Hub ⇄ Sihanoukville Port Deep Sea Terminal',
    logo_url: cop.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(cop.name || 'Cooperator')}&background=f59e0b&color=0f172a&bold=true`,
    rating: Number(cop.rating) || 5.0,
    total_waybills: Number(cop.total_waybills) || 0,
    total_tonnage: Number(cop.total_tonnage) || 0,
    total_spend: Number(cop.total_spend) || 0,
    cod_collected: Number(cop.cod_collected) || 0,
    joined_date: cop.joined_date || new Date().toISOString().split('T')[0],
    notes: cop.notes || '',
    status: cop.status || 'active',
    active_shipments: Array.isArray(cop.active_shipments) ? cop.active_shipments : [],
  };
}

export async function fetchCooperators() {
  try {
    const { data, error } = await supabase.from('cooperators').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) {
      // If table exists but empty, seed default cooperators automatically
      if (!error && data && data.length === 0) {
        await syncCooperatorsToSupabase(DEFAULT_COOPERATORS).catch(() => {});
      }
      return DEFAULT_COOPERATORS;
    }
    return data;
  } catch {
    return DEFAULT_COOPERATORS;
  }
}

export async function syncCooperatorsToSupabase(cooperatorsList = DEFAULT_COOPERATORS) {
  try {
    const list = Array.isArray(cooperatorsList) && cooperatorsList.length > 0 ? cooperatorsList : DEFAULT_COOPERATORS;
    const payloads = list.map(formatCooperatorPayload);

    const { data, error } = await supabase.from('cooperators').upsert(payloads, { onConflict: 'id' }).select();
    if (error) {
      console.warn('[Supabase syncCooperatorsToSupabase error]', error);
      return { success: false, error, data: null };
    }
    return { success: true, count: data ? data.length : payloads.length, data: data || payloads };
  } catch (err) {
    console.warn('[Supabase syncCooperatorsToSupabase catch]', err);
    return { success: false, error: err, data: null };
  }
}

export async function addLocalCooperator(newCop) {
  const payload = formatCooperatorPayload(newCop);

  try {
    const { data, error } = await supabase.from('cooperators').insert(payload).select().single();
    if (error) {
      console.warn('[Supabase addLocalCooperator warning]', error.message);
      return payload;
    }
    return data || payload;
  } catch (err) {
    console.warn('[Supabase addLocalCooperator catch]', err);
    return payload;
  }
}

export async function updateLocalCooperator(id, updates) {
  try {
    const { data, error } = await supabase.from('cooperators').update(updates).eq('id', id).select().single();
    if (error) {
      console.warn('[Supabase updateLocalCooperator warning]', error.message);
      return { id, ...updates };
    }
    return data || { id, ...updates };
  } catch (err) {
    console.warn('[Supabase updateLocalCooperator catch]', err);
    return { id, ...updates };
  }
}

export async function deleteLocalCooperator(id) {
  try {
    const { error } = await supabase.from('cooperators').delete().eq('id', id);
    if (error) {
      console.warn('[Supabase deleteLocalCooperator warning]', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase deleteLocalCooperator catch]', err);
    return false;
  }
}

// Top Sports Textile (TST Group) Product Catalog
export const TOP_SPORTS_TEXTILE_PRODUCTS = [
  // 1. Functional / Performance Fabrics
  {
    id: 'tst-fab-mw01',
    name: 'Moisture Wicking / Quick Dry Performance Fabric (ក្រណាត់ស្រូប និងបញ្ចេញញើសលឿន)',
    sku: 'TST-FAB-MW01',
    barcode: '884102938101',
    category: 'Functional Performance Fabrics (ក្រណាត់មុខងារពិសេស)',
    unit: 'Roll (50m)',
    default_price: 185.00,
    cost_price: 120.00,
    min_stock_alert: 15,
    warehouse_location: 'Fabric Bay A-1 (Textile Warehouse)',
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
    description: 'ក្រណាត់បច្ចេកវិទ្យាស្រូប និងបញ្ចេញញើសរហ័ស (Moisture Wicking / Quick Dry) សម្រាប់កីឡាការិនី-កីឡាករ។ ផ្គត់ផ្គង់ស្តង់ដារ Adidas / Nike / Puma។',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'tst-fab-uv02',
    name: 'Anti-UV Sun Protection Sports Fabric (ក្រណាត់ការពារកម្តៅថ្ងៃ UPF 50+)',
    sku: 'TST-FAB-UV02',
    barcode: '884102938102',
    category: 'Functional Performance Fabrics (ក្រណាត់មុខងារពិសេស)',
    unit: 'Roll (50m)',
    default_price: 195.00,
    cost_price: 130.00,
    min_stock_alert: 12,
    warehouse_location: 'Fabric Bay A-2 (Textile Warehouse)',
    image_url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=600&q=80',
    description: 'ក្រណាត់ការពារកម្ដៅថ្ងៃកម្រិតខ្ពស់ UPF 50+ ការពារស្បែកពីកាំរស្មីយូវី ស័ក្តិសមសម្រាប់កីឡាក្រៅផ្ទះ (Outdoor Sports)។',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'tst-fab-ab03',
    name: 'Anti-Bacterial & Anti-Odor Fabric (ក្រណាត់ប្រឆាំងក្លិនផ្អួរ និងបាក់តេរី)',
    sku: 'TST-FAB-AB03',
    barcode: '884102938103',
    category: 'Functional Performance Fabrics (ក្រណាត់មុខងារពិសេស)',
    unit: 'Roll (50m)',
    default_price: 210.00,
    cost_price: 145.00,
    min_stock_alert: 10,
    warehouse_location: 'Fabric Bay A-3 (Textile Warehouse)',
    image_url: 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=600&q=80',
    description: 'ក្រណាត់បច្ចេកវិទ្យា Silver-ion ប្រឆាំងបាក់តេរី ៩៩% ការពារក្លិនផ្អួរ និងរក្សាភាពស្រស់ស្រាយពេញមួយថ្ងៃ។',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },

  // 2. Knitted Fabrics
  {
    id: 'tst-knt-sj04',
    name: 'Single Jersey Performance Knit (ក្រណាត់ Single Jersey ស្តើងរលោងទន់)',
    sku: 'TST-KNT-SJ04',
    barcode: '884102938104',
    category: 'Knitted Fabrics (ក្រណាត់ត្បាញយឺត)',
    unit: 'Roll (50m)',
    default_price: 140.00,
    cost_price: 95.00,
    min_stock_alert: 25,
    warehouse_location: 'Knit Storage Bay B-1',
    image_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80',
    description: 'ក្រណាត់ Single Jersey ស្តើង រលោង យឺត និងទន់បំផុត សម្រាប់ផលិតអាវយឺតកីឡាគុណភាពខ្ពស់។',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'tst-knt-dj05',
    name: 'Double Jersey Heavy Knit (ក្រណាត់ Double Jersey ត្បាញយឺតភ្លោះ)',
    sku: 'TST-KNT-DJ05',
    barcode: '884102938105',
    category: 'Knitted Fabrics (ក្រណាត់ត្បាញយឺត)',
    unit: 'Roll (50m)',
    default_price: 165.00,
    cost_price: 110.00,
    min_stock_alert: 20,
    warehouse_location: 'Knit Storage Bay B-2',
    image_url: 'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=600&q=80',
    description: 'ក្រណាត់ត្បាញយឺតភ្លោះ ២ ជាន់ ធន់មាំ រក្សាទ្រង់ទ្រាយបានល្អ សម្រាប់ឈុតកីឡាប្រកួត។',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'tst-knt-in06',
    name: 'Interlock Smooth Double-Face (ក្រណាត់ Interlock ក្រាស់មាំរលោងសងខាង)',
    sku: 'TST-KNT-IN06',
    barcode: '884102938106',
    category: 'Knitted Fabrics (ក្រណាត់ត្បាញយឺត)',
    unit: 'Roll (50m)',
    default_price: 175.00,
    cost_price: 115.00,
    min_stock_alert: 18,
    warehouse_location: 'Knit Storage Bay B-3',
    image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
    description: 'សាច់ក្រណាត់ក្រាស់មាំ ផ្ទៃរលោងសងខាង ទន់ស្រួលពាក់ ស័ក្តិសមសម្រាប់ឈុតហ្វឹកហាត់ (Training Kits)។',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'tst-knt-rb07',
    name: 'Rib Fabric Elastic Trims (ក្រណាត់យឺតឆ្នូតៗ Rib សម្រាប់កអាវ/ដៃអាវ)',
    sku: 'TST-KNT-RB07',
    barcode: '884102938107',
    category: 'Knitted Fabrics (ក្រណាត់ត្បាញយឺត)',
    unit: 'Roll (30m)',
    default_price: 110.00,
    cost_price: 70.00,
    min_stock_alert: 15,
    warehouse_location: 'Trims Bay B-4',
    image_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80',
    description: 'ក្រណាត់យឺតឆ្នូតៗ (Rib 1x1 / 2x2) ប្រើសម្រាប់ធ្វើកអាវ ដៃអាវ ឬជាយអាវកីឡា។',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'tst-knt-ms08',
    name: 'Piqué & Mesh Breathable Knit (ក្រណាត់ Piqué & Mesh ប្រហោងខ្យល់បញ្ចេញកម្ដៅ)',
    sku: 'TST-KNT-MS08',
    barcode: '884102938108',
    category: 'Knitted Fabrics (ក្រណាត់ត្បាញយឺត)',
    unit: 'Roll (50m)',
    default_price: 155.00,
    cost_price: 100.00,
    min_stock_alert: 20,
    warehouse_location: 'Mesh Bay B-5',
    image_url: 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&w=600&q=80',
    description: 'ក្រណាត់ដែលមានរន្ធប្រហោងខ្យល់តូចៗ (Micro Mesh / Honeycomb Piqué) ជួយបញ្ចេញកម្ដៅ និងខ្យល់ចេញចូលល្អឥតខ្ចោះ។',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'tst-knt-ft09',
    name: 'French Terry & Fleece Fabric (ក្រណាត់ French Terry & Fleece សាច់ក្រាស់រោមទន់)',
    sku: 'TST-KNT-FT09',
    barcode: '884102938109',
    category: 'Knitted Fabrics (ក្រណាត់ត្បាញយឺត)',
    unit: 'Roll (40m)',
    default_price: 190.00,
    cost_price: 125.00,
    min_stock_alert: 15,
    warehouse_location: 'Fleece Bay B-6',
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    description: 'ក្រណាត់សាច់ក្រាស់ មានរោមទន់នៅខាងក្នុង ផ្តល់ភាពកក់ក្តៅខ្ពស់ សម្រាប់អាវរងា Hoodie និង Sweatshirts។',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },

  // 3. Spandex / Elastane Blends
  {
    id: 'tst-spx-ps10',
    name: '4-Way Stretch Poly-Spandex Blend (ក្រណាត់ Polyester-Spandex 4-Way Stretch)',
    sku: 'TST-SPX-PS10',
    barcode: '884102938110',
    category: 'Spandex & Elastane Blends (ក្រណាត់អេឡាស្ទីន)',
    unit: 'Roll (50m)',
    default_price: 220.00,
    cost_price: 150.00,
    min_stock_alert: 20,
    warehouse_location: 'Spandex Bay C-1',
    image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80',
    description: 'សាច់ក្រណាត់បត់បែនខ្ពស់ 4 ទិស (4-Way Stretch) លាយ 88% Polyester + 12% Spandex សម្រាប់ឈុតហាត់ប្រាណយឺត។',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'tst-spx-ns11',
    name: '4-Way Stretch Nylon-Spandex Blend (ក្រណាត់ Nylon-Spandex 4-Way Stretch)',
    sku: 'TST-SPX-NS11',
    barcode: '884102938111',
    category: 'Spandex & Elastane Blends (ក្រណាត់អេឡាស្ទីន)',
    unit: 'Roll (50m)',
    default_price: 245.00,
    cost_price: 165.00,
    min_stock_alert: 15,
    warehouse_location: 'Spandex Bay C-2',
    image_url: 'https://images.unsplash.com/photo-1574634534894-89d7576c8259?auto=format&fit=crop&w=600&q=80',
    description: 'សាច់ក្រណាត់ Nylon-Spandex កម្រិតខ្ពស់ ទន់រលោង ធន់នឹងការកកិត ស័ក្តិសមសម្រាប់ Leggings និង Yoga Wear។',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'tst-spx-cs12',
    name: '4-Way Stretch Cotton-Spandex Blend (ក្រណាត់ Cotton-Spandex 4-Way Stretch)',
    sku: 'TST-SPX-CS12',
    barcode: '884102938112',
    category: 'Spandex & Elastane Blends (ក្រណាត់អេឡាស្ទីន)',
    unit: 'Roll (50m)',
    default_price: 195.00,
    cost_price: 130.00,
    min_stock_alert: 18,
    warehouse_location: 'Spandex Bay C-3',
    image_url: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=600&q=80',
    description: 'សាច់ក្រណាត់កប្បាសធម្មជាតិ 95% Organic Cotton + 5% Elastane ទន់ត្រជាក់ និងបត់បែនស្រួល។',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },

  // 4. Activewear & Training Tops
  {
    id: 'tst-gar-rn13',
    name: 'Performance Running Tees (អាវយឺតរត់ប្រណាំងកម្រិតខ្ពស់)',
    sku: 'TST-GAR-RN13',
    barcode: '884102938113',
    category: 'Activewear & Training Tops (អាវកីឡា និងអាវហ្វឹកហាត់)',
    unit: 'Carton (100 pcs)',
    default_price: 650.00,
    cost_price: 420.00,
    min_stock_alert: 10,
    warehouse_location: 'Finished Goods Bay D-1',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    description: 'អាវយឺតរត់ប្រណាំងទម្ងន់ស្រាល (Ultra-light Running Tees) ខ្យល់ចេញចូលល្អ និង Quick-Dry ស្រូបញើសរហ័ស។',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'tst-gar-fb14',
    name: 'Pro Football / Soccer Team Jerseys (អាវកីឡាបាល់ទាត់អាជីព)',
    sku: 'TST-GAR-FB14',
    barcode: '884102938114',
    category: 'Activewear & Training Tops (អាវកីឡា និងអាវហ្វឹកហាត់)',
    unit: 'Carton (100 pcs)',
    default_price: 750.00,
    cost_price: 480.00,
    min_stock_alert: 10,
    warehouse_location: 'Finished Goods Bay D-2',
    image_url: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=600&q=80',
    description: 'អាវកីឡាបាល់ទាត់អាជីព ប្រើក្រណាត់ Jacquard Mesh ដកដង្ហើមបានល្អ និងធន់នឹងការទាញ។',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'tst-gar-bb15',
    name: 'Athletic Basketball Jerseys (អាវកីឡាបាល់បោះ)',
    sku: 'TST-GAR-BB15',
    barcode: '884102938115',
    category: 'Activewear & Training Tops (អាវកីឡា និងអាវហ្វឹកហាត់)',
    unit: 'Carton (100 pcs)',
    default_price: 720.00,
    cost_price: 460.00,
    min_stock_alert: 10,
    warehouse_location: 'Finished Goods Bay D-3',
    image_url: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=600&q=80',
    description: 'អាវកីឡាបាល់បោះដៃកាត់ សាច់ក្រណាត់ Mesh ទន់ស្រាល ងាយស្រួលចលនាលើទីលាន។',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'tst-gar-pl16',
    name: 'Performance Sports Polo Shirts (អាវប៉ូឡូកីឡា)',
    sku: 'TST-GAR-PL16',
    barcode: '884102938116',
    category: 'Activewear & Training Tops (អាវកីឡា និងអាវហ្វឹកហាត់)',
    unit: 'Carton (100 pcs)',
    default_price: 850.00,
    cost_price: 540.00,
    min_stock_alert: 8,
    warehouse_location: 'Finished Goods Bay D-4',
    image_url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80',
    description: 'អាវប៉ូឡូកីឡា ក្រណាត់ Honeycomb Piqué ឆ្លងកាត់ការកាត់ដេរយ៉ាងផ្ចិតផ្ចង់ ស័ក្តិសមសម្រាប់ Golf, Tennis និង Coaching Staff។',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },

  // 5. Sport Bottoms
  {
    id: 'tst-gar-lg17',
    name: 'High-Performance Compression Leggings (ខោហាត់ប្រាណយឺតរឹបរាង)',
    sku: 'TST-GAR-LG17',
    barcode: '884102938117',
    category: 'Sport Bottoms (ខោកីឡា)',
    unit: 'Carton (100 pcs)',
    default_price: 890.00,
    cost_price: 580.00,
    min_stock_alert: 12,
    warehouse_location: 'Finished Goods Bay E-1',
    image_url: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=600&q=80',
    description: 'ខោហាត់ប្រាណយឺតរឹបរាង High-Waist 4-Way Stretch Spandex គាំទ្រសាច់ដុំពេលហាត់ប្រាណ និងមិនជ្រាបពន្លឺ (Squat-Proof)។',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'tst-gar-sh18',
    name: 'Athletic Performance Shorts (ខោខ្លីកីឡា)',
    sku: 'TST-GAR-SH18',
    barcode: '884102938118',
    category: 'Sport Bottoms (ខោកីឡា)',
    unit: 'Carton (100 pcs)',
    default_price: 620.00,
    cost_price: 390.00,
    min_stock_alert: 15,
    warehouse_location: 'Finished Goods Bay E-2',
    image_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80',
    description: 'ខោខ្លីកីឡាទម្ងន់ស្រាល មានស្រទាប់ខាងក្នុង (Built-in Liner) និងហោប៉ៅខ្សែរូតសុវត្ថិភាព។',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'tst-gar-jg19',
    name: 'Warm-Up Joggers & Track Pants (ខោកម្ដៅសាច់ដុំ)',
    sku: 'TST-GAR-JG19',
    barcode: '884102938119',
    category: 'Sport Bottoms (ខោកីឡា)',
    unit: 'Carton (100 pcs)',
    default_price: 790.00,
    cost_price: 510.00,
    min_stock_alert: 10,
    warehouse_location: 'Finished Goods Bay E-3',
    image_url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=600&q=80',
    description: 'ខោកម្ដៅសាច់ដុំ Track Pants សាច់ក្រណាត់ French Terry យឺតទន់ស្រួល មានខ្សែរូតជើងសម្រាប់ងាយស្រួលដោះពាក់។',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },

  // 6. Outerwear
  {
    id: 'tst-gar-ls20',
    name: 'Long-Sleeve Thermal Compression Tops (អាវរងាដៃវែងកីឡា)',
    sku: 'TST-GAR-LS20',
    barcode: '884102938120',
    category: 'Outerwear (អាវក្រៅកីឡា)',
    unit: 'Carton (80 pcs)',
    default_price: 680.00,
    cost_price: 440.00,
    min_stock_alert: 10,
    warehouse_location: 'Finished Goods Bay F-1',
    image_url: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=600&q=80',
    description: 'អាវកីឡាដៃវែងការពារកម្ដៅថ្ងៃ និងរក្សាកម្ដៅសាច់ដុំ (Base Layer / Thermal Compression Top)។',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'tst-gar-hd21',
    name: 'Performance Sports Hoodies (អាវ Hoodie កីឡា)',
    sku: 'TST-GAR-HD21',
    barcode: '884102938121',
    category: 'Outerwear (អាវក្រៅកីឡា)',
    unit: 'Carton (60 pcs)',
    default_price: 840.00,
    cost_price: 550.00,
    min_stock_alert: 10,
    warehouse_location: 'Finished Goods Bay F-2',
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    description: 'អាវកីឡា Hoodie ក្រណាត់ Cotton-Poly Fleece សាច់ទន់កក់ក្តៅ មានមួក និងហោប៉ៅ Kangaroo ធំទូលាយ។',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'tst-gar-jk22',
    name: 'Athletic Tracksuit Warm-Up Jackets (អាវ Tracksuit Jackets កម្ដៅសាច់ដុំ)',
    sku: 'TST-GAR-JK22',
    barcode: '884102938122',
    category: 'Outerwear (អាវក្រៅកីឡា)',
    unit: 'Carton (60 pcs)',
    default_price: 920.00,
    cost_price: 600.00,
    min_stock_alert: 8,
    warehouse_location: 'Finished Goods Bay F-3',
    image_url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=600&q=80',
    description: 'អាវក្រៅកីឡា Tracksuit Jacket ខ្សែរូតពេញ (Full-zip) ធន់នឹងខ្យល់ និងទឹកសាចស្រាលៗ សម្រាប់ក្រុមកីឡា។',
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
  },
];

export const TOP_SPORTS_TEXTILE_BRANCH_STOCK = [
  // Phnom Penh Central Freight Hub (op-1)
  { id: 'bs-1', branch_id: 'op-1', product_id: 'tst-fab-mw01', on_hand_quantity: 120, reserved_quantity: 25, warehouse_location: 'Fabric Bay A-1 (Textile Warehouse)', last_restocked: '2026-08-19' },
  { id: 'bs-2', branch_id: 'op-1', product_id: 'tst-fab-uv02', on_hand_quantity: 85, reserved_quantity: 15, warehouse_location: 'Fabric Bay A-2 (Textile Warehouse)', last_restocked: '2026-08-18' },
  { id: 'bs-3', branch_id: 'op-1', product_id: 'tst-fab-ab03', on_hand_quantity: 65, reserved_quantity: 10, warehouse_location: 'Fabric Bay A-3 (Textile Warehouse)', last_restocked: '2026-08-18' },
  { id: 'bs-4', branch_id: 'op-1', product_id: 'tst-knt-sj04', on_hand_quantity: 150, reserved_quantity: 35, warehouse_location: 'Knit Storage Bay B-1', last_restocked: '2026-08-19' },
  { id: 'bs-5', branch_id: 'op-1', product_id: 'tst-knt-dj05', on_hand_quantity: 110, reserved_quantity: 20, warehouse_location: 'Knit Storage Bay B-2', last_restocked: '2026-08-17' },
  { id: 'bs-6', branch_id: 'op-1', product_id: 'tst-knt-in06', on_hand_quantity: 95, reserved_quantity: 18, warehouse_location: 'Knit Storage Bay B-3', last_restocked: '2026-08-17' },
  { id: 'bs-7', branch_id: 'op-1', product_id: 'tst-knt-rb07', on_hand_quantity: 75, reserved_quantity: 12, warehouse_location: 'Trims Bay B-4', last_restocked: '2026-08-16' },
  { id: 'bs-8', branch_id: 'op-1', product_id: 'tst-knt-ms08', on_hand_quantity: 130, reserved_quantity: 30, warehouse_location: 'Mesh Bay B-5', last_restocked: '2026-08-19' },
  { id: 'bs-9', branch_id: 'op-1', product_id: 'tst-knt-ft09', on_hand_quantity: 80, reserved_quantity: 15, warehouse_location: 'Fleece Bay B-6', last_restocked: '2026-08-15' },
  { id: 'bs-10', branch_id: 'op-1', product_id: 'tst-spx-ps10', on_hand_quantity: 140, reserved_quantity: 40, warehouse_location: 'Spandex Bay C-1', last_restocked: '2026-08-19' },
  { id: 'bs-11', branch_id: 'op-1', product_id: 'tst-spx-ns11', on_hand_quantity: 105, reserved_quantity: 25, warehouse_location: 'Spandex Bay C-2', last_restocked: '2026-08-18' },
  { id: 'bs-12', branch_id: 'op-1', product_id: 'tst-spx-cs12', on_hand_quantity: 90, reserved_quantity: 15, warehouse_location: 'Spandex Bay C-3', last_restocked: '2026-08-16' },
  { id: 'bs-13', branch_id: 'op-1', product_id: 'tst-gar-rn13', on_hand_quantity: 60, reserved_quantity: 10, warehouse_location: 'Finished Goods Bay D-1', last_restocked: '2026-08-19' },
  { id: 'bs-14', branch_id: 'op-1', product_id: 'tst-gar-fb14', on_hand_quantity: 55, reserved_quantity: 12, warehouse_location: 'Finished Goods Bay D-2', last_restocked: '2026-08-18' },
  { id: 'bs-15', branch_id: 'op-1', product_id: 'tst-gar-bb15', on_hand_quantity: 40, reserved_quantity: 8, warehouse_location: 'Finished Goods Bay D-3', last_restocked: '2026-08-17' },
  { id: 'bs-16', branch_id: 'op-1', product_id: 'tst-gar-pl16', on_hand_quantity: 45, reserved_quantity: 6, warehouse_location: 'Finished Goods Bay D-4', last_restocked: '2026-08-17' },
  { id: 'bs-17', branch_id: 'op-1', product_id: 'tst-gar-lg17', on_hand_quantity: 70, reserved_quantity: 18, warehouse_location: 'Finished Goods Bay E-1', last_restocked: '2026-08-19' },
  { id: 'bs-18', branch_id: 'op-1', product_id: 'tst-gar-sh18', on_hand_quantity: 85, reserved_quantity: 20, warehouse_location: 'Finished Goods Bay E-2', last_restocked: '2026-08-18' },
  { id: 'bs-19', branch_id: 'op-1', product_id: 'tst-gar-jg19', on_hand_quantity: 50, reserved_quantity: 10, warehouse_location: 'Finished Goods Bay E-3', last_restocked: '2026-08-16' },
  { id: 'bs-20', branch_id: 'op-1', product_id: 'tst-gar-ls20', on_hand_quantity: 48, reserved_quantity: 8, warehouse_location: 'Finished Goods Bay F-1', last_restocked: '2026-08-17' },
  { id: 'bs-21', branch_id: 'op-1', product_id: 'tst-gar-hd21', on_hand_quantity: 52, reserved_quantity: 14, warehouse_location: 'Finished Goods Bay F-2', last_restocked: '2026-08-18' },
  { id: 'bs-22', branch_id: 'op-1', product_id: 'tst-gar-jk22', on_hand_quantity: 38, reserved_quantity: 6, warehouse_location: 'Finished Goods Bay F-3', last_restocked: '2026-08-16' },

  // Sihanoukville Port Deep Sea Terminal (op-2 - Maritime Export Depot)
  { id: 'bs-23', branch_id: 'op-2', product_id: 'tst-fab-mw01', on_hand_quantity: 180, reserved_quantity: 50, warehouse_location: 'Maritime Export Bay #1', last_restocked: '2026-08-19' },
  { id: 'bs-24', branch_id: 'op-2', product_id: 'tst-knt-sj04', on_hand_quantity: 160, reserved_quantity: 45, warehouse_location: 'Maritime Export Bay #2', last_restocked: '2026-08-19' },
  { id: 'bs-25', branch_id: 'op-2', product_id: 'tst-spx-ps10', on_hand_quantity: 150, reserved_quantity: 40, warehouse_location: 'Maritime Export Bay #3', last_restocked: '2026-08-18' },
  { id: 'bs-26', branch_id: 'op-2', product_id: 'tst-gar-rn13', on_hand_quantity: 90, reserved_quantity: 25, warehouse_location: 'Export Container Bay #4', last_restocked: '2026-08-19' },
  { id: 'bs-27', branch_id: 'op-2', product_id: 'tst-gar-fb14', on_hand_quantity: 80, reserved_quantity: 20, warehouse_location: 'Export Container Bay #5', last_restocked: '2026-08-19' },
  { id: 'bs-28', branch_id: 'op-2', product_id: 'tst-gar-lg17', on_hand_quantity: 95, reserved_quantity: 30, warehouse_location: 'Export Container Bay #6', last_restocked: '2026-08-18' },
  { id: 'bs-29', branch_id: 'op-2', product_id: 'tst-gar-hd21', on_hand_quantity: 45, reserved_quantity: 10, warehouse_location: 'Export Container Bay #7', last_restocked: '2026-08-17' },

  // Bavet Border SEZ Terminal (op-3 - Cross-Border Regional Hub)
  { id: 'bs-30', branch_id: 'op-3', product_id: 'tst-fab-uv02', on_hand_quantity: 70, reserved_quantity: 15, warehouse_location: 'Bavet Border Staging A-1', last_restocked: '2026-08-18' },
  { id: 'bs-31', branch_id: 'op-3', product_id: 'tst-knt-ft09', on_hand_quantity: 60, reserved_quantity: 12, warehouse_location: 'Bavet Border Staging A-2', last_restocked: '2026-08-17' },
  { id: 'bs-32', branch_id: 'op-3', product_id: 'tst-spx-ns11', on_hand_quantity: 80, reserved_quantity: 20, warehouse_location: 'Bavet Border Staging A-3', last_restocked: '2026-08-19' },
  { id: 'bs-33', branch_id: 'op-3', product_id: 'tst-gar-sh18', on_hand_quantity: 65, reserved_quantity: 14, warehouse_location: 'Bavet Border Staging B-1', last_restocked: '2026-08-18' },
  { id: 'bs-34', branch_id: 'op-3', product_id: 'tst-gar-jk22', on_hand_quantity: 35, reserved_quantity: 8, warehouse_location: 'Bavet Border Staging B-2', last_restocked: '2026-08-16' },
];

export const TOP_SPORTS_TEXTILE_MOVEMENTS = [
  { id: 'sm-1', product_id: 'tst-fab-mw01', movement_type: 'inbound', quantity_change: 120, from_branch_id: null, to_branch_id: 'op-1', reference_no: 'PO-TST-2026-8801', reason: 'Factory production batch inbound (Moisture Wicking Quick Dry 50m Rolls)', operator_name: 'Bong Leak', created_at: '2026-08-19 09:30 AM' },
  { id: 'sm-2', product_id: 'tst-gar-fb14', movement_type: 'transfer', quantity_change: 40, from_branch_id: 'op-1', to_branch_id: 'op-2', reference_no: 'TR-TST-9042', reason: 'Export consignment transfer to Sihanoukville Port Terminal', operator_name: 'Sokha Meng', created_at: '2026-08-19 11:15 AM' },
  { id: 'sm-3', product_id: 'tst-spx-ps10', movement_type: 'outbound', quantity_change: -25, from_branch_id: 'op-1', to_branch_id: null, reference_no: 'DO-ADIDAS-4410', reason: 'Dispatch to Manhattan Garment partner manufacturing plant', operator_name: 'Bong Leak', created_at: '2026-08-18 03:45 PM' },
  { id: 'sm-4', product_id: 'tst-knt-sj04', movement_type: 'inbound', quantity_change: 80, from_branch_id: null, to_branch_id: 'op-1', reference_no: 'PO-TST-2026-8802', reason: 'Single Jersey Knitting Mill batch intake', operator_name: 'Bong Leak', created_at: '2026-08-18 10:00 AM' },
  { id: 'sm-5', product_id: 'tst-gar-lg17', movement_type: 'transfer', quantity_change: 30, from_branch_id: 'op-1', to_branch_id: 'op-3', reference_no: 'TR-TST-9043', reason: 'Rebalancing compression leggings stock for Bavet SEZ partner plant', operator_name: 'Sokha Meng', created_at: '2026-08-17 02:20 PM' },
];

export const TOP_SPORTS_TEXTILE_COOP_STOCK = [
  { id: 'cs-1', cooperator_id: '55555555-5555-5555-5555-555555555555', product_id: 'tst-fab-mw01', quantity: 65, unit: 'Roll (50m)', last_verified: '2026-08-19T10:00:00Z' },
  { id: 'cs-2', cooperator_id: '55555555-5555-5555-5555-555555555555', product_id: 'tst-spx-ps10', quantity: 45, unit: 'Roll (50m)', last_verified: '2026-08-19T10:00:00Z' },
  { id: 'cs-3', cooperator_id: '55555555-5555-5555-5555-555555555555', product_id: 'tst-knt-sj04', quantity: 50, unit: 'Roll (50m)', last_verified: '2026-08-19T10:00:00Z' },
  { id: 'cs-4', cooperator_id: '55555555-5555-5555-5555-555555555555', product_id: 'tst-gar-rn13', quantity: 20, unit: 'Carton (100 pcs)', last_verified: '2026-08-19T10:00:00Z' },
];

export const initialProducts = TOP_SPORTS_TEXTILE_PRODUCTS;
export const initialBranchStock = TOP_SPORTS_TEXTILE_BRANCH_STOCK;
export const initialStockMovements = TOP_SPORTS_TEXTILE_MOVEMENTS;
export const initialCooperatorStock = TOP_SPORTS_TEXTILE_COOP_STOCK;

export async function fetchProducts() {
  try {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) {
      return TOP_SPORTS_TEXTILE_PRODUCTS;
    }
    const hasTst = data.some((p) => p.sku?.startsWith('TST-') || p.id?.startsWith('tst-'));
    if (!hasTst) {
      // Auto-sync in background so Supabase gets the new products
      seedTopSportsTextileToSupabase().catch(() => {});
      return TOP_SPORTS_TEXTILE_PRODUCTS;
    }
    const filtered = data.filter((p) => !p.sku?.startsWith('VE-'));
    return filtered.length > 0 ? filtered : TOP_SPORTS_TEXTILE_PRODUCTS;
  } catch {
    return TOP_SPORTS_TEXTILE_PRODUCTS;
  }
}

export async function fetchBranchStock() {
  try {
    const { data, error } = await supabase.from('branch_stock').select('*');
    if (error || !data || data.length === 0) {
      return TOP_SPORTS_TEXTILE_BRANCH_STOCK;
    }
    const hasTst = data.some((bs) => bs.product_id?.startsWith('tst-'));
    if (!hasTst) {
      return TOP_SPORTS_TEXTILE_BRANCH_STOCK;
    }
    return data;
  } catch {
    return TOP_SPORTS_TEXTILE_BRANCH_STOCK;
  }
}

export async function fetchStockMovements() {
  try {
    const { data, error } = await supabase.from('stock_movements').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) {
      return TOP_SPORTS_TEXTILE_MOVEMENTS;
    }
    const hasTst = data.some((sm) => sm.product_id?.startsWith('tst-'));
    if (!hasTst) {
      return TOP_SPORTS_TEXTILE_MOVEMENTS;
    }
    return data;
  } catch {
    return TOP_SPORTS_TEXTILE_MOVEMENTS;
  }
}

export async function fetchCooperatorStock() {
  try {
    const { data, error } = await supabase.from('cooperator_stock').select('*');
    if (error || !data || data.length === 0) {
      return TOP_SPORTS_TEXTILE_COOP_STOCK;
    }
    const hasTst = data.some((cs) => cs.product_id?.startsWith('tst-'));
    if (!hasTst) {
      return TOP_SPORTS_TEXTILE_COOP_STOCK;
    }
    return data;
  } catch {
    return TOP_SPORTS_TEXTILE_COOP_STOCK;
  }
}

/**
 * Resets the products catalog to Top Sports Textile (TST Group) products
 * in both the live Supabase tables and returns the fresh items.
 */
export async function seedTopSportsTextileToSupabase() {
  try {
    // 1. Clear old products if possible
    await supabase.from('branch_stock').delete().neq('id', 'keep_none');
    await supabase.from('products').delete().neq('id', 'keep_none');

    // 2. Insert new Top Sports Textile products
    const { data: insertedProds, error: pErr } = await supabase.from('products').upsert(
      TOP_SPORTS_TEXTILE_PRODUCTS.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        unit: p.unit,
        default_price: p.default_price,
        min_stock_alert: p.min_stock_alert,
        image_url: p.image_url,
        is_active: true,
      }))
    ).select();

    if (pErr) {
      console.warn('[seedTopSportsTextileToSupabase prods error]', pErr);
    }

    return TOP_SPORTS_TEXTILE_PRODUCTS;
  } catch (err) {
    console.warn('[seedTopSportsTextileToSupabase catch]', err);
    return TOP_SPORTS_TEXTILE_PRODUCTS;
  }
}

export async function addLocalProduct(newProd) {
  const payload = {
    id: `prod-${Date.now()}`,
    name: newProd.name || 'Industrial Cargo Item',
    sku: newProd.sku || `VK-PRD-${Math.floor(Math.random() * 900 + 100)}`,
    barcode: newProd.barcode || `${Math.floor(Math.random() * 900000000000 + 100000000000)}`,
    category: newProd.category || 'General Industrial Cargo',
    unit: newProd.unit || 'Pallet',
    default_price: Number(newProd.default_price) || 0.0,
    cost_price: Number(newProd.cost_price) || 0.0,
    min_stock_alert: Number(newProd.min_stock_alert) || 10,
    warehouse_location: newProd.warehouse_location || 'General Staging Area',
    image_url: newProd.image_url || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
    description: newProd.description || 'Standard logistics freight consignment product.',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from('products').insert(payload).select().single();
    if (!error && data) return data;
    if (error) {
      console.warn('[Supabase addLocalProduct error]', error);
      if (error.code === '23505') {
        throw new Error(`SKU "${payload.sku}" is already registered. Please generate or enter a different SKU.`);
      }
    }
  } catch (err) {
    if (err.message && err.message.includes('already registered')) {
      throw err;
    }
    console.warn('[Supabase addLocalProduct fallback]', err);
  }
  return payload;
}

export async function updateLocalProduct(id, updates) {
  try {
    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
    if (!error && data) return data;
  } catch (err) {
    console.warn('[Supabase updateLocalProduct fallback]', err);
  }
  return { id, ...updates };
}

export async function deleteLocalProduct(id) {
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) return true;
  } catch (err) {
    console.warn('[Supabase deleteLocalProduct fallback]', err);
  }
  return true;
}

export async function updateProductPrice(id, newPrice, operatorName = 'Admin') {
  return updateLocalProduct(id, { default_price: Number(newPrice) });
}

export async function addLocalBranchStock(newStock) {
  const payload = {
    id: `bs-${Date.now()}`,
    branch_id: newStock.branch_id,
    product_id: newStock.product_id,
    on_hand_quantity: Number(newStock.on_hand_quantity) || 0,
    reserved_quantity: Number(newStock.reserved_quantity) || 0,
    warehouse_location: newStock.warehouse_location || 'General Staging Area',
    last_restocked: new Date().toISOString().split('T')[0],
  };

  try {
    const { data, error } = await supabase.from('branch_stock').insert(payload).select().single();
    if (!error && data) return data;
  } catch (err) {
    console.warn('[Supabase addLocalBranchStock fallback]', err);
  }
  return payload;
}

export async function updateLocalBranchStock(id, updates) {
  try {
    const { data, error } = await supabase.from('branch_stock').update(updates).eq('id', id).select().single();
    if (!error && data) return data;
  } catch (err) {
    console.warn('[Supabase updateLocalBranchStock fallback]', err);
  }
  return { id, ...updates };
}

export async function deleteLocalBranchStock(id) {
  try {
    const { error } = await supabase.from('branch_stock').delete().eq('id', id);
    if (!error) return true;
  } catch (err) {
    console.warn('[Supabase deleteLocalBranchStock fallback]', err);
  }
  return true;
}

export async function addLocalCooperatorStock(newStock) {
  const payload = {
    id: `cs-${Date.now()}`,
    cooperator_id: newStock.cooperator_id,
    product_id: newStock.product_id,
    quantity: Number(newStock.quantity) || 0,
    unit: newStock.unit || 'Pallet',
    last_verified: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from('cooperator_stock').insert(payload).select().single();
    if (!error && data) return data;
  } catch (err) {
    console.warn('[Supabase addLocalCooperatorStock fallback]', err);
  }
  return payload;
}

export async function updateLocalCooperatorStock(id, updates) {
  try {
    const { data, error } = await supabase.from('cooperator_stock').update(updates).eq('id', id).select().single();
    if (!error && data) return data;
  } catch (err) {
    console.warn('[Supabase updateLocalCooperatorStock fallback]', err);
  }
  return { id, ...updates };
}

export async function deleteLocalCooperatorStock(id) {
  try {
    const { error } = await supabase.from('cooperator_stock').delete().eq('id', id);
    if (!error) return true;
  } catch (err) {
    console.warn('[Supabase deleteLocalCooperatorStock fallback]', err);
  }
  return true;
}

export async function addLocalStockMovement(newMovement) {
  const payload = {
    id: `sm-${Date.now()}`,
    movement_type: newMovement.movement_type || 'inbound',
    product_id: newMovement.product_id,
    branch_id: newMovement.branch_id,
    to_branch_id: newMovement.to_branch_id || null,
    quantity: Number(newMovement.quantity) || 0,
    operator_name: newMovement.operator_name || 'Managing Director',
    reference_no: newMovement.reference_no || `MOV-${Date.now().toString().slice(-6)}`,
    reason: newMovement.reason || 'Standard warehouse stock movement',
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from('stock_movements').insert(payload).select().single();
    if (!error && data) return data;
  } catch (err) {
    console.warn('[Supabase addLocalStockMovement fallback]', err);
  }
  return payload;
}

export async function addLocalBus(newBus) {
  const truckPayload = {
    id: newBus.id || `truck-${Date.now()}`,
    plate_number: newBus.plate_number,
    model: newBus.model,
    capacity_tons: Number(newBus.capacity_tons || newBus.capacity) || 25,
    status: newBus.status || 'active',
    truck_type: newBus.truck_type || 'Container Heavy Trailer (25T)',
    image_url: newBus.image_url || 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80',
    assigned_driver_name: newBus.assigned_driver_name || 'Dara Chan',
    assigned_driver_phone: newBus.assigned_driver_phone || '+855 98 777 001',
    engine_power: newBus.engine_power || '450 HP Diesel',
    next_inspection_date: newBus.next_inspection_date || '2026-12-31',
    insurance_policy_number: newBus.insurance_policy_number || 'VKX-INS-8849-KH',
    home_hub_name: newBus.home_hub_name || 'Phnom Penh SEZ Central Hub',
    operator_id: (newBus.operator_id && newBus.operator_id !== 'op-1') ? newBus.operator_id : 'hub-pp-01',
  };

  let savedData = null;

  // 1. Primary: Insert into 'trucks' table
  try {
    const { data, error } = await supabase.from('trucks').insert(truckPayload).select().single();
    if (!error && data) {
      console.log('[Supabase addLocalBus] Saved to trucks table:', data.id);
      savedData = data;
    } else if (error) {
      console.warn('[Supabase addLocalBus] trucks insert warning:', error);
      // If error is FK on operator_id, retry with null operator_id
      if (error.code === '23503' || error.message?.includes('operator_id')) {
        const retryPayload = { ...truckPayload, operator_id: null };
        const { data: retryData, error: retryErr } = await supabase.from('trucks').insert(retryPayload).select().single();
        if (!retryErr && retryData) {
          savedData = retryData;
        }
      }
    }
  } catch (err) {
    console.warn('[Supabase addLocalBus trucks error]', err);
  }

  // 2. Fallback: Try 'buses' table if trucks failed
  if (!savedData) {
    try {
      const busPayload = {
        ...truckPayload,
        capacity: truckPayload.capacity_tons,
        assigned_driver_email: newBus.assigned_driver_email || 'driver.dara@voleakexpress.com',
      };
      const { data, error } = await supabase.from('buses').insert(busPayload).select().single();
      if (!error && data) {
        savedData = data;
      }
    } catch (err) {
      console.warn('[Supabase addLocalBus buses fallback]', err);
    }
  }

  return {
    ...truckPayload,
    capacity: truckPayload.capacity_tons,
    assigned_driver_email: newBus.assigned_driver_email || 'driver.dara@voleakexpress.com',
    ...(savedData || {}),
  };
}

export async function updateLocalBus(id, updates) {
  // Clean payload for trucks table
  const truckUpdates = { ...updates };
  delete truckUpdates.capacity; // trucks uses capacity_tons
  delete truckUpdates.assigned_driver_email; // not in trucks schema
  if (truckUpdates.operator_id === 'op-1') {
    truckUpdates.operator_id = 'hub-pp-01';
  }

  try {
    const { data, error } = await supabase.from('trucks').update(truckUpdates).eq('id', id).select().single();
    if (!error && data) {
      return { ...updates, ...data };
    }
  } catch (err) {
    console.warn('[Supabase updateLocalBus trucks error]', err);
  }

  try {
    const { data, error } = await supabase.from('buses').update(updates).eq('id', id).select().single();
    if (!error && data) return data;
  } catch (err) {
    console.warn('[Supabase updateLocalBus buses fallback]', err);
  }

  return { id, ...updates };
}

export async function deleteLocalBus(id) {
  try {
    const { error } = await supabase.from('trucks').delete().eq('id', id);
    if (!error) return true;
  } catch (err) {
    console.warn('[Supabase deleteLocalBus trucks error]', err);
  }

  try {
    const { error } = await supabase.from('buses').delete().eq('id', id);
    if (!error) return true;
  } catch (err) {
    console.warn('[Supabase deleteLocalBus buses fallback]', err);
  }

  return true;
}
