'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, Search, Bell, Receipt, User, ShieldCheck } from 'lucide-react';
import ThemeToggle from '@/components/theme/ThemeToggle';

export default function AdminHeader() {
  const [activeBranch, setActiveBranch] = useState('all');

  return (
    <header className="h-16 bg-navy-900/90 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Branch Context Selector (Requirements 26, 37) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs">
          <Building2 className="w-4 h-4 text-brand-400" />
          <span className="text-slate-400 font-semibold">Active Location:</span>
          <select
            value={activeBranch}
            onChange={(e) => setActiveBranch(e.target.value)}
            className="bg-transparent text-white font-bold outline-none cursor-pointer"
          >
            <option value="all" className="bg-navy-900 text-white">All Locations (Head Office Combined)</option>
            <option value="shop1" className="bg-navy-900 text-white">Shop 1 (Uttara Flagship)</option>
            <option value="shop2" className="bg-navy-900 text-white">Shop 2 (Dhanmondi Branch)</option>
            <option value="wh" className="bg-navy-900 text-white">Main Central Warehouse (Tejgaon)</option>
            <option value="rma" className="bg-navy-900 text-white">CORENIX RMA Hub (Agargaon)</option>
          </select>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle (Dark / Light) */}
        <ThemeToggle />

        {/* Quick POS Button */}
        <Link
          href="/admin/pos"
          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow"
        >
          <Receipt className="w-4 h-4" />
          <span>Launch POS Terminal</span>
        </Link>

        {/* Notifications */}
        <button className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-400"></span>
        </button>

        {/* User status */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-800 text-xs">
          <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-brand-500/40 flex items-center justify-center font-bold text-brand-400">
            A
          </div>
          <div className="hidden sm:block">
            <span className="text-white font-bold block leading-tight">Admin User</span>
            <span className="text-[10px] text-slate-400">admin@corenix.com</span>
          </div>
        </div>
      </div>
    </header>
  );
}
