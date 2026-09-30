'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Plus,
  Store,
  Tag
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

  // Load products & Other House inventory items
  useEffect(() => {
    Promise.all([
      fetch('/api/products').then((res) => res.json()).catch(() => ({ products: [] })),
      fetch('/api/admin/purchases/other-house').then((res) => res.json()).catch(() => ({ purchases: [] })),
    ]).then(([prodData, ohData]) => {
      const regularProds = (prodData.products || []).map((p: any) => ({
        ...p,
        is_other_house: false,
      }));

      const ohProds = (ohData.purchases || []).map((oh: any) => ({
        id: `oh-${oh.id}`,
        name: oh.product_name,
        sku: oh.tracking_number,
        serial_number: oh.serial_number,
        house_name: oh.house_name,
        selling_price: Number(oh.selling_price) || Number(oh.total_cost) * 1.08,
        discount_price: null,
        is_other_house: true,
        warranty_period: oh.warranty_period,
        payment_status: oh.payment_status,
        primary_image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=200&q=80',
      }));

      setProducts([...regularProds, ...ohProds]);
    });
  }, []);

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      (p.serial_number && p.serial_number.toLowerCase().includes(q)) ||
      (p.house_name && p.house_name.toLowerCase().includes(q))
    );
  });

  const handleAddToCart = (product: any) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(cart.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item)));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const handleUpdateQty = (id: any, delta: number) => {
    setCart(
      cart.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.qty + delta);
          return { ...item, qty: newQty };
        }
        return item;
      })
    );
  };

  const handleRemove = (id: any) => {
    setCart(cart.filter((item) => item.id !== id));
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
            <span className="text-xs text-slate-400">Rapid Barcode, Serial & Counter Sales</span>
          </div>
        </div>

        {/* Action Controls & Counter Context */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/admin/purchases?tab=other-house"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 text-xs font-bold transition-colors"
          >
            <Store className="w-3.5 h-3.5" />
            <span>+ Source from Other House (Lend)</span>
          </Link>

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
              <span className="text-white">
                {completedOrder.customerName} ({completedOrder.customerPhone})
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payment:</span>
              <span className="text-emerald-400 font-bold uppercase">{completedOrder.paymentMethod}</span>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3 space-y-2">
            {completedOrder.items.map((it: any) => (
              <div key={it.id} className="space-y-0.5">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-200">
                    {it.name} (x{it.qty})
                  </span>
                  <span className="font-mono font-bold text-white">
                    ৳{((it.discount_price || it.selling_price) * it.qty).toLocaleString()}
                  </span>
                </div>
                {it.serial_number && (
                  <span className="font-mono text-[10px] text-cyan-400 block">
                    SN: {it.serial_number} {it.house_name ? `• Sourced: ${it.house_name}` : ''}
                  </span>
                )}
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
                placeholder="Scan Barcode or Search by Serial Number (SN), Model, or SKU..."
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
                  className={`p-3 rounded-xl bg-navy-900 border transition-all cursor-pointer flex flex-col justify-between group ${
                    p.is_other_house
                      ? 'border-amber-500/40 hover:border-amber-400'
                      : 'border-slate-800 hover:border-brand-500/60'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      p.primary_image ||
                      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=200&q=80'
                    }
                    alt={p.name}
                    className="w-full h-24 object-contain mb-2"
                  />
                  <div>
                    {p.is_other_house && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-1">
                        <Store className="w-2.5 h-2.5" />
                        <span>Other House</span>
                      </span>
                    )}
                    <h4 className="text-xs font-semibold text-slate-200 line-clamp-2 group-hover:text-brand-300">
                      {p.name}
                    </h4>
                    {p.serial_number ? (
                      <span className="text-[10px] text-cyan-400 font-mono mt-0.5 block truncate">
                        SN: {p.serial_number}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{p.sku}</span>
                    )}
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

                {/* Cart Items List */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {cart.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs">
                      No items in ticket. Click products or search by serial number to add.
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-white truncate">{item.name}</h5>
                          {item.serial_number && (
                            <span className="text-[10px] text-cyan-400 font-mono block">
                              SN: {item.serial_number}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 block font-mono">
                            ৳{(item.discount_price || item.selling_price).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700">
                            <button
                              onClick={() => handleUpdateQty(item.id, -1)}
                              className="px-2 py-0.5 text-slate-400 hover:text-white font-bold"
                            >
                              -
                            </button>
                            <span className="px-2 py-0.5 font-bold text-white text-xs">{item.qty}</span>
                            <button
                              onClick={() => handleUpdateQty(item.id, 1)}
                              className="px-2 py-0.5 text-slate-400 hover:text-white font-bold"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemove(item.id)}
                            className="p-1 rounded-md text-rose-400 hover:bg-rose-950/50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Checkout Controls */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-400">Total Payable:</span>
                  <span className="text-lg font-black text-brand-400">৳{subtotal.toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    onClick={() => setPaymentMethod('cash_pos')}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      paymentMethod === 'cash_pos'
                        ? 'bg-brand-500 text-navy-950 border-brand-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      paymentMethod === 'card'
                        ? 'bg-brand-500 text-navy-950 border-brand-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    Card
                  </button>
                  <button
                    onClick={() => setPaymentMethod('bkash')}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      paymentMethod === 'bkash'
                        ? 'bg-brand-500 text-navy-950 border-brand-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    bKash
                  </button>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-navy-950 font-black text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Counter Sale</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
