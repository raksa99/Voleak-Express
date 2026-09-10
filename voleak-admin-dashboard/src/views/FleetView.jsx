import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { addLocalBus, updateLocalBus, deleteLocalBus } from '../lib/supabaseClient';
import SweetAlertModal from '../components/SweetAlertModal';

const DEFAULT_TRUCK_IMAGE =
  'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80';

export default function FleetView({ buses = [], setBuses }) {
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [deletingTruck, setDeletingTruck] = useState(null);
  const [selectedTruck, setSelectedTruck] = useState(null);

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
    assigned_driver_name: 'Dara Chan',
    assigned_driver_phone: '+855 98 777 001',
    assigned_driver_email: 'driver.dara@voleakexpress.com',
    engine_power: '450 HP Diesel',
    next_inspection_date: '2026-12-31',
    insurance_policy_number: 'VKX-INS-8849-KH',
  });

  const resetForm = () => {
    setFormData({
      plate_number: '',
      model: '',
      capacity: 28,
      status: 'active',
      truck_type: 'Container Heavy Trailer (25T)',
      image_url: DEFAULT_TRUCK_IMAGE,
      assigned_driver_name: 'Dara Chan',
      assigned_driver_phone: '+855 98 777 001',
      assigned_driver_email: 'driver.dara@voleakexpress.com',
      engine_power: '450 HP Diesel',
      next_inspection_date: '2026-12-31',
      insurance_policy_number: 'VKX-INS-8849-KH',
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (truck) => {
    setEditingTruck(truck);
    setFormData({
      plate_number: truck.plate_number || '',
      model: truck.model || '',
      capacity: Number(truck.capacity || truck.capacity_tons) || 25,
      status: truck.status || 'active',
      truck_type: truck.truck_type || 'Container Heavy Trailer (25T)',
      image_url: truck.image_url || truck.photo_url || DEFAULT_TRUCK_IMAGE,
      assigned_driver_name: truck.assigned_driver_name || 'Dara Chan',
      assigned_driver_phone: truck.assigned_driver_phone || '+855 98 777 001',
      assigned_driver_email:
        truck.assigned_driver_email ||
        `${(truck.assigned_driver_name || 'driver').toLowerCase().replace(/\s+/g, '.')}@voleakexpress.com`,
      engine_power: truck.engine_power || '450 HP Diesel',
      next_inspection_date: truck.next_inspection_date || '2026-12-31',
      insurance_policy_number: truck.insurance_policy_number || 'VKX-INS-8849-KH',
    });
  };

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
    if (!formData.plate_number || !formData.model) return;

    const payload = {
      ...formData,
      capacity: Number(formData.capacity),
      capacity_tons: Number(formData.capacity),
      operator_id: 'op-1',
    };

    const newTruck = await addLocalBus(payload);
    setBuses([newTruck, ...buses]);
    setShowAddModal(false);
    resetForm();
  };

  const handleUpdateTruck = async (e) => {
    e.preventDefault();
    if (!editingTruck || !formData.plate_number) return;

    const payload = {
      ...formData,
      capacity: Number(formData.capacity),
      capacity_tons: Number(formData.capacity),
    };

    if (updateLocalBus) {
      await updateLocalBus(editingTruck.id, payload);
    }

    setBuses(
      buses.map((b) => (b.id === editingTruck.id ? { ...b, ...payload } : b))
    );
    setEditingTruck(null);
    resetForm();
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

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Truck Details</span>
        </button>
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
          const driverPhone = truck.assigned_driver_phone || '+855 98 777 001';
          const driverEmail =
            truck.assigned_driver_email ||
            `${(truck.assigned_driver_name || 'driver').toLowerCase().replace(/\s+/g, '.')}@voleakexpress.com`;

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

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-sky-500" /> Assigned Driver:
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {truck.assigned_driver_name || 'Dara Chan'}
                    </span>
                  </div>

                  {/* Driver Telephone */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" /> Driver Phone:
                    </span>
                    <a
                      href={`tel:${driverPhone}`}
                      className="font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      {driverPhone}
                    </a>
                  </div>

                  {/* Driver Email */}
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
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setSelectedTruck(truck)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Details</span>
                  </button>

                  <button
                    onClick={() => openEditModal(truck)}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-500/10 hover:text-sky-500 text-slate-400 transition-all"
                    title="Edit Truck Specs & Photo"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

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

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <span className="text-slate-400 text-[10px] block">Assigned Driver</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedTruck.assigned_driver_name || 'Dara Chan'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <span className="text-slate-400 text-[10px] block">Driver Telephone</span>
                <span className="font-mono font-bold text-emerald-500">
                  {selectedTruck.assigned_driver_phone || '+855 98 777 001'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 sm:col-span-2">
                <span className="text-slate-400 text-[10px] block">Driver Corporate Email</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {selectedTruck.assigned_driver_email ||
                    `${(selectedTruck.assigned_driver_name || 'driver').toLowerCase().replace(/\s+/g, '.')}@voleakexpress.com`}
                </span>
              </div>

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

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Driver Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dara Chan"
                    value={formData.assigned_driver_name}
                    onChange={(e) => setFormData({ ...formData, assigned_driver_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Driver Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +855 98 777 001"
                    value={formData.assigned_driver_phone}
                    onChange={(e) => setFormData({ ...formData, assigned_driver_phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Driver Corporate Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. dara.chan@voleakexpress.com"
                    value={formData.assigned_driver_email}
                    onChange={(e) => setFormData({ ...formData, assigned_driver_email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
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
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-lg shadow-amber-500/25"
                >
                  {editingTruck ? 'Update Truck Details' : 'Save Truck Details'}
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
    </div>
  );
}
