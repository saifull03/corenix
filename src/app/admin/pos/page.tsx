'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  ShoppingCart,
  Trash2,
  Printer,
  CreditCard,
  Building2,
  CheckCircle2,
  User,
  Plus
} from 'lucide-react';

export default function PosPage() {
  const [branch, setBranch] = useState<'SHOP-1' | 'SHOP-2'>('SHOP-1');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('01700000000');
  const [paymentMethod, setPaymentMethod] = useState<'cash_pos' | 'card' | 'bkash'>('cash_pos');
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  // Load products
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.products) setProducts(data.products);
      })
      .catch(() => {});
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const handleUpdateQty = (id: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const handleRemove = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.discount_price || item.selling_price) * item.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty.');
      return;
    }

    const orderNumber = `POS-${branch}-${Math.floor(100000 + Math.random() * 900000)}`;
    const invoice = {
      orderNumber,
      branch: branch === 'SHOP-1' ? 'Shop 1 (Uttara Flagship)' : 'Shop 2 (Dhanmondi Branch)',
      date: new Date().toLocaleString(),
      customerName,
      customerPhone,
      items: cart,
      subtotal,
      paymentMethod,
    };

    setCompletedOrder(invoice);
    setCart([]);
  };

  return (
    <div className="space-y-6">
      {/* Top POS Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-navy-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">CORENIX Retail POS Terminal</h1>
            <span className="text-xs text-slate-400">Rapid Barcode & Counter Sales</span>
          </div>
        </div>

        {/* Branch Context Selector */}
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-brand-400" />
          <span className="text-xs text-slate-300 font-semibold">Active Counter:</span>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value as any)}
            className="bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg border border-slate-700 outline-none"
          >
            <option value="SHOP-1">Shop 1 (Uttara Counter)</option>
            <option value="SHOP-2">Shop 2 (Dhanmondi Counter)</option>
          </select>
        </div>
      </div>

      {completedOrder ? (
        /* PRINTABLE POS RECEIPT MODAL */
        <div className="max-w-md mx-auto p-6 rounded-3xl bg-navy-900 border border-slate-800 space-y-4 shadow-2xl text-xs">
          <div className="text-center space-y-1 pb-4 border-b border-slate-800">
            <h2 className="text-xl font-black text-white">CORENIX</h2>
            <p className="text-slate-400">{completedOrder.branch}</p>
            <span className="font-mono text-brand-400 font-bold">{completedOrder.orderNumber}</span>
          </div>

          <div className="space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="text-white">{completedOrder.date}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="text-white">{completedOrder.customerName} ({completedOrder.customerPhone})</span>
            </div>
            <div className="flex justify-between">
              <span>Payment:</span>
              <span className="text-emerald-400 font-bold uppercase">{completedOrder.paymentMethod}</span>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3 space-y-2">
            {completedOrder.items.map((it: any) => (
              <div key={it.id} className="flex justify-between">
                <span>{it.name} (x{it.qty})</span>
                <span className="font-mono font-bold text-white">
                  ৳{((it.discount_price || it.selling_price) * it.qty).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-3 flex justify-between text-base font-bold text-white">
            <span>Total Paid:</span>
            <span className="text-brand-400">৳{completedOrder.subtotal.toLocaleString()}</span>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={() => window.print()}
              className="flex-1 py-2.5 rounded-xl bg-brand-500 text-navy-950 font-bold flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={() => setCompletedOrder(null)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
            >
              New Sale
            </button>
          </div>
        </div>
      ) : (
        /* TWO COLUMN POS WORKSPACE: Product Catalog (Left) + Sale Ticket (Right) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Product Catalog & Search */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Scan Barcode or Search by Model / SKU / Name..."
                className="w-full bg-navy-900 border border-slate-700 rounded-xl px-4 py-3 pl-11 text-xs text-white outline-none focus:border-brand-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleAddToCart(p)}
                  className="p-3 rounded-xl bg-navy-900 border border-slate-800 hover:border-brand-500/60 cursor-pointer flex flex-col justify-between transition-colors group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.primary_image || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=200&q=80'}
                    alt={p.name}
                    className="w-full h-24 object-contain mb-2"
                  />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200 line-clamp-2 group-hover:text-brand-300">
                      {p.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{p.sku}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-black text-brand-400">
                      ৳{(p.discount_price || p.selling_price).toLocaleString()}
                    </span>
                    <button className="p-1 rounded-lg bg-slate-800 text-slate-300 group-hover:bg-brand-500 group-hover:text-navy-950 font-bold">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Current Ticket & Fast Checkout */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 space-y-4 flex flex-col justify-between min-h-[500px]">
              <div>
                <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800 flex items-center justify-between">
                  <span>Current Sale Ticket</span>
                  <span className="text-xs text-brand-400 font-mono">{cart.length} items</span>
                </h3>

                {/* Customer Details Input */}
                <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name"
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Phone"
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>

                {/* Ticket Items */}
                <div className="space-y-2 max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                  {cart.map((item) => (
                    <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
                      <div className="flex-1 min-w-0 pr-2">
                        <span className="font-bold text-white block truncate">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ৳{(item.discount_price || item.selling_price).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-slate-700 rounded bg-slate-800">
                          <button onClick={() => handleUpdateQty(item.id, -1)} className="px-2 py-0.5 text-slate-300">-</button>
                          <span className="px-2 text-white font-bold">{item.qty}</span>
                          <button onClick={() => handleUpdateQty(item.id, 1)} className="px-2 py-0.5 text-slate-300">+</button>
                        </div>
                        <span className="font-bold font-mono text-white">
                          ৳{((item.discount_price || item.selling_price) * item.qty).toLocaleString()}
                        </span>
                        <button onClick={() => handleRemove(item.id)} className="text-slate-500 hover:text-rose-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {cart.length === 0 && (
                    <p className="text-center text-xs text-slate-500 py-10">Scan barcode or click items to add to ticket.</p>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <div className="flex items-center justify-between text-base font-bold text-white">
                  <span>Grand Total:</span>
                  <span className="text-2xl font-black text-brand-400">৳{subtotal.toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    onClick={() => setPaymentMethod('cash_pos')}
                    className={`py-2 rounded-lg font-bold border ${
                      paymentMethod === 'cash_pos' ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 rounded-lg font-bold border ${
                      paymentMethod === 'card' ? 'bg-blue-950 border-blue-500 text-blue-300' : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    Card POS
                  </button>
                  <button
                    onClick={() => setPaymentMethod('bkash')}
                    className={`py-2 rounded-lg font-bold border ${
                      paymentMethod === 'bkash' ? 'bg-pink-950 border-pink-500 text-pink-300' : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    bKash
                  </button>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-black text-sm shadow disabled:opacity-40"
                >
                  Complete Sale & Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
