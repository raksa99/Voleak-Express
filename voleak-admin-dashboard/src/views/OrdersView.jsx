import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuthRole } from '../context/AuthRoleContext';
import {
  approveOrder,
  rejectOrder,
  pickupOrder,
} from '../lib/supabaseClient';
import {
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Eye,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrdersView({ orders = [], setOrders, searchVal = '' }) {
  const { t } = useLanguage();
  const { isAdmin, isManager, selectedBranchId, currentUser } = useAuthRole();

  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [targetRejectId, setTargetRejectId] = useState(null);

  // Scoped orders
  const scopedOrders = isManager ? orders.filter((o) => o.branch_id === selectedBranchId) : orders;

  const filteredOrders = scopedOrders.filter((ord) => {
    const matchesSearch =
      ord.order_code.toLowerCase().includes(searchVal.toLowerCase()) ||
      (ord.notes && ord.notes.toLowerCase().includes(searchVal.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || ord.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (orderId) => {
    approveOrder(orderId, currentUser.name);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'approved', approved_at: new Date().toISOString() } : o))
    );
  };

  const handlePickup = (orderId) => {
    pickupOrder(orderId, 'Driver Dara');
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'picked_up' } : o))
    );
  };

  const handleRejectConfirm = () => {
    if (!targetRejectId) return;
    rejectOrder(targetRejectId, rejectReason, currentUser.name);
    setOrders((prev) =>
      prev.map((o) => (o.id === targetRejectId ? { ...o, status: 'cancelled', notes: rejectReason } : o))
    );
    setRejectModalOpen(false);
    setRejectReason('');
    setTargetRejectId(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'requested':
        return { text: t('statusRequested'), bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' };
      case 'approved':
        return { text: t('statusApproved'), bg: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30' };
      case 'assigned':
        return { text: t('statusAssigned'), bg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' };
      case 'picked_up':
        return { text: t('statusPickedUp'), bg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' };
      case 'delivered':
        return { text: t('statusDelivered'), bg: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30' };
      case 'confirmed':
        return { text: t('statusConfirmed'), bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
      case 'disputed':
        return { text: t('statusDisputed'), bg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' };
      case 'resolved':
        return { text: t('statusResolved'), bg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' };
      case 'cancelled':
        return { text: t('statusCancelled'), bg: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30' };
      default:
        return { text: status, bg: 'bg-slate-500/15 text-slate-600 border-slate-500/30' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-amber-500" />
            <span>{t('ordersTitle')}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('ordersSubtitle')}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['all', 'requested', 'approved', 'picked_up', 'delivered', 'confirmed', 'disputed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st === 'all' ? t('filterAllStatus') : st.charAt(0).toUpperCase() + st.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">{t('thOrderCode')}</th>
                <th className="py-3.5 px-4">{t('thItems')}</th>
                <th className="py-3.5 px-4">{t('thAmount')}</th>
                <th className="py-3.5 px-4">{t('thStatus')}</th>
                <th className="py-3.5 px-4">{t('thCreated')}</th>
                <th className="py-3.5 px-4 text-right">{t('thActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No orders match your filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const badge = getStatusBadge(ord.status);
                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-extrabold text-[10px]">
                            ORD
                          </div>
                          <div>
                            <div>{ord.order_code}</div>
                            <div className="text-[10px] font-normal text-slate-400">{ord.notes || 'Standard Delivery'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {ord.total_items} units
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                        ${ord.total_amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] border ${badge.bg}`}>
                          {badge.text}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                        {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Order Review / Detail Button */}
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
                            title={t('btnViewDetails')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Manager Approval Action (§4.3) */}
                          {ord.status === 'requested' && (
                            <>
                              <button
                                onClick={() => handleApprove(ord.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{t('btnApprove')}</span>
                              </button>
                              <button
                                onClick={() => {
                                  setTargetRejectId(ord.id);
                                  setRejectModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs transition-all"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {/* Driver Pickup Action (§4.3 Physical Decrement) */}
                          {ord.status === 'approved' && (
                            <button
                              onClick={() => handlePickup(ord.id)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1"
                              title="Checkout stock as Driver"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Dispatch Pickup</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedOrder.order_code}
                  </h3>
                  <p className="text-xs text-slate-400">Order Items & Soft Reservation Details</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('orderItemsTitle')}</h4>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">Product ID: {item.product_id}</span>
                          <p className="text-slate-400 text-[11px]">Requested: {item.qty_requested} units</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-amber-500">${(item.unit_price * item.qty_requested).toFixed(2)}</span>
                          <p className="text-slate-400 text-[10px]">@${item.unit_price.toFixed(2)}/unit</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">Standard pallet item bundle.</p>
                  )}
                </div>
              </div>

              {/* Notice Banner */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
                <span className="font-bold">§4.1 Auto-Confirm Policy:</span> {t('autoConfirmNotice')}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  {t('close')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Reason Modal */}
      <AnimatePresence>
        {rejectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            >
              <h3 className="text-sm font-bold text-rose-500 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                <span>Reject Order Request</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Specify rejection reason for cooperator and audit trail:
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Insufficient branch inventory, customer unreachable..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                rows="3"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setRejectModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleRejectConfirm}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
