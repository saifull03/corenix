'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  DollarSign,
  AlertCircle,
  Eye,
  RefreshCw,
  X,
  CreditCard,
  Building2,
  User,
  Phone
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all' ? '/api/admin/orders' : `/api/admin/orders?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, orderStatus: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, order_status: newStatus });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentChange = async (orderId: number, newPayment: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, paymentStatus: newPayment }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, payment_status: newPayment } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, payment_status: newPayment });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.order_number?.toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_phone?.toLowerCase().includes(q) ||
      o.customer_email?.toLowerCase().includes(q)
    );
  });

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const totalProfit = orders.reduce((sum, o) => sum + Number(o.gross_profit || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-cyan-400">
            Order Fulfillment Center
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-sky-600 dark:text-cyan-400" />
            <span>Customer Orders & POS Invoices</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time multi-channel order pipeline covering Showroom pickups, bKash digital checkouts, and courier deliveries.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Pipeline</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Total Orders</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{orders.length}</span>
          <span className="text-[10px] text-sky-600 dark:text-cyan-400 font-semibold">Across all branches</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Pending / Actionable</span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
            {orders.filter((o) => o.order_status === 'pending' || o.order_status === 'confirmed').length}
          </span>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Requires dispatch</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Sales Revenue</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            ৳{totalRevenue.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Gross sales volume</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Gross Profit (Margin)</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            ৳{totalProfit.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Calculated waterfall</span>
        </div>
      </div>

      {/* Filter Tabs and Search */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[11px] transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order # or Customer..."
            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 pl-10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Channel / Branch</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Order Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-800/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-900 dark:text-white block font-mono">
                        {ord.order_number}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        {ord.order_type} order
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {ord.customer_name || 'Walk-in Customer'}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {ord.customer_phone || ord.customer_email || 'No contact'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                        {ord.branch_name || 'Central WH'}
                      </span>
                      <span className="text-[10px] text-sky-600 dark:text-cyan-400 font-mono">
                        {ord.branch_code || 'WH-MAIN'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] block">
                        {ord.payment_method}
                      </span>
                      <select
                        value={ord.payment_status}
                        disabled={updatingId === ord.id}
                        onChange={(e) => handlePaymentChange(ord.id, e.target.value)}
                        className={`mt-1 text-[10px] font-bold rounded-lg px-2 py-0.5 border outline-none cursor-pointer ${
                          ord.payment_status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                        }`}
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="partially_paid">Partial</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-sm font-black text-slate-900 dark:text-white block">
                        ৳{Number(ord.total_amount).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Margin: ৳{Number(ord.gross_profit || 0).toLocaleString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={ord.order_status}
                        disabled={updatingId === ord.id}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        className={`text-xs font-bold rounded-xl px-2.5 py-1 border outline-none cursor-pointer ${
                          ord.order_status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                            : ord.order_status === 'shipped'
                            ? 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800'
                            : ord.order_status === 'cancelled'
                            ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                            : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors"
                        title="View invoice details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-sky-600 dark:text-cyan-400 font-bold uppercase">
                  Invoice & Line Items Breakdown
                </span>
                <h3 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{selectedOrder.order_number}</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 mt-4 text-xs">
              {/* Customer & Delivery Details */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Customer Info</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{selectedOrder.customer_name || 'Walk-in'}</p>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">{selectedOrder.customer_phone}</p>
                  <p className="text-slate-600 dark:text-slate-400">{selectedOrder.customer_email}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Fulfillment Details</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedOrder.branch_name}</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">Method: <strong className="uppercase">{selectedOrder.payment_method}</strong> ({selectedOrder.payment_status})</p>
                  <p className="text-slate-500 dark:text-slate-400">Order Channel: {selectedOrder.order_type}</p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
                  Purchased Products
                </h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{item.product_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">SKU: {item.sku} • Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900 dark:text-white">৳{Number(item.total_price).toLocaleString()}</p>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Cost: ৳{Number(item.total_cost || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-400">
                      Standard package items associated with this checkout invoice.
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Totals */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-1.5">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">৳{Number(selectedOrder.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Shipping Fee:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">৳{Number(selectedOrder.shipping_fee || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Discount:</span>
                  <span className="font-semibold text-rose-600">-৳{Number(selectedOrder.discount_amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Total Invoiced Amount:</span>
                  <span className="text-sky-600 dark:text-cyan-400">৳{Number(selectedOrder.total_amount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
