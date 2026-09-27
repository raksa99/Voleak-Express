import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Truck,
  PlusCircle,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  X,
  Eye,
  Scale,
  Thermometer,
  Calendar,
  ShieldCheck,
  Phone,
  Mail,
  User,
  UserX,
  UserMinus,
  Search,
  Filter,
  Layers,
  Edit2,
  Trash2,
  Zap,
  Sparkles,
  ExternalLink,
  Image as ImageIcon,
  UploadCloud,
  Camera,
  Radio,
  Satellite,
} from 'lucide-react';
import { addLocalBus, updateLocalBus, deleteLocalBus, DEFAULT_USERS } from '../lib/supabaseClient';
import SweetAlertModal from '../components/SweetAlertModal';
import DagpsConfigModal from '../components/DagpsConfigModal';
import {
  getCachedGpsDevices,
  assignDeviceToTruck,
  getDeviceAssignments,
} from '../lib/dagpsService';

const DEFAULT_TRUCK_IMAGE =
  'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80';

export default function FleetView({ buses = [], setBuses, users = [], setActiveTab }) {
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [deletingTruck, setDeletingTruck] = useState(null);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // GPS Device Assignment State
  const [isGpsModalOpen, setIsGpsModalOpen] = useState(false);
  const [gpsAssignments, setGpsAssignments] = useState(getDeviceAssignments());
  const [availableGpsDevices, setAvailableGpsDevices] = useState(getCachedGpsDevices());

  useEffect(() => {
    const handleUpdate = () => {
      setGpsAssignments(getDeviceAssignments());
      setAvailableGpsDevices(getCachedGpsDevices());
    };
    window.addEventListener('dagps_config_updated', handleUpdate);
    window.addEventListener('dagps_telemetry_updated', handleUpdate);
    return () => {
      window.removeEventListener('dagps_config_updated', handleUpdate);
      window.removeEventListener('dagps_telemetry_updated', handleUpdate);
    };
  }, []);

  // Staff & Drivers list resolution
  const staffList = useMemo(() => {
    return users && users.length > 0 ? users : DEFAULT_USERS;
  }, [users]);

  const driversList = useMemo(() => {
    return staffList.filter((u) => (u.role || '').toLowerCase() === 'driver');
  }, [staffList]);

  const otherStaffList = useMemo(() => {
    return staffList.filter((u) => (u.role || '').toLowerCase() !== 'driver');
  }, [staffList]);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form State
  const [formData, setFormData] = useState({
    plate_number: '',
    model: '',
    capacity: 28,
    status: 'active',
    truck_type: 'Container Heavy Trailer (25T)',
    image_url: DEFAULT_TRUCK_IMAGE,
    assigned_driver_staff_id: 'none',
    assigned_driver_name: '',
    assigned_driver_phone: '',
    assigned_driver_email: '',
    assigned_driver_avatar: '',
    engine_power: '450 HP Diesel',
    next_inspection_date: '2026-12-31',
    insurance_policy_number: 'VKX-INS-8849-KH',
    gps_imei: '',
    gps_device_name: '',
  });

  const resetForm = () => {
    setFormData({
      plate_number: '',
      model: '',
      capacity: 28,
      status: 'active',
      truck_type: 'Container Heavy Trailer (25T)',
      image_url: DEFAULT_TRUCK_IMAGE,
      assigned_driver_staff_id: 'none',
      assigned_driver_name: '',
      assigned_driver_phone: '',
      assigned_driver_email: '',
      assigned_driver_avatar: '',
      engine_power: '450 HP Diesel',
      next_inspection_date: '2026-12-31',
      insurance_policy_number: 'VKX-INS-8849-KH',
      gps_imei: '',
      gps_device_name: '',
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (truck) => {
    setEditingTruck(truck);
    const hasDriver = Boolean(
      truck.assigned_driver_name &&
      truck.assigned_driver_name.trim() !== '' &&
      truck.assigned_driver_name.toLowerCase() !== 'unassigned' &&
      truck.assigned_driver_name.toLowerCase() !== 'none'
    );

    const matchedStaff = hasDriver
      ? staffList.find(
          (s) =>
            (truck.assigned_driver_staff_id && s.id === truck.assigned_driver_staff_id) ||
            (s.full_name && s.full_name.toLowerCase() === (truck.assigned_driver_name || '').toLowerCase()) ||
            (s.name && s.name.toLowerCase() === (truck.assigned_driver_name || '').toLowerCase()) ||
            (s.phone && s.phone === truck.assigned_driver_phone)
        )
      : null;

    const matchedGps = Object.entries(gpsAssignments).find(
      ([imei, plate]) => plate === truck.plate_number
    );

    setFormData({
      plate_number: truck.plate_number || '',
      model: truck.model || '',
      capacity: Number(truck.capacity || truck.capacity_tons) || 25,
      status: truck.status || 'active',
      truck_type: truck.truck_type || 'Container Heavy Trailer (25T)',
      image_url: truck.image_url || truck.photo_url || DEFAULT_TRUCK_IMAGE,
      assigned_driver_staff_id: hasDriver
        ? (matchedStaff?.id || truck.assigned_driver_staff_id || 'custom')
        : 'none',
      assigned_driver_name: hasDriver ? (truck.assigned_driver_name || '') : '',
      assigned_driver_phone: hasDriver ? (truck.assigned_driver_phone || '') : '',
      assigned_driver_email: hasDriver ? (truck.assigned_driver_email || '') : '',
      assigned_driver_avatar: hasDriver ? (truck.assigned_driver_avatar || matchedStaff?.avatar || '') : '',
      engine_power: truck.engine_power || '450 HP Diesel',
      next_inspection_date: truck.next_inspection_date || '2026-12-31',
      insurance_policy_number: truck.insurance_policy_number || 'VKX-INS-8849-KH',
      gps_imei: truck.gps_imei || matchedGps?.[0] || '',
      gps_device_name: truck.gps_device_name || '',
    });
  };

  const handleStaffDriverSelect = (staffId) => {
    if (!staffId || staffId === 'none') {
      setFormData((prev) => ({
        ...prev,
        assigned_driver_staff_id: 'none',
        assigned_driver_name: '',
        assigned_driver_phone: '',
        assigned_driver_email: '',
        assigned_driver_avatar: '',
      }));
      return;
    }

    if (staffId === 'custom') {
      setFormData((prev) => ({
        ...prev,
        assigned_driver_staff_id: 'custom',
      }));
      return;
    }

    const selected = staffList.find((s) => s.id === staffId);
    if (selected) {
      const displayName = selected.full_name || selected.name || '';
      const displayPhone = selected.phone || '';
      const displayEmail =
        selected.email ||
        `${displayName.toLowerCase().replace(/\s+/g, '.')}@voleakexpress.com`;
      const avatar = selected.avatar || selected.avatar_url || '';

      setFormData((prev) => ({
        ...prev,
        assigned_driver_staff_id: selected.id,
        assigned_driver_name: displayName,
        assigned_driver_phone: displayPhone,
        assigned_driver_email: displayEmail,
        assigned_driver_avatar: avatar,
      }));
    }
  };

  const handleRemoveDriverFromForm = () => {
    setFormData((prev) => ({
      ...prev,
      assigned_driver_staff_id: 'none',
      assigned_driver_name: '',
      assigned_driver_phone: '',
      assigned_driver_email: '',
      assigned_driver_avatar: '',
    }));
  };

  const currentSelectedStaff = useMemo(() => {
    if (!formData.assigned_driver_staff_id || formData.assigned_driver_staff_id === 'custom' || formData.assigned_driver_staff_id === 'none') {
      return null;
    }
    return staffList.find((s) => s.id === formData.assigned_driver_staff_id);
  }, [formData.assigned_driver_staff_id, staffList]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateTruck = async (e) => {
    e.preventDefault();
    if (!formData.plate_number || !formData.model) {
      alert('Please provide both License Plate Number and Truck Model.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isBlank = formData.assigned_driver_staff_id === 'none' || !formData.assigned_driver_name?.trim();
      const payload = {
        ...formData,
        capacity: Number(formData.capacity) || 25,
        capacity_tons: Number(formData.capacity) || 25,
        assigned_driver_staff_id: isBlank ? null : formData.assigned_driver_staff_id,
        assigned_driver_name: isBlank ? '' : formData.assigned_driver_name.trim(),
        assigned_driver_phone: isBlank ? '' : (formData.assigned_driver_phone?.trim() || ''),
        assigned_driver_email: isBlank ? '' : (formData.assigned_driver_email?.trim() || ''),
        assigned_driver_avatar: isBlank ? '' : (formData.assigned_driver_avatar || ''),
        operator_id: 'hub-pp-01',
      };

      if (formData.gps_imei) {
        assignDeviceToTruck(formData.gps_imei, formData.plate_number);
        setGpsAssignments(getDeviceAssignments());
      }

      const newTruck = await addLocalBus(payload);
      setBuses((prev) => [newTruck, ...prev.filter((b) => b.id !== newTruck.id)]);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error('[Create Truck Error]', err);
      alert('Failed to save truck: ' + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTruck = async (e) => {
    e.preventDefault();
    if (!editingTruck || !formData.plate_number) return;

    setIsSubmitting(true);
    try {
      const isBlank = formData.assigned_driver_staff_id === 'none' || !formData.assigned_driver_name?.trim();
      const payload = {
        ...formData,
        capacity: Number(formData.capacity) || 25,
        capacity_tons: Number(formData.capacity) || 25,
        assigned_driver_staff_id: isBlank ? null : formData.assigned_driver_staff_id,
        assigned_driver_name: isBlank ? '' : formData.assigned_driver_name.trim(),
        assigned_driver_phone: isBlank ? '' : (formData.assigned_driver_phone?.trim() || ''),
        assigned_driver_email: isBlank ? '' : (formData.assigned_driver_email?.trim() || ''),
        assigned_driver_avatar: isBlank ? '' : (formData.assigned_driver_avatar || ''),
      };

      if (formData.gps_imei) {
        assignDeviceToTruck(formData.gps_imei, formData.plate_number);
      } else {
        const prevAssignedImei = Object.keys(gpsAssignments).find(
          (k) => gpsAssignments[k] === editingTruck.plate_number
        );
        if (prevAssignedImei) {
          assignDeviceToTruck(prevAssignedImei, null);
        }
      }
      setGpsAssignments(getDeviceAssignments());

      if (updateLocalBus) {
        await updateLocalBus(editingTruck.id, payload);
      }

      setBuses((prev) =>
        prev.map((b) => (b.id === editingTruck.id ? { ...b, ...payload } : b))
      );
      if (selectedTruck && selectedTruck.id === editingTruck.id) {
        setSelectedTruck((prev) => ({ ...prev, ...payload }));
      }
      setEditingTruck(null);
      resetForm();
    } catch (err) {
      console.error('[Update Truck Error]', err);
      alert('Failed to update truck: ' + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickRemoveDriver = async (truck, e) => {
    if (e) e.stopPropagation();
    const confirmed = window.confirm(
      `Remove driver from truck "${truck.plate_number}"? The truck will have a blank driver and can be assigned later.`
    );
    if (!confirmed) return;

    try {
      const blankData = {
        assigned_driver_staff_id: null,
        assigned_driver_name: '',
        assigned_driver_phone: '',
        assigned_driver_email: '',
        assigned_driver_avatar: '',
      };
      if (updateLocalBus) {
        await updateLocalBus(truck.id, blankData);
      }
      setBuses((prev) =>
        prev.map((b) => (b.id === truck.id ? { ...b, ...blankData } : b))
      );
      if (selectedTruck && selectedTruck.id === truck.id) {
        setSelectedTruck((prev) => ({ ...prev, ...blankData }));
      }
    } catch (err) {
      console.error('Error removing driver:', err);
      alert('Failed to remove driver: ' + (err.message || err));
    }
  };

  const handleDeleteTruck = async () => {
    if (!deletingTruck) return;
    if (deleteLocalBus) {
      await deleteLocalBus(deletingTruck.id);
    }
    setBuses(buses.filter((b) => b.id !== deletingTruck.id));
    setDeletingTruck(null);
    if (selectedTruck?.id === deletingTruck.id) {
      setSelectedTruck(null);
    }
  };

  // Filtered Trucks
  const filteredTrucks = useMemo(() => {
    return buses.filter((truck) => {
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        !searchQuery.trim() ||
        truck.plate_number?.toLowerCase().includes(q) ||
        truck.model?.toLowerCase().includes(q) ||
        truck.truck_type?.toLowerCase().includes(q) ||
        truck.assigned_driver_name?.toLowerCase().includes(q) ||
        truck.assigned_driver_phone?.toLowerCase().includes(q) ||
        truck.assigned_driver_email?.toLowerCase().includes(q);

      const matchesCategory =
        categoryFilter === 'all' || truck.truck_type === categoryFilter;

      const matchesStatus =
        statusFilter === 'all' || truck.status === statusFilter;

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [buses, searchQuery, categoryFilter, statusFilter]);

  // Overall Specs
  const totalTonnage = buses.reduce(
    (sum, b) => sum + (Number(b.capacity || b.capacity_tons) || 0),
    0
  );
  const activeCount = buses.filter((b) => b.status === 'active').length;
  const maintenanceCount = buses.filter((b) => b.status === 'maintenance').length;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-sky-500/10 dark:from-amber-500/10 dark:via-slate-900/90 dark:to-sky-950/40 border border-amber-500/30 shadow-lg backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/30 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              Truck Details & Heavy Freight Fleet
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Inspect axle tonnage capacities, 40ft container haulers, truck photos, assigned drivers, telephone hotlines, and emails.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsGpsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 border border-amber-500/30 hover:border-amber-500 text-amber-400 font-extrabold text-xs shadow-sm transition-all shrink-0 hover:bg-slate-800/90"
            title="Configure GPS Satellites & Assign Trackers to Trucks"
          >
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Pair GPS Hardware</span>
            {Object.keys(gpsAssignments).length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono">
                {Object.keys(gpsAssignments).length} Paired
              </span>
            )}
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Truck Details</span>
          </button>
        </div>
      </div>

      {/* 2. SUMMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Total Heavy Fleet</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{buses.length} Trucks</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Active On Highway</p>
            <p className="text-2xl font-black text-emerald-500 mt-0.5">{activeCount} Trucks</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Total Fleet Payload</p>
            <p className="text-2xl font-black text-purple-500 mt-0.5">{totalTonnage.toFixed(0)} Tons</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Under Maintenance</p>
            <p className="text-2xl font-black text-amber-500 mt-0.5">{maintenanceCount} Trucks</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Wrench className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTER TOOLBAR */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search truck plate (PP-3D-...), model, driver, phone, email..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Truck Types</option>
            <option value="Container Heavy Trailer (25T)">Container Heavy Trailer (25T)</option>
            <option value="Medium Cargo Truck (8T)">Medium Cargo Truck (8T)</option>
            <option value="Refrigerated Cold Truck (10T)">Refrigerated Cold Truck (10T)</option>
            <option value="Heavy Flatbed (30T)">Heavy Flatbed (30T)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active (On Highway)</option>
            <option value="maintenance">Under Maintenance</option>
            <option value="retired">Out of Service</option>
          </select>
        </div>

        <span className="text-xs font-bold text-slate-400">
          Showing {filteredTrucks.length} of {buses.length} Trucks
        </span>
      </div>

      {/* 4. TRUCK SPECIFICATION CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrucks.map((truck) => {
          const capacityTons = Number(truck.capacity || truck.capacity_tons) || 25;
          const status = truck.status || 'active';
          const isMaintenance = status === 'maintenance';
          const truckImg = truck.image_url || truck.photo_url || DEFAULT_TRUCK_IMAGE;
          const hasDriver = Boolean(
            truck.assigned_driver_name &&
            truck.assigned_driver_name.trim() !== '' &&
            truck.assigned_driver_name.toLowerCase() !== 'unassigned' &&
            truck.assigned_driver_name.toLowerCase() !== 'none'
          );
          const driverPhone = hasDriver ? truck.assigned_driver_phone : '';
          const driverEmail = hasDriver ? truck.assigned_driver_email : '';

          return (
            <div
              key={truck.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden transition-all hover:shadow-lg hover:border-amber-500/30 group flex flex-col justify-between"
            >
              {/* Card Top Banner Image */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-800">
                <img
                  src={truckImg}
                  alt={truck.model}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = DEFAULT_TRUCK_IMAGE;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                {/* Overlaid Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-black bg-slate-950/90 text-amber-400 border border-amber-500/40 shadow-lg backdrop-blur-md">
                    🇰🇭 {truck.plate_number}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md ${
                      status === 'active'
                        ? 'bg-emerald-500/80 text-white border border-emerald-400'
                        : isMaintenance
                        ? 'bg-amber-500/80 text-slate-950 border border-amber-400'
                        : 'bg-rose-500/80 text-white border border-rose-400'
                    }`}
                  >
                    {status}
                  </span>
                </div>

                {/* Bottom of Image: Model Title */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-sm font-extrabold text-white truncate drop-shadow-md">
                    {truck.model}
                  </h3>
                  <p className="text-[11px] text-amber-400 font-bold truncate">
                    {truck.truck_type || 'Container Heavy Hauler'}
                  </p>
                </div>
              </div>

              {/* Card Body Specs */}
              <div className="p-5 space-y-3.5">
                {/* Truck Specs Grid Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-purple-500" /> Max Payload Axle:
                    </span>
                    <span className="font-mono font-bold text-purple-500 text-sm">
                      {capacityTons.toFixed(1)} Tons
                    </span>
                  </div>

                  {hasDriver ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-sky-500" /> Assigned Driver:
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate max-w-[180px]">
                          {truck.assigned_driver_avatar && (
                            <img
                              src={truck.assigned_driver_avatar}
                              alt={truck.assigned_driver_name}
                              className="w-4 h-4 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                          )}
                          <span className="truncate">{truck.assigned_driver_name}</span>
                        </span>
                      </div>

                      {/* Driver Telephone */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-emerald-500" /> Driver Phone:
                        </span>
                        {driverPhone ? (
                          <a
                            href={`tel:${driverPhone}`}
                            className="font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            {driverPhone}
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>

                      {/* Driver Email */}
                      {driverEmail && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-sky-500" /> Driver Email:
                          </span>
                          <a
                            href={`mailto:${driverEmail}`}
                            className="font-medium text-slate-700 dark:text-slate-300 hover:text-sky-500 dark:hover:text-sky-400 hover:underline truncate max-w-[170px]"
                            title={driverEmail}
                          >
                            {driverEmail}
                          </a>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700/80 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-amber-500/10 text-amber-500">
                          <UserX className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <span className="font-bold text-amber-600 dark:text-amber-400 block text-[11px]">
                            No Driver Assigned
                          </span>
                          <span className="text-[10px] text-slate-400">Blank • Assign later</span>
                        </div>
                      </div>
                      <button
                        onClick={() => openEditModal(truck)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-slate-950 font-bold text-[11px] transition-all flex items-center gap-1"
                      >
                        + Assign Driver
                      </button>
                    </div>
                  )}
                </div>

                {/* DAGPS Live Telemetry or Assign GPS Prompt */}
                {(() => {
                  const assignedImei = Object.entries(gpsAssignments).find(
                    ([imei, plate]) => plate === truck.plate_number
                  )?.[0] || truck.gps_imei;
                  const matchedGpsDev = availableGpsDevices.find(
                    (d) => d.imei === assignedImei || d.plateNumber === truck.plate_number
                  );

                  if (assignedImei || matchedGpsDev || truck.dagps_live) {
                    const dev = matchedGpsDev || {
                      userName: truck.gps_device_name || 'GPS Tracker',
                      motionStatus: truck.motion_status || 'Parking',
                      battery: truck.battery || 70,
                      speed: truck.speed || 0,
                    };
                    return (
                      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                        <div className="flex items-center gap-1.5 font-extrabold text-emerald-600 dark:text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          <span className="truncate max-w-[130px]">
                            {dev.userName || dev.deviceModel || 'GPS Online'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>Bat: <strong className="text-emerald-600 dark:text-emerald-400">{dev.battery || 70}%</strong></span>
                          <span>•</span>
                          <span className="font-mono text-purple-600 dark:text-purple-400">{dev.speed || 0} km/h</span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700/80 text-xs">
                      <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                        <Satellite className="w-3.5 h-3.5 text-slate-400" />
                        No GPS tracker paired
                      </span>
                      <button
                        onClick={() => openEditModal(truck)}
                        className="text-[11px] font-bold text-amber-500 hover:text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                      >
                        + Assign GPS
                      </button>
                    </div>
                  );
                })()}

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setSelectedTruck(truck)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Details</span>
                  </button>

                  {setActiveTab && (
                    <button
                      onClick={() => setActiveTab('liveMap')}
                      className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 hover:text-white text-amber-500 font-bold transition-all"
                      title="Track Truck on Live GPS Map"
                    >
                      <Radio className="w-4 h-4 animate-pulse" />
                    </button>
                  )}

                  <button
                    onClick={() => openEditModal(truck)}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-500/10 hover:text-sky-500 text-slate-400 transition-all"
                    title="Edit Truck Specs & Photo"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {hasDriver && (
                    <button
                      onClick={(e) => handleQuickRemoveDriver(truck, e)}
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 hover:text-rose-500 text-slate-400 transition-all"
                      title="Remove driver from truck (leave blank to assign later)"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => setDeletingTruck(truck)}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 hover:text-rose-500 text-slate-400 transition-all"
                    title="Delete Truck"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. MODAL: DETAILED TRUCK INSPECTOR */}
      {selectedTruck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            {/* Header with Hero Image */}
            <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-800">
              <img
                src={selectedTruck.image_url || selectedTruck.photo_url || DEFAULT_TRUCK_IMAGE}
                alt={selectedTruck.model}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

              <button
                onClick={() => setSelectedTruck(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/60 text-white hover:bg-slate-900"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-black bg-slate-950 text-amber-400 border border-amber-500/40">
                      🇰🇭 {selectedTruck.plate_number}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
                      {selectedTruck.status || 'Active'}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white mt-1">
                    {selectedTruck.model}
                  </h3>
                </div>
              </div>
            </div>

            {/* Spec Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <span className="text-slate-400 text-[10px] block">Max Payload Scale</span>
                <span className="font-mono font-bold text-purple-500 text-sm">
                  {selectedTruck.capacity || selectedTruck.capacity_tons || 28} Tons
                </span>
              </div>

              {(() => {
                const selectedHasDriver = Boolean(
                  selectedTruck.assigned_driver_name &&
                  selectedTruck.assigned_driver_name.trim() !== '' &&
                  selectedTruck.assigned_driver_name.toLowerCase() !== 'unassigned' &&
                  selectedTruck.assigned_driver_name.toLowerCase() !== 'none'
                );

                if (selectedHasDriver) {
                  return (
                    <>
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <span className="text-slate-400 text-[10px] block">Assigned Driver</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            {selectedTruck.assigned_driver_avatar && (
                              <img
                                src={selectedTruck.assigned_driver_avatar}
                                alt={selectedTruck.assigned_driver_name}
                                className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                              />
                            )}
                            <span className="font-bold text-slate-900 dark:text-white truncate">
                              {selectedTruck.assigned_driver_name}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleQuickRemoveDriver(selectedTruck)}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 transition-all flex items-center gap-1 shrink-0 ml-2"
                          title="Remove driver from truck"
                        >
                          <UserX className="w-3 h-3" />
                          Remove
                        </button>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                        <span className="text-slate-400 text-[10px] block">Driver Telephone</span>
                        <span className="font-mono font-bold text-emerald-500">
                          {selectedTruck.assigned_driver_phone || '—'}
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 sm:col-span-2">
                        <span className="text-slate-400 text-[10px] block">Driver Corporate Email</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {selectedTruck.assigned_driver_email || '—'}
                        </span>
                      </div>
                    </>
                  );
                }

                return (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700/80 sm:col-span-2 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                        <UserX className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          No Driver Assigned (Blank Driver)
                        </span>
                        <span className="text-[10px] text-slate-400">
                          This truck currently has no driver. You can assign one at any time.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const trk = selectedTruck;
                        setSelectedTruck(null);
                        openEditModal(trk);
                      }}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center gap-1 shadow-sm shrink-0"
                    >
                      <User className="w-3.5 h-3.5" />
                      + Assign Driver
                    </button>
                  </div>
                );
              })()}

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <span className="text-slate-400 text-[10px] block">Safety Certificate Expiry</span>
                <span className="font-mono font-bold text-emerald-500">
                  {selectedTruck.next_inspection_date || '2026-12-31 (Valid)'}
                </span>
              </div>
            </div>

            {/* Maintenance Record */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Heavy Vehicle Safety Inspection Record</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                Axle alignment, pneumatic brake lines, and digital GPS governor calibrated for Cambodian national highways.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTruck(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold hover:bg-slate-800"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: ADD / EDIT TRUCK DETAILS WITH PHOTO UPLOAD */}
      {(showAddModal || editingTruck) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-500" />
                {editingTruck ? 'Edit Truck Specifications' : 'Add New Heavy Truck Details'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTruck(null);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingTruck ? handleUpdateTruck : handleCreateTruck} className="space-y-4 text-xs">
              {/* TRUCK PHOTO UPLOAD */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-500" />
                    <span>Truck Image / Photo</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Upload file or paste image link</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Photo Preview */}
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-950 border border-amber-500/40 relative shrink-0 shadow-md">
                    <img
                      src={formData.image_url || DEFAULT_TRUCK_IMAGE}
                      alt="Truck Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = DEFAULT_TRUCK_IMAGE;
                      }}
                    />
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload Photo File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>

                      <span className="text-[10px] text-slate-400">or paste URL:</span>
                    </div>

                    <input
                      type="url"
                      placeholder="https://example.com/truck-photo.jpg"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* SPECIFICATION INPUTS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    License Plate Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PP-3D-8890"
                    value={formData.plate_number}
                    onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Truck Model & Engine
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Scania R450 40ft Container Truck"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Truck Category
                  </label>
                  <select
                    value={formData.truck_type}
                    onChange={(e) => setFormData({ ...formData, truck_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Container Heavy Trailer (25T)">Container Heavy Trailer (25T)</option>
                    <option value="Medium Cargo Truck (8T)">Medium Cargo Truck (8T)</option>
                    <option value="Refrigerated Cold Truck (10T)">Refrigerated Cold Truck (10T)</option>
                    <option value="Heavy Flatbed (30T)">Heavy Flatbed (30T)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Max Payload Weight (Tons)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>

              {/* DRIVER DETAIL SECTION (SELECT FROM STAFF OR LEAVE BLANK) */}
              <div className="sm:col-span-2 p-4 rounded-2xl bg-amber-500/5 dark:bg-slate-800/80 border border-amber-500/20 dark:border-slate-700/80 space-y-3.5">
                <div className="flex items-center justify-between border-b border-amber-500/10 dark:border-slate-700/50 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                      <User className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                        Driver Details (ព័ត៌មានលម្អិតអ្នកបើកបរ)
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Select an assigned driver from company staff, enter custom credentials, or leave blank to assign later
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(formData.assigned_driver_name || (formData.assigned_driver_staff_id && formData.assigned_driver_staff_id !== 'none')) && (
                      <button
                        type="button"
                        onClick={handleRemoveDriverFromForm}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 transition-all flex items-center gap-1 shadow-xs"
                        title="Remove driver and leave truck blank to assign later"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Remove Driver (ដកចេញ)</span>
                      </button>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {formData.assigned_driver_staff_id === 'none' || !formData.assigned_driver_name ? 'Unassigned' : 'Select from Staff'}
                    </span>
                  </div>
                </div>

                {/* Staff Dropdown Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs">
                      Choose Driver from Staff (ជ្រើសរើសពីបញ្ជីបុគ្គលិក)
                    </label>
                    <span className="text-[10px] text-slate-400 font-normal">
                      (Optional — can be blank to assign later)
                    </span>
                  </div>
                  <select
                    value={formData.assigned_driver_staff_id || 'none'}
                    onChange={(e) => handleStaffDriverSelect(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="none">🚫 No Driver Assigned / Blank (Assign Later) (មិនទាន់ចាត់តាំងអ្នកបើកបរ)</option>
                    {driversList.length > 0 && (
                      <optgroup label="🚚 Company Drivers (បុគ្គលិកបើកបរ)">
                        {driversList.map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.full_name || driver.name} {driver.khmer_name ? `(${driver.khmer_name})` : ''} • {driver.phone || 'No phone'}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {otherStaffList.length > 0 && (
                      <optgroup label="👥 Other Staff Members (បុគ្គលិកផ្សេងទៀត)">
                        {otherStaffList.map((staff) => (
                          <option key={staff.id} value={staff.id}>
                            {staff.full_name || staff.name} • {staff.role?.toUpperCase() || 'STAFF'} • {staff.phone || 'No phone'}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <option value="custom">✍️ Custom / External Driver (Manual Entry)</option>
                  </select>
                </div>

                {/* If No Driver Assigned / Blank Banner */}
                {(formData.assigned_driver_staff_id === 'none' || (!formData.assigned_driver_name && formData.assigned_driver_staff_id !== 'custom')) && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                        <UserX className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                          Blank Driver (គ្មានអ្នកបើកបរ)
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                            Can Assign Later
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          This truck will be saved with no driver assigned. You can assign a company staff driver or custom driver later.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Staff Info Card */}
                {currentSelectedStaff && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/30 dark:border-emerald-500/20 shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={
                          formData.assigned_driver_avatar ||
                          currentSelectedStaff.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.assigned_driver_name || 'Driver')}&background=f59e0b&color=0f172a`
                        }
                        alt={formData.assigned_driver_name}
                        className="w-11 h-11 rounded-xl object-cover border-2 border-emerald-500/40 shadow-xs shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">
                            {formData.assigned_driver_name}
                          </span>
                          {currentSelectedStaff.khmer_name && (
                            <span className="text-[10px] text-amber-500 font-normal">
                              ({currentSelectedStaff.khmer_name})
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            Linked Staff
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {formData.assigned_driver_phone || 'No phone'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {formData.assigned_driver_email || 'No email'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveDriverFromForm}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-all shrink-0 ml-2"
                      title="Unlink driver from truck"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Driver Inputs Grid (Auto-populated from staff, editable if needed) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                      Driver Full Name {formData.assigned_driver_staff_id !== 'none' && formData.assigned_driver_name && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type="text"
                      required={formData.assigned_driver_staff_id !== 'none' && Boolean(formData.assigned_driver_name)}
                      placeholder={formData.assigned_driver_staff_id === 'none' ? 'No driver assigned (blank)' : 'e.g. Dara Chan'}
                      value={formData.assigned_driver_name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          assigned_driver_name: val,
                          assigned_driver_staff_id: val ? (formData.assigned_driver_staff_id === 'none' ? 'custom' : formData.assigned_driver_staff_id) : 'none',
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                      Driver Phone Number {formData.assigned_driver_staff_id !== 'none' && formData.assigned_driver_name && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type="tel"
                      required={formData.assigned_driver_staff_id !== 'none' && Boolean(formData.assigned_driver_name)}
                      placeholder={formData.assigned_driver_staff_id === 'none' ? 'No phone (blank)' : 'e.g. +855 98 777 001'}
                      value={formData.assigned_driver_phone}
                      onChange={(e) => setFormData({ ...formData, assigned_driver_phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                      Driver Corporate Email
                    </label>
                    <input
                      type="email"
                      placeholder={formData.assigned_driver_staff_id === 'none' ? 'No email (blank)' : 'e.g. dara.chan@voleakexpress.com'}
                      value={formData.assigned_driver_email}
                      onChange={(e) => setFormData({ ...formData, assigned_driver_email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

                {/* GPS TRACKER HARDWARE PAIRING */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-amber-500/5 dark:bg-slate-800/80 border border-amber-500/30 dark:border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-500/20 dark:border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Satellite className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="font-black text-xs text-slate-900 dark:text-white">
                          GPS Satellite Hardware Pairing (ផ្ជាប់ឧបករណ៍ GPS ផ្កាយរណប)
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Assign a DAGPS tracker / IMEI to stream real-time coordinates and speed for this truck
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsGpsModalOpen(true)}
                      className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Radio className="w-3 h-3 text-emerald-500" /> Manage All Trackers
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Choose GPS Device (ជ្រើសរើសឧបករណ៍ GPS):
                    </label>
                    <select
                      value={formData.gps_imei || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const matchedDev = availableGpsDevices.find((d) => d.imei === val);
                        setFormData((prev) => ({
                          ...prev,
                          gps_imei: val,
                          gps_device_name: matchedDev?.userName || matchedDev?.deviceModel || prev.gps_device_name,
                        }));
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="">— No GPS Hardware Assigned (Unpaired) —</option>
                      {availableGpsDevices.map((dev) => {
                        const currentAssignedPlate = gpsAssignments[dev.imei];
                        const isThisTruck = currentAssignedPlate === formData.plate_number;
                        const isOtherTruck = currentAssignedPlate && !isThisTruck;
                        return (
                          <option key={dev.imei || dev.id} value={dev.imei}>
                            🛰️ {dev.userName || dev.deviceModel || 'GPS Tracker'} • IMEI: {dev.imei}
                            {isThisTruck ? ' — [Currently assigned to this truck]' : ''}
                            {isOtherTruck ? ` — [Assigned to: ${currentAssignedPlate}]` : ''}
                            {dev.battery ? ` • Battery: ${dev.battery}%` : ''}
                          </option>
                        );
                      })}
                      <option value="custom_manual">✍️ Enter Custom GPS Tracker IMEI manually...</option>
                    </select>

                    {(formData.gps_imei === 'custom_manual' || (formData.gps_imei && !availableGpsDevices.some((d) => d.imei === formData.gps_imei))) && (
                      <div className="pt-1.5 space-y-1">
                        <label className="block text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                          Enter Hardware IMEI (15 digits):
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 358878731425895"
                          value={formData.gps_imei === 'custom_manual' ? '' : formData.gps_imei}
                          onChange={(e) => setFormData((prev) => ({ ...prev, gps_imei: e.target.value.trim() }))}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/50 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    )}

                    {formData.gps_imei && formData.gps_imei !== 'custom_manual' && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                            IMEI: {formData.gps_imei}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          Telemetry will stream to this truck
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Operational Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="active">Active (On Highway)</option>
                    <option value="maintenance">Under Maintenance</option>
                    <option value="retired">Out of Service</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingTruck(null);
                  }}
                  className="px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && (
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>
                    {isSubmitting
                      ? 'Saving to Supabase...'
                      : editingTruck
                      ? 'Update Truck Details'
                      : 'Save Truck Details'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. SWEETALERT DELETE ANIMATION MODAL */}
      <SweetAlertModal
        isOpen={Boolean(deletingTruck)}
        title="Delete Truck from Fleet?"
        text={`Are you sure you want to remove truck "${deletingTruck?.plate_number} (${deletingTruck?.model})"? All associated manifest links will be detached.`}
        confirmButtonText="Yes, Delete Truck"
        cancelButtonText="Cancel"
        onConfirm={handleDeleteTruck}
        onCancel={() => setDeletingTruck(null)}
      />

      {/* 8. DAGPS HARDWARE ASSIGNMENT MODAL */}
      <DagpsConfigModal
        isOpen={isGpsModalOpen}
        onClose={() => {
          setIsGpsModalOpen(false);
          setGpsAssignments(getDeviceAssignments());
          setAvailableGpsDevices(getCachedGpsDevices());
        }}
        trucks={buses}
        onAssignmentChange={() => {
          setGpsAssignments(getDeviceAssignments());
          setAvailableGpsDevices(getCachedGpsDevices());
        }}
      />
    </div>
  );
}
