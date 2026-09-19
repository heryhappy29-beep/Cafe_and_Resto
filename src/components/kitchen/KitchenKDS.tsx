import React, { useState, useEffect } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Order, OrderStatus } from '../../types';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  Flame, 
  Bell, 
  AlertCircle, 
  CheckSquare, 
  Square, 
  Utensils, 
  Volume2, 
  VolumeX,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const KitchenKDS: React.FC = () => {
  const { 
    orders, 
    startCookingOrder, 
    toggleKitchenItem, 
    markOrderReady, 
    currentUser 
  } = useCafe();

  const [statusFilter, setStatusFilter] = useState<'semua' | 'menunggu_konfirmasi' | 'sedang_diproses' | 'siap_saji'>('semua');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [now, setNow] = useState<number>(Date.now());

  // Update timer every 10 seconds for real-time elapsed badges
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filter orders relevant for kitchen (active non-completed)
  const kitchenOrders = orders
    .filter(o => o.status !== 'selesai' && o.status !== 'dibatalkan')
    .filter(o => {
      if (statusFilter === 'semua') return true;
      return o.status === statusFilter;
    })
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // FIFO (First In, First Out)

  const getElapsedTimeMinutes = (isoString: string) => {
    const diffMs = now - new Date(isoString).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  const getTimerBadge = (minutes: number) => {
    if (minutes < 10) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {minutes} menit lalu
        </span>
      );
    } else if (minutes < 20) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-700/60 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {minutes} menit lalu (Perhatian)
        </span>
      );
    } else {
      return (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-700/60 flex items-center gap-1 animate-pulse">
          <AlertCircle className="w-3 h-3" />
          {minutes} menit lalu (Prioritas Tinggi!)
        </span>
      );
    }
  };

  const handleStartCooking = (order: Order) => {
    startCookingOrder(order.id);
  };

  const handleMarkReady = (order: Order) => {
    markOrderReady(order.id);
    if (soundEnabled && typeof window !== 'undefined') {
      try {
        // Play brief gentle synthesized chime for notification
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } catch {
        // audio context blocked or unsupported
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      {/* Header bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-500">
              Kitchen Display System (KDS)
            </span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Live Real-Time
            </span>
          </div>
          <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-400" />
            Antrean Masak Dapur & Barista
          </h2>
        </div>

        {/* Controls: Sound toggle & Filter tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
              soundEnabled
                ? 'bg-stone-800 border-stone-700 text-stone-200'
                : 'bg-stone-900 border-stone-800 text-stone-500'
            }`}
            title={soundEnabled ? 'Notifikasi Suara Aktif' : 'Notifikasi Suara Dinonaktifkan'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Audio Chime ON' : 'Mute'}</span>
          </button>

          <div className="flex rounded-xl bg-stone-950 p-1 border border-stone-800 text-xs">
            <button
              onClick={() => setStatusFilter('semua')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                statusFilter === 'semua' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Semua ({orders.filter(o => o.status !== 'selesai' && o.status !== 'dibatalkan').length})
            </button>
            <button
              onClick={() => setStatusFilter('menunggu_konfirmasi')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                statusFilter === 'menunggu_konfirmasi' ? 'bg-blue-500 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Baru Masuk
            </button>
            <button
              onClick={() => setStatusFilter('sedang_diproses')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                statusFilter === 'sedang_diproses' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Dimasak
            </button>
            <button
              onClick={() => setStatusFilter('siap_saji')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                statusFilter === 'siap_saji' ? 'bg-emerald-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Siap Saji
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Kitchen Tickets */}
      {kitchenOrders.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center">
          <Utensils className="w-12 h-12 text-stone-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-200">Semua Antrean Bersih!</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto mt-1">
            Tidak ada pesanan aktif saat ini. Begitu Pelayan menekan tombol "Kirim Pesanan ke Dapur", tiket akan langsung muncul di sini secara real-time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {kitchenOrders.map(order => {
            const elapsed = getElapsedTimeMinutes(order.createdAt);
            const isCooking = order.status === 'sedang_diproses';
            const isReady = order.status === 'siap_saji';
            const isPending = order.status === 'menunggu_konfirmasi';
            const allItemsChecked = order.items.every(it => it.isCompletedInKitchen);

            return (
              <div
                key={order.id}
                id={`kds-card-${order.id}`}
                className={`rounded-2xl border flex flex-col justify-between transition-all shadow-md overflow-hidden ${
                  isReady
                    ? 'bg-emerald-950/20 border-emerald-600/50 shadow-emerald-950/40'
                    : isCooking
                    ? 'bg-amber-950/20 border-amber-500/50 shadow-amber-950/40'
                    : 'bg-stone-900 border-stone-700 shadow-stone-950/60'
                }`}
              >
                {/* Ticket Top Header */}
                <div className={`p-4 border-b flex items-start justify-between gap-2 ${
                  isReady
                    ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-100'
                    : isCooking
                    ? 'bg-amber-950/50 border-amber-800/60 text-amber-100'
                    : 'bg-stone-800/70 border-stone-700 text-stone-100'
                }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-extrabold tracking-tight">Meja {order.tableNumber}</span>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-stone-950/80 border border-stone-700 text-stone-300">
                        {order.orderNumber}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Tamu: <strong className="text-stone-200">{order.customerName || 'Anonim'}</strong> &bull; Pelayan: {order.waiterName}
                    </p>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    {getTimerBadge(elapsed)}
                    <span className="text-[10px] text-stone-400 font-mono">
                      Masuk: {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Ticket General Notes (if any) */}
                {order.notes && (
                  <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-300 flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Catatan Khusus: {order.notes}</span>
                  </div>
                )}

                {/* Items Checklist for Chefs */}
                <div className="p-4 flex-1 space-y-2.5 max-h-64 overflow-y-auto">
                  <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1 flex justify-between">
                    <span>Menu Pesanan ({order.items.length})</span>
                    <span className="text-stone-500">Klik untuk centang</span>
                  </div>

                  {order.items.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggleKitchenItem(order.id, item.id)}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                        item.isCompletedInKitchen
                          ? 'bg-stone-800/40 border-stone-800 text-stone-500 line-through'
                          : 'bg-stone-800/90 border-stone-700 text-stone-100 hover:border-amber-500/60'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 shrink-0 text-amber-400"
                        title={item.isCompletedInKitchen ? 'Tandai belum siap' : 'Tandai siap'}
                      >
                        {item.isCompletedInKitchen ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-500" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`font-bold text-xs ${item.isCompletedInKitchen ? 'text-stone-500' : 'text-stone-100'}`}>
                            {item.quantity}x {item.menuName}
                          </span>
                        </div>
                        {item.notes && (
                          <p className={`text-[11px] mt-0.5 font-medium ${
                            item.isCompletedInKitchen ? 'text-stone-600' : 'text-amber-300'
                          }`}>
                            &bull; "{item.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 bg-stone-950/60 border-t border-stone-800/80 flex items-center justify-between gap-2">
                  <div className="text-xs">
                    <span className="text-stone-400">Status: </span>
                    <span className={`font-bold uppercase text-[11px] px-2 py-0.5 rounded ${
                      isReady 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' 
                        : isCooking 
                        ? 'bg-amber-950 text-amber-300 border border-amber-700' 
                        : 'bg-blue-950 text-blue-300 border border-blue-700'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>

                  {isPending && (
                    <button
                      id={`btn-start-cook-${order.id}`}
                      onClick={() => handleStartCooking(order)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Flame className="w-4 h-4" />
                      Terima & Masak
                    </button>
                  )}

                  {isCooking && (
                    <button
                      id={`btn-ready-${order.id}`}
                      onClick={() => handleMarkReady(order)}
                      className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm ${
                        allItemsChecked
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 animate-pulse'
                          : 'bg-emerald-600/80 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                      Tandai Siap Saji
                    </button>
                  )}

                  {isReady && (
                    <div className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Menunggu Diantar Pelayan</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
