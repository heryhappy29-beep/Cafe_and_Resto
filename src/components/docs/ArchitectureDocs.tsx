import React, { useState } from 'react';
import { 
  FileCode2, 
  Database, 
  FolderTree, 
  Code2, 
  Workflow, 
  Radio, 
  Copy, 
  Check, 
  ShieldCheck, 
  Server, 
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'db' | 'folder' | 'snippets' | 'workflow' | 'realtime'>('db');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sqlDDL = `-- =================================================================
-- SKEMA DATABASE APLIKASI PEMESANAN CAFE (POSTGRESQL / MYSQL)
-- DIOPTIMALKAN UNTUK RBAC, INTEGRITAS TRANSAKSI, & AUDIT LOG
-- =================================================================

-- 1. ENUM TIPE DATA (PostgreSQL)
CREATE TYPE user_role AS ENUM ('admin', 'kasir', 'pelayan', 'dapur');
CREATE TYPE order_status AS ENUM (
    'menunggu_konfirmasi', 
    'sedang_diproses', 
    'siap_saji', 
    'sudah_disajikan', 
    'selesai', 
    'dibatalkan'
);
CREATE TYPE payment_method AS ENUM ('cash', 'debit', 'qris');

-- 2. TABEL USERS (RBAC Karyawan & Autentikasi)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    pin_hash VARCHAR(255) NOT NULL, -- PIN cepat untuk kasir & waitress di tablet
    name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABEL CATEGORIES (Kategori Menu)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABEL MENUS (Katalog Makanan & Minuman)
CREATE TABLE menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0, -- HPP untuk analisa laba
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    preparation_time_minutes INT DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABEL ORDERS (Header Transaksi Pemesanan)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(30) UNIQUE NOT NULL, -- Contoh: ORD-2026-101
    table_number INT NOT NULL,
    customer_name VARCHAR(100),
    waiter_id UUID NOT NULL REFERENCES users(id),
    status order_status NOT NULL DEFAULT 'menunggu_konfirmasi',
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax NUMERIC(12, 2) NOT NULL DEFAULT 0,            -- PPN 10%
    service_charge NUMERIC(12, 2) NOT NULL DEFAULT 0, -- Service 5%
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    version INT NOT NULL DEFAULT 1, -- OPTIMISTIC LOCKING VERSION GUARD
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_cooking_at TIMESTAMP WITH TIME ZONE,
    ready_at TIMESTAMP WITH TIME ZONE,
    served_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABEL ORDER_DETAILS (Rincian Item yang Dipesan)
CREATE TABLE order_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE RESTRICT,
    menu_name VARCHAR(150) NOT NULL, -- Denormalisasi untuk arsip jika menu diubah nanti
    price_at_order NUMERIC(12, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    notes TEXT, -- Catatan khusus: "less ice, pedas level 3"
    is_completed_in_kitchen BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABEL PAYMENTS (Konfirmasi Pembayaran Kasir)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    cashier_id UUID NOT NULL REFERENCES users(id),
    payment_method payment_method NOT NULL,
    amount_paid NUMERIC(12, 2) NOT NULL,
    change_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    transaction_reference VARCHAR(100), -- ID EDC / Ref QRIS
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. INDEX OPTIMIZATION (Untuk Kecepatan Query KDS & POS)
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_table_active ON orders(table_number) WHERE status NOT IN ('selesai', 'dibatalkan');
CREATE INDEX idx_order_details_order ON order_details(order_id);
CREATE INDEX idx_payments_paid_at ON payments(paid_at);`;

  const folderStructureText = `cafe-pos-system/
├── backend/                  # REST API & WebSocket Realtime Server (Node.js / Express / NestJS)
│   ├── src/
│   │   ├── config/           # Database pool, JWT keys, WebSocket settings
│   │   ├── constants/        # Role enums, Order statuses, Tax rates (PPN 10%, Service 5%)
│   │   ├── modules/
│   │   │   ├── auth/         # Login controller, PIN auth, JWT token generator
│   │   │   ├── menu/         # Menu CRUD, Image upload handler (Multer/S3)
│   │   │   ├── orders/       # Order state machine, optimistic locking service
│   │   │   ├── kitchen/      # KDS events, cooking timers, status updates
│   │   │   ├── cashier/      # Billing calculation, thermal receipt ESC/POS engine
│   │   │   ├── reports/      # Sales aggregation, SQL grouping (daily/weekly/monthly)
│   │   │   └── users/        # Employee management (RBAC CRUD)
│   │   ├── middlewares/
│   │   │   ├── authGuard.ts  # JWT Verification
│   │   │   └── roleGuard.ts  # RBAC Middleware (Authorize: admin, kasir, pelayan, dapur)
│   │   ├── realtime/         # Socket.io / WebSocket Server & Room manager
│   │   │   ├── socketServer.ts
│   │   │   └── events.ts     # 'order:created', 'order:status_updated', 'order:paid'
│   │   └── server.ts         # Main entry point & DB connection
│   ├── prisma/ or migrations/# Database schema & migrations
│   └── package.json
│
├── frontend/                 # Client Web Application (React + Vite / Next.js)
│   ├── src/
│   │   ├── api/              # Axios/Fetch clients with auth bearer interceptors
│   │   ├── assets/           # Logos, sounds (chime.mp3 for kitchen KDS)
│   │   ├── components/
│   │   │   ├── admin/        # Sales charts, Menu CRUD modals, User list
│   │   │   ├── cashier/      # Table bill inspector, Payment modal, Thermal printer
│   │   │   ├── kitchen/      # Kitchen Display System cards, item checklist
│   │   │   ├── waitress/     # Tablet menu catalog, Cart sheet, table picker
│   │   │   └── shared/       # Navbar, Role badge, Modal wrappers, Toast notifications
│   │   ├── hooks/
│   │   │   ├── useSocket.ts  # Real-time WebSocket connection hook
│   │   │   └── useAuth.ts    # User session & active role state
│   │   ├── store/            # State management (Zustand / Redux Toolkit / Context)
│   │   │   ├── orderStore.ts
│   │   │   └── cartStore.ts
│   │   ├── utils/            # Rupiah formatter, thermal receipt text formatter
│   │   ├── App.tsx           # Router with ProtectedRoute based on UserRole
│   │   └── main.tsx
│   └── tailwind.config.js
└── docker-compose.yml        # Multi-container setup (PostgreSQL, Backend, Frontend)`;

  const waitressSnippet = `// ==========================================================
// 1. STATE MANAGEMENT PELAYAN (ZUSTAND / REACT HOOKS)
// Optimistic UI + Validasi Lock Status
// ==========================================================
import create from 'zustand';

interface WaitressCartState {
  tableNumber: number;
  customerName: string;
  items: Array<{ menuId: string; menuName: string; price: number; quantity: number; notes: string }>;
  setTable: (table: number) => void;
  addItem: (menu: any) => void;
  updateQty: (menuId: string, delta: number) => void;
  setItemNotes: (menuId: string, notes: string) => void;
  clearCart: () => void;
  calculateTotals: () => { subtotal: number; tax: number; service: number; total: number };
}

export const useWaitressCart = create<WaitressCartState>((set, get) => ({
  tableNumber: 1,
  customerName: '',
  items: [],
  setTable: (table) => set({ tableNumber: table }),
  addItem: (menu) => {
    const existing = get().items.find(i => i.menuId === menu.id);
    if (existing) {
      set({
        items: get().items.map(i => 
          i.menuId === menu.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      });
    } else {
      set({
        items: [...get().items, { menuId: menu.id, menuName: menu.name, price: menu.price, quantity: 1, notes: '' }]
      });
    }
  },
  updateQty: (menuId, delta) => {
    const updated = get().items
      .map(i => i.menuId === menuId ? { ...i, quantity: i.quantity + delta } : i)
      .filter(i => i.quantity > 0);
    set({ items: updated });
  },
  setItemNotes: (menuId, notes) => {
    set({
      items: get().items.map(i => i.menuId === menuId ? { ...i, notes } : i)
    });
  },
  clearCart: () => set({ items: [], customerName: '' }),
  calculateTotals: () => {
    const subtotal = get().items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const tax = Math.round(subtotal * 0.10); // PPN 10%
    const service = Math.round(subtotal * 0.05); // Service charge 5%
    const total = subtotal + tax + service;
    return { subtotal, tax, service, total };
  }
}));`;

  const kitchenSnippet = `// ==========================================================
// 2. FUNGSI UPDATE STATUS DAPUR & BROADCAST REAL-TIME
// Menggunakan Optimistic Locking (version guard) di Backend
// ==========================================================
import { Request, Response } from 'express';
import { db } from '../config/db';
import { io } from '../realtime/socketServer';

export async function updateKitchenStatus(req: Request, res: Response) {
  const { orderId } = req.params;
  const { targetStatus, currentVersion } = req.body; // 'sedang_diproses' | 'siap_saji'
  const chefId = (req as any).user.id;

  try {
    // 1. UPDATE DENGAN CHECK VERSION (ANTI-RACE CONDITION)
    const result = await db.query(
      \`UPDATE orders 
       SET status = $1, 
           version = version + 1,
           started_cooking_at = CASE WHEN $1 = 'sedang_diproses' THEN NOW() ELSE started_cooking_at END,
           ready_at = CASE WHEN $1 = 'siap_saji' THEN NOW() ELSE ready_at END,
           updated_at = NOW()
       WHERE id = $2 AND version = $3
       RETURNING *;\`,
      [targetStatus, orderId, currentVersion]
    );

    if (result.rowCount === 0) {
      return res.status(409).json({
        error: 'CONFLICT',
        message: 'Pesanan telah diubah oleh pengguna lain. Silakan muat ulang data tiket.'
      });
    }

    const updatedOrder = result.rows[0];

    // 2. BROADCAST VIA WEBSOCKET KE SEMUA CLIENT TERHUBUNG
    io.emit('order:status_updated', {
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.order_number,
      tableNumber: updatedOrder.table_number,
      newStatus: targetStatus,
      updatedBy: chefId,
      timestamp: new Date().toISOString()
    });

    // 3. JIKA SIAP SAJI -> TRIGGER NOTIFIKASI KHUSUS KE WAITRESS
    if (targetStatus === 'siap_saji') {
      io.to('waitress_room').emit('notification:order_ready', {
        title: \`Meja \${updatedOrder.table_number} Siap Saji!\`,
        message: \`Pesanan \${updatedOrder.order_number} telah selesai dibuat dapur. Segera antar ke tamu.\`
      });
    }

    return res.json({ success: true, order: updatedOrder });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}`;

  const cashierSnippet = `// ==========================================================
// 3. LOGIKA HITUNG & CETAK STRUK THERMAL KASIR (58mm / 80mm)
// ESC/POS Command Generator untuk Printer Thermal Bluetooth / USB
// ==========================================================
export class ThermalPrinterService {
  // ESC/POS Byte Commands
  static ESC = '\\x1B';
  static GS  = '\\x1D';
  static INIT = '\\x1B\\x40';
  static ALIGN_CENTER = '\\x1B\\x61\\x01';
  static ALIGN_LEFT   = '\\x1B\\x61\\x00';
  static ALIGN_RIGHT  = '\\x1B\\x61\\x02';
  static BOLD_ON      = '\\x1B\\x45\\x01';
  static BOLD_OFF     = '\\x1B\\x45\\x00';
  static CUT_PAPER    = '\\x1D\\x56\\x41\\x00';

  static formatLine(left: string, right: string, width = 32): string {
    const spaceCount = Math.max(1, width - left.length - right.length);
    return left + ' '.repeat(spaceCount) + right + '\\n';
  }

  static generateReceiptBytes(order: any, payment: any): string {
    let out = this.INIT;

    // Header Toko
    out += this.ALIGN_CENTER;
    out += this.BOLD_ON + "NADIRA CAFE AND RESTO\\n" + this.BOLD_OFF;
    out += "Jl. Sudirman No. 45, Jakarta\\n";
    out += "Telp: 0812-3456-7890\\n";
    out += "--------------------------------\\n";

    // Metadata Transaksi
    out += this.ALIGN_LEFT;
    out += \`Order : \${order.orderNumber}\\n\`;
    out += \`Meja  : \${order.tableNumber}\\n\`;
    out += \`Kasir : \${payment.cashierName}\\n\`;
    out += \`Waktu : \${new Date().toLocaleString('id-ID')}\\n\`;
    out += "--------------------------------\\n";

    // Item Pesanan
    order.items.forEach((it: any) => {
      const line = \`\${it.quantity}x \${it.menuName.slice(0, 15)}\`;
      const priceStr = \`Rp \${(it.price * it.quantity).toLocaleString('id-ID')}\`;
      out += this.formatLine(line, priceStr, 32);
    });

    out += "--------------------------------\\n";

    // Rincian Hitung Otomatis
    out += this.formatLine("Subtotal", \`Rp \${order.subtotal.toLocaleString('id-ID')}\`);
    out += this.formatLine("PPN 10%", \`Rp \${order.tax.toLocaleString('id-ID')}\`);
    out += this.formatLine("Service 5%", \`Rp \${order.serviceCharge.toLocaleString('id-ID')}\`);
    if (payment.discount > 0) {
      out += this.formatLine("Diskon", \`-Rp \${payment.discount.toLocaleString('id-ID')}\`);
    }

    out += this.BOLD_ON;
    out += this.formatLine("TOTAL", \`Rp \${payment.totalAmount.toLocaleString('id-ID')}\`);
    out += this.BOLD_OFF;

    out += this.formatLine("Metode", payment.paymentMethod.toUpperCase());
    out += this.formatLine("Bayar", \`Rp \${payment.amountPaid.toLocaleString('id-ID')}\`);
    out += this.formatLine("Kembali", \`Rp \${payment.changeAmount.toLocaleString('id-ID')}\`);

    // Footer
    out += "\\n" + this.ALIGN_CENTER;
    out += "Terima Kasih Atas Kunjungan Anda!\\n\\n\\n";
    out += this.CUT_PAPER;

    return out;
  }
}`;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
              Senior Software Architect Blueprint
            </span>
            <span className="text-stone-400 text-xs">&bull; Panduan Teknis & Implementasi Lengkap</span>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-stone-100 flex items-center gap-2">
          <FileCode2 className="w-6 h-6 text-amber-400" />
          Arsitektur Sistem Pemesanan Cafe Multi-User (RBAC)
        </h2>
        <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-3xl leading-relaxed">
          Dokumen teknis komprehensif yang menjawab seluruh 5 butir instruksi: Skema Database Relasional, Struktur Folder Modular, Potongan Kode Kunci (State Waitress, KDS Dapur, Struk Kasir), Workflow Anti-Konflik Transaksi, dan Panduan Integrasi Real-Time API.
        </p>

        {/* Section Navigation Tabs */}
        <div className="flex space-x-2 overflow-x-auto mt-4 pt-4 border-t border-stone-800 no-scrollbar">
          {[
            { id: 'db', label: '1. Skema Database & Relasi', icon: <Database className="w-4 h-4" /> },
            { id: 'folder', label: '2. Struktur Folder Proyek', icon: <FolderTree className="w-4 h-4" /> },
            { id: 'snippets', label: '3. Code Snippet Inti', icon: <Code2 className="w-4 h-4" /> },
            { id: 'workflow', label: '4. Alur Kerja Anti-Konflik', icon: <Workflow className="w-4 h-4" /> },
            { id: 'realtime', label: '5. Integrasi Real-Time API', icon: <Radio className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                activeSection === tab.id
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md font-bold'
                  : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: PERANCANGAN DATABASE (SKEMA TABEL & RELASI) */}
      {activeSection === 'db' && (
        <div className="space-y-6">
          {/* Visual Entity-Relationship (ERD) Card */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-bold text-stone-100 flex items-center gap-2 mb-3">
              <Database className="w-5 h-5 text-amber-400" />
              Diagram Konseptual Relasi Tabel (ERD)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-800/80 border border-purple-500/40">
                <div className="font-bold text-purple-300 text-sm mb-1">users</div>
                <div className="text-[11px] text-stone-300 space-y-0.5 font-mono">
                  <p className="text-amber-400 font-bold">&bull; id (PK, UUID)</p>
                  <p>&bull; username (UQ)</p>
                  <p>&bull; role (ENUM)</p>
                  <p>&bull; pin_hash</p>
                  <p>&bull; is_active</p>
                </div>
                <span className="text-[10px] text-purple-400 mt-2 block font-semibold">1:N ke orders & payments</span>
              </div>

              <div className="p-3 rounded-xl bg-stone-800/80 border border-amber-500/40">
                <div className="font-bold text-amber-300 text-sm mb-1">categories & menus</div>
                <div className="text-[11px] text-stone-300 space-y-0.5 font-mono">
                  <p className="text-amber-400 font-bold">&bull; id (PK)</p>
                  <p>&bull; category_id (FK)</p>
                  <p>&bull; price, cost_price</p>
                  <p>&bull; is_available</p>
                  <p>&bull; prep_time_min</p>
                </div>
                <span className="text-[10px] text-amber-400 mt-2 block font-semibold">1:N ke order_details</span>
              </div>

              <div className="p-3 rounded-xl bg-stone-800/80 border border-blue-500/40">
                <div className="font-bold text-blue-300 text-sm mb-1">orders (Header)</div>
                <div className="text-[11px] text-stone-300 space-y-0.5 font-mono">
                  <p className="text-amber-400 font-bold">&bull; id (PK)</p>
                  <p>&bull; order_number (UQ)</p>
                  <p>&bull; table_number</p>
                  <p>&bull; waiter_id (FK)</p>
                  <p>&bull; status (ENUM)</p>
                  <p className="text-emerald-400 font-bold">&bull; version (INT)</p>
                </div>
                <span className="text-[10px] text-blue-400 mt-2 block font-semibold">1:N ke order_details</span>
              </div>

              <div className="p-3 rounded-xl bg-stone-800/80 border border-teal-500/40">
                <div className="font-bold text-teal-300 text-sm mb-1">order_details</div>
                <div className="text-[11px] text-stone-300 space-y-0.5 font-mono">
                  <p className="text-amber-400 font-bold">&bull; id (PK)</p>
                  <p>&bull; order_id (FK)</p>
                  <p>&bull; menu_id (FK)</p>
                  <p>&bull; quantity</p>
                  <p>&bull; price_at_order</p>
                  <p>&bull; is_completed</p>
                </div>
                <span className="text-[10px] text-teal-400 mt-2 block font-semibold">Rincian item dapur</span>
              </div>

              <div className="p-3 rounded-xl bg-stone-800/80 border border-emerald-500/40">
                <div className="font-bold text-emerald-300 text-sm mb-1">payments</div>
                <div className="text-[11px] text-stone-300 space-y-0.5 font-mono">
                  <p className="text-amber-400 font-bold">&bull; id (PK)</p>
                  <p>&bull; order_id (FK, UQ)</p>
                  <p>&bull; cashier_id (FK)</p>
                  <p>&bull; payment_method</p>
                  <p>&bull; amount_paid</p>
                  <p>&bull; change_amount</p>
                </div>
                <span className="text-[10px] text-emerald-400 mt-2 block font-semibold">1:1 ke orders</span>
              </div>
            </div>
          </div>

          {/* Full DDL SQL Code Block */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-3">
              <div>
                <h4 className="font-bold text-stone-100 text-sm">PostgreSQL / MySQL Production DDL</h4>
                <p className="text-xs text-stone-400">Siap dieksekusi di Supabase, Cloud SQL, Neon, atau Docker PostgreSQL</p>
              </div>
              <button
                onClick={() => handleCopy('sql', sqlDDL)}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-700"
              >
                {copiedKey === 'sql' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey === 'sql' ? 'Tersalin!' : 'Salin SQL DDL'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-stone-950 font-mono text-xs text-amber-200/90 overflow-x-auto border border-stone-800 leading-relaxed max-h-96">
              {sqlDDL}
            </pre>
          </div>
        </div>
      )}

      {/* SECTION 2: STRUKTUR FOLDER PROYEK */}
      {activeSection === 'folder' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div>
              <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-amber-400" />
                Struktur Folder Monorepo / Modular Full-Stack
              </h3>
              <p className="text-xs text-stone-400">Arsitektur bersih (Clean Architecture) yang memisahkan Controller, Domain Service, Repository, dan WebSocket Handler</p>
            </div>
            <button
              onClick={() => handleCopy('folder', folderStructureText)}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-700"
            >
              {copiedKey === 'folder' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === 'folder' ? 'Tersalin!' : 'Salin Struktur Folder'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-stone-950 font-mono text-xs text-emerald-300/90 overflow-x-auto border border-stone-800 leading-relaxed max-h-[500px]">
            {folderStructureText}
          </pre>
        </div>
      )}

      {/* SECTION 3: CODE SNIPPETS LOGIKA UTAMA */}
      {activeSection === 'snippets' && (
        <div className="space-y-6">
          {/* Snippet 1: Waitress State */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-stone-100 text-sm">Snippet 1: State Management Pelayan (Zustand)</h4>
                <p className="text-xs text-stone-400">Menangani keranjang pesanan meja, catatan kustom per item, dan hitung PPN/Service otomatis</p>
              </div>
              <button
                onClick={() => handleCopy('waitressSnippet', waitressSnippet)}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 border border-stone-700"
              >
                {copiedKey === 'waitressSnippet' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey === 'waitressSnippet' ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-stone-950 font-mono text-xs text-sky-200/90 overflow-x-auto border border-stone-800 leading-relaxed max-h-80">
              {waitressSnippet}
            </pre>
          </div>

          {/* Snippet 2: Kitchen KDS Status Update */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-stone-100 text-sm">Snippet 2: Update Status Dapur & Broadcast Real-Time</h4>
                <p className="text-xs text-stone-400">Optimistic locking (version guard) di backend untuk mencegah konflik saat dua koki menekan tiket bersamaan</p>
              </div>
              <button
                onClick={() => handleCopy('kitchenSnippet', kitchenSnippet)}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 border border-stone-700"
              >
                {copiedKey === 'kitchenSnippet' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey === 'kitchenSnippet' ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-stone-950 font-mono text-xs text-amber-200/90 overflow-x-auto border border-stone-800 leading-relaxed max-h-80">
              {kitchenSnippet}
            </pre>
          </div>

          {/* Snippet 3: Thermal Receipt Printer */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-stone-100 text-sm">Snippet 3: Mesin Cetak Struk Thermal Kasir (ESC/POS)</h4>
                <p className="text-xs text-stone-400">Mencetak bukti bayar ke printer kasir bluetooth/USB dengan auto-cut paper dan perataan teks presisi</p>
              </div>
              <button
                onClick={() => handleCopy('cashierSnippet', cashierSnippet)}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 border border-stone-700"
              >
                {copiedKey === 'cashierSnippet' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey === 'cashierSnippet' ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-stone-950 font-mono text-xs text-emerald-200/90 overflow-x-auto border border-stone-800 leading-relaxed max-h-80">
              {cashierSnippet}
            </pre>
          </div>
        </div>
      )}

      {/* SECTION 4: ALUR KERJA (WORKFLOW) & ANTI-KONFLIK DATA */}
      {activeSection === 'workflow' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <Workflow className="w-5 h-5 text-amber-400" />
              Alur Kerja Data Terpadu & Proteksi Anti-Konflik Transaksi
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Bagaimana data mengalir lancar antara Pelayan &rarr; Dapur &rarr; Kasir &rarr; Admin tanpa terjadi tumpang tindih status atau pesanan ganda.
            </p>
          </div>

          {/* Flow Stepper Visual */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center">1</span>
                <span className="text-[10px] font-bold uppercase text-blue-400">Pelayan</span>
              </div>
              <h4 className="font-bold text-stone-100 text-sm">Catat & Kirim Pesanan</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Pelayan memilih nomor meja, memilih menu, menuliskan catatan kustom. Selama status <code className="text-blue-300">menunggu_konfirmasi</code>, Pelayan masih berhak menambah/mengurangi menu.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center">2</span>
                <span className="text-[10px] font-bold uppercase text-amber-400">Dapur (KDS)</span>
              </div>
              <h4 className="font-bold text-stone-100 text-sm">Locking & Memasak</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Dapur menekan <strong>Terima & Masak</strong>. Status beralih ke <code className="text-amber-300">sedang_diproses</code>. Pada detik ini, <strong>akses edit Pelayan otomatis terkunci (LOCKED)</strong> agar koki tidak memasak pesanan yang tiba-tiba dihapus.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-stone-950 font-bold text-xs flex items-center justify-center">3</span>
                <span className="text-[10px] font-bold uppercase text-emerald-400">Siap & Kasir</span>
              </div>
              <h4 className="font-bold text-stone-100 text-sm">Penyajian & Billing</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Dapur mengubah status ke <code className="text-emerald-300">siap_saji</code>. Notifikasi bunyi masuk ke tablet Pelayan untuk mengantar. Kasir melihat total tagihan yang sudah diproteksi dari penambahan sepihak.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-purple-500 text-white font-bold text-xs flex items-center justify-center">4</span>
                <span className="text-[10px] font-bold uppercase text-purple-400">Kasir & Admin</span>
              </div>
              <h4 className="font-bold text-stone-100 text-sm">Pelunasan & Omzet</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Kasir memproses bayar via Tunai/Debit/QRIS dan mencetak struk. Status pesanan ditutup ke <code className="text-purple-300">selesai</code>. Meja kembali bebas (AVAILABLE) dan nominal omzet tercatat otomatis ke dashboard Admin.
              </p>
            </div>
          </div>

          {/* Anti-Conflict Core Principles Box */}
          <div className="p-4 rounded-xl bg-stone-950 border border-amber-500/30 space-y-3">
            <h4 className="font-bold text-amber-400 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              3 Pilar Pencegahan Konflik Data (Concurrency & Anti-Conflict Rules)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-stone-300">
              <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                <strong className="text-stone-100 block mb-1">1. Optimistic Locking (kolom version)</strong>
                Setiap kali tabel <code className="text-amber-400">orders</code> di-update, query mengecek <code className="text-amber-400">WHERE version = $version</code>. Jika versi di database sudah lebih tinggi (karena telah diubah oleh Dapur), server menolak edit dan meminta client me-refresh data.
              </div>

              <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                <strong className="text-stone-100 block mb-1">2. Single-Active Table Lock</strong>
                Meja bernomor X hanya boleh memiliki 1 pesanan dalam status aktif (<code className="text-amber-400">status NOT IN ('selesai', 'dibatalkan')</code>). Pelayan lain tidak bisa membuat pesanan baru di meja yang sama sebelum kasir menyelesaikannya.
              </div>

              <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                <strong className="text-stone-100 block mb-1">3. Idempotency Key pada Pembayaran</strong>
                Setiap klik bayar kasir dilengkapi ID unik (UUID transaksi). Ini menjamin bahwa jika tombol konfirmasi tertekan dua kali karena koneksi lambat, saldo tidak akan terpotong ganda dan struk tidak terduplikasi.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: PANDUAN INTEGRASI REAL-TIME API */}
      {activeSection === 'realtime' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-400" />
              Panduan Integrasi Real-Time API (WebSocket / Supabase / SSE)
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Standar arsitektur event-driven untuk menyinkronkan data antar 4 role secara instan tanpa perlu refresh manual.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700 space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase">Opsi A (Rekomendasi)</span>
              <h4 className="font-bold text-stone-100 text-sm">Socket.io / WebSockets</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Komunikasi dua arah (bi-directional) berkecepatan tinggi &lt;50ms. Sangat cocok untuk KDS dapur di tablet lokal cafe dengan fitur auto-reconnection dan channel grouping (<code className="text-amber-300">room:kitchen</code>, <code className="text-amber-300">room:cashier</code>).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700 space-y-2">
              <span className="text-xs font-bold text-teal-400 uppercase">Opsi B (Serverless)</span>
              <h4 className="font-bold text-stone-100 text-sm">Supabase Realtime</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Memanfaatkan PostgreSQL Logical Replication / Change Data Capture (CDC). Frontend langsung subscribe ke tabel <code className="text-teal-300">orders</code> (INSERT / UPDATE) tanpa perlu coding backend socket khusus.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700 space-y-2">
              <span className="text-xs font-bold text-purple-400 uppercase">Opsi C (Ringan)</span>
              <h4 className="font-bold text-stone-100 text-sm">Server-Sent Events (SSE)</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Satu arah dari server ke browser melalui HTTP standar. Sangat hemat baterai untuk tablet Pelayan, mudah melewati firewall/proxy tanpa overhead handshake WebSocket.
              </p>
            </div>
          </div>

          {/* Event Topic Payload Catalog */}
          <div className="bg-stone-950 rounded-xl p-4 border border-stone-800 space-y-3">
            <h4 className="font-bold text-stone-200 text-xs uppercase tracking-wider">
              Katalog Topik Event & Struktur Payload Standar:
            </h4>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
                <span className="text-blue-400 font-bold">1. orders:new</span> &rarr; Dikirim saat Pelayan submit order
                <p className="text-[11px] text-stone-400 mt-1">
                  Payload: &#123; orderId, orderNumber, tableNumber, items: [...], notes, createdAt &#125;
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
                <span className="text-amber-400 font-bold">2. orders:status_changed</span> &rarr; Dikirim saat Dapur update (cooking/ready)
                <p className="text-[11px] text-stone-400 mt-1">
                  Payload: &#123; orderId, previousStatus, newStatus: 'sedang_diproses' | 'siap_saji', actorRole: 'dapur' &#125;
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
                <span className="text-emerald-400 font-bold">3. orders:paid</span> &rarr; Dikirim saat Kasir berhasil menyelesaikan pembayaran
                <p className="text-[11px] text-stone-400 mt-1">
                  Payload: &#123; orderId, tableNumber, totalAmount, paymentMethod, paidAt &#125;
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
