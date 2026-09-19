import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { MenuItem, MenuCategory, OrderItem, Order } from '../../types';
import { 
  UtensilsCrossed, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Coffee, 
  Flame, 
  ShoppingBag, 
  ChevronRight, 
  User, 
  FileText,
  Edit3
} from 'lucide-react';

export const WaitressView: React.FC = () => {
  const { 
    menus, 
    orders, 
    createOrder, 
    updateOrderItems, 
    cancelOrder, 
    markOrderServed, 
    formatRupiah,
    calculateOrderTotals,
    currentUser
  } = useCafe();

  const [selectedTable, setSelectedTable] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cartItems, setCartItems] = useState<Omit<OrderItem, 'id'>[]>([]);
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Editing existing pending order mode
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  // Find if selected table currently has an active order
  const currentTableOrder = orders.find(
    o => o.tableNumber === selectedTable && o.status !== 'selesai' && o.status !== 'dibatalkan'
  );

  const categories: { id: MenuCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'Semua Menu' },
    { id: 'coffee', label: 'Coffee' },
    { id: 'non-coffee', label: 'Non-Coffee' },
    { id: 'makanan', label: 'Makanan Utama' },
    { id: 'snack', label: 'Snack / Camilan' },
    { id: 'dessert', label: 'Dessert' },
  ];

  const filteredMenus = menus.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddToCart = (menu: MenuItem) => {
    if (!menu.isAvailable) return;
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.menuId === menu.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += 1;
        return next;
      } else {
        return [
          ...prev,
          {
            menuId: menu.id,
            menuName: menu.name,
            price: menu.price,
            quantity: 1,
            notes: '',
            isCompletedInKitchen: false,
          },
        ];
      }
    });
  };

  const handleUpdateQty = (index: number, delta: number) => {
    setCartItems(prev => {
      const next = [...prev];
      const newQty = next[index].quantity + delta;
      if (newQty <= 0) {
        return next.filter((_, idx) => idx !== index);
      }
      next[index].quantity = newQty;
      return next;
    });
  };

  const handleItemNoteChange = (index: number, note: string) => {
    setCartItems(prev => {
      const next = [...prev];
      next[index].notes = note;
      return next;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCartItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const { subtotal, tax, serviceCharge, total } = calculateOrderTotals(cartItems);

  const handleSubmitOrder = () => {
    if (cartItems.length === 0) {
      setFeedbackMsg({ text: 'Pilih minimal 1 menu sebelum mengirim ke dapur.', isError: true });
      return;
    }

    if (editingOrderId) {
      const result = updateOrderItems(editingOrderId, cartItems, orderNotes);
      setFeedbackMsg({ text: result.message, isError: !result.success });
      if (result.success) {
        setCartItems([]);
        setEditingOrderId(null);
        setOrderNotes('');
      }
    } else {
      const result = createOrder(selectedTable, customerName, cartItems, orderNotes);
      setFeedbackMsg({ text: result.message, isError: !result.success });
      if (result.success) {
        setCartItems([]);
        setCustomerName('');
        setOrderNotes('');
      }
    }
  };

  const handleStartEditPendingOrder = (order: Order) => {
    if (order.status !== 'menunggu_konfirmasi') {
      setFeedbackMsg({ 
        text: `Pesanan tidak dapat diedit karena sudah ${order.status.replace('_', ' ')}. Anti-Conflict Rule aktif.`, 
        isError: true 
      });
      return;
    }
    setEditingOrderId(order.id);
    setSelectedTable(order.tableNumber);
    setCustomerName(order.customerName || '');
    setOrderNotes(order.notes || '');
    setCartItems(order.items.map(it => ({
      menuId: it.menuId,
      menuName: it.menuName,
      price: it.price,
      quantity: it.quantity,
      notes: it.notes || '',
      isCompletedInKitchen: it.isCompletedInKitchen || false,
    })));
  };

  const handleCancelEditing = () => {
    setEditingOrderId(null);
    setCartItems([]);
    setOrderNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      {/* Top Banner with Table Quick Selector */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-500">
              Modul Pelayan / Tablet POS
            </span>
            <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-amber-400" />
              Pencatatan Pesanan Meja Tamu
            </h2>
          </div>
          <div className="text-xs text-stone-400 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            Pelayan Aktif: <strong className="text-stone-200">{currentUser.name}</strong>
          </div>
        </div>

        {/* Table Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs text-stone-400 font-medium mr-1 shrink-0">Pilih Meja:</span>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(tableNum => {
            const activeOrd = orders.find(
              o => o.tableNumber === tableNum && o.status !== 'selesai' && o.status !== 'dibatalkan'
            );
            const isSelected = selectedTable === tableNum;
            
            let badgeColor = 'bg-stone-800 text-stone-300 border-stone-700 hover:border-amber-500';
            let statusDot = 'bg-stone-500';

            if (activeOrd) {
              if (activeOrd.status === 'siap_saji') {
                badgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60 font-bold';
                statusDot = 'bg-emerald-400 animate-ping';
              } else if (activeOrd.status === 'sedang_diproses') {
                badgeColor = 'bg-amber-950/80 text-amber-300 border-amber-600/60 font-medium';
                statusDot = 'bg-amber-400';
              } else {
                badgeColor = 'bg-blue-950/80 text-blue-300 border-blue-600/60';
                statusDot = 'bg-blue-400';
              }
            }

            if (isSelected) {
              badgeColor = 'bg-amber-500 text-stone-950 font-bold border-amber-400 ring-2 ring-amber-500/30';
              statusDot = 'bg-stone-950';
            }

            return (
              <button
                key={tableNum}
                id={`table-select-${tableNum}`}
                onClick={() => {
                  setSelectedTable(tableNum);
                  if (editingOrderId && currentTableOrder?.id !== editingOrderId) {
                    handleCancelEditing();
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs border flex items-center gap-1.5 transition-all shrink-0 ${badgeColor}`}
              >
                <span className={`w-2 h-2 rounded-full ${statusDot}`}></span>
                <span>Meja {tableNum}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Order on Current Table Alert (if exists) */}
      {currentTableOrder && (
        <div className={`mb-6 p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
          currentTableOrder.status === 'siap_saji'
            ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-200'
            : currentTableOrder.status === 'sedang_diproses'
            ? 'bg-amber-950/40 border-amber-600/60 text-amber-200'
            : 'bg-blue-950/40 border-blue-600/60 text-blue-200'
        }`}>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-stone-900/80 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">
                  Meja {selectedTable} memiliki Pesanan Aktif: {currentTableOrder.orderNumber}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-stone-900 text-stone-100 border border-stone-700">
                  {currentTableOrder.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs opacity-90 mt-0.5">
                Tamu: {currentTableOrder.customerName} &bull; {currentTableOrder.items.length} item &bull; Total: {formatRupiah(currentTableOrder.total)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentTableOrder.status === 'siap_saji' && (
              <button
                id="btn-mark-served"
                onClick={() => markOrderServed(currentTableOrder.id)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Antar & Tandai Disajikan
              </button>
            )}

            {currentTableOrder.status === 'menunggu_konfirmasi' && !editingOrderId && (
              <>
                <button
                  id="btn-edit-order"
                  onClick={() => handleStartEditPendingOrder(currentTableOrder)}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs border border-stone-600 flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Pesanan
                </button>
                <button
                  id="btn-cancel-order"
                  onClick={() => {
                    const reason = window.prompt('Masukkan alasan pembatalan pesanan:', 'Tamu membatalkan order');
                    if (reason) cancelOrder(currentTableOrder.id, reason);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs border border-rose-800 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Batalkan
                </button>
              </>
            )}

            {currentTableOrder.status === 'sedang_diproses' && (
              <span className="text-xs italic bg-stone-900/80 px-3 py-1.5 rounded-lg border border-amber-500/40 text-amber-300">
                🔒 Terkunci: Dapur sedang memasak, tidak bisa diedit via tablet
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Grid: Catalog on Left, Order Cart on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Menu Catalog (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                id="input-search-menu"
                type="text"
                placeholder="Cari menu kopi, makanan, snack..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Category Badges */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                id={`cat-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-colors border ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-semibold'
                    : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Menu Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredMenus.map(menu => {
              const inCartItem = cartItems.find(it => it.menuId === menu.id);
              return (
                <div
                  key={menu.id}
                  id={`card-menu-${menu.id}`}
                  className={`bg-stone-900 border rounded-2xl overflow-hidden flex flex-col justify-between transition-all hover:border-stone-700 ${
                    !menu.isAvailable ? 'opacity-60 border-stone-800/50' : 'border-stone-800'
                  }`}
                >
                  <div className="relative h-32 w-full overflow-hidden bg-stone-800">
                    <img
                      src={menu.imageUrl}
                      alt={menu.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-stone-950/80 text-amber-400 backdrop-blur-sm border border-stone-800">
                        {menu.category}
                      </span>
                      {!menu.isAvailable && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-rose-950/80 text-rose-300 border border-rose-800">
                          Habis
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-stone-100 text-sm leading-tight mb-1">{menu.name}</h4>
                      <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">{menu.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between">
                      <span className="font-bold text-amber-400 text-sm">
                        {formatRupiah(menu.price)}
                      </span>

                      {menu.isAvailable ? (
                        <div className="flex items-center gap-1.5">
                          {inCartItem && (
                            <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 text-xs font-bold flex items-center justify-center">
                              {inCartItem.quantity}
                            </span>
                          )}
                          <button
                            id={`btn-add-${menu.id}`}
                            onClick={() => handleAddToCart(menu)}
                            className="p-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition-colors shadow-sm"
                            title="Tambah ke Pesanan"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-stone-500 italic">Tidak Tersedia</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Order Sheet / Cart (5 cols on lg) */}
        <div className="lg:col-span-5">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col h-full shadow-lg sticky top-28">
            <div className="border-b border-stone-800 pb-3 mb-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-base text-stone-100">
                    {editingOrderId ? `Edit Pesanan #${editingOrderId.slice(-4)}` : `Pesanan Meja ${selectedTable}`}
                  </h3>
                </div>
                <p className="text-xs text-stone-400">
                  {cartItems.reduce((sum, it) => sum + it.quantity, 0)} item dipilih
                </p>
              </div>

              {editingOrderId && (
                <button
                  onClick={handleCancelEditing}
                  className="text-xs text-stone-400 hover:text-stone-200 underline"
                >
                  Batal Edit
                </button>
              )}
            </div>

            {/* Customer Name Input (if new order) */}
            {!editingOrderId && (
              <div className="mb-3">
                <label className="block text-xs font-semibold text-stone-400 mb-1">
                  Nama Pelanggan (Opsional)
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    id="input-customer-name"
                    type="text"
                    placeholder="Contoh: Bpk. Dani, Mas Rama"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-500 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto max-h-72 space-y-2.5 pr-1 mb-3">
              {cartItems.length === 0 ? (
                <div className="py-12 text-center text-stone-500 text-xs">
                  <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Belum ada menu yang dipilih untuk Meja {selectedTable}.
                  <br />
                  Klik tombol <span className="text-amber-400 font-bold">+</span> pada kartu menu di sebelah kiri.
                </div>
              ) : (
                cartItems.map((item, idx) => (
                  <div key={idx} className="bg-stone-800/80 border border-stone-700/80 rounded-xl p-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-stone-200 text-xs truncate">{item.menuName}</h5>
                        <span className="text-[11px] text-amber-400 font-semibold">
                          {formatRupiah(item.price * item.quantity)}
                        </span>
                      </div>

                      {/* Qty controls */}
                      <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-700 rounded-lg p-0.5">
                        <button
                          onClick={() => handleUpdateQty(idx, -1)}
                          className="p-1 hover:bg-stone-800 rounded text-stone-300"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-stone-100">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(idx, 1)}
                          className="p-1 hover:bg-stone-800 rounded text-stone-300"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 text-stone-500 hover:text-rose-400"
                        title="Hapus item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Special Note Input */}
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Catatan: misal pedas level 2, es sedikit..."
                        value={item.notes || ''}
                        onChange={e => handleItemNoteChange(idx, e.target.value)}
                        className="w-full px-2 py-1 rounded bg-stone-900/90 border border-stone-700/60 text-stone-300 placeholder-stone-600 text-[11px] focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* General Order Note */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Catatan umum pesanan (opsional)..."
                value={orderNotes}
                onChange={e => setOrderNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 placeholder-stone-500 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Price Calculations Summary */}
            <div className="border-t border-stone-800 pt-3 space-y-1 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>Subtotal Menu</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>PPN (10%)</span>
                <span>{formatRupiah(tax)}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Service Charge (5%)</span>
                <span>{formatRupiah(serviceCharge)}</span>
              </div>
              <div className="flex justify-between text-stone-100 font-bold text-sm pt-1 border-t border-stone-800">
                <span>Estimasi Total</span>
                <span className="text-amber-400">{formatRupiah(total)}</span>
              </div>
            </div>

            {/* Feedback Alert */}
            {feedbackMsg && (
              <div className={`mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                feedbackMsg.isError 
                  ? 'bg-rose-950/80 border border-rose-700 text-rose-200' 
                  : 'bg-emerald-950/80 border border-emerald-700 text-emerald-200'
              }`}>
                {feedbackMsg.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            {/* Send to Kitchen CTA */}
            <button
              id="btn-submit-order"
              onClick={handleSubmitOrder}
              disabled={cartItems.length === 0}
              className={`mt-3 w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                cartItems.length === 0
                  ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-lg shadow-amber-500/20 active:scale-[0.99]'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{editingOrderId ? 'Simpan Perubahan Pesanan' : 'Kirim Pesanan ke Dapur'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
