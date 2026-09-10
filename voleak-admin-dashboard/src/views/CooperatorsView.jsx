import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Handshake,
  Building2,
  Building,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Truck,
  Package,
  Calendar,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  Star,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  DollarSign,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Warehouse,
  ArrowRight,
  Navigation,
  Scale,
  Route as RouteIcon,
} from 'lucide-react';
import {
  fetchCooperators,
  addLocalCooperator,
  updateLocalCooperator,
  deleteLocalCooperator,
  DEFAULT_OPERATORS,
  DEFAULT_ROUTES,
} from '../lib/supabaseClient';
import SweetAlertModal from '../components/SweetAlertModal';

export default function CooperatorsView({
  cooperators = [],
  setCooperators,
  operators = [],
  routes = [],
  searchVal = '',
  setActiveTab,
}) {
  const { t } = useLanguage();

  const allOperators = operators && operators.length > 0 ? operators : DEFAULT_OPERATORS;
  const allRoutes = routes && routes.length > 0 ? routes : DEFAULT_ROUTES;

  // Local state if not provided from props
  const [localList, setLocalList] = useState(cooperators || []);
  const items = cooperators && cooperators.length > 0 ? cooperators : localList || [];
  const updateList = setCooperators || setLocalList;

  const [industryFilter, setIndustryFilter] = useState('all');
  const [hubFilter, setHubFilter] = useState('all');
  const [selectedCooperator, setSelectedCooperator] = useState(null);
  const [detailTab, setDetailTab] = useState('overview'); // 'overview' | 'shipments' | 'financials'
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCooperator, setEditingCooperator] = useState(null);
  const [deletingCooperator, setDeletingCooperator] = useState(null);

  // Form State
  const defaultHub = allOperators[0] || DEFAULT_OPERATORS[0];
  const defaultRoute = allRoutes[0] || DEFAULT_ROUTES[0];

  const initialFormState = {
    name: '',
    short_name: '',
    code: '',
    industry: 'Garments & Textiles',
    category: 'Garment & Apparel Manufacturing',
    operator_id: defaultHub?.id || 'op-1',
    hub_name: defaultHub?.name || 'Phnom Penh Central Freight Hub',
    primary_corridor: defaultRoute?.name || 'Phnom Penh Central Hub ⇄ Sihanoukville Port Deep Sea Terminal',
    contact_person: '',
    contact_title: 'Procurement & Logistics Director',
    phone: '',
    email: '',
    address: defaultHub?.address || 'Phnom Penh Special Economic Zone (PPSEZ), National Road 4',
    province: defaultHub?.province || 'Phnom Penh',
    latitude: defaultHub?.latitude || 11.5564,
    longitude: defaultHub?.longitude || 104.9282,
    tier: 'Gold Partner',
    discount_rate: '10% Off',
    payment_terms: 'Net 30 Days',
    credit_limit: 30000,
    current_balance: 0,
    tax_id: '',
    notes: '',
    status: 'active',
  };

  const [formData, setFormData] = useState(initialFormState);

  const resetForm = () => {
    setFormData(initialFormState);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (cop) => {
    setEditingCooperator(cop);
    setFormData({
      name: cop.name || '',
      short_name: cop.short_name || '',
      code: cop.code || '',
      industry: cop.industry || 'Garments & Textiles',
      category: cop.category || 'Garment & Apparel Manufacturing',
      operator_id: cop.operator_id || allOperators[0]?.id || 'op-1',
      hub_name: cop.hub_name || allOperators.find((o) => o.id === cop.operator_id)?.name || allOperators[0]?.name || '',
      primary_corridor: cop.primary_corridor || allRoutes[0]?.name || 'Phnom Penh Central Hub ⇄ Sihanoukville Port Deep Sea Terminal',
      contact_person: cop.contact_person || '',
      contact_title: cop.contact_title || 'Procurement & Logistics Director',
      phone: cop.phone || '',
      email: cop.email || '',
      address: cop.address || '',
      province: cop.province || 'Phnom Penh',
      latitude: cop.latitude || 11.5564,
      longitude: cop.longitude || 104.9282,
      tier: cop.tier || 'Gold Partner',
      discount_rate: cop.discount_rate || '10% Off',
      payment_terms: cop.payment_terms || 'Net 30 Days',
      credit_limit: cop.credit_limit || 30000,
      current_balance: cop.current_balance || 0,
      tax_id: cop.tax_id || '',
      notes: cop.notes || '',
      status: cop.status || 'active',
    });
  };

  // Helper when selecting a Hub in the Add/Edit form
  const handleHubSelect = (hubId) => {
    const selected = allOperators.find((o) => o.id === hubId);
    if (!selected) return;

    // Find a matching corridor connected to this hub
    const matchedRoute = allRoutes.find(
      (r) =>
        r.operator_id === hubId ||
        r.destination?.toLowerCase().includes(selected.name?.toLowerCase()) ||
        (selected.province && r.destination?.toLowerCase().includes(selected.province?.toLowerCase()))
    ) || allRoutes[0];

    setFormData((prev) => ({
      ...prev,
      operator_id: selected.id,
      hub_name: selected.name,
      province: selected.province || prev.province,
      address: prev.address ? prev.address : selected.address,
      latitude: selected.latitude || prev.latitude,
      longitude: selected.longitude || prev.longitude,
      primary_corridor: matchedRoute ? matchedRoute.name : prev.primary_corridor,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const genCode =
      formData.code ||
      `COP-${formData.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

    const newCop = await addLocalCooperator({
      ...formData,
      code: genCode,
      total_waybills: 0,
      total_tonnage: 0,
      total_spend: 0,
      cod_collected: 0,
      rating: 5.0,
      logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=f59e0b&color=0f172a&bold=true`,
      active_shipments: [
        {
          id: `VKX-WAY-${Math.floor(1000 + Math.random() * 9000)}`,
          destination: formData.hub_name || 'Phnom Penh Central Freight Hub',
          tonnage: '20.0 Tons',
          fee: 350,
          status: 'Scheduled',
        },
      ],
    });

    updateList([newCop, ...items]);
    setShowAddModal(false);
    resetForm();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCooperator || !formData.name) return;

    const updated = await updateLocalCooperator(editingCooperator.id, formData);
    updateList(items.map((c) => (c.id === editingCooperator.id ? { ...c, ...updated } : c)));

    if (selectedCooperator && selectedCooperator.id === editingCooperator.id) {
      setSelectedCooperator({ ...selectedCooperator, ...updated });
    }

    setEditingCooperator(null);
    resetForm();
  };

  const handleDelete = async () => {
    if (!deletingCooperator) return;
    await deleteLocalCooperator(deletingCooperator.id);
    updateList(items.filter((c) => c.id !== deletingCooperator.id));

    if (selectedCooperator && selectedCooperator.id === deletingCooperator.id) {
      setSelectedCooperator(null);
    }
    setDeletingCooperator(null);
  };

  // Filter Logic
  const filteredCooperators = useMemo(() => {
    return items.filter((cop) => {
      const matchesIndustry =
        industryFilter === 'all' || cop.industry?.toLowerCase().includes(industryFilter.toLowerCase());
      
      const matchesHub =
        hubFilter === 'all' ||
        cop.operator_id === hubFilter ||
        cop.hub_name?.toLowerCase().includes(hubFilter.toLowerCase()) ||
        cop.province?.toLowerCase().includes(hubFilter.toLowerCase());

      const query = (searchVal || '').toLowerCase().trim();
      const matchesSearch =
        !query ||
        cop.name?.toLowerCase().includes(query) ||
        (cop.short_name && cop.short_name.toLowerCase().includes(query)) ||
        cop.code?.toLowerCase().includes(query) ||
        cop.contact_person?.toLowerCase().includes(query) ||
        cop.phone?.includes(query) ||
        cop.email?.toLowerCase().includes(query) ||
        cop.address?.toLowerCase().includes(query) ||
        cop.province?.toLowerCase().includes(query) ||
        cop.hub_name?.toLowerCase().includes(query) ||
        cop.primary_corridor?.toLowerCase().includes(query);

      return matchesIndustry && matchesHub && matchesSearch;
    });
  }, [items, industryFilter, hubFilter, searchVal]);

  // KPI Computations
  const totalCooperators = items.length;
  const totalTonnage = items.reduce((acc, curr) => acc + (Number(curr.total_tonnage) || 0), 0);
  const totalFreightSpend = items.reduce((acc, curr) => acc + (Number(curr.total_spend) || 0), 0);
  const totalCodDisbursed = items.reduce((acc, curr) => acc + (Number(curr.cod_collected) || 0), 0);

  const getTierBadge = (tierName) => {
    const t = (tierName || '').toLowerCase();
    if (t.includes('platinum') || t.includes('vip')) {
      return {
        label: tierName || 'VIP Platinum',
        cls: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
      };
    }
    if (t.includes('gold')) {
      return {
        label: tierName || 'Gold Partner',
        cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      };
    }
    if (t.includes('silver')) {
      return {
        label: tierName || 'Silver Partner',
        cls: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/30',
      };
    }
    return {
      label: tierName || 'Standard Enterprise',
      cls: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
    };
  };

  // Find linked hub object for a given cooperator
  const getLinkedHub = (cop) => {
    if (!cop) return allOperators[0];
    return (
      allOperators.find((o) => o.id === cop.operator_id) ||
      allOperators.find((o) => o.name === cop.hub_name) ||
      allOperators.find((o) => o.province && cop.province && o.province.toLowerCase() === cop.province.toLowerCase()) ||
      allOperators[0]
    );
  };

  // Find linked corridor route for a given cooperator
  const getLinkedRoute = (cop) => {
    if (!cop) return allRoutes[0];
    return (
      allRoutes.find((r) => r.name === cop.primary_corridor) ||
      allRoutes.find((r) => r.destination?.toLowerCase().includes(cop.province?.toLowerCase())) ||
      allRoutes[0]
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-sky-500/10 dark:from-amber-500/10 dark:via-slate-900/90 dark:to-sky-950/40 border border-amber-500/30 shadow-lg backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/30 shrink-0">
            <Handshake className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              {t('cooperatorsTitle') || 'Cooperators & Enterprise SEZ Clients'}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Partner manufacturing plants, SEZ corporate accounts, connected freight corridors, and multi-hub logistics contracts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {setActiveTab && (
            <button
              onClick={() => setActiveTab('operators')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              <Building2 className="w-4 h-4 text-amber-500" />
              <span>SEZ Hubs & Corridors</span>
            </button>
          )}

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg shadow-amber-500/25 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('addCooperatorBtn') || '+ Add Cooperator'}</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Enterprise Partners</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalCooperators}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Shipped Tonnage</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {totalTonnage.toLocaleString()} <span className="text-xs font-bold text-slate-400">Tons</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Freight Billed</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              ${totalFreightSpend.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">COD Collected</p>
            <p className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
              ${totalCodDisbursed.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Industries' },
            { id: 'Garments', label: 'Garments & Apparel' },
            { id: 'Electronics', label: 'Electronics & Tech' },
            { id: 'Agriculture', label: 'Agriculture & Produce' },
            { id: 'Food', label: 'Food & Beverage' },
            { id: 'Manufacturing', label: 'Industrial' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setIndustryFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                industryFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Hub Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Warehouse className="w-3.5 h-3.5 text-amber-500" />
          <select
            value={hubFilter}
            onChange={(e) => setHubFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All SEZ Hubs & Regions</option>
            {allOperators.map((hub) => (
              <option key={hub.id} value={hub.id}>
                {hub.name} ({hub.province})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cooperators Data Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5 rounded-l-xl">Cooperator / Enterprise Client</th>
                <th className="p-3.5">Designated SEZ Hub</th>
                <th className="p-3.5">Primary Corridor</th>
                <th className="p-3.5">Key Contact</th>
                <th className="p-3.5">Partner Tier</th>
                <th className="p-3.5">Shipped Mass</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCooperators.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No cooperators found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCooperators.map((cop) => {
                  const tierBadge = getTierBadge(cop.tier);
                  const linkedHub = getLinkedHub(cop);
                  const logoUrl =
                    cop.logo_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(cop.name)}&background=f59e0b&color=0f172a&bold=true`;

                  return (
                    <tr
                      key={cop.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedCooperator(cop)}
                    >
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <img
                            src={logoUrl}
                            alt={cop.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-sm"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cop.name)}&background=f59e0b&color=0f172a`;
                            }}
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                              {cop.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                              <span className="font-semibold text-amber-600 dark:text-amber-400">{cop.code}</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                {cop.province}
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Designated SEZ Hub */}
                      <td className="p-3.5">
                        <div className="flex flex-col gap-0.5 max-w-[200px]">
                          <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-semibold">
                            <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="truncate">{cop.hub_name || linkedHub?.name || 'Central Hub'}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 truncate">
                            {linkedHub?.code || 'SEZ-HUB'} • {cop.province}
                          </span>
                        </div>
                      </td>

                      {/* Primary Corridor */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 max-w-[220px]">
                          <Truck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate font-medium">{cop.primary_corridor}</span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-3.5">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{cop.contact_person}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{cop.phone}</p>
                        </div>
                      </td>

                      {/* Partner Tier */}
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block ${tierBadge.cls}`}>
                          {tierBadge.label}
                        </span>
                      </td>

                      {/* Total Tonnage */}
                      <td className="p-3.5 font-mono">
                        <p className="font-bold text-slate-900 dark:text-white">{cop.total_tonnage || 0} T</p>
                        <p className="text-[10px] text-slate-400">{cop.total_waybills || 0} waybills</p>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            cop.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}
                        >
                          {cop.status || 'active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedCooperator(cop)}
                          className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 transition-all"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(cop)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
                          title="Edit Cooperator"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                        </button>
                        <button
                          onClick={() => setDeletingCooperator(cop)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-all"
                          title="Delete Cooperator"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DETAILED VIEW MODAL / SLIDE-OVER FOR COOPERATOR */}
      {/* ========================================================================= */}
      {selectedCooperator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
            {/* Header Banner */}
            <div className="relative p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950 text-white rounded-t-3xl border-b border-amber-500/20 overflow-hidden">
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <button
                  onClick={() => openEditModal(selectedCooperator)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </button>
                <button
                  onClick={() => setSelectedCooperator(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
                <img
                  src={
                    selectedCooperator.logo_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCooperator.name)}&background=f59e0b&color=0f172a&bold=true`
                  }
                  alt={selectedCooperator.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500/40 shadow-xl shrink-0"
                />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {selectedCooperator.code}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {selectedCooperator.tier || 'VIP Partner'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ⭐ {selectedCooperator.rating || '4.9'} / 5.0
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight truncate text-white">
                    {selectedCooperator.name}
                  </h3>
                  <p className="text-xs text-slate-300 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      {selectedCooperator.address}, {selectedCooperator.province}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-slate-300">
                      Tax ID: {selectedCooperator.tax_id || 'K008-90182394'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Decorative Glow */}
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl"></div>
            </div>

            {/* Sub Nav Tabs */}
            <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              {[
                { id: 'overview', label: 'Company Overview & Connected Hub', icon: Building },
                { id: 'shipments', label: 'Shipment Manifests (Waybills)', icon: Package },
                { id: 'financials', label: 'Financials & Volume Analytics', icon: DollarSign },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setDetailTab(t.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                      detailTab === t.id
                        ? 'border-amber-500 text-amber-500 dark:text-amber-400'
                        : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Body Content */}
            <div className="p-6 space-y-6 flex-1">
              {/* TAB 1: OVERVIEW */}
              {detailTab === 'overview' && (
                <div className="space-y-6">
                  {/* Grid details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Primary Contact Person */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
                      <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-500" /> Key Account Contact
                      </p>
                      <div className="space-y-1">
                        <p className="text-base font-bold text-slate-900 dark:text-white">
                          {selectedCooperator.contact_person}
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                          {selectedCooperator.contact_title || 'Procurement & Logistics Director'}
                        </p>
                      </div>
                      <div className="pt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                        <p className="flex items-center gap-2 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedCooperator.phone}
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedCooperator.email}
                        </p>
                      </div>
                    </div>

                    {/* Commercial Terms & Credit */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
                      <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-500" /> Contract & Payment Terms
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-slate-400">Payment Terms</p>
                          <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                            {selectedCooperator.payment_terms || 'Net 30 Days'}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Discount Tier</p>
                          <p className="font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                            {selectedCooperator.discount_rate || '10% Corporate'}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Credit Limit</p>
                          <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                            ${(selectedCooperator.credit_limit || 30000).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Current Balance Due</p>
                          <p className="font-mono font-bold text-rose-500 mt-0.5">
                            ${(selectedCooperator.current_balance || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CONNECTED SEZ LOGISTICS HUB CARD */}
                  {(() => {
                    const linkedHub = getLinkedHub(selectedCooperator);
                    const linkedRoute = getLinkedRoute(selectedCooperator);

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Hub Card */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-50 to-orange-500/5 dark:from-amber-500/10 dark:via-slate-800/70 dark:to-slate-900 border border-amber-500/30 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
                                <Warehouse className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                  Designated SEZ Logistics Hub
                                </p>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                  {selectedCooperator.hub_name || linkedHub.name}
                                </h4>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
                              {linkedHub.code}
                            </span>
                          </div>

                          <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 pt-1">
                            <p className="flex items-start gap-2">
                              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span>{linkedHub.address}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                              <span>Operating: {linkedHub.operating_hours || '24/7 Gate Dispatch'}</span>
                            </p>
                            <div className="flex items-center justify-between text-[11px] pt-1">
                              <span className="text-slate-400">Hub Manager:</span>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {linkedHub.manager_name} ({linkedHub.manager_phone || linkedHub.contact_phone})
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">Loading Bays & Scale:</span>
                              <span className="font-semibold text-emerald-500">
                                {linkedHub.loading_bays || 12} Bays • {linkedHub.weighbridge_capacity || '80T Scale'}
                              </span>
                            </div>
                          </div>

                          {setActiveTab && (
                            <button
                              onClick={() => {
                                setSelectedCooperator(null);
                                setActiveTab('operators');
                              }}
                              className="w-full mt-2 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              <span>View Hub in Hubs & Corridors</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Corridor Card */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-500/10 via-slate-50 to-blue-500/5 dark:from-sky-500/10 dark:via-slate-800/70 dark:to-slate-900 border border-sky-500/30 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-xl bg-sky-500 text-white font-bold">
                                <Truck className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                                  Primary Logistics Corridor
                                </p>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                                  {selectedCooperator.primary_corridor || linkedRoute.name}
                                </h4>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-sky-500/20 text-sky-500 border border-sky-500/30">
                              {linkedRoute.distance_km || 230} KM
                            </span>
                          </div>

                          <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 pt-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">Estimated Transit Time:</span>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {linkedRoute.duration_hours ? `${linkedRoute.duration_hours} hrs` : '4.5 hrs'} (~
                                {linkedRoute.duration_min || 270} min)
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">Highway Corridors:</span>
                              <span className="font-semibold text-slate-900 dark:text-white">
                                National Road Logistics Network
                              </span>
                            </div>
                            {linkedRoute.stops && linkedRoute.stops.length > 0 && (
                              <div className="pt-1">
                                <p className="text-[10px] uppercase font-bold text-slate-400">Key Corridor Waypoints:</p>
                                <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5">
                                  {linkedRoute.stops.join(' ➔ ')}
                                </p>
                              </div>
                            )}
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                              {selectedCooperator.notes ||
                                'Priority container dispatch with automated customs documentation and direct SEZ gate clearance.'}
                            </p>
                          </div>

                          {setActiveTab && (
                            <button
                              onClick={() => {
                                setSelectedCooperator(null);
                                setActiveTab('operators');
                              }}
                              className="w-full mt-2 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-600 dark:text-sky-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                            >
                              <RouteIcon className="w-3.5 h-3.5" />
                              <span>View Corridor Route Details</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 2: SHIPMENTS & WAYBILLS */}
              {detailTab === 'shipments' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Recent Waybill Consignments
                    </h4>
                    <span className="text-xs text-slate-400">
                      Total {selectedCooperator.total_waybills || 0} shipments completed
                    </span>
                  </div>

                  {selectedCooperator.active_shipments && selectedCooperator.active_shipments.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                      {selectedCooperator.active_shipments.map((ship, idx) => (
                        <div
                          key={idx}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-mono font-bold text-xs">
                              <Package className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-mono font-bold text-slate-900 dark:text-white">
                                {ship.id}
                              </p>
                              <p className="text-xs text-slate-400 flex items-center gap-1">
                                <span>Destination:</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{ship.destination}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs font-mono">
                            <div>
                              <span className="text-slate-400">Tonnage: </span>
                              <span className="font-bold text-slate-900 dark:text-white">{ship.tonnage}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Fee: </span>
                              <span className="font-bold text-emerald-500">${ship.fee}</span>
                            </div>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                ship.status === 'Delivered' || ship.status === 'Completed'
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              }`}
                            >
                              {ship.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      No active shipments recorded for this partner yet.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: FINANCIALS */}
              {detailTab === 'financials' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Lifetime Freight Spend</p>
                      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                        ${(selectedCooperator.total_spend || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20">
                      <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase">Total COD Remitted</p>
                      <p className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
                        ${(selectedCooperator.cod_collected || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                      <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase">Total Shipped Mass</p>
                      <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                        {selectedCooperator.total_tonnage || 0} Tons
                      </p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Shipping Reliability & Service SLA
                    </h5>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-600 dark:text-slate-300">On-Time Highway Transit Rate</span>
                        <span className="text-emerald-500 font-bold">99.4%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="w-[99.4%] h-full bg-emerald-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Modal Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 rounded-b-3xl flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                Partner since: {selectedCooperator.joined_date || '2026-01-15'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCooperator(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT COOPERATOR MODAL */}
      {/* ========================================================================= */}
      {(showAddModal || editingCooperator) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Handshake className="w-5 h-5 text-amber-500" />
                {editingCooperator ? 'Edit Cooperator Details' : 'Add New Cooperator / Enterprise Partner'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCooperator(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingCooperator ? handleUpdate : handleCreate} className="space-y-4 text-xs">
              {/* Row 1: Company Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company / Factory Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Manhattan Textile Mills Ltd"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Short Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.short_name}
                    onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                    placeholder="e.g. Manhattan Garments"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Row 2: Designated SEZ Hub & Primary Corridor */}
              <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                      <Warehouse className="w-3.5 h-3.5" /> Designated SEZ Logistics Hub <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.operator_id}
                      onChange={(e) => handleHubSelect(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                    >
                      {allOperators.map((hub) => (
                        <option key={hub.id} value={hub.id}>
                          {hub.name} ({hub.province})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" /> Primary Freight Corridor <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.primary_corridor}
                      onChange={(e) => setFormData({ ...formData, primary_corridor: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                    >
                      {allRoutes.map((rt) => (
                        <option key={rt.id} value={rt.name}>
                          {rt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 3: Industry & Partner Tier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Industry Category
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Garments & Textiles">Garments & Textiles</option>
                    <option value="Electronics & High-Tech">Electronics & High-Tech</option>
                    <option value="Agriculture & Produce">Agriculture & Produce</option>
                    <option value="Food & Beverage / Retail">Food & Beverage / Retail</option>
                    <option value="Industrial Manufacturing">Industrial Manufacturing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Partner Tier & Commercial Terms
                  </label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="VIP Platinum">VIP Platinum (15% Off)</option>
                    <option value="Gold Partner">Gold Partner (10% Off)</option>
                    <option value="Silver Partner">Silver Partner (8% Off)</option>
                    <option value="Standard Enterprise">Standard Enterprise</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Contact details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Key Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    placeholder="e.g. Mr. Kenji Takahashi"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Title / Role
                  </label>
                  <input
                    type="text"
                    value={formData.contact_title}
                    onChange={(e) => setFormData({ ...formData, contact_title: e.target.value })}
                    placeholder="e.g. Procurement & Logistics Director"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Row 5: Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+855 23 881 200"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="procurement@company.kh"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Row 6: Address & Province */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Plant / Factory Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Phnom Penh Special Economic Zone (PPSEZ), National Road 4"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Province
                  </label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    placeholder="Phnom Penh"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Row 7: Tax ID & Credit Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    VAT / Tax ID
                  </label>
                  <input
                    type="text"
                    value={formData.tax_id}
                    onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                    placeholder="K002-98471203"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Credit Limit ($ USD)
                  </label>
                  <input
                    type="number"
                    value={formData.credit_limit}
                    onChange={(e) => setFormData({ ...formData, credit_limit: Number(e.target.value) })}
                    placeholder="30000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Form Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCooperator(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                >
                  {editingCooperator ? 'Save Changes' : 'Create Cooperator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SweetAlert Modal for Delete */}
      <SweetAlertModal
        isOpen={!!deletingCooperator}
        onClose={() => setDeletingCooperator(null)}
        onConfirm={handleDelete}
        title="Delete Cooperator / Enterprise Partner?"
        text="You won't be able to revert this! The cooperator profile, connected freight corridor allocations, and shipping account will be permanently removed."
        confirmButtonText="Yes, delete cooperator!"
        cancelButtonText="Cancel"
        itemName={deletingCooperator?.name}
        itemSubtext={`${deletingCooperator?.code} • ${deletingCooperator?.hub_name || deletingCooperator?.province}`}
        itemAvatar={deletingCooperator?.logo_url}
      />
    </div>
  );
}
