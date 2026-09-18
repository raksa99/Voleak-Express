import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  Edit2,
  Trash2,
  X,
  Check,
  Phone,
  Mail,
  Briefcase,
  Globe,
  Truck,
  Crown,
  Sparkles,
  Camera,
  Upload,
  CreditCard,
  FileText,
  CheckCircle2,
  Eye,
  Calendar,
  MapPin,
  RefreshCw,
  FileUp,
  Download,
  AlertCircle,
  XCircle,
  Crop,
  Scan,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addLocalUser, updateLocalUser, deleteLocalUser } from '../lib/supabaseClient';
import SweetAlertModal from '../components/SweetAlertModal';
import IdCardCropperModal from '../components/IdCardCropperModal';
import {
  fileToDataUrl,
  autoDetectAndCropCard,
  detectNationalIdNumber,
} from '../lib/idCardProcessor';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
];


export default function UsersView({ users = [], setUsers, searchVal = '' }) {
  const { t } = useLanguage();
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [viewingIdCardUser, setViewingIdCardUser] = useState(null);

  const profileImageInputRef = useRef(null);
  const idCardImageInputRef = useRef(null);

  // ID Card Auto-Crop & OCR State
  const [originalIdCardImage, setOriginalIdCardImage] = useState('');
  const [isCroppedView, setIsCroppedView] = useState(true);
  const [isCropperModalOpen, setIsCropperModalOpen] = useState(false);
  const [cropRect, setCropRect] = useState(null);
  const [isScanningCard, setIsScanningCard] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [detectedIdInfo, setDetectedIdInfo] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'driver',
    nationality: 'Cambodian',
    status: 'active',
    avatar: '',
    national_id: '',
    id_card_image: '',
    khmer_name: '',
    dob: '',
    gender: 'Male',
    address: '',
    id_expiry: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'driver',
      nationality: 'Cambodian',
      status: 'active',
      avatar: '',
      national_id: '',
      id_card_image: '',
      khmer_name: '',
      dob: '',
      gender: 'Male',
      address: '',
      id_expiry: '',
    });
    setOriginalIdCardImage('');
    setIsCroppedView(true);
    setCropRect(null);
    setIsScanningCard(false);
    setScanStatus('');
    setDetectedIdInfo(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    // Normalize role to one of the 3 roles
    let normalizedRole = user.role || 'driver';
    if (normalizedRole === 'admin') normalizedRole = 'super_admin';
    if (normalizedRole === 'operator_admin') normalizedRole = 'manager';
    if (!['super_admin', 'manager', 'driver'].includes(normalizedRole)) {
      normalizedRole = 'driver';
    }

    setFormData({
      name: user.full_name || user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: normalizedRole,
      nationality: user.nationality || 'Cambodian',
      status: user.status || 'active',
      avatar: user.avatar || user.avatar_url || '',
      national_id: user.national_id || '',
      id_card_image: user.id_card_image || '',
      khmer_name: user.khmer_name || '',
      dob: user.dob || '',
      gender: user.gender || 'Male',
      address: user.address || '',
      id_expiry: user.id_expiry || '',
    });
    setOriginalIdCardImage(user.id_card_image || '');
    setIsCroppedView(true);
    setDetectedIdInfo(user.national_id ? { idNumber: user.national_id, source: 'Saved Record' } : null);
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, avatar: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleIdCardUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP)');
      return;
    }

    try {
      setIsScanningCard(true);
      setScanStatus('Reading card image file...');

      const originalDataUrl = await fileToDataUrl(file);
      setOriginalIdCardImage(originalDataUrl);

      // 1. Auto-detect card boundaries & crop to ID-1 aspect ratio
      setScanStatus('Detecting ID card edges & auto-cropping...');
      const cropRes = await autoDetectAndCropCard(originalDataUrl);
      const croppedUrl = cropRes.croppedDataUrl;
      setCropRect(cropRes.cropRect);
      setIsCroppedView(true);

      setFormData((prev) => ({
        ...prev,
        id_card_image: croppedUrl,
      }));

      // 2. Auto-detect National ID Number using OCR
      setScanStatus('Scanning & recognizing National ID number...');
      const ocrRes = await detectNationalIdNumber(croppedUrl, (p) => {
        if (p.message) setScanStatus(p.message);
      });

      if (ocrRes.success && ocrRes.idNumber) {
        setFormData((prev) => ({
          ...prev,
          national_id: ocrRes.idNumber,
          name: prev.name ? prev.name : (ocrRes.fullName || prev.name),
        }));
        setDetectedIdInfo({
          idNumber: ocrRes.idNumber,
          source: ocrRes.source,
          name: ocrRes.fullName,
        });
        setScanStatus(`National ID Detected: ${ocrRes.idNumber}`);
      } else {
        setDetectedIdInfo(null);
        setScanStatus('Card auto-cropped successfully.');
      }
    } catch (err) {
      console.error('[ID Card Processing Error]', err);
    } finally {
      setIsScanningCard(false);
      if (idCardImageInputRef.current) idCardImageInputRef.current.value = '';
    }
  };

  const handleApplyManualCrop = async (newCroppedUrl, newPixelRect) => {
    setCropRect(newPixelRect);
    setIsCroppedView(true);
    setFormData((prev) => ({
      ...prev,
      id_card_image: newCroppedUrl,
    }));

    // Re-run OCR on the adjusted crop
    try {
      setIsScanningCard(true);
      setScanStatus('Scanning cropped area for National ID Number...');
      const ocrRes = await detectNationalIdNumber(newCroppedUrl, (p) => {
        if (p.message) setScanStatus(p.message);
      });
      if (ocrRes.success && ocrRes.idNumber) {
        setFormData((prev) => ({
          ...prev,
          national_id: ocrRes.idNumber,
          name: prev.name ? prev.name : (ocrRes.fullName || prev.name),
        }));
        setDetectedIdInfo({
          idNumber: ocrRes.idNumber,
          source: ocrRes.source,
          name: ocrRes.fullName,
        });
        setScanStatus(`National ID Detected: ${ocrRes.idNumber}`);
      }
    } catch (err) {
      console.error('[OCR Re-scan Error]', err);
    } finally {
      setIsScanningCard(false);
    }
  };

  const handleRescanOcr = async () => {
    const targetImg = isCroppedView ? formData.id_card_image : (originalIdCardImage || formData.id_card_image);
    if (!targetImg) return;

    try {
      setIsScanningCard(true);
      setScanStatus('Re-scanning National ID Number...');
      const ocrRes = await detectNationalIdNumber(targetImg, (p) => {
        if (p.message) setScanStatus(p.message);
      });
      if (ocrRes.success && ocrRes.idNumber) {
        setFormData((prev) => ({
          ...prev,
          national_id: ocrRes.idNumber,
          name: prev.name ? prev.name : (ocrRes.fullName || prev.name),
        }));
        setDetectedIdInfo({
          idNumber: ocrRes.idNumber,
          source: ocrRes.source,
          name: ocrRes.fullName,
        });
        setScanStatus(`National ID Detected: ${ocrRes.idNumber}`);
      } else {
        alert('Could not clearly detect an ID number. Please enter it manually below.');
      }
    } catch (err) {
      console.error('[OCR Error]', err);
    } finally {
      setIsScanningCard(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=f59e0b&color=0f172a&bold=true`;
    const newUserPayload = {
      ...formData,
      full_name: formData.name,
      name: formData.name,
      avatar: formData.avatar || defaultAvatar,
    };

    const savedUser = await addLocalUser(newUserPayload);
    setUsers([savedUser, ...users]);
    setShowAddModal(false);
    resetForm();
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser || !formData.name) return;

    const updates = {
      full_name: formData.name,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      nationality: formData.nationality,
      status: formData.status,
      avatar: formData.avatar,
      national_id: formData.national_id,
      id_card_image: formData.id_card_image,
      khmer_name: formData.khmer_name,
      dob: formData.dob,
      gender: formData.gender,
      address: formData.address,
      id_expiry: formData.id_expiry,
    };

    await updateLocalUser(editingUser.id, updates);
    setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, ...updates } : u)));
    setEditingUser(null);
    resetForm();
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    await deleteLocalUser(deletingUser.id);
    setUsers(users.filter((u) => u.id !== deletingUser.id));
    setDeletingUser(null);
  };

  const toggleUserStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    await updateLocalUser(user.id, { status: nextStatus });
    setUsers(
      users.map((u) =>
        u.id === user.id ? { ...u, status: nextStatus } : u
      )
    );
  };

  // Filter logic for the 3 roles: Super Admin, Manager, Driver
  const filteredUsers = users.filter((u) => {
    const r = (u.role || '').toLowerCase();
    const matchesRole =
      roleFilter === 'all' ||
      (roleFilter === 'super_admin' && (r === 'super_admin' || r === 'admin')) ||
      (roleFilter === 'manager' && (r === 'manager' || r === 'operator_admin')) ||
      (roleFilter === 'driver' && (r === 'driver' || r === 'conductor' || r === 'corporate' || r === 'passenger'));

    const query = (searchVal || '').toLowerCase().trim();
    const matchesSearch =
      !query ||
      (u.full_name || u.name || '').toLowerCase().includes(query) ||
      (u.email || '').toLowerCase().includes(query) ||
      (u.phone || '').includes(query) ||
      (u.role || '').toLowerCase().includes(query);

    return matchesRole && matchesSearch;
  });

  const getRoleBadge = (roleName) => {
    switch (roleName) {
      case 'super_admin':
      case 'admin':
        return {
          label: 'Super Admin',
          cls: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
        };
      case 'manager':
      case 'operator_admin':
        return {
          label: 'Manager',
          cls: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
        };
      case 'driver':
      default:
        return {
          label: 'Driver',
          cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        };
    }
  };

  // KPI Metrics for the 3 roles + Total Staff
  const superAdminCount = users.filter((u) => u.role === 'super_admin' || u.role === 'admin').length;
  const managerCount = users.filter((u) => u.role === 'manager' || u.role === 'operator_admin').length;
  const driverCount = users.filter((u) => u.role === 'driver' || (!['super_admin', 'admin', 'manager', 'operator_admin'].includes(u.role))).length;
  const totalStaffCount = users.length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            {t('usersTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('usersSubtitle')}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg shadow-amber-500/25 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          {t('addUserBtn')}
        </button>
      </div>

      {/* 4 KPI Metric Cards: 3 Roles + Total Staff */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Super Admins</p>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{superAdminCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Managers</p>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{managerCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Drivers</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{driverCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Total Staff</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{totalStaffCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Role Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        {/* 3 Roles + All Staff Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: t('filterAllRoles') },
            { id: 'super_admin', label: 'Super Admin' },
            { id: 'manager', label: 'Manager' },
            { id: 'driver', label: 'Driver' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                roleFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Data Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5 rounded-l-xl">{t('thName')}</th>
                <th className="p-3.5">{t('thRole')}</th>
                <th className="p-3.5">National ID (អត្តសញ្ញាណប័ណ្ណ)</th>
                <th className="p-3.5">{t('thPhone')}</th>
                <th className="p-3.5">{t('thEmail')}</th>
                <th className="p-3.5">{t('thStatus')}</th>
                <th className="p-3.5 rounded-r-xl text-right">{t('thActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No staff members found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  const displayName = user.full_name || user.name || 'Unnamed Staff';
                  const avatarUrl =
                    user.avatar ||
                    user.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f59e0b&color=0f172a&bold=true`;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-sm"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f59e0b&color=0f172a`;
                            }}
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {displayName}
                              {user.khmer_name && (
                                <span className="text-[11px] font-normal text-amber-500 font-sans">
                                  ({user.khmer_name})
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400 font-normal">
                              {user.nationality || 'Cambodian'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block ${roleBadge.cls}`}
                        >
                          {roleBadge.label}
                        </span>
                      </td>

                      <td className="p-3.5">
                        {user.id_card_image || user.national_id ? (
                          <button
                            onClick={() => setViewingIdCardUser(user)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-[11px] font-medium transition-all group shadow-sm"
                            title="Click to view Cambodian National ID Card image"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-sky-500 group-hover:scale-110 transition-transform" />
                            <span>{user.national_id || 'ID Card Image'}</span>
                            <Eye className="w-3 h-3 text-sky-400 opacity-60 group-hover:opacity-100" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 inline-block" />
                            No ID image
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                        {user.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {user.phone}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-500 dark:text-slate-400">
                        {user.email ? (
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            {user.email}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            user.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          }`}
                        >
                          {user.status || 'active'}
                        </span>
                      </td>

                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => toggleUserStatus(user)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
                          title={user.status === 'active' ? 'Suspend Staff' : 'Activate Staff'}
                        >
                          {user.status === 'active' ? (
                            <UserX className="w-3.5 h-3.5 text-rose-400" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
                          title="Edit Staff Member"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                        </button>
                        <button
                          onClick={() => setDeletingUser(user)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-all"
                          title="Delete Staff Member"
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

      {/* Add / Edit Staff Modal */}
      {(showAddModal || editingUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-3xl p-5 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Users className="w-4 h-4" />
                  </span>
                  {editingUser ? 'Edit Staff Profile' : 'Add New Staff Member'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Upload profile photo and import Cambodian National ID Card (អត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរ)
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingUser(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-6 text-xs">
              {/* SECTION 1: PROFILE PICTURE */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-500" />
                    Staff Profile Photo (រូបថតបុគ្គលិក)
                  </label>
                  {formData.avatar && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: '' })}
                      className="text-[11px] text-rose-500 hover:text-rose-600 flex items-center gap-1 font-medium"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Remove photo
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {/* Photo Avatar Preview with Upload Trigger */}
                  <div className="relative group shrink-0">
                    <img
                      src={
                        formData.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'Staff')}&background=f59e0b&color=0f172a&bold=true`
                      }
                      alt="Avatar Preview"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500/50 shadow-md bg-slate-200 dark:bg-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => profileImageInputRef.current?.click()}
                      className="absolute inset-0 rounded-2xl bg-slate-950/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs text-[10px] font-semibold"
                    >
                      <Camera className="w-5 h-5 mb-0.5 text-amber-400" />
                      Change
                    </button>
                  </div>

                  <div className="flex-1 space-y-2.5 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <input
                        type="file"
                        ref={profileImageInputRef}
                        onChange={handleProfileImageUpload}
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => profileImageInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-amber-500 font-semibold shadow-xs transition-all text-xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-500" />
                        Upload Custom Photo
                      </button>
                      <span className="text-[11px] text-slate-400">PNG, JPG, WEBP (max 5MB)</span>
                    </div>

                    {/* Quick Avatar Presets */}
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1.5">
                        Or select quick avatar preset:
                      </span>
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        {AVATAR_PRESETS.map((presetUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormData({ ...formData, avatar: presetUrl })}
                            className={`w-7 h-7 rounded-xl overflow-hidden border-2 transition-all hover:scale-110 ${
                              formData.avatar === presetUrl
                                ? 'border-amber-500 ring-2 ring-amber-500/30'
                                : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={presetUrl} alt="Preset" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CORE STAFF INFORMATION */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                  <Users className="w-3.5 h-3.5 text-amber-500" />
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    Core Staff Information
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name (Latin) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Sokha Meng"
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      System Role <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="manager">Manager</option>
                      <option value="driver">Driver</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+855 12 345 678"
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="staff@voleakexpress.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Account Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nationality
                    </label>
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      placeholder="Cambodian"
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: CAMBODIAN NATIONAL ID CARD IMAGE IMPORT WITH AUTO-CROP & AUTO-DETECT OCR */}
              <div className="p-4 rounded-2xl bg-sky-950/10 dark:bg-sky-950/30 border border-sky-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-sky-600 dark:text-sky-400 flex items-center gap-2 text-xs">
                      <CreditCard className="w-4 h-4 text-sky-500" />
                      Cambodian National ID Card (អត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរ)
                    </label>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Auto-detects card edges, auto-crops to 1.58:1 ratio, and auto-detects National ID number
                    </p>
                  </div>
                  {formData.id_card_image && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, id_card_image: '', national_id: '' });
                        setOriginalIdCardImage('');
                        setDetectedIdInfo(null);
                      }}
                      className="text-[11px] text-rose-500 hover:text-rose-600 flex items-center gap-1 font-medium"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Remove image
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={idCardImageInputRef}
                  onChange={handleIdCardUpload}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />

                {formData.id_card_image ? (
                  <div className="space-y-2.5">
                    {/* Top Action & Detection Status Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/60 border border-sky-500/20 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] border border-emerald-500/30">
                          <Sparkles className="w-3 h-3 text-emerald-500 animate-pulse" />
                          Auto-Cropped Card (1.58:1)
                        </span>
                        {detectedIdInfo && (
                          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-400 font-mono text-[10px]">
                            ID: {detectedIdInfo.idNumber}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {originalIdCardImage && (
                          <button
                            type="button"
                            onClick={() => setIsCroppedView(!isCroppedView)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-[11px] transition-colors border border-white/10"
                            title="Toggle between auto-cropped card and original full photo"
                          >
                            <Eye className="w-3 h-3 text-sky-400" />
                            <span>{isCroppedView ? 'View Original' : 'View Cropped'}</span>
                          </button>
                        )}

                        {originalIdCardImage && (
                          <button
                            type="button"
                            onClick={() => setIsCropperModalOpen(true)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-semibold text-[11px] transition-colors border border-sky-500/30"
                            title="Adjust crop area manually"
                          >
                            <Crop className="w-3 h-3 text-sky-400" />
                            <span>Adjust Crop</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={handleRescanOcr}
                          disabled={isScanningCard}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 font-semibold text-[11px] transition-colors border border-amber-500/30 disabled:opacity-50"
                          title="Re-scan card for National ID number"
                        >
                          <RefreshCw className={`w-3 h-3 ${isScanningCard ? 'animate-spin' : ''}`} />
                          <span>Re-scan</span>
                        </button>
                      </div>
                    </div>

                    {/* Card Preview with Scanning Beam Animation */}
                    <div className="relative group rounded-2xl overflow-hidden border border-sky-500/30 bg-slate-950 p-2 flex items-center justify-center min-h-[160px] max-h-72 shadow-lg">
                      <img
                        src={isCroppedView ? formData.id_card_image : (originalIdCardImage || formData.id_card_image)}
                        alt="Imported Cambodian National ID Card"
                        className="max-h-64 w-auto object-contain rounded-xl shadow-md transition-transform duration-300"
                      />

                      {/* Laser Scanning Animation Overlay */}
                      {isScanningCard && (
                        <div className="absolute inset-0 bg-slate-950/60 flex flex-col items-center justify-center backdrop-blur-[2px] transition-all">
                          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#38bdf8] animate-pulse" />
                          <div className="mt-3 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-sky-500/40 text-sky-400 text-xs font-bold flex items-center gap-2 shadow-xl">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                            <span>{scanStatus || 'Auto-detecting card & reading ID number...'}</span>
                          </div>
                        </div>
                      )}

                      {/* Hover Overlay Controls */}
                      {!isScanningCard && (
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                          {originalIdCardImage && (
                            <button
                              type="button"
                              onClick={() => setIsCropperModalOpen(true)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs shadow-md"
                            >
                              <Crop className="w-3.5 h-3.5" />
                              Adjust Crop
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => idCardImageInputRef.current?.click()}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs shadow-md"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, id_card_image: '', national_id: '' });
                              setOriginalIdCardImage('');
                              setDetectedIdInfo(null);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-semibold text-xs shadow-md"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Detection Feedback Status Banner */}
                    {detectedIdInfo ? (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="font-semibold">
                            Auto-detected ID Number:{' '}
                            <span className="font-mono font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30">
                              {detectedIdInfo.idNumber}
                            </span>
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-500/80 font-medium">
                          {detectedIdInfo.source}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-emerald-500 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Card auto-cropped & aligned
                        </span>
                        <button
                          type="button"
                          onClick={() => idCardImageInputRef.current?.click()}
                          className="text-sky-500 hover:underline font-medium"
                        >
                          Upload different image
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => idCardImageInputRef.current?.click()}
                    className="border-2 border-dashed border-sky-500/30 hover:border-sky-500/60 rounded-xl p-6 text-center cursor-pointer transition-colors bg-sky-500/5 hover:bg-sky-500/10 group"
                  >
                    <div className="w-12 h-12 mx-auto rounded-xl bg-sky-500/10 group-hover:bg-sky-500/20 text-sky-500 flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105">
                      <FileUp className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                      Click to import Cambodian National ID Card image
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Auto-detects card bounds, auto-crops, and reads National ID number automatically
                    </p>
                  </div>
                )}

                {/* Auto-detected National ID Number Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                      National ID Card Number
                    </label>
                    {detectedIdInfo && (
                      <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Auto-detected from card
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.national_id}
                      onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                      placeholder="e.g. 010892415"
                      className={`w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border ${
                        detectedIdInfo
                          ? 'border-emerald-500/50 ring-2 ring-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                      } font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs font-bold`}
                    />
                    {formData.national_id && (
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formData.national_id.length} digits
                        </span>
                        {detectedIdInfo && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {editingUser ? 'Save Staff Changes' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cambodian National ID Card Inspection Lightbox Modal */}
      {viewingIdCardUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Cambodian National ID Card • {viewingIdCardUser.full_name || viewingIdCardUser.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {viewingIdCardUser.national_id ? `ID No: ${viewingIdCardUser.national_id} • ` : ''}អត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingIdCardUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Uploaded Card Image or Empty State */}
            {viewingIdCardUser.id_card_image ? (
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 p-3 shadow-xl flex items-center justify-center min-h-[260px] max-h-[460px]">
                <img
                  src={viewingIdCardUser.id_card_image}
                  alt={`Cambodian National ID - ${viewingIdCardUser.full_name || viewingIdCardUser.name}`}
                  className="w-full h-full max-h-[440px] object-contain rounded-xl"
                />
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <CreditCard className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  No ID Card Image Uploaded
                </p>
                <p className="text-xs text-slate-500">
                  This staff member does not have an imported Cambodian National ID Card image yet.
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              {viewingIdCardUser.id_card_image ? (
                <a
                  href={viewingIdCardUser.id_card_image}
                  download={`cambodian_id_${(viewingIdCardUser.full_name || viewingIdCardUser.name || 'staff').replace(/\s+/g, '_')}.png`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download ID Image
                </a>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const userToEdit = viewingIdCardUser;
                    setViewingIdCardUser(null);
                    openEditModal(userToEdit);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  {viewingIdCardUser.id_card_image ? 'Update ID Card Image' : 'Import ID Card Image'}
                </button>
                <button
                  type="button"
                  onClick={() => setViewingIdCardUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SweetAlert Animated Delete Modal */}
      <SweetAlertModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteUser}
        title="Delete Staff Member?"
        text="You won't be able to revert this! The staff record will be permanently deleted from the directory."
        confirmButtonText="Yes, delete staff!"
        cancelButtonText="Cancel"
        itemName={deletingUser?.full_name || deletingUser?.name}
        itemSubtext={`${deletingUser?.role?.toUpperCase() || 'STAFF'} • ${deletingUser?.email || deletingUser?.phone || 'No contact details'}`}
        itemAvatar={deletingUser?.avatar}
      />

      {/* Interactive ID Card Crop Adjustment Modal */}
      <IdCardCropperModal
        isOpen={isCropperModalOpen}
        onClose={() => setIsCropperModalOpen(false)}
        originalImage={originalIdCardImage || formData.id_card_image}
        initialCropRect={cropRect}
        onApplyCrop={handleApplyManualCrop}
      />
    </div>
  );
}
