'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  CreditCard,
  Truck,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Phone,
  Mail,
  User,
  ShoppingBag
} from 'lucide-react';

export default function CheckoutPage() {
  const [name, setName] = useState('Mahmudul Karim');
  const [phone, setPhone] = useState('+8801799999999');
  const [email, setEmail] = useState('customer@gmail.com');
  const [deliveryType, setDeliveryType] = useState<'shop1' | 'shop2' | 'inside_dhaka' | 'outside_dhaka'>('shop1');
  const [address, setAddress] = useState('House 14, Road 5, Block B, Uttara, Dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'card' | 'emi'>('bkash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<any | null>(null);

  const subtotal = 46900;
  const shippingFee = deliveryType === 'shop1' || deliveryType === 'shop2' ? 0 : deliveryType === 'inside_dhaka' ? 70 : 130;
  const total = subtotal + shippingFee;

  const branchId = deliveryType === 'shop2' ? 3 : 2; // Shop 2 or Shop 1

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          deliveryType,
          branchId,
          shippingAddress: address,
          paymentMethod,
          subtotal,
          shippingFee,
          items: [
            {
              id: 1,
              name: 'MSI GeForce RTX 5060 Gaming X 8GB GDDR6 Graphics Card',
              sku: 'GPU-MSI-5060-GX',
              price: 46900,
              quantity: 1,
              warranty: '3 Years Official Replacement Warranty',
            }
          ]
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrderConfirmed(data);
      } else {
        alert(data.error || 'Failed to place order.');
      }
    } catch (err: any) {
      alert('Error connecting to checkout server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {orderConfirmed ? (
          /* ORDER CONFIRMATION SCREEN */
          <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-navy-900 border border-slate-800 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Order Confirmed</span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Thank you for your order!
              </h1>
              <p className="text-xs text-slate-400">
                Your order has been recorded into the CORENIX database. Inventory is reserved.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Order Reference:</span>
                <span className="font-mono font-bold text-brand-400 text-sm">{orderConfirmed.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pickup / Location:</span>
                <span className="font-bold text-white">
                  {deliveryType === 'shop1' ? 'Shop 1 (Uttara Flagship)' : deliveryType === 'shop2' ? 'Shop 2 (Dhanmondi Branch)' : 'Home Express Delivery'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Status:</span>
                <span className="text-amber-400 font-semibold uppercase">{paymentMethod.toUpperCase()} (Pending confirmation)</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 text-sm">
                <span className="font-bold text-white">Total Amount:</span>
                <span className="font-black text-brand-400">৳{orderConfirmed.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4">
              <Link
                href="/products"
                className="px-6 py-3 rounded-xl bg-brand-500 text-navy-950 font-bold text-xs"
              >
                Continue Shopping
              </Link>
              <button
                onClick={() => window.print()}
                className="px-6 py-3 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs border border-slate-700 hover:bg-slate-700"
              >
                Print Invoice
              </button>
            </div>
          </div>
        ) : (
          /* CHECKOUT FORM */
          <form onSubmit={handlePlaceOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Details, Delivery & Payment */}
              <div className="lg:col-span-8 space-y-6">
                {/* 1. Customer Information */}
                <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-brand-400" />
                    <span>1. Customer Information</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-400 mb-1 font-semibold">Email Address (Optional for Invoice & Updates)</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Delivery or Branch Pickup Selection */}
                <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Truck className="w-5 h-5 text-brand-400" />
                    <span>2. Delivery or Branch Pickup</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <label className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-colors ${
                      deliveryType === 'shop1' ? 'bg-cyan-950/40 border-brand-500 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-brand-400" /> Shop 1: Uttara Flagship
                        </span>
                        <input
                          type="radio"
                          name="deliveryType"
                          checked={deliveryType === 'shop1'}
                          onChange={() => setDeliveryType('shop1')}
                          className="text-brand-500"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">Sector 3, Uttara. Instant cash/card pickup.</p>
                      <span className="text-emerald-400 font-bold mt-2">FREE Pickup</span>
                    </label>

                    <label className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-colors ${
                      deliveryType === 'shop2' ? 'bg-cyan-950/40 border-brand-500 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-brand-400" /> Shop 2: Dhanmondi
                        </span>
                        <input
                          type="radio"
                          name="deliveryType"
                          checked={deliveryType === 'shop2'}
                          onChange={() => setDeliveryType('shop2')}
                          className="text-brand-500"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">Road 27, Dhanmondi. Instant pickup.</p>
                      <span className="text-emerald-400 font-bold mt-2">FREE Pickup</span>
                    </label>

                    <label className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-colors ${
                      deliveryType === 'inside_dhaka' ? 'bg-cyan-950/40 border-brand-500 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold">Inside Dhaka Express</span>
                        <input
                          type="radio"
                          name="deliveryType"
                          checked={deliveryType === 'inside_dhaka'}
                          onChange={() => setDeliveryType('inside_dhaka')}
                          className="text-brand-500"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">Delivered within 24 hours.</p>
                      <span className="text-brand-400 font-bold mt-2">৳70 Fee</span>
                    </label>

                    <label className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-colors ${
                      deliveryType === 'outside_dhaka' ? 'bg-cyan-950/40 border-brand-500 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold">Nationwide Courier</span>
                        <input
                          type="radio"
                          name="deliveryType"
                          checked={deliveryType === 'outside_dhaka'}
                          onChange={() => setDeliveryType('outside_dhaka')}
                          className="text-brand-500"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">Sundarban / Steadfast 48-72h.</p>
                      <span className="text-brand-400 font-bold mt-2">৳130 Fee</span>
                    </label>
                  </div>

                  <div className="pt-2 text-xs">
                    <label className="block text-slate-400 mb-1 font-semibold">Detailed Street Address / Landmark</label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* 3. Payment Method */}
                <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-brand-400" />
                    <span>3. Payment Method</span>
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <label className={`p-3.5 rounded-xl border cursor-pointer text-center space-y-1 transition-colors ${
                      paymentMethod === 'bkash' ? 'bg-pink-950/50 border-pink-500 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'bkash'}
                        onChange={() => setPaymentMethod('bkash')}
                        className="hidden"
                      />
                      <span className="font-black text-pink-400 block">bKash</span>
                      <span className="text-[10px] text-slate-400">Instant Gateway</span>
                    </label>

                    <label className={`p-3.5 rounded-xl border cursor-pointer text-center space-y-1 transition-colors ${
                      paymentMethod === 'nagad' ? 'bg-orange-950/50 border-orange-500 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'nagad'}
                        onChange={() => setPaymentMethod('nagad')}
                        className="hidden"
                      />
                      <span className="font-black text-orange-400 block">Nagad</span>
                      <span className="text-[10px] text-slate-400">Digital Wallet</span>
                    </label>

                    <label className={`p-3.5 rounded-xl border cursor-pointer text-center space-y-1 transition-colors ${
                      paymentMethod === 'cod' ? 'bg-emerald-950/50 border-emerald-500 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="hidden"
                      />
                      <span className="font-black text-emerald-400 block">Cash / COD</span>
                      <span className="text-[10px] text-slate-400">Pay on Pickup</span>
                    </label>

                    <label className={`p-3.5 rounded-xl border cursor-pointer text-center space-y-1 transition-colors ${
                      paymentMethod === 'emi' ? 'bg-purple-950/50 border-purple-500 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'emi'}
                        onChange={() => setPaymentMethod('emi')}
                        className="hidden"
                      />
                      <span className="font-black text-purple-400 block">0% EMI</span>
                      <span className="text-[10px] text-slate-400">Credit Card</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Review */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4 sticky top-24">
                  <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-brand-400" />
                    <span>Review Order</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>MSI RTX 5060 Gaming X 8GB (x1)</span>
                      <span className="font-bold text-white">৳46,900</span>
                    </div>

                    <div className="pt-3 border-t border-slate-800 space-y-1.5">
                      <div className="flex justify-between text-slate-400">
                        <span>Subtotal:</span>
                        <span className="text-white">৳{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Delivery / Pickup:</span>
                        <span className={shippingFee === 0 ? 'text-emerald-400 font-bold' : 'text-white'}>
                          {shippingFee === 0 ? 'FREE' : `৳${shippingFee}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-slate-800 font-bold text-white">
                        <span>Payable Total:</span>
                        <span className="text-xl font-black text-brand-400">৳{total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-102 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="pt-2 text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Official Warranty & 100% Data Security</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
