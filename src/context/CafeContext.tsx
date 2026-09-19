import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  UserRole, 
  MenuItem, 
  Order, 
  OrderItem, 
  OrderStatus, 
  PaymentRecord, 
  PaymentMethod, 
  SystemEvent 
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_MENUS, 
  INITIAL_ORDERS, 
  INITIAL_PAYMENTS 
} from '../data/mockData';

interface CafeContextType {
  // Current session
  currentRole: UserRole | 'docs';
  setCurrentRole: (role: UserRole | 'docs') => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  
  // Data
  users: User[];
  menus: MenuItem[];
  orders: Order[];
  payments: PaymentRecord[];
  events: SystemEvent[];
  
  // Menu CRUD (Admin)
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  toggleMenuAvailability: (id: string) => void;
  
  // User CRUD (Admin)
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  toggleUserActive: (id: string) => void;
  
  // Order Operations (Pelayan / Waitress)
  createOrder: (tableNumber: number, customerName: string, items: Omit<OrderItem, 'id'>[], notes?: string) => { success: boolean; message: string; orderId?: string };
  updateOrderItems: (orderId: string, items: Omit<OrderItem, 'id'>[], notes?: string) => { success: boolean; message: string };
  cancelOrder: (orderId: string, reason: string) => { success: boolean; message: string };
  markOrderServed: (orderId: string) => { success: boolean; message: string };
  
  // Kitchen Operations (Dapur / KDS)
  startCookingOrder: (orderId: string) => { success: boolean; message: string };
  toggleKitchenItem: (orderId: string, itemId: string) => void;
  markOrderReady: (orderId: string) => { success: boolean; message: string };
  
  // Cashier Operations (Kasir)
  processPayment: (
    orderId: string, 
    method: PaymentMethod, 
    amountPaid: number, 
    discount?: number
  ) => { success: boolean; message: string; payment?: PaymentRecord };
  
  // Utilities
  formatRupiah: (amount: number) => string;
  calculateOrderTotals: (items: { price: number; quantity: number }[], discount?: number) => {
    subtotal: number;
    tax: number;
    serviceCharge: number;
    discount: number;
    total: number;
  };
  dismissEvent: (id: string) => void;
  clearAllEvents: () => void;
  resetDemoData: () => void;
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

export const CafeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole | 'docs'>('pelayan');
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[2]); // Waitress Rian
  const [menus, setMenus] = useState<MenuItem[]>(INITIAL_MENUS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [events, setEvents] = useState<SystemEvent[]>([]);

  // Keep currentUser synced when role switch happens
  const handleSetRole = (role: UserRole | 'docs') => {
    setCurrentRole(role);
    if (role !== 'docs') {
      const match = users.find(u => u.role === role);
      if (match) {
        setCurrentUser(match);
      }
    }
  };

  const broadcastEvent = (
    type: SystemEvent['type'],
    order: Order,
    message: string,
    actorRole: UserRole,
    actorName: string
  ) => {
    const newEvent: SystemEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      orderId: order.id,
      orderNumber: order.orderNumber,
      tableNumber: order.tableNumber,
      message,
      timestamp: new Date().toISOString(),
      actorRole,
      actorName,
    };
    setEvents(prev => [newEvent, ...prev.slice(0, 19)]); // Keep last 20
  };

  const calculateOrderTotals = (items: { price: number; quantity: number }[], discount = 0) => {
    const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const tax = Math.round(subtotal * 0.1); // PPN 10%
    const serviceCharge = Math.round(subtotal * 0.05); // Service 5%
    const total = Math.max(0, subtotal + tax + serviceCharge - discount);
    return { subtotal, tax, serviceCharge, discount, total };
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // --- MENU CRUD (Admin) ---
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `menu-${Date.now()}`,
    };
    setMenus(prev => [newItem, ...prev]);
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenus(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMenuItem = (id: string) => {
    setMenus(prev => prev.filter(m => m.id !== id));
  };

  const toggleMenuAvailability = (id: string) => {
    setMenus(prev => prev.map(m => m.id === id ? { ...m, isAvailable: !m.isAvailable } : m));
  };

  // --- USER CRUD (Admin) ---
  const addUser = (user: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...user,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (currentUser.id === id) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
    }
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const toggleUserActive = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
  };

  // --- WAITRESS OPERATIONS ---
  const createOrder = (
    tableNumber: number, 
    customerName: string, 
    items: Omit<OrderItem, 'id'>[], 
    notes?: string
  ) => {
    if (items.length === 0) {
      return { success: false, message: 'Harap pilih minimal 1 menu pesanan.' };
    }

    // Check if table already has active unpaid order
    const existingActive = orders.find(
      o => o.tableNumber === tableNumber && o.status !== 'selesai' && o.status !== 'dibatalkan'
    );
    if (existingActive) {
      return { 
        success: false, 
        message: `Meja ${tableNumber} masih memiliki pesanan aktif (${existingActive.orderNumber}) yang belum diselesaikan di Kasir.` 
      };
    }

    const { subtotal, tax, serviceCharge, discount, total } = calculateOrderTotals(items);
    const orderItems: OrderItem[] = items.map((it, idx) => ({
      ...it,
      id: `item-${Date.now()}-${idx}`,
      isCompletedInKitchen: false,
    }));

    const orderNumber = `ORD-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      tableNumber,
      customerName: customerName.trim() || `Pelanggan Meja ${tableNumber}`,
      waiterId: currentUser.id,
      waiterName: currentUser.name,
      items: orderItems,
      status: 'menunggu_konfirmasi',
      subtotal,
      tax,
      serviceCharge,
      discount,
      total,
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    setOrders(prev => [newOrder, ...prev]);
    broadcastEvent(
      'order_created',
      newOrder,
      `Pesanan baru ${orderNumber} di Meja ${tableNumber} dikirim ke Dapur.`,
      'pelayan',
      currentUser.name
    );

    return { success: true, message: `Pesanan ${orderNumber} berhasil dikirim ke Dapur!`, orderId: newOrder.id };
  };

  const updateOrderItems = (
    orderId: string, 
    items: Omit<OrderItem, 'id'>[], 
    notes?: string
  ) => {
    const existing = orders.find(o => o.id === orderId);
    if (!existing) return { success: false, message: 'Pesanan tidak ditemukan.' };

    // ANTI-CONFLICT RULE: Cannot edit if Dapur has started cooking or already paid!
    if (existing.status !== 'menunggu_konfirmasi') {
      return { 
        success: false, 
        message: `Konflik status! Pesanan tidak dapat diedit karena sudah berstatus '${existing.status}'. Hubungi Dapur/Kasir langsung.` 
      };
    }

    const { subtotal, tax, serviceCharge, discount, total } = calculateOrderTotals(items);
    const orderItems: OrderItem[] = items.map((it, idx) => ({
      ...it,
      id: `item-${Date.now()}-${idx}`,
      isCompletedInKitchen: false,
    }));

    const updatedOrder: Order = {
      ...existing,
      items: orderItems,
      subtotal,
      tax,
      serviceCharge,
      discount,
      total,
      notes: notes !== undefined ? notes : existing.notes,
      updatedAt: new Date().toISOString(),
      version: existing.version + 1,
    };

    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    broadcastEvent(
      'order_updated',
      updatedOrder,
      `Pelayan ${currentUser.name} memperbarui pesanan ${updatedOrder.orderNumber} (Meja ${updatedOrder.tableNumber}).`,
      'pelayan',
      currentUser.name
    );

    return { success: true, message: 'Pesanan berhasil diperbarui.' };
  };

  const cancelOrder = (orderId: string, reason: string) => {
    const existing = orders.find(o => o.id === orderId);
    if (!existing) return { success: false, message: 'Pesanan tidak ditemukan.' };

    // ANTI-CONFLICT: Only pending orders can be cancelled directly by waitress
    if (existing.status !== 'menunggu_konfirmasi') {
      return { 
        success: false, 
        message: `Gagal membatalkan! Pesanan sudah diproses oleh Dapur (${existing.status}). Membutuhkan otorisasi Supervisor/Admin.` 
      };
    }

    const cancelledOrder: Order = {
      ...existing,
      status: 'dibatalkan',
      notes: `${existing.notes ? existing.notes + ' | ' : ''}Dibatalkan: ${reason}`,
      updatedAt: new Date().toISOString(),
      version: existing.version + 1,
    };

    setOrders(prev => prev.map(o => o.id === orderId ? cancelledOrder : o));
    broadcastEvent(
      'order_cancelled',
      cancelledOrder,
      `Pesanan ${cancelledOrder.orderNumber} (Meja ${cancelledOrder.tableNumber}) dibatalkan. Alasan: ${reason}`,
      'pelayan',
      currentUser.name
    );

    return { success: true, message: 'Pesanan berhasil dibatalkan.' };
  };

  const markOrderServed = (orderId: string) => {
    const existing = orders.find(o => o.id === orderId);
    if (!existing) return { success: false, message: 'Pesanan tidak ditemukan.' };

    const servedOrder: Order = {
      ...existing,
      status: 'sudah_disajikan',
      servedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: existing.version + 1,
    };

    setOrders(prev => prev.map(o => o.id === orderId ? servedOrder : o));
    broadcastEvent(
      'order_served',
      servedOrder,
      `Makanan untuk Meja ${servedOrder.tableNumber} telah disajikan ke tamu oleh Pelayan.`,
      'pelayan',
      currentUser.name
    );

    return { success: true, message: `Pesanan Meja ${servedOrder.tableNumber} ditandai sudah disajikan!` };
  };

  // --- KITCHEN OPERATIONS ---
  const startCookingOrder = (orderId: string) => {
    const existing = orders.find(o => o.id === orderId);
    if (!existing) return { success: false, message: 'Pesanan tidak ditemukan.' };

    if (existing.status === 'dibatalkan' || existing.status === 'selesai') {
      return { success: false, message: `Pesanan sudah dalam status ${existing.status}.` };
    }

    const updated: Order = {
      ...existing,
      status: 'sedang_diproses',
      startedCookingAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: existing.version + 1,
    };

    setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    broadcastEvent(
      'cooking_started',
      updated,
      `Dapur mulai memasak pesanan ${updated.orderNumber} untuk Meja ${updated.tableNumber}.`,
      'dapur',
      currentUser.name
    );

    return { success: true, message: `Pesanan Meja ${updated.tableNumber} sedang dimasak!` };
  };

  const toggleKitchenItem = (orderId: string, itemId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const updatedItems = o.items.map(it => it.id === itemId ? { ...it, isCompletedInKitchen: !it.isCompletedInKitchen } : it);
      return { ...o, items: updatedItems, updatedAt: new Date().toISOString() };
    }));
  };

  const markOrderReady = (orderId: string) => {
    const existing = orders.find(o => o.id === orderId);
    if (!existing) return { success: false, message: 'Pesanan tidak ditemukan.' };

    // Mark all items completed
    const allDoneItems = existing.items.map(it => ({ ...it, isCompletedInKitchen: true }));
    const readyOrder: Order = {
      ...existing,
      items: allDoneItems,
      status: 'siap_saji',
      readyAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: existing.version + 1,
    };

    setOrders(prev => prev.map(o => o.id === orderId ? readyOrder : o));
    broadcastEvent(
      'order_ready',
      readyOrder,
      `🔔 SIAP SAJI! Pesanan ${readyOrder.orderNumber} (Meja ${readyOrder.tableNumber}) siap diantar ke tamu!`,
      'dapur',
      currentUser.name
    );

    return { success: true, message: `Notifikasi terkirim ke Pelayan: Pesanan Meja ${readyOrder.tableNumber} siap saji!` };
  };

  // --- CASHIER OPERATIONS ---
  const processPayment = (
    orderId: string, 
    method: PaymentMethod, 
    amountPaid: number, 
    discount = 0
  ) => {
    const existing = orders.find(o => o.id === orderId);
    if (!existing) return { success: false, message: 'Pesanan tidak ditemukan.' };

    if (existing.status === 'selesai') {
      return { success: false, message: 'Pesanan ini sudah dibayar sebelumnya.' };
    }

    const effectiveTotal = Math.max(0, existing.subtotal + existing.tax + existing.serviceCharge - discount);
    if (amountPaid < effectiveTotal && method === 'cash') {
      return { success: false, message: 'Uang tunai yang diterima kurang dari total tagihan.' };
    }

    const changeAmount = method === 'cash' ? Math.max(0, amountPaid - effectiveTotal) : 0;
    const finalAmountPaid = method === 'cash' ? amountPaid : effectiveTotal;

    const paymentRecord: PaymentRecord = {
      id: `pay-${Date.now()}`,
      orderId: existing.id,
      orderNumber: existing.orderNumber,
      tableNumber: existing.tableNumber,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      subtotal: existing.subtotal,
      tax: existing.tax,
      serviceCharge: existing.serviceCharge,
      discount,
      totalAmount: effectiveTotal,
      paymentMethod: method,
      amountPaid: finalAmountPaid,
      changeAmount,
      transactionReference: method === 'qris' 
        ? `QRIS-${Date.now().toString().slice(-8)}`
        : method === 'debit' 
        ? `EDC-${Date.now().toString().slice(-6)}`
        : `CASH-${Date.now().toString().slice(-4)}`,
      paidAt: new Date().toISOString(),
    };

    const completedOrder: Order = {
      ...existing,
      status: 'selesai',
      discount,
      total: effectiveTotal,
      paidAt: paymentRecord.paidAt,
      updatedAt: new Date().toISOString(),
      version: existing.version + 1,
    };

    setOrders(prev => prev.map(o => o.id === orderId ? completedOrder : o));
    setPayments(prev => [paymentRecord, ...prev]);

    broadcastEvent(
      'payment_completed',
      completedOrder,
      `Pembayaran ${completedOrder.orderNumber} (Meja ${completedOrder.tableNumber}) lunas via ${method.toUpperCase()} (${formatRupiah(effectiveTotal)}).`,
      'kasir',
      currentUser.name
    );

    return { 
      success: true, 
      message: `Pembayaran Meja ${completedOrder.tableNumber} berhasil!`, 
      payment: paymentRecord 
    };
  };

  const dismissEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const clearAllEvents = () => {
    setEvents([]);
  };

  const resetDemoData = () => {
    setUsers(INITIAL_USERS);
    setMenus(INITIAL_MENUS);
    setOrders(INITIAL_ORDERS);
    setPayments(INITIAL_PAYMENTS);
    setEvents([]);
  };

  return (
    <CafeContext.Provider
      value={{
        currentRole,
        setCurrentRole: handleSetRole,
        currentUser,
        setCurrentUser,
        users,
        menus,
        orders,
        payments,
        events,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleMenuAvailability,
        addUser,
        updateUser,
        deleteUser,
        toggleUserActive,
        createOrder,
        updateOrderItems,
        cancelOrder,
        markOrderServed,
        startCookingOrder,
        toggleKitchenItem,
        markOrderReady,
        processPayment,
        formatRupiah,
        calculateOrderTotals,
        dismissEvent,
        clearAllEvents,
        resetDemoData,
      }}
    >
      {children}
    </CafeContext.Provider>
  );
};

export const useCafe = () => {
  const context = useContext(CafeContext);
  if (!context) {
    throw new Error('useCafe must be used within a CafeProvider');
  }
  return context;
};
