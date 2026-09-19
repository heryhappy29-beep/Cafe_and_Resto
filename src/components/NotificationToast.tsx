import React, { useEffect, useState } from 'react';
import { useCafe } from '../context/CafeContext';
import { Bell, CheckCircle2, AlertTriangle, ChefHat, CreditCard, UtensilsCrossed, X } from 'lucide-react';
import { SystemEvent } from '../types';

export const NotificationToast: React.FC = () => {
  const { events, dismissEvent } = useCafe();
  const [activeToast, setActiveToast] = useState<SystemEvent | null>(null);

  useEffect(() => {
    if (events.length > 0) {
      // Pick newest event
      const latest = events[0];
      setActiveToast(latest);
      const timer = setTimeout(() => {
        setActiveToast(prev => (prev?.id === latest.id ? null : prev));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [events]);

  if (!activeToast) return null;

  const getIcon = (type: SystemEvent['type']) => {
    switch (type) {
      case 'order_created':
        return <UtensilsCrossed className="w-5 h-5 text-blue-400" />;
      case 'cooking_started':
        return <ChefHat className="w-5 h-5 text-amber-400" />;
      case 'order_ready':
        return <Bell className="w-5 h-5 text-emerald-400 animate-bounce" />;
      case 'payment_completed':
        return <CreditCard className="w-5 h-5 text-teal-400" />;
      case 'order_cancelled':
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-stone-900 border border-stone-700 text-stone-100 p-4 rounded-xl shadow-2xl shadow-black/60 flex items-start gap-3 backdrop-blur-md">
        <div className="p-2 rounded-lg bg-stone-800 border border-stone-700/80 shrink-0">
          {getIcon(activeToast.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Sinkronisasi Real-Time ({activeToast.actorRole})
            </span>
            <span className="text-[10px] text-stone-500">
              {new Date(activeToast.timestamp).toLocaleTimeString('id-ID', { minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <p className="text-xs text-stone-200 leading-snug font-medium">
            {activeToast.message}
          </p>
        </div>
        <button
          onClick={() => {
            dismissEvent(activeToast.id);
            setActiveToast(null);
          }}
          className="text-stone-500 hover:text-stone-300 p-1 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
