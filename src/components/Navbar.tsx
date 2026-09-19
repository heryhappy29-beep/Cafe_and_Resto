import React, { useState } from 'react';
import { useCafe } from '../context/CafeContext';
import { UserRole } from '../types';
import { 
  Coffee, 
  Store, 
  CreditCard, 
  UtensilsCrossed, 
  ChefHat, 
  FileCode2, 
  Bell, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  X,
  UserCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentRole, 
    setCurrentRole, 
    currentUser, 
    setCurrentUser, 
    users, 
    events, 
    dismissEvent, 
    clearAllEvents,
    resetDemoData,
    orders
  } = useCafe();

  const [showNotifications, setShowNotifications] = useState(false);

  // Count active badges
  const pendingKitchenCount = orders.filter(o => o.status === 'menunggu_konfirmasi' || o.status === 'sedang_diproses').length;
  const readyToServeCount = orders.filter(o => o.status === 'siap_saji').length;
  const pendingPaymentCount = orders.filter(o => o.status !== 'selesai' && o.status !== 'dibatalkan').length;

  const roleOptions: { role: UserRole | 'docs'; label: string; icon: React.ReactNode; badge?: number }[] = [
    { 
      role: 'pelayan', 
      label: 'Pelayan / Waitress', 
      icon: <UtensilsCrossed className="w-4 h-4" />, 
      badge: readyToServeCount > 0 ? readyToServeCount : undefined 
    },
    { 
      role: 'dapur', 
      label: 'Dapur (KDS)', 
      icon: <ChefHat className="w-4 h-4" />, 
      badge: pendingKitchenCount > 0 ? pendingKitchenCount : undefined 
    },
    { 
      role: 'kasir', 
      label: 'Kasir', 
      icon: <CreditCard className="w-4 h-4" />, 
      badge: pendingPaymentCount > 0 ? pendingPaymentCount : undefined 
    },
    { 
      role: 'admin', 
      label: 'Pemilik / Admin', 
      icon: <Store className="w-4 h-4" /> 
    },
    { 
      role: 'docs', 
      label: 'Arsitektur & Skema (Tugas 1-5)', 
      icon: <FileCode2 className="w-4 h-4" /> 
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-900 border-b border-stone-800 text-stone-100 shadow-md">
      {/* Top Brand & Global Status Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Cafe Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-sm shadow-amber-500/30">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-base">Senja Rasa Cafe</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                RBAC v2.4
              </span>
            </div>
            <p className="text-xs text-stone-400 hidden sm:block">
              Sistem Pemesanan & Kasir Terintegrasi Multi-User
            </p>
          </div>
        </div>

        {/* Real-time Indicator & Controls */}
        <div className="flex items-center gap-3">
          {/* WebSocket / Realtime status pulse */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-stone-800/80 border border-stone-700/60 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-stone-300 font-mono text-[11px]">Real-Time Sync Aktif</span>
          </div>

          {/* Quick Notification Bell */}
          <div className="relative">
            <button
              id="btn-notifications-toggle"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors border border-stone-700/80"
              title="Notifikasi Sistem"
            >
              <Bell className="w-4 h-4" />
              {events.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {events.length > 9 ? '9+' : events.length}
                </span>
              )}
            </button>

            {/* Notification Drawer Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-3 bg-stone-800/90 border-b border-stone-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-stone-200">Log Event Real-Time ({events.length})</span>
                  </div>
                  {events.length > 0 && (
                    <button
                      onClick={clearAllEvents}
                      className="text-[11px] text-stone-400 hover:text-rose-400 transition-colors"
                    >
                      Hapus Semua
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-stone-800">
                  {events.length === 0 ? (
                    <div className="p-6 text-center text-xs text-stone-500">
                      Belum ada notifikasi baru. Lakukan aksi di modul Pelayan, Dapur, atau Kasir untuk melihat event sinkronisasi real-time!
                    </div>
                  ) : (
                    events.map(ev => (
                      <div key={ev.id} className="p-3 hover:bg-stone-800/40 text-xs transition-colors flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-amber-400 uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                              {ev.actorRole}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {new Date(ev.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-stone-200 leading-snug">{ev.message}</p>
                        </div>
                        <button
                          onClick={() => dismissEvent(ev.id)}
                          className="text-stone-500 hover:text-stone-300 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User selector / info */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-stone-700">
            <div className="w-7 h-7 rounded-full bg-stone-700 overflow-hidden border border-amber-500/50">
              <img 
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                alt={currentUser.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left text-xs">
              <p className="font-semibold text-stone-200 leading-tight truncate max-w-[110px]">{currentUser.name.split(' ')[0]}</p>
              <p className="text-[10px] text-amber-400 capitalize">{currentUser.role}</p>
            </div>
          </div>

          {/* Reset Demo Data button */}
          <button
            id="btn-reset-demo"
            onClick={resetDemoData}
            title="Reset Data Simulasi ke Kondisi Awal"
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 text-xs flex items-center gap-1 border border-stone-700/80 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Reset Data</span>
          </button>
        </div>
      </div>

      {/* Role Navigation Tabs - High Contrast, Modern Touch UI */}
      <div className="bg-stone-950 border-t border-stone-800/80">
        <div className="max-w-7xl mx-auto px-2 sm:px-6">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar" aria-label="Role Switcher">
            {roleOptions.map(tab => {
              const isActive = currentRole === tab.role;
              return (
                <button
                  key={tab.role}
                  id={`tab-role-${tab.role}`}
                  onClick={() => setCurrentRole(tab.role)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                      : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/70'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span 
                      className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive 
                          ? 'bg-stone-950 text-amber-400' 
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
