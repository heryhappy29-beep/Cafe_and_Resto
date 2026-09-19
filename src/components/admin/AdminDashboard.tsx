import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { MenuItem, MenuCategory, User, UserRole } from '../../types';
import { 
  Store, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Coffee, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  BarChart3, 
  Calendar, 
  Percent, 
  Layers,
  KeyRound
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    menus, 
    addMenuItem, 
    updateMenuItem, 
    deleteMenuItem, 
    toggleMenuAvailability,
    users, 
    addUser, 
    updateUser, 
    deleteUser, 
    toggleUserActive,
    payments, 
    orders, 
    formatRupiah 
  } = useCafe();

  const [activeTab, setActiveTab] = useState<'laporan' | 'menu' | 'user'>('laporan');
  const [reportPeriod, setReportPeriod] = useState<'harian' | 'mingguan' | 'bulanan'>('harian');

  // Menu Modal State
  const [isMenuModalOpen, setIsMenuModalOpen] = useState<boolean>(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [menuForm, setMenuForm] = useState({
    name: '',
    category: 'coffee' as MenuCategory,
    price: 25000,
    costPrice: 10000,
    description: '',
    imageUrl: '',
    preparationTimeMinutes: 5,
    isAvailable: true,
  });

  // User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    username: '',
    role: 'pelayan' as UserRole,
    pin: '1234',
    phone: '',
    avatarUrl: '',
    isActive: true,
  });

  // Analytics calculations
  const totalRevenue = payments.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalTransactions = payments.length;
  const averageOrderValue = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;
  
  // Calculate top selling menus across all orders
  const itemCounts: Record<string, { name: string; quantity: number; revenue: number }> = {};
  orders.forEach(order => {
    order.items.forEach(it => {
      if (!itemCounts[it.menuName]) {
        itemCounts[it.menuName] = { name: it.menuName, quantity: 0, revenue: 0 };
      }
      itemCounts[it.menuName].quantity += it.quantity;
      itemCounts[it.menuName].revenue += it.quantity * it.price;
    });
  });
  const topSellingList = Object.values(itemCounts).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  // Mock Sales chart points based on period
  const chartData = reportPeriod === 'harian' 
    ? [
        { label: '08:00', value: 85000 },
        { label: '10:00', value: 210000 },
        { label: '12:00', value: 430000 },
        { label: '14:00', value: 310000 },
        { label: '16:00', value: 520000 },
        { label: '18:00', value: 680000 },
        { label: '20:00', value: 490000 },
      ]
    : reportPeriod === 'mingguan'
    ? [
        { label: 'Sen', value: 1450000 },
        { label: 'Sel', value: 1720000 },
        { label: 'Rab', value: 1980000 },
        { label: 'Kam', value: 2200000 },
        { label: 'Jum', value: 3150000 },
        { label: 'Sab', value: 4850000 },
        { label: 'Min', value: 4200000 },
      ]
    : [
        { label: 'Mgg 1', value: 12400000 },
        { label: 'Mgg 2', value: 14800000 },
        { label: 'Mgg 3', value: 17500000 },
        { label: 'Mgg 4', value: 19200000 },
      ];

  const maxChartVal = Math.max(...chartData.map(d => d.value), 1);

  // Handle open Menu Form
  const handleOpenAddMenu = () => {
    setEditingMenu(null);
    setMenuForm({
      name: '',
      category: 'coffee',
      price: 25000,
      costPrice: 10000,
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=80',
      preparationTimeMinutes: 5,
      isAvailable: true,
    });
    setIsMenuModalOpen(true);
  };

  const handleOpenEditMenu = (item: MenuItem) => {
    setEditingMenu(item);
    setMenuForm({
      name: item.name,
      category: item.category,
      price: item.price,
      costPrice: item.costPrice,
      description: item.description,
      imageUrl: item.imageUrl,
      preparationTimeMinutes: item.preparationTimeMinutes,
      isAvailable: item.isAvailable,
    });
    setIsMenuModalOpen(true);
  };

  const handleSaveMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuForm.name.trim()) return;

    if (editingMenu) {
      updateMenuItem(editingMenu.id, menuForm);
    } else {
      addMenuItem(menuForm);
    }
    setIsMenuModalOpen(false);
  };

  // Handle open User Form
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      username: '',
      role: 'pelayan',
      pin: '1234',
      phone: '',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      isActive: true,
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      username: user.username,
      role: user.role,
      pin: user.pin,
      phone: user.phone || '',
      avatarUrl: user.avatarUrl || '',
      isActive: user.isActive,
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name.trim() || !userForm.username.trim()) return;

    if (editingUser) {
      updateUser(editingUser.id, userForm);
    } else {
      addUser(userForm);
    }
    setIsUserModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Header bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-amber-500">
            Modul Pemilik Cafe & Administrator
          </span>
          <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-400" />
            Executive Dashboard & Master Data Management
          </h2>
        </div>

        {/* Sub-nav Tabs */}
        <div className="flex rounded-xl bg-stone-950 p-1 border border-stone-800 text-xs">
          <button
            onClick={() => setActiveTab('laporan')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === 'laporan' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Laporan Penjualan</span>
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === 'menu' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Manajemen Menu ({menus.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('user')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === 'user' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manajemen Karyawan ({users.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LAPORAN PENJUALAN & ANALITIK */}
      {activeTab === 'laporan' && (
        <div className="space-y-6">
          {/* Key Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                <span>Total Omzet Penjualan</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-extrabold text-stone-100 font-mono">
                {formatRupiah(totalRevenue)}
              </p>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                <TrendingUp className="w-3 h-3" /> +18.4% vs periode lalu
              </span>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                <span>Total Transaksi Selesai</span>
                <ShoppingBag className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-extrabold text-stone-100 font-mono">
                {totalTransactions} Transaksi
              </p>
              <span className="text-[11px] text-stone-400 mt-1 block">
                {orders.filter(o => o.status !== 'selesai' && o.status !== 'dibatalkan').length} pesanan sedang aktif
              </span>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                <span>Rata-rata Nilai Order (AOV)</span>
                <Percent className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-extrabold text-stone-100 font-mono">
                {formatRupiah(averageOrderValue)}
              </p>
              <span className="text-[11px] text-stone-400 mt-1 block">Per meja per kunjungan</span>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                <span>Top Seller Terlaris</span>
                <Coffee className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-lg font-bold text-stone-100 truncate">
                {topSellingList[0]?.name || 'Kopi Susu Gula Aren'}
              </p>
              <span className="text-[11px] text-amber-400 font-semibold mt-1 block">
                {topSellingList[0]?.quantity || 0} porsi terjual
              </span>
            </div>
          </div>

          {/* Graphical Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sales Chart (8 cols) */}
            <div className="lg:col-span-8 bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="font-bold text-stone-100 text-base">Grafik Tren Penjualan</h3>
                  <p className="text-xs text-stone-400">Distribusi pendapatan berdasarkan waktu operasional</p>
                </div>

                {/* Filter Timeframe */}
                <div className="flex rounded-xl bg-stone-950 p-1 border border-stone-800 text-xs">
                  {(['harian', 'mingguan', 'bulanan'] as const).map(period => (
                    <button
                      key={period}
                      onClick={() => setReportPeriod(period)}
                      className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                        reportPeriod === period ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bar / Column Chart Visual */}
              <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-4 border-b border-stone-800">
                {chartData.map((bar, idx) => {
                  const heightPercent = Math.round((bar.value / maxChartVal) * 100);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                      <span className="text-[10px] font-mono text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-bold whitespace-nowrap">
                        {formatRupiah(bar.value)}
                      </span>
                      <div 
                        className="w-full max-w-[48px] rounded-t-lg bg-gradient-to-t from-amber-600 to-amber-400 group-hover:from-amber-500 group-hover:to-amber-300 transition-all duration-300 shadow-sm"
                        style={{ height: `${Math.max(12, heightPercent)}%` }}
                      ></div>
                      <span className="text-xs text-stone-400 font-mono mt-2">{bar.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Summary Text (Spesifikasi Admin) */}
              <div className="mt-4 p-3 rounded-xl bg-stone-950/80 border border-stone-800 text-xs text-stone-300 leading-relaxed">
                <strong className="text-amber-400">Ringkasan Laporan: </strong>
                Berdasarkan data periode {reportPeriod}, puncak transaksi (peak hours) terjadi pada pukul 16:00 - 20:00 dengan kontribusi pendapatan terbesar dari kategori Minuman Coffee (42%) dan Makanan Utama (38%). Efisiensi waktu tunggu meja rata-rata 14 menit dari pesanan dikirim hingga siap saji.
              </div>
            </div>

            {/* Top 5 Items List (4 cols) */}
            <div className="lg:col-span-4 bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-stone-100 text-base mb-1">5 Menu Terfavorit</h3>
                <p className="text-xs text-stone-400 mb-4">Diurutkan berdasarkan volume penjualan</p>

                <div className="space-y-3">
                  {topSellingList.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-stone-800/60 border border-stone-700/60 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-stone-200 leading-tight">{item.name}</p>
                          <span className="text-[10px] text-stone-400">{item.quantity} porsi</span>
                        </div>
                      </div>
                      <span className="font-mono text-amber-400 font-bold">
                        {formatRupiah(item.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] text-stone-500 text-center">
                Data disinkronkan otomatis dari transaksi Kasir yang berhasil.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAJEMEN MENU (CRUD) */}
      {activeTab === 'menu' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-stone-100">Katalog Menu & Harga Cafe</h3>
              <p className="text-xs text-stone-400">Kelola daftar produk, kategori, harga jual, HPP, dan ketersediaan stok</p>
            </div>
            <button
              id="btn-add-menu-modal"
              onClick={handleOpenAddMenu}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Menu Baru</span>
            </button>
          </div>

          {/* Table of Menus */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-800/80 text-stone-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-3 rounded-l-lg">Foto & Nama Menu</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3 text-right">Harga Jual</th>
                  <th className="py-3 px-3 text-right">HPP (Modal)</th>
                  <th className="py-3 px-3 text-center">Estimasi Masak</th>
                  <th className="py-3 px-3 text-center">Status Stok</th>
                  <th className="py-3 px-3 text-right rounded-r-lg">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 text-stone-200">
                {menus.map(item => (
                  <tr key={item.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-3 px-3 flex items-center gap-3">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-lg object-cover bg-stone-800"
                      />
                      <div>
                        <p className="font-bold text-stone-100">{item.name}</p>
                        <p className="text-[11px] text-stone-400 truncate max-w-xs">{item.description}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-800 border border-stone-700 text-amber-400">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-amber-400">
                      {formatRupiah(item.price)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-stone-400">
                      {formatRupiah(item.costPrice)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-stone-300">
                      {item.preparationTimeMinutes} mnt
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => toggleMenuAvailability(item.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                          item.isAvailable
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : 'bg-rose-950 text-rose-300 border border-rose-700'
                        }`}
                      >
                        {item.isAvailable ? 'Tersedia' : 'Habis'}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditMenu(item)}
                          className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                          title="Edit Menu"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus menu "${item.name}"?`)) {
                              deleteMenuItem(item.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 transition-colors"
                          title="Hapus Menu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MANAJEMEN USER & ROLE (CRUD) */}
      {activeTab === 'user' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-stone-100">Manajemen Pengguna (RBAC)</h3>
              <p className="text-xs text-stone-400">Kelola akun karyawan dan hak akses role (Admin, Kasir, Pelayan, Dapur)</p>
            </div>
            <button
              id="btn-add-user-modal"
              onClick={handleOpenAddUser}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Karyawan Baru</span>
            </button>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-800/80 text-stone-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-3 rounded-l-lg">Karyawan</th>
                  <th className="py-3 px-3">Username & PIN</th>
                  <th className="py-3 px-3">Role Akses</th>
                  <th className="py-3 px-3">Kontak Telp</th>
                  <th className="py-3 px-3 text-center">Status Akun</th>
                  <th className="py-3 px-3 text-right rounded-r-lg">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 text-stone-200">
                {users.map(user => {
                  const roleColors: Record<UserRole, string> = {
                    admin: 'bg-purple-950 text-purple-300 border-purple-700',
                    kasir: 'bg-teal-950 text-teal-300 border-teal-700',
                    pelayan: 'bg-blue-950 text-blue-300 border-blue-700',
                    dapur: 'bg-amber-950 text-amber-300 border-amber-700',
                  };

                  return (
                    <tr key={user.id} className="hover:bg-stone-800/40 transition-colors">
                      <td className="py-3 px-3 flex items-center gap-3">
                        <img 
                          src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                          alt={user.name} 
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover border border-stone-700"
                        />
                        <div>
                          <p className="font-bold text-stone-100">{user.name}</p>
                          <p className="text-[10px] text-stone-400">ID: {user.id}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-stone-300">@{user.username}</span>
                        <div className="text-[10px] text-stone-500 font-mono flex items-center gap-1 mt-0.5">
                          <KeyRound className="w-3 h-3" /> PIN: {user.pin}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${roleColors[user.role]}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-stone-400 font-mono">
                        {user.phone || '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => toggleUserActive(user.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                            user.isActive
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : 'bg-stone-800 text-stone-500 border border-stone-700'
                          }`}
                        >
                          {user.isActive ? 'Aktif' : 'Non-Aktif'}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditUser(user)}
                            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                            title="Edit Akun Karyawan"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {users.length > 1 && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus pengguna ${user.name}?`)) {
                                  deleteUser(user.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 transition-colors"
                              title="Hapus Karyawan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL MENU (CREATE / UPDATE) */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveMenu} className="bg-stone-900 border border-stone-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-base font-bold text-stone-100">
                {editingMenu ? `Edit Menu: ${editingMenu.name}` : 'Tambah Menu Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsMenuModalOpen(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-stone-400 mb-1 font-semibold">Nama Menu</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kopi Susu Aren Spesial"
                  value={menuForm.name}
                  onChange={e => setMenuForm({ ...menuForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-semibold">Kategori</label>
                <select
                  value={menuForm.category}
                  onChange={e => setMenuForm({ ...menuForm, category: e.target.value as MenuCategory })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="coffee">Coffee</option>
                  <option value="non-coffee">Non-Coffee</option>
                  <option value="makanan">Makanan Utama</option>
                  <option value="snack">Snack / Camilan</option>
                  <option value="dessert">Dessert</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-semibold">Estimasi Masak (Menit)</label>
                <input
                  type="number"
                  min="1"
                  value={menuForm.preparationTimeMinutes}
                  onChange={e => setMenuForm({ ...menuForm, preparationTimeMinutes: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-semibold">Harga Jual (Rp)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="500"
                  value={menuForm.price}
                  onChange={e => setMenuForm({ ...menuForm, price: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-500 font-mono text-amber-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-semibold">HPP Modal (Rp)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={menuForm.costPrice}
                  onChange={e => setMenuForm({ ...menuForm, costPrice: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-500 font-mono text-stone-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-400 mb-1 font-semibold">URL Foto Menu</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={menuForm.imageUrl}
                  onChange={e => setMenuForm({ ...menuForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-500 font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-400 mb-1 font-semibold">Deskripsi Menu</label>
                <textarea
                  rows={2}
                  placeholder="Bahan, cita rasa, porsi..."
                  value={menuForm.description}
                  onChange={e => setMenuForm({ ...menuForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setIsMenuModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-md"
              >
                Simpan Menu
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL USER (CREATE / UPDATE) */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveUser} className="bg-stone-900 border border-stone-700 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-base font-bold text-stone-100">
                {editingUser ? `Edit Akun: ${editingUser.name}` : 'Tambah Karyawan Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 mb-1 font-semibold">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Andi Pratama"
                  value={userForm.name}
                  onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-400 mb-1 font-semibold">Username Login</label>
                  <input
                    type="text"
                    required
                    placeholder="andi1"
                    value={userForm.username}
                    onChange={e => setUserForm({ ...userForm, username: e.target.value.toLowerCase().trim() })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1 font-semibold">PIN Keamanan (4 Digit)</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="1234"
                    value={userForm.pin}
                    onChange={e => setUserForm({ ...userForm, pin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-500 font-mono text-center tracking-widest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-semibold">Role Akses (Hak Akses)</label>
                <select
                  value={userForm.role}
                  onChange={e => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-500 capitalize"
                >
                  <option value="admin">Admin / Pemilik</option>
                  <option value="kasir">Kasir</option>
                  <option value="pelayan">Pelayan (Waitress)</option>
                  <option value="dapur">Dapur (KDS)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-semibold">Nomor WhatsApp / HP</label>
                <input
                  type="text"
                  placeholder="0812-xxxx-xxxx"
                  value={userForm.phone}
                  onChange={e => setUserForm({ ...userForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-md"
              >
                Simpan Karyawan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
