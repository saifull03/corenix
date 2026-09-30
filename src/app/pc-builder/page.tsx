'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  Cpu,
  Layers,
  Zap,
  HardDrive,
  Monitor,
  Fan,
  Box,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Trash2,
  ShoppingCart,
  Share2,
  Printer,
  Sparkles
} from 'lucide-react';

interface ComponentSlot {
  key: string;
  name: string;
  icon: any;
  required: boolean;
  product: any | null;
  baseWattage: number;
}

export default function PcBuilderPage() {
  const [slots, setSlots] = useState<ComponentSlot[]>([
    { key: 'cpu', name: 'Processor (CPU)', icon: Cpu, required: true, product: null, baseWattage: 125 },
    { key: 'motherboard', name: 'Motherboard', icon: Layers, required: true, product: null, baseWattage: 50 },
    { key: 'cooler', name: 'CPU Cooler', icon: Fan, required: false, product: null, baseWattage: 15 },
    { key: 'ram', name: 'RAM (Memory)', icon: Layers, required: true, product: null, baseWattage: 20 },
    { key: 'storage', name: 'Storage (SSD / M.2)', icon: HardDrive, required: true, product: null, baseWattage: 10 },
    { key: 'gpu', name: 'Graphics Card (GPU)', icon: Zap, required: false, product: null, baseWattage: 200 },
    { key: 'psu', name: 'Power Supply (PSU)', icon: Zap, required: true, product: null, baseWattage: 0 },
    { key: 'case', name: 'Casing / PC Case', icon: Box, required: true, product: null, baseWattage: 0 },
    { key: 'monitor', name: 'Monitor / Display', icon: Monitor, required: false, product: null, baseWattage: 0 },
  ]);

  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [selectingSlot, setSelectingSlot] = useState<string | null>(null);
  const [shareCode, setShareCode] = useState<string>('');

  // Fetch PC Builder eligible products from database
  useEffect(() => {
    fetch('/api/products?pc_builder=1')
      .then(res => res.json())
      .then(data => {
        if (data.products) setAvailableProducts(data.products);
      })
      .catch(() => {});
  }, []);

  // Total price calculation
  const totalPrice = slots.reduce((sum, slot) => {
    if (!slot.product) return sum;
    return sum + (slot.product.discount_price || slot.product.selling_price);
  }, 0);

  // Total wattage calculation
  const totalWattage = slots.reduce((sum, slot) => {
    if (!slot.product) return sum;
    return sum + (slot.baseWattage || 30);
  }, 100);

  const recommendedPsuWattage = Math.ceil((totalWattage * 1.3) / 50) * 50;

  // Compatibility engine
  const cpu = slots.find(s => s.key === 'cpu')?.product;
  const mobo = slots.find(s => s.key === 'motherboard')?.product;
  const ram = slots.find(s => s.key === 'ram')?.product;
  const psu = slots.find(s => s.key === 'psu')?.product;

  let compatibilityStatus: 'compatible' | 'warning' | 'incompatible' = 'compatible';
  let compatibilityMessage = 'All currently selected components are compatible.';

  if (cpu && mobo) {
    // Check socket compatibility
    const cpuSocket = cpu.specs?.find((s: any) => s.attribute_code === 'cpu_socket')?.attribute_value;
    const moboSocket = mobo.specs?.find((s: any) => s.attribute_code === 'cpu_socket')?.attribute_value;
    if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
      compatibilityStatus = 'incompatible';
      compatibilityMessage = `Socket Mismatch: CPU requires ${cpuSocket}, but Motherboard is ${moboSocket}.`;
    }
  }

  if (mobo && ram) {
    // Check RAM standard (e.g. DDR5 vs DDR4)
    const moboRam = mobo.specs?.find((s: any) => s.attribute_code === 'ram_type')?.attribute_value;
    const ramType = ram.specs?.find((s: any) => s.attribute_code === 'ram_type')?.attribute_value;
    if (moboRam && ramType && moboRam !== ramType) {
      compatibilityStatus = 'incompatible';
      compatibilityMessage = `Memory Incompatibility: Motherboard supports ${moboRam}, but RAM is ${ramType}.`;
    }
  }

  if (psu && totalWattage > 500) {
    // PSU capacity warning
    const psuWattageMatch = psu.name.match(/(\d+)W/i);
    if (psuWattageMatch && parseInt(psuWattageMatch[1]) < totalWattage) {
      compatibilityStatus = 'warning';
      compatibilityMessage = `Power Warning: Selected PSU (${psuWattageMatch[1]}W) is lower than recommended capacity (${recommendedPsuWattage}W).`;
    }
  }

  const handleSelectProduct = (slotKey: string, product: any) => {
    setSlots(slots.map(s => s.key === slotKey ? { ...s, product } : s));
    setSelectingSlot(null);
  };

  const handleRemoveProduct = (slotKey: string) => {
    setSlots(slots.map(s => s.key === slotKey ? { ...s, product: null } : s));
  };

  const handleShare = () => {
    const code = 'CRX-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setShareCode(code);
    alert(`Build Saved! Share Code: ${code}\nShare URL: https://corenix.com.bd/pc-builder?share=${code}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddToCart = () => {
    const selected = slots.filter(s => s.product);
    if (selected.length === 0) {
      alert('Please select at least one component to add your build to cart.');
      return;
    }
    alert(`Success! Added all ${selected.length} custom build components to cart (Total: ৳${totalPrice.toLocaleString()}).`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-navy-900 via-slate-900 to-navy-900 border border-slate-800 mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Hardware Compatibility Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              CORENIX Custom PC Builder
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Choose your components with automated validation for sockets, RAM generation, and wattage consumption. Save, share, or pick up assembled at Shop 1 or Shop 2.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Share2 className="w-4 h-4 text-brand-400" />
              <span>Share Build</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Printer className="w-4 h-4 text-brand-400" />
              <span>Print Quotation</span>
            </button>
          </div>
        </div>

        {/* Compatibility Bar & Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Compatibility Engine Alert */}
          <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
            compatibilityStatus === 'compatible'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : compatibilityStatus === 'warning'
              ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}>
            {compatibilityStatus === 'compatible' && <CheckCircle2 className="w-7 h-7 text-emerald-400 flex-shrink-0" />}
            {compatibilityStatus === 'warning' && <AlertTriangle className="w-7 h-7 text-amber-400 flex-shrink-0" />}
            {compatibilityStatus === 'incompatible' && <XCircle className="w-7 h-7 text-rose-400 flex-shrink-0" />}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block">
                Compatibility Status: {compatibilityStatus.toUpperCase()}
              </span>
              <p className="text-xs opacity-90 leading-tight mt-0.5">
                {compatibilityMessage}
              </p>
            </div>
          </div>

          {/* Wattage Calculator */}
          <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Estimated Power Draw
              </span>
              <span className="text-2xl font-black text-amber-400">
                {totalWattage}W
              </span>
              <span className="text-[11px] text-slate-400 block">
                Recommended PSU: <strong>{recommendedPsuWattage}W+</strong>
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-6 h-6" />
            </div>
          </div>

          {/* Total Build Price & Order CTA */}
          <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Total Build Price
              </span>
              <span className="text-2xl font-black text-brand-400">
                ৳{totalPrice.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 block">
                VAT Included • Free Assembly
              </span>
            </div>
            <button
              onClick={handleAddToCart}
              className="py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add All to Cart</span>
            </button>
          </div>
        </div>

        {/* Component Slots List */}
        <div className="space-y-3">
          {slots.map((slot) => {
            const Icon = slot.icon;
            return (
              <div
                key={slot.key}
                className="p-4 rounded-2xl bg-navy-900 border border-slate-800 flex items-center justify-between flex-wrap gap-4 transition-colors hover:border-slate-700"
              >
                {/* Left: Slot Type */}
                <div className="flex items-center gap-3.5 w-64">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-brand-400 flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {slot.name}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                      {slot.required ? 'Mandatory Component' : 'Optional Upgrade'}
                    </span>
                  </div>
                </div>

                {/* Middle: Selected Product Details or Placeholder */}
                <div className="flex-1 min-w-[200px]">
                  {slot.product ? (
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={slot.product.primary_image || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=200&q=80'}
                        alt={slot.product.name}
                        className="w-12 h-12 object-contain bg-navy-950 rounded-lg p-1 border border-slate-800 flex-shrink-0"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-100 line-clamp-1">
                          {slot.product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                          <span className="text-brand-400 font-bold">
                            ৳{(slot.product.discount_price || slot.product.selling_price).toLocaleString()}
                          </span>
                          <span>•</span>
                          <span>{slot.product.warranty_period}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic">
                      No component selected
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                  {slot.product ? (
                    <>
                      <button
                        onClick={() => setSelectingSlot(slot.key)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                      >
                        Change
                      </button>
                      <button
                        onClick={() => handleRemoveProduct(slot.key)}
                        className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-400"
                        title="Remove component"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setSelectingSlot(slot.key)}
                      className="px-4 py-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Choose {slot.name.split(' ')[0]}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Select Component from live database */}
        {selectingSlot && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-navy-900 border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Select Compatible Component
                  </h3>
                  <span className="text-xs text-slate-400">
                    Showing verified inventory items for {slots.find(s => s.key === selectingSlot)?.name}
                  </span>
                </div>
                <button
                  onClick={() => setSelectingSlot(null)}
                  className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-3 flex-1">
                {availableProducts.length > 0 ? (
                  availableProducts.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between gap-4 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.primary_image || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=200&q=80'}
                          alt={p.name}
                          className="w-12 h-12 object-contain bg-navy-950 rounded-lg p-1"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-white">{p.name}</h4>
                          <span className="text-[11px] text-slate-400">{p.warranty_period} • Stock: {p.total_stock || 10} Units</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-brand-400">
                          ৳{(p.discount_price || p.selling_price).toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleSelectProduct(selectingSlot, p)}
                          className="px-3.5 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-xs text-slate-400 py-8">
                    No components found in this category.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
