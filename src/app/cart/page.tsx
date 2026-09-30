'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck, MapPin, Tag } from 'lucide-react';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'MSI GeForce RTX 5060 Gaming X 8GB GDDR6 Graphics Card',
      sku: 'GPU-MSI-5060-GX',
      price: 46900,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80',
      warranty: '3 Years Official Replacement Warranty',
    },
  ]);

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal - discount;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'CORENIX500') {
      setDiscount(500);
      alert('Coupon applied! ৳500 discount added.');
    } else {
      alert('Invalid coupon code. Try "CORENIX500"');
    }
  };

  const handleUpdateQty = (id: number, delta: number) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemove = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-navy-950 dark:text-slate-100 font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-sky-600 dark:text-brand-400" />
          <span>Shopping Cart</span>
        </h1>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-contain bg-slate-50 dark:bg-navy-950 rounded-xl p-2 border border-slate-200 dark:border-slate-800"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{item.name}</h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">SKU: {item.sku}</span>
                        <span className="text-[11px] text-sky-600 dark:text-brand-400 flex items-center gap-1 mt-1 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5" /> {item.warranty}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <button
                          onClick={() => handleUpdateQty(item.id, -1)}
                          className="px-3 py-1 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 font-bold transition-colors"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQty(item.id, 1)}
                          className="px-3 py-1 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 font-bold transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-slate-900 dark:text-white block">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">৳{item.price.toLocaleString()} each</span>
                      </div>

                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Branch Pickup Notice */}
              <div className="p-4 rounded-xl bg-sky-50/80 dark:bg-slate-900 border border-sky-200/70 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
                <MapPin className="w-5 h-5 text-sky-600 dark:text-brand-400 flex-shrink-0" />
                <span>
                  Items are reserved upon order confirmation. Ready for instant pickup at <strong className="text-slate-900 dark:text-white">Shop 1 (Uttara)</strong> or <strong className="text-slate-900 dark:text-white">Shop 2 (Dhanmondi)</strong>.
                </span>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                  Order Summary
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Subtotal:</span>
                    <span className="font-bold text-slate-900 dark:text-white">৳{subtotal.toLocaleString()}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>Promo Discount:</span>
                      <span className="font-bold">-৳{discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Estimated Shipping / Pickup:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Calculated at Checkout</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm">
                    <span className="font-bold text-slate-900 dark:text-white">Estimated Total:</span>
                    <span className="text-xl font-black text-sky-600 dark:text-brand-400">৳{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Coupon Code Input */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon: CORENIX500"
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white uppercase focus:outline-none focus:border-sky-500 dark:focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-brand-300 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    Apply
                  </button>
                </form>

                <Link
                  href="/checkout"
                  className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-brand-500 dark:hover:bg-brand-400 text-white dark:text-navy-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 dark:shadow-cyan-500/20 transition-all hover:scale-102"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-16 text-center rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-4 max-w-md mx-auto shadow-xs">
            <ShoppingCart className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your Cart is Empty</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Discover new arrivals, GPUs, processors and custom gaming rigs.</p>
            <Link
              href="/products"
              className="inline-block px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-brand-500 dark:hover:bg-brand-400 text-white dark:text-navy-950 font-bold text-xs shadow-sm transition-colors"
            >
              Browse Hardware
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
