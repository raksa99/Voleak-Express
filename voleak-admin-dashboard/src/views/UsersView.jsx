import React, { useState } from 'react';
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
} from 'lucide-react';
import { addLocalUser, updateLocalUser, deleteLocalUser } from '../lib/supabaseClient';
import SweetAlertModal from '../components/SweetAlertModal';

export default function UsersView({ users = [], setUsers, searchVal = '' }) {
  const { t } = useLanguage();
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'driver',
    nationality: 'Cambodian',
    status: 'active',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'driver',
      nationality: 'Cambodian',
      status: 'active',
    });
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
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const newUserPayload = {
      ...formData,
      full_name: formData.name,
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
                <th className="p-3.5">{t('thPhone')}</th>
                <th className="p-3.5">{t('thEmail')}</th>
                <th className="p-3.5">{t('thStatus')}</th>
                <th className="p-3.5 rounded-r-xl text-right">{t('thActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
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
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f59e0b&color=0f172a`;
                            }}
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{displayName}</p>
                            <p className="text-[10px] text-slate-400 font-normal">{user.nationality || 'Cambodian'}</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                {editingUser ? 'Edit Staff Member' : t('actionAddUser')}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingUser(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                >
                  {editingUser ? 'Save Changes' : t('save')}
                </button>
              </div>
            </form>
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
    </div>
  );
}
