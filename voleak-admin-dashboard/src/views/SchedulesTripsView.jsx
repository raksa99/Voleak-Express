import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Calendar,
  PlusCircle,
  Play,
  CheckCircle,
  Clock,
  Truck,
  User,
  X,
  Scale,
  Route,
  FileText,
  Edit3,
  Trash2,
  Check,
  Package,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  addLocalSchedule,
  addLocalTrip,
  addLocalBooking,
  updateTripStatus,
  updateLocalTrip,
  deleteLocalTrip,
  updateLocalBooking,
  deleteLocalBooking,
  updateLocalSchedule,
} from '../lib/supabaseClient';

export const formatToDayMonthYear = (val) => {
  if (!val) return '28-sep-2026';
  const str = String(val).trim();
  if (/^\d{1,2}-[a-zA-Z]{3}-\d{4}$/.test(str)) {
    return str.toLowerCase();
  }
  try {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const month = monthNames[d.getMonth()];
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    }
  } catch {
    // fallback
  }
  return str;
};

export const getTodayFormatted = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${month}-${year}`; // e.g. 28-sep-2026
};

export default function SchedulesTripsView({
  schedules = [],
  setSchedules,
  trips = [],
  setTrips,
  routes = [],
  buses = [],
  users = [],
  cooperators = [],
  bookings = [],
  setBookings,
}) {
  const { t } = useLanguage();

  // Create Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [busIds, setBusIds] = useState([]);
  const [waybillNo, setWaybillNo] = useState('');
  const [driverId, setDriverId] = useState('u-3');
  const [cooperatorId, setCooperatorId] = useState(cooperators[0]?.id || '');
  const [dispatchDate, setDispatchDate] = useState(getTodayFormatted);
  const [price, setPrice] = useState(120.0);
  const [cargoKg, setCargoKg] = useState('');
  const [cargoType, setCargoType] = useState('Knitted Fabric');

  // Edit Modal State
  const [editingTrip, setEditingTrip] = useState(null);
  const [editWaybillNo, setEditWaybillNo] = useState('');
  const [editCooperatorId, setEditCooperatorId] = useState('');
  const [editRouteId, setEditRouteId] = useState('');
  const [editBusId, setEditBusId] = useState('');
  const [editDriverId, setEditDriverId] = useState('');
  const [editDispatchDate, setEditDispatchDate] = useState('');
  const [editCargoKg, setEditCargoKg] = useState('');
  const [editCargoType, setEditCargoType] = useState('Knitted Fabric');
  const [editTotalParcels, setEditTotalParcels] = useState('');
  const [editStatus, setEditStatus] = useState('scheduled');

  // Auto-detect corridor from selected cooperator for Add Modal
  const autoDetectedRoute = useMemo(() => {
    const coop = cooperators.find((c) => c.id === cooperatorId);
    if (!coop) return routes[0] || null;
    if (coop.operator_id) {
      const match = routes.find((r) => r.operator_id === coop.operator_id);
      if (match) return match;
    }
    if (coop.short_name) {
      const match = routes.find((r) => r.name?.toLowerCase().includes(coop.short_name.toLowerCase()));
      if (match) return match;
    }
    return routes[0] || null;
  }, [cooperatorId, cooperators, routes]);

  const routeId = autoDetectedRoute?.id || routes[0]?.id || 'r-1';

  // Helper to format or extract cooperator name from trip
  const getTripCooperator = (trip) => {
    if (trip.cooperator_name) return trip.cooperator_name;
    if (trip.cooperator) return trip.cooperator;
    if (trip.cooperator_id) {
      const found = cooperators.find((c) => c.id === trip.cooperator_id);
      if (found) return found.name;
    }
    if (trip.id === 'TRK-901' || trip.id === 'tr-1') {
      const found = cooperators.find((c) => c.id === 'cop-bowker' || c.short_name?.toLowerCase().includes('bowker'));
      return found ? found.name : 'BOWKER GARMENT FACTORY (CAMBODIA) COMPANY LIMITED';
    }
    if (trip.id === 'TRK-902' || trip.id === 'tr-2') {
      const found = cooperators.find((c) => c.id === 'cop-eminent' || c.short_name?.toLowerCase().includes('eminent'));
      return found ? found.name : 'EMINENT GARMENT (CAMBODIA) LIMITED';
    }
    return cooperators[0]?.name || '8 STAR SPORTSWEAR LTD.';
  };

  // Toggle a truck on/off in the multi-select list for Add Modal
  const handleToggleBus = (id) => {
    setBusIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      return [...prev, id];
    });
  };

  // Creates dispatch manifests, trips, and matching factory waybills
  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    const selectedCoop = cooperators.find((c) => c.id === cooperatorId);
    const selectedDriver = users.find((u) => u.id === driverId) || { name: 'Dara Chan' };
    const newSchedules = [];
    const newTrips = [];
    const newBookings = [];

    const baseWbNumber = waybillNo.trim() || `WB-${Math.floor(Math.random() * 9000 + 1000)}`;

    let truckIndex = 0;
    for (const bid of busIds) {
      truckIndex++;
      const truck = buses.find((b) => b.id === bid) || {};
      const currentWaybillNo =
        busIds.length > 1 && waybillNo.trim()
          ? `${baseWbNumber}-${truckIndex}`
          : waybillNo.trim() || (truckIndex === 1 ? baseWbNumber : `WB-${Math.floor(Math.random() * 9000 + 1000)}`);

      const tripId = `TRK-${Math.floor(Math.random() * 900 + 100)}`;
      const weightInKg = cargoKg ? Number(cargoKg) : Number(truck.capacity || 20) * 1000;
      const weightInTons = (weightInKg / 1000).toFixed(1);

      // 1. Create Schedule
      const newSch = await addLocalSchedule({
        route_id: routeId,
        bus_id: bid,
        driver_id: driverId,
        conductor_id: 'u-4',
        cooperator_id: cooperatorId,
        cooperator_name: selectedCoop?.name || '',
        departure_time: dispatchDate,
        arrival_time: dispatchDate,
        trip_date: dispatchDate,
        days_of_week: '1,2,3,4,5,6,7',
        price: Number(price),
        cargo_kg: weightInKg,
        status: 'active',
      });
      newSchedules.push(newSch);

      // 2. Create Truck Dispatch Manifest (Trip)
      const tripData = {
        id: tripId,
        trip_number: `VKX-${tripId}`,
        waybill_no: currentWaybillNo,
        route_id: routeId,
        route_name: autoDetectedRoute?.name || 'Top Sports Express Corridor',
        bus_id: bid,
        bus_plate: truck.plate_number || 'PP-3D-8890',
        driver_id: driverId,
        driver_name: selectedDriver.name || 'Dara Chan',
        cooperator_id: cooperatorId,
        cooperator_name: selectedCoop?.name || 'EMINENT GARMENT (CAMBODIA) LIMITED',
        status: 'scheduled',
        progress: 0,
        cargo_weight_tons: Number(weightInTons),
        cargo_kg: weightInKg,
        loaded_tons: Number(weightInTons),
        total_parcels: Math.floor(weightInKg / 45) || 450,
        cargo_type: cargoType.trim() || 'Knitted Fabric',
        trip_date: dispatchDate,
        date: dispatchDate,
        departure_time: dispatchDate,
        estimated_arrival: dispatchDate,
        speed_kmh: 0,
      };
      await addLocalTrip(tripData);
      newTrips.push(tripData);

      // 3. Create Waybill in Factory Waybills & Consignments (Bookings)
      const bookingData = {
        id: currentWaybillNo,
        trip_id: tripId,
        truck_plate: truck.plate_number || 'PP-3D-8890',
        passenger_name: 'Top Sports Textile',
        sender: 'Top Sports Textile',
        receiver: selectedCoop?.name || 'EMINENT GARMENT (CAMBODIA) LIMITED',
        seat_number: `${weightInKg.toLocaleString()} kg`,
        status: 'confirmed',
        total_price: Number(price) || 65,
        booking_channel: cargoType.trim() || 'Knitted Fabric',
        cargo_type: cargoType.trim() || 'Knitted Fabric',
        cod_amount: 0,
        qr_code: `VKX-${currentWaybillNo}-KH`,
        booked_at: dispatchDate,
      };
      await addLocalBooking(bookingData);
      newBookings.push(bookingData);
    }

    setSchedules([...newSchedules, ...schedules]);
    setTrips([...newTrips, ...trips]);
    if (setBookings) {
      setBookings([...newBookings, ...bookings]);
    }
    setCargoKg('');
    setWaybillNo('');
    setDispatchDate(getTodayFormatted());
    setShowAddModal(false);
  };

  // Open Edit Modal with prefilled data for a trip
  const handleOpenEditModal = (trip) => {
    const currentWb =
      trip.waybill_no ||
      (trip.id === 'tr-1' || trip.id === 'TRK-901'
        ? 'WB-8810'
        : trip.id === 'tr-2' || trip.id === 'TRK-902'
        ? 'WB-8811'
        : trip.id === 'tr-3' || trip.id === 'TRK-903'
        ? 'WB-8812'
        : `WB-${trip.id?.replace(/\D/g, '') || '8801'}`);

    // Detect cooperator ID
    let foundCoopId = trip.cooperator_id;
    if (!foundCoopId && trip.cooperator_name) {
      const match = cooperators.find(
        (c) =>
          c.name?.toLowerCase() === trip.cooperator_name?.toLowerCase() ||
          (c.short_name && trip.cooperator_name?.toLowerCase().includes(c.short_name.toLowerCase()))
      );
      if (match) foundCoopId = match.id;
    }
    if (!foundCoopId) {
      if (trip.id === 'tr-1' || trip.id === 'TRK-901') foundCoopId = 'cop-bowker';
      else if (trip.id === 'tr-2' || trip.id === 'TRK-902') foundCoopId = 'cop-eminent';
      else if (trip.id === 'tr-3' || trip.id === 'TRK-903') foundCoopId = 'cop-8star';
      else foundCoopId = cooperators[0]?.id || '';
    }

    // Detect route ID
    let foundRouteId = trip.route_id;
    if (!foundRouteId && trip.route_name) {
      const match = routes.find(
        (r) =>
          r.name?.toLowerCase() === trip.route_name?.toLowerCase() ||
          trip.route_name?.toLowerCase().includes(r.name?.toLowerCase())
      );
      if (match) foundRouteId = match.id;
    }
    if (!foundRouteId) {
      foundRouteId = routes[0]?.id || 'r-1';
    }

    // Detect bus ID
    let foundBusId = trip.bus_id;
    if (!foundBusId && trip.bus_plate) {
      const match = buses.find((b) => b.plate_number === trip.bus_plate);
      if (match) foundBusId = match.id;
    }
    if (!foundBusId) {
      foundBusId = buses[0]?.id || '';
    }

    // Detect driver ID
    let foundDriverId = trip.driver_id;
    if (!foundDriverId && trip.driver_name) {
      const match = users.find((u) => u.name?.toLowerCase() === trip.driver_name?.toLowerCase());
      if (match) foundDriverId = match.id;
    }
    if (!foundDriverId) {
      foundDriverId = users.find((u) => u.role === 'driver')?.id || users[0]?.id || 'u-3';
    }

    const kgVal =
      trip.cargo_kg ||
      (trip.cargo_weight_tons ? Number(trip.cargo_weight_tons) * 1000 : null) ||
      (trip.loaded_tons ? Number(trip.loaded_tons) * 1000 : 20000);

    const parcelsVal = trip.total_parcels || Math.floor(kgVal / 45) || 450;

    setEditingTrip(trip);
    setEditWaybillNo(currentWb);
    setEditCooperatorId(foundCoopId);
    setEditRouteId(foundRouteId);
    setEditBusId(foundBusId);
    setEditDriverId(foundDriverId);
    setEditDispatchDate(formatToDayMonthYear(trip.trip_date || trip.date || trip.departure_time || getTodayFormatted()));
    setEditCargoKg(String(kgVal));
    setEditCargoType(trip.cargo_type || 'Knitted Fabric');
    setEditTotalParcels(String(parcelsVal));
    setEditStatus(trip.status || 'scheduled');
  };

  // Change cooperator in edit modal and auto-suggest route
  const handleEditCooperatorChange = (newCoopId) => {
    setEditCooperatorId(newCoopId);
    const coop = cooperators.find((c) => c.id === newCoopId);
    if (coop) {
      if (coop.operator_id) {
        const match = routes.find((r) => r.operator_id === coop.operator_id);
        if (match) {
          setEditRouteId(match.id);
          return;
        }
      }
      if (coop.short_name) {
        const match = routes.find((r) => r.name?.toLowerCase().includes(coop.short_name.toLowerCase()));
        if (match) {
          setEditRouteId(match.id);
        }
      }
    }
  };

  // Save changes to an existing dispatch manifest
  const handleSaveEditSchedule = async (e) => {
    e.preventDefault();
    if (!editingTrip) return;

    const selectedCoop = cooperators.find((c) => c.id === editCooperatorId);
    const selectedDriver = users.find((u) => u.id === editDriverId) || { name: 'Dara Chan' };
    const selectedTruck = buses.find((b) => b.id === editBusId) || {};
    const selectedRoute = routes.find((r) => r.id === editRouteId) || routes[0] || {};

    const weightInKg = editCargoKg ? Number(editCargoKg) : Number(selectedTruck.capacity || 20) * 1000;
    const weightInTons = (weightInKg / 1000).toFixed(1);
    const parcelsCount = editTotalParcels ? Number(editTotalParcels) : Math.floor(weightInKg / 45) || 450;
    const finalWaybillNo = editWaybillNo.trim() || editingTrip.waybill_no || 'WB-8801';

    const updatedTrip = {
      ...editingTrip,
      waybill_no: finalWaybillNo,
      route_id: selectedRoute.id || editingTrip.route_id,
      route_name: selectedRoute.name || editingTrip.route_name || 'Top Sports Express Corridor',
      bus_id: selectedTruck.id || editingTrip.bus_id,
      bus_plate: selectedTruck.plate_number || editingTrip.bus_plate || 'PP-3D-8890',
      driver_id: selectedDriver.id || editingTrip.driver_id,
      driver_name: selectedDriver.name || editingTrip.driver_name || 'Dara Chan',
      cooperator_id: selectedCoop?.id || editingTrip.cooperator_id,
      cooperator_name: selectedCoop?.name || editingTrip.cooperator_name || 'EMINENT GARMENT (CAMBODIA) LIMITED',
      status: editStatus,
      speed_kmh: editStatus === 'in_progress' ? 75 : 0,
      cargo_weight_tons: Number(weightInTons),
      cargo_kg: weightInKg,
      loaded_tons: Number(weightInTons),
      total_parcels: parcelsCount,
      cargo_type: editCargoType.trim() || 'Knitted Fabric',
      trip_date: editDispatchDate,
      date: editDispatchDate,
      departure_time: editDispatchDate,
      estimated_arrival: editDispatchDate,
    };

    // 1. Update in Supabase Trips
    await updateLocalTrip(editingTrip.id, updatedTrip);

    // 2. Update React trips state
    setTrips((prev) => prev.map((t) => (t.id === editingTrip.id ? updatedTrip : t)));

    // 3. Update Bookings (Waybills) in state and Supabase
    if (setBookings) {
      setBookings((prev) =>
        prev.map((b) => {
          if (b.trip_id === editingTrip.id || b.id === editingTrip.waybill_no || b.id === finalWaybillNo) {
            return {
              ...b,
              id: finalWaybillNo,
              truck_plate: selectedTruck.plate_number || b.truck_plate,
              receiver: selectedCoop?.name || b.receiver,
              corridor: selectedRoute.name || b.corridor,
              seat_number: `${weightInKg.toLocaleString()} kg`,
              cargo_type: editCargoType.trim() || b.cargo_type,
              status: editStatus === 'in_progress' ? 'boarded' : editStatus === 'completed' ? 'completed' : 'confirmed',
              booked_at: editDispatchDate,
            };
          }
          return b;
        })
      );
      await updateLocalBooking(editingTrip.waybill_no || finalWaybillNo, {
        trip_id: editingTrip.id,
        receiver: selectedCoop?.name,
        seat_number: `${weightInKg.toLocaleString()} kg`,
        status: editStatus === 'in_progress' ? 'boarded' : editStatus === 'completed' ? 'completed' : 'confirmed',
        cargo_type: editCargoType.trim() || 'Knitted Fabric',
        booked_at: editDispatchDate,
      });
    }

    // 4. Update Schedules if matched
    if (setSchedules) {
      setSchedules((prev) =>
        prev.map((s) => {
          if (s.bus_id === editingTrip.bus_id || s.route_id === editingTrip.route_id) {
            return {
              ...s,
              route_id: selectedRoute.id || s.route_id,
              bus_id: selectedTruck.id || s.bus_id,
              driver_id: selectedDriver.id || s.driver_id,
              cooperator_id: selectedCoop?.id || s.cooperator_id,
              cooperator_name: selectedCoop?.name || s.cooperator_name,
              departure_time: editDispatchDate,
              arrival_time: editDispatchDate,
              trip_date: editDispatchDate,
              cargo_kg: weightInKg,
            };
          }
          return s;
        })
      );
    }

    setEditingTrip(null);
  };

  // Delete a manifest
  const handleDeleteTrip = async (tripId) => {
    const tripToDelete = trips.find((t) => t.id === tripId);
    const wbLabel = tripToDelete?.waybill_no ? ` (${tripToDelete.waybill_no})` : '';
    const confirmed = window.confirm(
      `${t('confirmDeleteManifest') || 'Are you sure you want to delete this dispatch manifest?'} ${tripId}${wbLabel}`
    );
    if (!confirmed) return;

    await deleteLocalTrip(tripId);
    setTrips((prev) => prev.filter((t) => t.id !== tripId));

    if (setBookings && tripToDelete) {
      setBookings((prev) =>
        prev.filter((b) => b.trip_id !== tripId && b.id !== tripToDelete.waybill_no)
      );
      if (tripToDelete.waybill_no) {
        await deleteLocalBooking(tripToDelete.waybill_no);
      }
    }

    if (editingTrip?.id === tripId) {
      setEditingTrip(null);
    }
  };

  const handleStartTrip = (tripId) => {
    updateTripStatus(tripId, 'in_progress');
    setTrips(trips.map((t) => (t.id === tripId ? { ...t, status: 'in_progress', speed_kmh: 75 } : t)));
    if (setBookings) {
      setBookings((prev) =>
        prev.map((b) => (b.trip_id === tripId ? { ...b, status: 'boarded' } : b))
      );
    }
  };

  const handleEndTrip = (tripId) => {
    updateTripStatus(tripId, 'completed');
    setTrips(trips.map((t) => (t.id === tripId ? { ...t, status: 'completed', speed_kmh: 0 } : t)));
    if (setBookings) {
      setBookings((prev) =>
        prev.map((b) => (b.trip_id === tripId ? { ...b, status: 'completed' } : b))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            {t('schedulesTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('schedulesSubtitle')}
          </p>
        </div>
        <button
          onClick={() => {
            setBusIds([]);
            setCargoKg('');
            setWaybillNo('');
            setCargoType('Knitted Fabric');
            setDispatchDate(getTodayFormatted());
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-lg shadow-amber-500/25 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          {t('addScheduleBtn')}
        </button>
      </div>

      {/* Active Truck Dispatches Operations Section */}
      <div className="p-6 rounded-2xl glass-card space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
            Live Daily Truck Dispatch & Voyage Manifests
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
            {trips.length} Active Manifests
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip) => {
            const currentWb =
              trip.waybill_no ||
              (trip.id === 'tr-1' || trip.id === 'TRK-901'
                ? 'WB-8810'
                : trip.id === 'tr-2' || trip.id === 'TRK-902'
                ? 'WB-8811'
                : trip.id === 'tr-3' || trip.id === 'TRK-903'
                ? 'WB-8812'
                : 'WB-8801');

            const truckPlate = trip.bus_plate || buses.find((b) => b.id === trip.bus_id)?.plate_number || 'PP-3D-8890';
            const cargoDisplay = trip.cargo_kg
              ? `${Number(trip.cargo_kg).toLocaleString()} kg`
              : trip.cargo_weight_tons
              ? `${(Number(trip.cargo_weight_tons) * 1000).toLocaleString()} kg`
              : `${trip.loaded_tons || 22.4} Tons`;

            return (
              <div
                key={trip.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3 relative group transition-all hover:border-amber-500/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-500">{trip.id}</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono font-bold text-[10px]">
                      {currentWb}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold ${
                        trip.status === 'in_progress'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : trip.status === 'completed'
                          ? 'bg-purple-500/10 text-purple-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      {trip.status}
                    </span>
                    <button
                      onClick={() => handleOpenEditModal(trip)}
                      title={t('editManifestBtn') || 'Edit Manifest'}
                      className="p-1 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 dark:hover:text-amber-400 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTrip(trip.id)}
                      title={t('deleteManifestBtn') || 'Delete Manifest'}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {trip.route_name || 'Phnom Penh Hub → Siem Reap Terminal'}
                </h4>

                <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center justify-between font-mono">
                    <span>Waybill No:</span>
                    <span className="font-bold text-amber-500">{currentWb}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span>Truck Plate:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{truckPlate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Date:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatToDayMonthYear(trip.trip_date || trip.date || trip.departure_time)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cooperator / Consignee:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 truncate max-w-[180px]">
                      {getTripCooperator(trip)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Lead Driver:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{trip.driver_name}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span>Loaded Cargo Weight:</span>
                    <span className="font-bold text-amber-500">
                      {cargoDisplay} ({trip.total_parcels || 450} Parcels)
                    </span>
                  </div>
                  {trip.cargo_type && (
                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <span className="text-slate-400">Cargo Type:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                        {trip.cargo_type}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEditModal(trip)}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-700/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t('edit') || 'Edit'}</span>
                  </button>

                  {trip.status === 'scheduled' && (
                    <button
                      onClick={() => handleStartTrip(trip.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5" /> {t('startTripBtn')}
                    </button>
                  )}

                  {trip.status === 'in_progress' && (
                    <button
                      onClick={() => handleEndTrip(trip.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> {t('endTripBtn')}
                    </button>
                  )}

                  {trip.status === 'completed' && (
                    <span className="flex-1 text-xs font-bold text-slate-400 text-center py-1.5">
                      ✓ Arrived & Unloaded
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Truck Dispatch & Voyage Manifest Modal */}
      {editingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl my-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-500">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t('editManifestTitle') || 'Edit Truck Dispatch & Voyage Manifest'}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs font-bold text-amber-500">{editingTrip.id}</span>
                    <span className="text-[10px] text-slate-400">• Update dispatch route, truck, driver, weight and waybill</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setEditingTrip(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSchedule} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Waybill No */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Waybill No (Tracking)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WB-8810"
                    value={editWaybillNo}
                    onChange={(e) => setEditWaybillNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                  />
                </div>

                {/* Dispatch Status */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Voyage Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                  >
                    <option value="scheduled">Scheduled Dispatch</option>
                    <option value="in_progress">In Transit on Highway</option>
                    <option value="completed">Arrived & Unloaded at Hub</option>
                  </select>
                </div>
              </div>

              {/* Target Cooperator / Client */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Cooperator / Consignee
                </label>
                <select
                  value={editCooperatorId}
                  onChange={(e) => handleEditCooperatorChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                >
                  {cooperators.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.short_name ? `(${c.short_name})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Freight Corridor / Route */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Freight Route Corridor
                </label>
                <select
                  value={editRouteId}
                  onChange={(e) => setEditRouteId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.distance_km || 0} km)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Freight Truck */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Freight Truck
                  </label>
                  <select
                    value={editBusId}
                    onChange={(e) => setEditBusId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                  >
                    {buses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.plate_number} - {b.model || 'Heavy Freight Truck'} ({b.capacity || 20} Tons)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lead Driver */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lead Driver
                  </label>
                  <select
                    value={editDriverId}
                    onChange={(e) => setEditDriverId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} {u.role ? `(${u.role})` : ''} {u.phone ? `- ${u.phone}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Dispatch Date */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Dispatch Date
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="28-sep-2026"
                      value={editDispatchDate}
                      onChange={(e) => setEditDispatchDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium pr-10"
                    />
                    <input
                      type="date"
                      className="absolute right-2 opacity-0 w-8 h-8 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.value) {
                          setEditDispatchDate(formatToDayMonthYear(e.target.value));
                        }
                      }}
                    />
                    <Calendar className="w-4 h-4 text-amber-500 absolute right-3 pointer-events-none" />
                  </div>
                </div>

                {/* Planned Cargo Weight (Kg) */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Planned Cargo Weight (Kg)
                    {editCargoKg && (
                      <span className="ml-2 font-mono font-bold text-amber-500 text-[11px]">
                        ({(Number(editCargoKg) / 1000).toFixed(1)} Tons)
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    step="100"
                    placeholder="e.g. 25000"
                    value={editCargoKg}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditCargoKg(val);
                      if (val && !isNaN(val)) {
                        setEditTotalParcels(String(Math.floor(Number(val) / 45) || 450));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Total Parcels / Roll count */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Parcels / Rolls
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 450"
                    value={editTotalParcels}
                    onChange={(e) => setEditTotalParcels(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                {/* Cargo Type */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cargo / Consignment Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Knitted Fabric / Textile Rolls"
                    value={editCargoType}
                    onChange={(e) => setEditCargoType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleDeleteTrip(editingTrip.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-semibold transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t('deleteManifestBtn') || 'Delete Manifest'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTrip(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/25 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>{t('saveChangesBtn') || 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Truck Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md my-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('addScheduleBtn')}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Waybill No
                </label>
                <input
                  type="text"
                  placeholder="Enter Waybill No (e.g. WB-8815)"
                  value={waybillNo}
                  onChange={(e) => setWaybillNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Cooperator / Client
                </label>
                <select
                  value={cooperatorId}
                  onChange={(e) => setCooperatorId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                >
                  {cooperators.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.short_name ? `(${c.short_name})` : ''}
                    </option>
                  ))}
                </select>
                {autoDetectedRoute && (
                  <div className="mt-1.5 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Route className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                      {autoDetectedRoute.name} ({autoDetectedRoute.distance_km}km)
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lead Driver
                </label>
                <select
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} {u.role ? `(${u.role})` : ''} {u.phone ? `- ${u.phone}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Freight Truck
                  {busIds.length > 1 && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-500 text-[10px] font-bold">
                      {busIds.length} trucks selected
                    </span>
                  )}
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2">
                  {buses.map((b) => {
                    const isSelected = busIds.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleToggleBus(b.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all text-xs ${
                          isSelected
                            ? 'bg-amber-500/15 border-2 border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                            : 'bg-white/60 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-amber-400/50'
                        }`}
                      >
                        <span
                          className={`flex-shrink-0 w-4 h-4 rounded flex items-center justify-center border-2 transition-all ${
                            isSelected
                              ? 'bg-amber-500 border-amber-500 text-white'
                              : 'border-slate-400 dark:border-slate-500'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <Truck className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">
                          {b.plate_number} - {b.model} ({b.capacity} Tons)
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Click to select multiple trucks when 1 is not enough for this cooperator</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="28-sep-2026"
                    value={dispatchDate}
                    onChange={(e) => setDispatchDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium pr-10"
                  />
                  <input
                    type="date"
                    className="absolute right-2 opacity-0 w-8 h-8 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.value) {
                        setDispatchDate(formatToDayMonthYear(e.target.value));
                      }
                    }}
                  />
                  <Calendar className="w-4 h-4 text-amber-500 absolute right-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Planned Cargo Capacity (Kg)
                </label>
                <input
                  type="number"
                  step="100"
                  placeholder="Enter cargo capacity in Kg (e.g. 20000)"
                  value={cargoKg}
                  onChange={(e) => setCargoKg(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cargo / Consignment Type
                </label>
                <input
                  type="text"
                  placeholder="e.g. Knitted Fabric / Spandex Rolls"
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={busIds.length === 0}
                  className={`px-4 py-2 rounded-xl font-semibold shadow-md ${
                    busIds.length === 0
                      ? 'bg-slate-400 text-slate-200 cursor-not-allowed'
                      : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  {t('createBtn') || 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
