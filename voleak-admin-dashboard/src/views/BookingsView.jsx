import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Package, QrCode, X, CheckCircle, Truck } from 'lucide-react';

export default function BookingsView({ bookings = [], setBookings, trips = [], users = [], cooperators = [] }) {
  const { t } = useLanguage();
  const [qrModalWaybill, setQrModalWaybill] = useState(null);

  // Factory Waybills & Freight Consignments: Derived 1:1 and ONLY from Truck Dispatch Manifests
  const effectiveBookings = useMemo(() => {
    return trips.map((trip) => {
      const waybillId =
        trip.waybill_no ||
        (trip.id === 'tr-1' || trip.id === 'TRK-901'
          ? 'WB-8810'
          : trip.id === 'tr-2' || trip.id === 'TRK-902'
          ? 'WB-8811'
          : trip.id === 'tr-3' || trip.id === 'TRK-903'
          ? 'WB-8812'
          : `WB-${trip.id?.replace(/\D/g, '') || '8815'}`);

      const isBowker = trip.id === 'TRK-901' || trip.id === 'tr-1' || trip.route_name?.includes('Bowker');
      const isEminent = trip.id === 'TRK-902' || trip.id === 'tr-2' || trip.route_name?.includes('Eminent');
      const is8Star = trip.id === 'TRK-903' || trip.id === 'tr-3' || trip.route_name?.includes('8 Star');

      const receiverName =
        trip.cooperator_name ||
        trip.cooperator ||
        (isBowker
          ? 'BOWKER GARMENT FACTORY (CAMBODIA) COMPANY LIMITED'
          : isEminent
          ? 'EMINENT GARMENT (CAMBODIA) LIMITED'
          : is8Star
          ? '8 STAR SPORTSWEAR LTD.'
          : cooperators[0]?.name || 'EMINENT GARMENT (CAMBODIA) LIMITED');

      const kgNum =
        trip.cargo_kg ||
        (trip.cargo_weight_tons ? Number(trip.cargo_weight_tons) * 1000 : null) ||
        (trip.loaded_tons ? Number(trip.loaded_tons) * 1000 : null) ||
        (isBowker ? 28500 : isEminent ? 22000 : 25000);

      const status =
        trip.status === 'in_progress' ? 'in_transit' : trip.status === 'completed' ? 'delivered' : 'confirmed';

      return {
        id: waybillId,
        trip_id: trip.id,
        truck_plate: trip.bus_plate || 'PP-3D-8890',
        sender: 'Top Sports Textile',
        receiver: receiverName,
        corridor: trip.route_name || 'Top Sports Express Corridor',
        seat_number: `${Number(kgNum).toLocaleString()} kg`,
        status,
        total_price: 65,
        booking_channel: 'Knitted Fabric',
        cargo_type: 'Knitted Fabric',
        qr_code: `VKX-${waybillId}-KH`,
        booked_at: trip.departure_time || new Date().toISOString(),
      };
    });
  }, [trips, cooperators]);

  // Helper to extract truck plate from dispatch trip
  const getTruckPlate = (bk) => {
    if (bk.truck_plate) return bk.truck_plate;
    const trip = trips.find((t) => t.id === bk.trip_id || t.trip_number === bk.trip_id || t.waybill_no === bk.id);
    if (trip?.bus_plate) return trip.bus_plate;
    if (trip?.truck_plate) return trip.truck_plate;
    if (bk.trip_id === 'TRK-902' || bk.id === 'WB-8803') return 'PP-3E-1234';
    return 'PP-3D-8890';
  };

  // Helper to get cooperator recipient from dispatch trip
  const getDispatchRecipient = (bk) => {
    const trip = trips.find((t) => t.id === bk.trip_id || t.trip_number === bk.trip_id || t.waybill_no === bk.id);
    if (trip?.cooperator_name) return trip.cooperator_name;
    if (trip?.cooperator) return trip.cooperator;
    if (trip?.client_name) return trip.client_name;

    // Check if trip associates with a cooperator in cooperators list
    if (trip?.cooperator_id) {
      const found = cooperators.find((c) => c.id === trip.cooperator_id);
      if (found?.name) return found.name;
    }

    if (bk.receiver && !bk.receiver.includes('Mart') && !bk.receiver.includes('Hub') && !bk.receiver.includes('Depot')) {
      return bk.receiver;
    }
    return cooperators[0]?.name || 'EMINENT GARMENT (CAMBODIA) LIMITED';
  };

  const getCorridorName = (bk) => {
    const trip = trips.find((t) => t.id === bk.trip_id || t.trip_number === bk.trip_id || t.waybill_no === bk.id);
    return trip?.route_name || 'Top Sports Express Corridor';
  };

  const getWaybillStatus = (bk) => {
    const trip = trips.find((t) => t.id === bk.trip_id || t.trip_number === bk.trip_id || t.waybill_no === bk.id);
    if (trip) {
      if (trip.status === 'in_progress') return 'in_transit';
      if (trip.status === 'completed') return 'delivered';
      if (trip.status === 'scheduled') return 'confirmed';
    }
    return bk.status || 'confirmed';
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

  const getWeightKg = (bk) => {
    const trip = trips.find((t) => t.id === bk.trip_id || t.trip_number === bk.trip_id || t.waybill_no === bk.id);
    if (trip?.cargo_kg) return `${Number(trip.cargo_kg).toLocaleString()} kg`;
    if (trip?.cargo_weight_tons) return `${(Number(trip.cargo_weight_tons) * 1000).toLocaleString()} kg`;
    if (trip?.loaded_tons) return `${(Number(trip.loaded_tons) * 1000).toLocaleString()} kg`;
    return formatKg(bk.seat_number);
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'in_transit':
      case 'boarded':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      case 'confirmed':
        return 'bg-sky-500/10 text-sky-500 border-sky-500/30';
      case 'delivered':
        return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30';
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
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold text-xs shadow-sm shrink-0">
          <Truck className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>Auto-Synced with Truck Dispatch Manifests</span>
        </div>
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
                <th className="p-3.5">{t('thStatus')}</th>
                <th className="p-3.5 rounded-r-xl text-right">{t('thTicketQr')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {effectiveBookings.map((bk) => {
                const truckPlate = getTruckPlate(bk);
                const recipient = getDispatchRecipient(bk);
                const kgValue = getWeightKg(bk);
                const status = getWaybillStatus(bk);
                const corridor = getCorridorName(bk);

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
                    <td className="p-3.5">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{recipient}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{corridor}</p>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      {kgValue}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] border border-emerald-500/20">
                        Knitted Fabric
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadge(
                          status
                        )}`}
                      >
                        {status}
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
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${qrModalWaybill.qr_code || qrModalWaybill.id}`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="text-xs space-y-1.5 text-slate-300 font-mono text-left p-3 rounded-xl bg-slate-950 border border-slate-800">
                <p className="font-bold text-amber-400">Tracking: {qrModalWaybill.qr_code || `VKX-${qrModalWaybill.id}-KH`}</p>
                <p>Truck Plate: <span className="text-amber-300 font-bold">{getTruckPlate(qrModalWaybill)}</span></p>
                <p>Corridor: <span className="text-slate-300">{getCorridorName(qrModalWaybill)}</span></p>
                <p>Sender: <span className="text-white font-semibold">Top Sports Textile</span></p>
                <p>Recipient: <span className="text-white font-semibold">{getDispatchRecipient(qrModalWaybill)}</span></p>
                <p>Kg: <span className="text-emerald-400 font-bold">{getWeightKg(qrModalWaybill)}</span></p>
                <p>Product: <span className="text-sky-400 font-bold">Knitted Fabric</span></p>
                <p>Status: <span className="text-purple-400 font-bold uppercase">{getWaybillStatus(qrModalWaybill)}</span></p>
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

    </div>
  );
}
