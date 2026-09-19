export type UserRole = 'admin' | 'kasir' | 'pelayan' | 'dapur';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  pin: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export type MenuCategory = 'coffee' | 'non-coffee' | 'makanan' | 'snack' | 'dessert';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  costPrice: number; // HPP for profit analytics
  description: string;
  imageUrl: string;
  isAvailable: boolean;
  preparationTimeMinutes: number;
}

export type OrderStatus = 
  | 'menunggu_konfirmasi' // Draft / Submitted by waitress
  | 'sedang_diproses'     // Dapur is cooking
  | 'siap_saji'           // Ready to serve
  | 'sudah_disajikan'     // Waitress delivered to table
  | 'selesai'             // Paid at cashier
  | 'dibatalkan';         // Cancelled

export interface OrderItem {
  id: string;
  menuId: string;
  menuName: string;
  price: number;
  quantity: number;
  notes?: string;
  isCompletedInKitchen?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "ORD-2026-001"
  tableNumber: number;
  customerName?: string;
  waiterId: string;
  waiterName: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number;          // PPN 10%
  serviceCharge: number; // 5%
  discount: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  startedCookingAt?: string;
  readyAt?: string;
  servedAt?: string;
  paidAt?: string;
  version: number; // For optimistic locking & anti-conflict workflow
}

export type PaymentMethod = 'cash' | 'debit' | 'qris';

export interface PaymentRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  tableNumber: number;
  cashierId: string;
  cashierName: string;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeAmount: number;
  transactionReference?: string;
  paidAt: string;
}

export interface SalesSummary {
  totalRevenue: number;
  totalTransactions: number;
  averageOrderValue: number;
  topSellingItems: { name: string; quantity: number; revenue: number }[];
}

export interface SystemEvent {
  id: string;
  type: 'order_created' | 'order_updated' | 'cooking_started' | 'order_ready' | 'order_served' | 'payment_completed' | 'order_cancelled';
  orderId: string;
  orderNumber: string;
  tableNumber: number;
  message: string;
  timestamp: string;
  actorRole: UserRole;
  actorName: string;
}
