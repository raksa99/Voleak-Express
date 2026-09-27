import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Package, PlusCircle, QrCode, X, CheckCircle, AlertCircle, Scale, Layers, Truck } from 'lucide-react';
import { addLocalBooking } from '../lib/supabaseClient';

export default function BookingsView({ bookings = [], setBookings, trips = [], users = [], cooperators = [] }) {
  const { t } = useLanguage();
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [qrModalWaybill, setQrModalWaybill] = useState(null);

  // Helper to extract truck plate from dispatch trip
  const getTruckPlate = (bk) => {
    if (bk.truck_plate) return bk.truck_plate;
    const trip = trips.find((t) => t.id === bk.trip_id || t.trip_number === bk.trip_id);
    if (trip?.bus_plate) return trip.bus_plate;
    if (trip?.truck_plate) return trip.truck_plate;
    if (bk.trip_id === 'TRK-902' || bk.id === 'WB-8803') return 'PP-3E-1234';
    return 'PP-3D-8890';
  };

  // Helper to get cooperator recipient from dispatch trip
  const getDispatchRecipient = (bk) => {
    const trip = trips.find((t) => t.id === bk.trip_id || t.trip_number === bk.trip_id);
    if (trip?.cooperator_name) return trip.cooperator_name;
    if (trip?.cooperator) return trip.cooperator;
    if (trip?.client_name) return trip.client_name;

    // Check if trip associates with a cooperator in cooperators list
    if (trip?.cooperator_id) {
      const found = cooperators.find((c) => c.id === trip.cooperator_id);
      if (found?.name) return found.name;
    }

    // Mapping by dispatch trip or waybill ID to verified garment partner factories
    if (bk.trip_id === 'TRK-901' || bk.id === 'WB-8801') {
      const found = cooperators.find(
        (c) => c.id === 'cop-bowker' || c.short_name?.toLowerCase().includes('bowker') || c.name?.toUpperCase().includes('BOWKER')
      );
      return found ? found.name : 'BOWKER GARMENT FACTORY (CAMBODIA) COMPANY LIMITED';
    }
    if (bk.trip_id === 'TRK-902' || bk.id === 'WB-8802') {
      const found = cooperators.find(
        (c) => c.id === 'cop-eminent' || c.short_name?.toLowerCase().includes('eminent') || c.name?.toUpperCase().includes('EMINENT')
      );
      return found ? found.name : 'EMINENT GARMENT (CAMBODIA) LIMITED';
    }
    if (bk.trip_id === 'TRK-903' || bk.id === 'WB-8803') {
      const found = cooperators.find(
        (c) => c.id === 'cop-8star' || c.short_name?.toLowerCase().includes('8 star') || c.name?.toUpperCase().includes('8 STAR')
      );
      return found ? found.name : '8 STAR SPORTSWEAR LTD.';
    }

    // If bk.receiver is already a known corporate cooperator, preserve it
    if (bk.receiver && !bk.receiver.includes('Mart') && !bk.receiver.includes('Hub') && !bk.receiver.includes('Depot')) {
      return bk.receiver;
    }
    return cooperators[0]?.name || 'EMINENT GARMENT (CAMBODIA) LIMITED';
  };

  // Helper to format weight strictly into Kg
  const formatKg = (seatNumber) => {
    if (!seatNumber) return '0 kg';
    const str = String(seatNumber).trim();
    if (str.includes('/')) {
      return str.split('/')[0].trim();
    }
    if (str.toLowerCase().includes('kg')) {
      return str;
    }
    if (str.toLowerCase().includes('tons') || str.toLowerCase().includes('ton')) {
      const num = parseFloat(str.replace(/[^0-9.]/g, ''));
      return num ? `${(num * 1000).toLocaleString()} kg` : str;
    }
    if (str.includes('Rolls') || str.includes('Cartons')) {
      const match = str.match(/([0-9,]+)\s*m/i);
      if (match) return `${match[1]} kg`;
      return '1,200 kg';
    }
    if (/^[0-9,.]+$/.test(str)) {
      return `${str} kg`;
    }
    return str;
  };

  // Form State
  const defaultTrip = trips[0] || { id: 'TRK-901', bus_plate: 'PP-3D-8890' };
  const [selectedTripId, setSelectedTripId] = useState(defaultTrip.id);
  const [receiverName, setReceiverName] = useState(() => {
    return defaultTrip.cooperator_name || (cooperators[0]?.name || 'BOWKER GARMENT FACTORY (CAMBODIA) COMPANY LIMITED');
  });
  const [weightKg, setWeightKg] = useState(450);
  const [codAmount, setCodAmount] = useState(0);
  const [cargoType, setCargoType] = useState('Knitted Fabric');
  const [shippingFee, setShippingFee] = useState(65);

  const handleTripChange = (tripId) => {
    setSelectedTripId(tripId);
    const tr = trips.find((t) => t.id === tripId);
    if (tr) {
      const coop =
        tr.cooperator_name ||
        tr.cooperator ||
        (tripId === 'TRK-901'
          ? 'BOWKER GARMENT FACTORY (CAMBODIA) COMPANY LIMITED'
          : 'EMINENT GARMENT (CAMBODIA) LIMITED');
      setReceiverName(coop);
    }
  };

  const handleCreateWaybill = (e) => {
    e.preventDefault();
    const selTrip = trips.find((t) => t.id === selectedTripId) || defaultTrip;
    const finalReceiver = receiverName || getDispatchRecipient({ trip_id: selectedTripId });

    const newBk = addLocalBooking({
      trip_id: selectedTripId,
      truck_plate: selTrip.bus_plate || 'PP-3D-8890',
      passenger_id: `u-${Date.now()}`,
      passenger_name: 'Top Sports Textile',
      sender: 'Top Sports Textile',
      receiver: finalReceiver,
      seat_number: `${weightKg} kg`,
      status: 'confirmed',
      total_price: Number(shippingFee),
      booking_channel: 'Knitted Fabric',
      cargo_type: cargoType,
      cod_amount: Number(codAmount),
    });

    setBookings([newBk, ...bookings]);
    setShowCounterModal(false);
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
                <th className="p-3.5">{t('thTruckPlate') || 'Truck Plate'}</th>
                <th className="p-3.5">{t('thSender') || 'Sender'}</th>
                <th className="p-3.5">{t('thRecipient') || 'Recipient'}</th>
                <th className="p-3.5">{t('thWeightKg') || 'Kg'}</th>
                <th className="p-3.5">{t('thProduct') || 'Product'}</th>
                <th className="p-3.5">Freight Priority</th>
                <th className="p-3.5">{t('thStatus')}</th>
                <th className="p-3.5 rounded-r-xl text-right">{t('thTicketQr')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {bookings.map((bk) => {
                const truckPlate = getTruckPlate(bk);
                const recipient = getDispatchRecipient(bk);
                const kgValue = formatKg(bk.seat_number);

                return (
                  <tr key={bk.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono font-bold text-amber-500">{bk.id}</td>
                    <td className="p-3.5 font-mono">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-amber-600 dark:text-amber-400 font-bold font-mono">
                        {truckPlate}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                      Top Sports Textile
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                      {recipient}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      {kgValue}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] border border-emerald-500/20">
                        Knitted Fabric
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-purple-600 dark:text-purple-400 font-mono">
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-[11px]">Express Freight</span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadge(
                          bk.status
                        )}`}
                      >
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
                );
              })}
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

              <div className="text-xs space-y-1.5 text-slate-300 font-mono text-left p-3 rounded-xl bg-slate-950 border border-slate-800">
                <p className="font-bold text-amber-400">Tracking: {qrModalWaybill.qr_code}</p>
                <p>Truck Plate: <span className="text-amber-300 font-bold">{getTruckPlate(qrModalWaybill)}</span></p>
                <p>Sender: <span className="text-white font-semibold">Top Sports Textile</span></p>
                <p>Recipient: <span className="text-white font-semibold">{getDispatchRecipient(qrModalWaybill)}</span></p>
                <p>Kg: <span className="text-emerald-400 font-bold">{formatKg(qrModalWaybill.seat_number)}</span></p>
                <p>Product: <span className="text-sky-400 font-bold">Knitted Fabric</span></p>
                <p>Service Class: <span className="text-purple-400 font-bold">Priority Textile Freight</span></p>
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
                  Dispatch Manifest / Truck Voyage
                </label>
                <select
                  value={selectedTripId}
                  onChange={(e) => handleTripChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {trips.map((tr) => (
                    <option key={tr.id} value={tr.id}>
                      {tr.id} ({tr.bus_plate || 'PP-3D-8890'}) — {tr.route_name || 'Highway Corridor'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sender (Origin Factory)
                </label>
                <input
                  type="text"
                  readOnly
                  value="Top Sports Textile"
                  className="w-full px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Recipient (Cooperator from Dispatch)
                </label>
                <input
                  type="text"
                  required
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="Cooperator garment factory"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Weight (Kg)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Shipping Fee ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={shippingFee}
                    onChange={(e) => setShippingFee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Product
                </label>
                <select
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                >
                  <option value="Knitted Fabric">Knitted Fabric</option>
                  <option value="Knitted Fabric (High-Elasticity Spandex)">Knitted Fabric (High-Elasticity Spandex)</option>
                  <option value="Knitted Fabric (Single Jersey Cotton)">Knitted Fabric (Single Jersey Cotton)</option>
                  <option value="Knitted Fabric (Rib Knit Textile Rolls)">Knitted Fabric (Rib Knit Textile Rolls)</option>
                  <option value="Knitted Fabric (Interlock Polyester)">Knitted Fabric (Interlock Polyester)</option>
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
