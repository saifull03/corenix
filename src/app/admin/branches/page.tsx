'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Warehouse,
  Wrench,
  Store,
  Plus,
  MapPin,
  Phone,
  Mail,
  Users,
  Package,
  ShoppingCart,
  CheckCircle2,
  Receipt,
  X
} from 'lucide-react';

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<'shop' | 'warehouse' | 'rma_center'>('shop');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/branches');
      const data = await res.json();
      if (data.success) {
        setBranches(data.branches);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code, type, address, phone, email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to create branch');
        setSubmitting(false);
        return;
      }

      setName('');
      setCode('');
      setAddress('');
      setPhone('');
      setEmail('');
      setIsModalOpen(false);
      fetchBranches();
    } catch (err) {
      setErrorMsg('Failed to create branch');
    } finally {
      setSubmitting(false);
    }
  };

  const getBranchIcon = (branchType: string) => {
    switch (branchType) {
      case 'warehouse':
        return <Warehouse className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'rma_center':
        return <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      default:
        return <Store className="w-5 h-5 text-sky-600 dark:text-cyan-400" />;
    }
  };

  const totalStock = branches.reduce((sum, b) => sum + Number(b.total_units || 0), 0);
  const totalStaff = branches.reduce((sum, b) => sum + Number(b.staff_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-cyan-400">
            Enterprise Infrastructure
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-sky-600 dark:text-cyan-400" />
            <span>Branches & Physical Showroom Locations</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage multi-location computer retail showrooms, central logistics warehouse, and technical RMA diagnostic centers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-sky-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Location</span>
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Total Facilities</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{branches.length}</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">100% operational</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Total Stock Distribution</span>
          <span className="text-2xl font-black text-sky-600 dark:text-cyan-400 mt-1 block">
            {totalStock.toLocaleString()} units
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Tracked in live inventory</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Active Field Personnel</span>
          <span className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
            {totalStaff} Staff
          </span>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Assigned by RBAC</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Physical Showrooms</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            {branches.filter((b) => b.type === 'shop').length} Retail Hubs
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">With live POS terminal</span>
        </div>
      </div>

      {/* Branch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {branches.map((b) => (
          <div
            key={b.id}
            className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Top Row: Icon, Title & Status */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center">
                    {getBranchIcon(b.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{b.name}</h3>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-100 text-sky-800 dark:bg-cyan-950 dark:text-cyan-300 border border-sky-200 dark:border-cyan-800">
                        {b.code}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 capitalize block mt-0.5">
                      {b.type === 'rma_center' ? 'Official RMA Diagnostics Center' : b.type === 'warehouse' ? 'Central Logistics Warehouse' : 'Flagship Technology Showroom'}
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Operational
                </span>
              </div>

              {/* Metrics Strip */}
              <div className="grid grid-cols-3 gap-3 my-4 p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-slate-800 text-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inventory</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                    {Number(b.total_units || 0).toLocaleString()} <span className="text-[10px] font-normal text-slate-400">units</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Personnel</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                    {b.staff_count || 0} <span className="text-[10px] font-normal text-slate-400">staff</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Orders</span>
                  <span className="text-sm font-black text-sky-600 dark:text-cyan-400 mt-0.5 block">
                    {b.active_orders || 0}
                  </span>
                </div>
              </div>

              {/* Contact & Address Details */}
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>{b.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{b.phone}</span>
                </div>
                {b.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{b.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/admin/inventory"
                className="text-xs font-bold text-sky-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                <Package className="w-3.5 h-3.5" />
                <span>View Location Stock</span>
              </Link>

              {b.type === 'shop' && (
                <Link
                  href="/admin/pos"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-colors"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Launch POS</span>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Location Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                <span>Add New Facility Location</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Location Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shop 3 (Mirpur Branch)"
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Branch Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="SHOP-3"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Facility Type
                  </label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="shop" className="dark:bg-navy-900">Retail Showroom (Shop)</option>
                    <option value="warehouse" className="dark:bg-navy-900">Distribution Warehouse</option>
                    <option value="rma_center" className="dark:bg-navy-900">RMA Diagnosis Hub</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Physical Address *
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Plot, Road, Area, Dhaka"
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hotline Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+8801700000000"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Branch Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="branch@corenix.com"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Save Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
