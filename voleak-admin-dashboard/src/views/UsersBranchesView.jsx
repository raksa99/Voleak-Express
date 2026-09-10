import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuthRole } from '../context/AuthRoleContext';
import { addOrUpdateUser } from '../lib/supabaseClient';
import { Users, Building, PlusCircle, ShieldCheck, Mail, Phone, Store, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UsersBranchesView({ users = [], setUsers, branches = [] }) {
  const { t } = useLanguage();
  const { currentUser } = useAuthRole();
  const [activeTab, setActiveTab] = useState('users');
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('cooperator');
  const [newBranchId, setNewBranchId] = useState('b-01');

  const handleCreateUser = () => {
    if (!newFullName) return;
    const created = addOrUpdateUser(
      {
        full_name: newFullName,
        email: newEmail,
        phone: newPhone,
        role: newRole,
        branch_id: newRole === 'admin' ? null : newBranchId,
      },
      currentUser.name
    );
    setUsers((prev) => [created, ...prev]);
    setUserModalOpen(false);
    setNewFullName('');
    setNewEmail('');
    setNewPhone('');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return { text: 'Super Admin', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' };
      case 'manager':
        return { text: 'Branch Manager', bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30' };
      case 'driver':
        return { text: 'Delivery Driver', bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' };
      case 'cooperator':
        return { text: 'Cooperator Shop', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
      default:
        return { text: role, bg: 'bg-slate-500/10 text-slate-600' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            <span>{t('usersTitle')}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('usersSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'users' ? 'bg-white dark:bg-slate-900 shadow-sm text-amber-600 dark:text-amber-400' : 'text-slate-500'
              }`}
            >
              Users & Staff
            </button>
            <button
              onClick={() => setActiveTab('branches')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'branches' ? 'bg-white dark:bg-slate-900 shadow-sm text-sky-600 dark:text-sky-400' : 'text-slate-500'
              }`}
            >
              Branch Hubs
            </button>
          </div>

          {activeTab === 'users' && (
            <button
              onClick={() => setUserModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('addUserBtn')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'users' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">{t('thFullName')}</th>
                  <th className="py-3.5 px-4">{t('thRole')}</th>
                  <th className="py-3.5 px-4">{t('thAssignedBranch')}</th>
                  <th className="py-3.5 px-4">{t('thEmail')}</th>
                  <th className="py-3.5 px-4">{t('thPhone')}</th>
                  <th className="py-3.5 px-4 text-center">{t('thStatus')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => {
                  const badge = getRoleBadge(u.role);
                  const branch = branches.find((b) => b.id === u.branch_id) || { name: 'Global Hubs (All)' };

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                            alt={u.full_name}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                          <span>{u.full_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                          {badge.text}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {branch.name}
                      </td>
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                        {u.email}
                      </td>
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-mono">
                        {u.phone}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {branches.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                  <Building className="w-5 h-5" />
                </div>
                <span className="font-mono text-xs font-bold text-amber-500">{b.code}</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{b.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{b.address}</p>
                <p className="text-xs text-slate-500 font-mono mt-1">{b.phone}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Create Modal */}
      <AnimatePresence>
        {userModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                <span>{t('addUserBtn')}</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Role</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="cooperator">Cooperator</option>
                      <option value="driver">Driver</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Branch</label>
                    <select
                      value={newBranchId}
                      onChange={(e) => setNewBranchId(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleCreateUser}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold"
                >
                  Save User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
