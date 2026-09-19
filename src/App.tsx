import React from 'react';
import { CafeProvider, useCafe } from './context/CafeContext';
import { Navbar } from './components/Navbar';
import { NotificationToast } from './components/NotificationToast';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CashierView } from './components/cashier/CashierView';
import { WaitressView } from './components/waitress/WaitressView';
import { KitchenKDS } from './components/kitchen/KitchenKDS';
import { ArchitectureDocs } from './components/docs/ArchitectureDocs';
import { Coffee, ShieldCheck, Zap, Sparkles } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentRole } = useCafe();

  return (
    <main className="min-h-[calc(100vh-120px)] bg-stone-950 text-stone-100">
      {currentRole === 'pelayan' && <WaitressView />}
      {currentRole === 'dapur' && <KitchenKDS />}
      {currentRole === 'kasir' && <CashierView />}
      {currentRole === 'admin' && <AdminDashboard />}
      {currentRole === 'docs' && <ArchitectureDocs />}
    </main>
  );
};

export default function App() {
  return (
    <CafeProvider>
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
        <Navbar />
        <MainContent />
        <NotificationToast />

        {/* Minimalist Professional Footer */}
        <footer className="mt-auto border-t border-stone-800/80 bg-stone-900/60 py-4 px-4 text-center text-xs text-stone-500">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-stone-300">Senja Rasa CafePOS</span>
              <span className="text-stone-600">&bull;</span>
              <span>Sistem Pemesanan Multi-User RBAC (Admin &bull; Kasir &bull; Pelayan &bull; Dapur)</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-stone-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Anti-Conflict Lock
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Real-Time Sync
              </span>
            </div>
          </div>
        </footer>
      </div>
    </CafeProvider>
  );
}
