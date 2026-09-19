import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Order, PaymentMethod, PaymentRecord } from '../../types';
import { 
  CreditCard, 
  Receipt, 
  Printer, 
  CheckCircle2, 
  Search, 
  Clock, 
  DollarSign, 
  QrCode, 
  Banknote, 
  AlertCircle, 
  Copy, 
  Check, 
  X, 
  FileText,
  UserCheck
} from 'lucide-react';

export const CashierView: React.FC = () => {
  const { 
    orders, 
    payments, 
    processPayment, 
    formatRupiah, 
    currentUser 
  } = useCafe();

  const [selectedTable, setSelectedTable] = useState<number>(3);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [activePaymentModal, setActivePaymentModal] = useState<Order | null>(null);
  const [completedReceipt, setCompletedReceipt] = useState<PaymentRecord | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState<boolean>(false);
  const [paymentResultMsg, setPaymentResultMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Active unpaid orders
  const unpaidOrders = orders.filter(o => o.status !== 'selesai' && o.status !== 'dibatalkan');
  
  // Find current order on selected table
  const currentOrder = orders.find(
    o => o.tableNumber === selectedTable && o.status !== 'selesai' && o.status !== 'dibatalkan'
  );

  const calculateFinalBill = (order: Order, discount: number) => {
    const totalBeforeDiscount = order.subtotal + order.tax + order.serviceCharge;
    const finalTotal = Math.max(0, totalBeforeDiscount - discount);
    return {
      subtotal: order.subtotal,
      tax: order.tax,
      serviceCharge: order.serviceCharge,
      discount,
      total: finalTotal,
    };
  };

  const handleOpenPaymentModal = (order: Order) => {
    setActivePaymentModal(order);
    const bill = calculateFinalBill(order, discountAmount);
    setCashGiven(bill.total); // default cash given to exact total
    setPaymentResultMsg(null);
  };

  const handleConfirmPayment = () => {
    if (!activePaymentModal) return;

    const result = processPayment(
      activePaymentModal.id,
      paymentMethod,
      paymentMethod === 'cash' ? cashGiven : activePaymentModal.total - discountAmount,
      discountAmount
    );

    if (result.success && result.payment) {
      setCompletedReceipt(result.payment);
      setActivePaymentModal(null);
      setDiscountAmount(0);
    } else {
      setPaymentResultMsg({ text: result.message, isError: true });
    }
  };

  const generateReceiptPlainText = (receipt: PaymentRecord) => {
    const ord = orders.find(o => o.id === receipt.orderId);
    let text = `================================\n`;
    text += `     NADIRA CAFE AND RESTO      \n`;
    text += `   Jl. Sudirman No. 45, Jakarta \n`;
    text += `      Telp: 0812-3456-7890     \n`;
    text += `================================\n`;
    text += `No. Order : ${receipt.orderNumber}\n`;
    text += `Meja      : ${receipt.tableNumber}\n`;
    text += `Kasir     : ${receipt.cashierName}\n`;
    text += `Waktu     : ${new Date(receipt.paidAt).toLocaleString('id-ID')}\n`;
    text += `--------------------------------\n`;
    if (ord) {
      ord.items.forEach(it => {
        text += `${it.quantity}x ${it.menuName.padEnd(16).slice(0, 16)} ${formatRupiah(it.price * it.quantity)}\n`;
      });
    }
    text += `--------------------------------\n`;
    text += `Subtotal        : ${formatRupiah(receipt.subtotal)}\n`;
    text += `PPN (10%)       : ${formatRupiah(receipt.tax)}\n`;
    text += `Service (5%)    : ${formatRupiah(receipt.serviceCharge)}\n`;
    if (receipt.discount > 0) {
      text += `Diskon          : -${formatRupiah(receipt.discount)}\n`;
    }
    text += `TOTAL           : ${formatRupiah(receipt.totalAmount)}\n`;
    text += `Metode Bayar    : ${receipt.paymentMethod.toUpperCase()}\n`;
    text += `Bayar           : ${formatRupiah(receipt.amountPaid)}\n`;
    text += `Kembali         : ${formatRupiah(receipt.changeAmount)}\n`;
    text += `Ref: ${receipt.transactionReference || '-'}\n`;
    text += `================================\n`;
    text += `     Terima Kasih Atas          \n`;
    text += `      Kunjungan Anda!           \n`;
    text += `================================\n`;
    return text;
  };

  const handleCopyReceiptText = () => {
    if (!completedReceipt) return;
    const text = generateReceiptPlainText(completedReceipt);
    navigator.clipboard.writeText(text);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      {/* Header bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-amber-500">
            Modul Kasir & Billing POS
          </span>
          <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            Kasir Pemesanan & Pembayaran
          </h2>
        </div>

        <div className="text-xs text-stone-400 flex items-center gap-2">
          <span>Kasir Aktif: <strong className="text-stone-200">{currentUser.name}</strong></span>
          <span className="px-2 py-0.5 rounded bg-stone-800 border border-stone-700 font-mono text-[11px] text-amber-400">
            {unpaidOrders.length} Tagihan Aktif
          </span>
        </div>
      </div>

      {/* Main Grid: Left = Table & Active Orders Queue, Right = Current Bill & Checkout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Order Table Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-stone-200 mb-3 flex items-center justify-between">
              <span>Daftar Meja dengan Pesanan Aktif</span>
              <span className="text-xs text-stone-500 font-normal">Pilih meja untuk melihat tagihan</span>
            </h3>

            {unpaidOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500">
                Tidak ada pesanan aktif yang menunggu pembayaran.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {unpaidOrders.map(order => {
                  const isSelected = selectedTable === order.tableNumber;
                  const isServed = order.status === 'sudah_disajikan';
                  const isReady = order.status === 'siap_saji';
                  
                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedTable(order.tableNumber)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/40'
                          : 'bg-stone-800/80 border-stone-700/80 hover:border-stone-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-extrabold text-stone-100">
                              Meja {order.tableNumber}
                            </span>
                            <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-stone-900 text-stone-300 border border-stone-700">
                              {order.orderNumber}
                            </span>
                          </div>
                          <p className="text-xs text-stone-400 mt-0.5">
                            Tamu: <strong className="text-stone-200">{order.customerName || 'Anonim'}</strong> &bull; {order.items.length} item
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="font-extrabold text-amber-400 text-sm block">
                            {formatRupiah(order.total)}
                          </span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                            isServed 
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' 
                              : isReady
                              ? 'bg-blue-950 text-blue-300 border border-blue-700'
                              : 'bg-stone-900 text-stone-400 border border-stone-700'
                          }`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Transaction History */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Transaksi Terakhir Kasir</span>
              <span className="text-[10px] text-stone-500">{payments.length} selesai</span>
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {payments.slice(0, 5).map(pay => (
                <div key={pay.id} className="p-2 rounded-lg bg-stone-800/60 border border-stone-700/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-stone-200">Meja {pay.tableNumber} ({pay.orderNumber})</span>
                    <p className="text-[10px] text-stone-400">
                      {new Date(pay.paidAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} &bull; {pay.paymentMethod.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400">{formatRupiah(pay.totalAmount)}</span>
                    <button
                      onClick={() => setCompletedReceipt(pay)}
                      className="block text-[10px] text-amber-400 hover:underline mt-0.5 ml-auto"
                    >
                      Lihat Struk
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Bill Details & Payment Action (7 cols) */}
        <div className="lg:col-span-7">
          {currentOrder ? (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="border-b border-stone-800 pb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-stone-100">Tagihan Meja {currentOrder.tableNumber}</h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-800 text-amber-400 border border-stone-700">
                      {currentOrder.orderNumber}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Tamu: {currentOrder.customerName} &bull; Pelayan: {currentOrder.waiterName}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs uppercase font-bold px-2.5 py-1 rounded-lg ${
                    currentOrder.status === 'sudah_disajikan'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : 'bg-amber-950 text-amber-300 border border-amber-700'
                  }`}>
                    {currentOrder.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-800/80 text-stone-400 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-lg">Menu</th>
                      <th className="py-2.5 px-2 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                      <th className="py-2.5 px-3 text-right rounded-r-lg">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 text-stone-200">
                    {currentOrder.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-stone-800/30">
                        <td className="py-2.5 px-3">
                          <p className="font-semibold">{item.menuName}</p>
                          {item.notes && <p className="text-[11px] text-amber-400 italic">&bull; {item.notes}</p>}
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right text-stone-400">{formatRupiah(item.price)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-stone-100">{formatRupiah(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Calculation Summary Breakdowns */}
              <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between text-stone-400">
                  <span>Subtotal Pesanan</span>
                  <span className="font-mono text-stone-200">{formatRupiah(currentOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>PPN Restoran (10%)</span>
                  <span className="font-mono text-stone-200">{formatRupiah(currentOrder.tax)}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Service Charge (5%)</span>
                  <span className="font-mono text-stone-200">{formatRupiah(currentOrder.serviceCharge)}</span>
                </div>

                {/* Optional Discount Input */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-800/80">
                  <span className="text-stone-400">Potongan Diskon (Rp)</span>
                  <input
                    id="input-discount"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="0"
                    value={discountAmount || ''}
                    onChange={e => setDiscountAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-32 px-2 py-1 rounded bg-stone-900 border border-stone-700 text-right font-mono text-xs text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Grand Total */}
                <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-base font-extrabold text-stone-100">
                  <span>TOTAL PEMBAYARAN</span>
                  <span className="text-xl text-amber-400 font-mono">
                    {formatRupiah(calculateFinalBill(currentOrder, discountAmount).total)}
                  </span>
                </div>
              </div>

              {/* Pay Now Button */}
              <button
                id="btn-open-payment"
                onClick={() => handleOpenPaymentModal(currentOrder)}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-[0.99]"
              >
                <CreditCard className="w-4 h-4" />
                <span>Proses Pembayaran (Konfirmasi Kasir)</span>
              </button>
            </div>
          ) : (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center text-stone-400">
              <Receipt className="w-12 h-12 text-stone-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-200">Pilih Meja untuk Membuka Tagihan</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Silakan pilih salah satu meja di panel kiri untuk memeriksa rincian tagihan, menghitung PPN & service, serta mencetak struk.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* PAYMENT CONFIRMATION MODAL */}
      {activePaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-stone-100">Konfirmasi Pembayaran</h3>
                <p className="text-xs text-stone-400">
                  Meja {activePaymentModal.tableNumber} &bull; {activePaymentModal.orderNumber}
                </p>
              </div>
              <button
                onClick={() => setActivePaymentModal(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Amount Badge */}
            <div className="bg-stone-950 rounded-xl p-3 mb-4 text-center border border-stone-800">
              <span className="text-xs text-stone-400">Total yang harus dibayar:</span>
              <p className="text-2xl font-extrabold text-amber-400 font-mono mt-0.5">
                {formatRupiah(calculateFinalBill(activePaymentModal, discountAmount).total)}
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-stone-400 mb-2">Metode Pembayaran</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qris')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'qris'
                      ? 'bg-amber-500 text-stone-950 border-amber-400'
                      : 'bg-stone-800 text-stone-300 border-stone-700 hover:border-stone-600'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>QRIS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'cash'
                      ? 'bg-amber-500 text-stone-950 border-amber-400'
                      : 'bg-stone-800 text-stone-300 border-stone-700 hover:border-stone-600'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Tunai (Cash)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('debit')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'debit'
                      ? 'bg-amber-500 text-stone-950 border-amber-400'
                      : 'bg-stone-800 text-stone-300 border-stone-700 hover:border-stone-600'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Debit / EDC</span>
                </button>
              </div>
            </div>

            {/* Cash specific UI */}
            {paymentMethod === 'cash' && (
              <div className="mb-4 space-y-2">
                <label className="block text-xs font-semibold text-stone-400">Nominal Diterima</label>
                <input
                  type="number"
                  step="1000"
                  value={cashGiven || ''}
                  onChange={e => setCashGiven(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 font-mono text-sm focus:outline-none focus:border-amber-500 text-right"
                />

                {/* Quick Denominations */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    calculateFinalBill(activePaymentModal, discountAmount).total,
                    50000,
                    100000,
                    150000,
                    200000
                  ].map((val, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCashGiven(val)}
                      className="px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-[11px] font-mono text-stone-300 hover:bg-stone-700"
                    >
                      {idx === 0 ? 'Uang Pas' : formatRupiah(val)}
                    </button>
                  ))}
                </div>

                {/* Change calculation */}
                <div className="pt-2 flex justify-between items-center text-xs font-semibold">
                  <span className="text-stone-400">Kembalian:</span>
                  <span className="font-mono text-amber-400 text-sm">
                    {formatRupiah(Math.max(0, cashGiven - calculateFinalBill(activePaymentModal, discountAmount).total))}
                  </span>
                </div>
              </div>
            )}

            {/* QRIS specific simulation */}
            {paymentMethod === 'qris' && (
              <div className="mb-4 p-4 rounded-xl bg-stone-950 border border-stone-800 text-center">
                <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl shadow-inner flex flex-col items-center justify-center">
                  <QrCode className="w-28 h-28 text-stone-950" />
                  <span className="text-[9px] font-mono text-stone-600 font-bold">QRIS NASIONAL (NMID)</span>
                </div>
                <p className="text-xs text-stone-400 mt-2">
                  Pindai menggunakan GoPay, OVO, Dana, BCA Mobile, dll.
                </p>
              </div>
            )}

            {/* Debit specific UI */}
            {paymentMethod === 'debit' && (
              <div className="mb-4 p-4 rounded-xl bg-stone-950 border border-stone-800 text-xs space-y-2">
                <p className="text-stone-300">Silakan gesek / tap kartu ATM pada mesin EDC Kasir.</p>
                <input
                  type="text"
                  placeholder="Nomor Approval / Ref EDC (opsional)"
                  className="w-full px-3 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            {paymentResultMsg && (
              <div className="mb-3 p-2 rounded-lg bg-rose-950 border border-rose-700 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{paymentResultMsg.text}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActivePaymentModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-confirm-payment-final"
                onClick={handleConfirmPayment}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                Konfirmasi Lunas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* THERMAL RECEIPT MODAL (Struk Pembayaran) */}
      {completedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-3">
              <h3 className="text-sm font-bold text-stone-100 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-400" />
                Struk Pembayaran Selesai
              </h3>
              <button
                onClick={() => setCompletedReceipt(null)}
                className="p-1 rounded text-stone-400 hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 58mm / 80mm Thermal Receipt Paper Simulation */}
            <div 
              id="thermal-receipt-container"
              className="bg-stone-100 text-stone-900 font-mono text-xs p-4 rounded-lg shadow-inner border border-stone-300 max-h-96 overflow-y-auto"
            >
              <div className="text-center pb-2 border-b border-dashed border-stone-400">
                <h4 className="font-extrabold text-sm uppercase tracking-wider">NADIRA CAFE AND RESTO</h4>
                <p className="text-[10px] text-stone-600">Jl. Sudirman No. 45, Jakarta</p>
                <p className="text-[10px] text-stone-600">Telp: 0812-3456-7890</p>
              </div>

              <div className="py-2 text-[11px] border-b border-dashed border-stone-400 space-y-0.5">
                <div className="flex justify-between">
                  <span>No. Order</span>
                  <span className="font-bold">{completedReceipt.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Meja</span>
                  <span className="font-bold">Meja {completedReceipt.tableNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir</span>
                  <span>{completedReceipt.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu</span>
                  <span>{new Date(completedReceipt.paidAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Items in receipt */}
              <div className="py-2 border-b border-dashed border-stone-400 space-y-1 text-[11px]">
                {orders.find(o => o.id === completedReceipt.orderId)?.items.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between font-medium">
                      <span>{item.quantity}x {item.menuName}</span>
                      <span>{formatRupiah(item.price * item.quantity)}</span>
                    </div>
                    {item.notes && <p className="text-[9px] text-stone-500 pl-2">*{item.notes}</p>}
                  </div>
                ))}
              </div>

              {/* Total calculations */}
              <div className="py-2 border-b border-dashed border-stone-400 space-y-0.5 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatRupiah(completedReceipt.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>PPN 10%</span>
                  <span>{formatRupiah(completedReceipt.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service 5%</span>
                  <span>{formatRupiah(completedReceipt.serviceCharge)}</span>
                </div>
                {completedReceipt.discount > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Diskon</span>
                    <span>-{formatRupiah(completedReceipt.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-stone-400">
                  <span>TOTAL</span>
                  <span>{formatRupiah(completedReceipt.totalAmount)}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="pt-2 text-[11px] space-y-0.5">
                <div className="flex justify-between">
                  <span>Metode</span>
                  <span className="font-bold uppercase">{completedReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bayar</span>
                  <span>{formatRupiah(completedReceipt.amountPaid)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Kembali</span>
                  <span>{formatRupiah(completedReceipt.changeAmount)}</span>
                </div>
                <div className="text-[9px] text-stone-500 pt-1 text-center font-mono">
                  Ref: {completedReceipt.transactionReference}
                </div>
              </div>

              <div className="text-center pt-3 mt-2 border-t border-dashed border-stone-400 text-[10px] text-stone-600">
                <p>Terima Kasih Atas Kunjungan Anda!</p>
                <p>Silakan Datang Kembali</p>
              </div>
            </div>

            {/* Receipt Actions */}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleCopyReceiptText}
                className="flex-1 py-2 px-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedReceipt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReceipt ? 'Tersalin' : 'Salin Teks'}</span>
              </button>
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex-1 py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Thermal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
