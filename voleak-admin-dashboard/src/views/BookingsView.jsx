import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Package, PlusCircle, QrCode, X, CheckCircle, AlertCircle, Scale, Layers } from 'lucide-react';
import { addLocalBooking } from '../lib/supabaseClient';

export default function BookingsView({ bookings, setBookings, trips, users }) {
  const { t } = useLanguage();
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [qrModalWaybill, setQrModalWaybill] = useState(null);

  // Form State
  const [senderName, setSenderName] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [weightKg, setWeightKg] = useState(25);
  const [codAmount, setCodAmount] = useState(100);
  const [cargoType, setCargoType] = useState('Express Parcel');
  const [shippingFee, setShippingFee] = useState(15);

  const handleCreateWaybill = (e) => {
    e.preventDefault();
    if (!senderName || !receiverName) return;

    const newBk = addLocalBooking({
      trip_id: trips[0]?.id || 'TRK-901',
      passenger_id: `u-${Date.now()}`,
      passenger_name: senderName,
      sender: senderName,
      receiver: receiverName,
      seat_number: `${weightKg} kg / ${(weightKg * 0.015).toFixed(1)} m³`,
      status: 'confirmed',
      total_price: Number(shippingFee),
      booking_channel: cargoType,
      cod_amount: Number(codAmount),
    });

    setBookings([newBk, ...bookings]);
    setShowCounterModal(false);
    setSenderName('');
    setReceiverName('');
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'boarded':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      case 'confirmed':
        return 'bg-sky-500/10 text-sky-500 border-sky-500/30';
      case 'pending':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      default:
        return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-500" />
            {t('bookingsTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('bookingsSubtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowCounterModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-lg shadow-amber-500/25 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          {t('newBookingBtn')}
        </button>
      </div>

      {/* Bookings Table */}
      <div className="p-6 rounded-2xl glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5 rounded-l-xl">{t('thBookingId')}</th>
                <th className="p-3.5">Sender</th>
                <th className="p-3.5">Recipient</th>
                <th className="p-3.5">Weight/Vol</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Freight Priority</th>
                <th className="p-3.5">Transit Route</th>
                <th className="p-3.5">{t('thStatus')}</th>
                <th className="p-3.5 rounded-r-xl text-right">{t('thTicketQr')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {bookings.map((bk) => (
                <tr key={bk.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 font-mono font-bold text-amber-500">{bk.id}</td>
                  <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                    {bk.sender || bk.passenger_name}
                  </td>
                  <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">
                    {bk.receiver || 'Siem Reap Hub'}
                  </td>
                  <td className="p-3.5 font-mono font-bold">{bk.seat_number}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 font-medium">
                      {bk.booking_channel}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-purple-600 dark:text-purple-400 font-mono">
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-[11px]">Express Freight</span>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">
                    Highway Line #{bk.trip_id?.slice(-3) || '101'}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadge(bk.status)}`}>
                      {bk.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setQrModalWaybill(bk)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-white text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-1.5 ml-auto transition-all text-xs"
                    >
                      <QrCode className="w-3.5 h-3.5" /> Label & QR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Waybill Label QR Simulator Modal */}
      {qrModalWaybill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                Waybill #{qrModalWaybill.id}
              </h3>
              <button onClick={() => setQrModalWaybill(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-44 h-44 mx-auto bg-white p-3 rounded-xl flex items-center justify-center shadow-inner">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${qrModalWaybill.qr_code}`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="text-xs space-y-1 text-slate-300 font-mono text-left p-2 rounded-lg bg-slate-950">
                <p className="font-bold text-amber-400">Tracking: {qrModalWaybill.qr_code}</p>
                <p>Sender: <span className="text-white font-semibold">{qrModalWaybill.sender || qrModalWaybill.passenger_name}</span></p>
                <p>Recipient: <span className="text-white font-semibold">{qrModalWaybill.receiver || 'Siem Reap Hub'}</span></p>
                <p>Weight/Vol: <span className="text-emerald-400 font-bold">{qrModalWaybill.seat_number}</span></p>
                <p>Service Class: <span className="text-amber-400 font-bold">Priority Textile Freight</span></p>
              </div>
            </div>

            <button
              onClick={() => setQrModalWaybill(null)}
              className="w-full py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-md"
            >
              Print Shipping Label
            </button>
          </div>
        </div>
      )}

      {/* New Cargo Waybill Creation Modal */}
      {showCounterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('newBookingBtn')}
              </h3>
              <button onClick={() => setShowCounterModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWaybill} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sender Name / Company
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phnom Penh Wholesale Market"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Recipient Name & Phone
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sok Dara (012 999 888)"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Package Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Pallets / Cartons Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 10"
                    defaultValue="1"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cargo Category
                </label>
                <select
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Express Parcel">Express Parcel</option>
                  <option value="Heavy Freight">Heavy Freight</option>
                  <option value="Cold Chain Cargo">Cold Chain Cargo</option>
                  <option value="Express Document">Express Document</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCounterModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-md"
                >
                  {t('confirmBookingBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
