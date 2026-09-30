'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Bell, Receipt, User, ShieldCheck, LogOut, ExternalLink } from 'lucide-react';
import ThemeToggle from '@/components/theme/ThemeToggle';

export default function AdminHeader() {
  const router = useRouter();
  const [activeBranch, setActiveBranch] = useState('all');
  const [staffUser, setStaffUser] = useState<{
    name?: string;
    email?: string;
    role_name?: string;
    role_slug?: string;
    avatar?: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.userType === 'staff') {
          setStaffUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/account';
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="h-16 bg-white/95 dark:bg-navy-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Branch Context Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs">
          <Building2 className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
          <span className="text-slate-500 dark:text-slate-400 font-semibold">Active Location:</span>
          <select
            value={activeBranch}
            onChange={(e) => setActiveBranch(e.target.value)}
            className="bg-transparent text-slate-900 dark:text-white font-bold outline-none cursor-pointer"
          >
            <option value="all" className="bg-white text-slate-900 dark:bg-navy-900 dark:text-white">All Locations (Head Office Combined)</option>
            <option value="shop1" className="bg-white text-slate-900 dark:bg-navy-900 dark:text-white">Shop 1 (Uttara Flagship)</option>
            <option value="shop2" className="bg-white text-slate-900 dark:bg-navy-900 dark:text-white">Shop 2 (Dhanmondi Branch)</option>
            <option value="wh" className="bg-white text-slate-900 dark:bg-navy-900 dark:text-white">Main Central Warehouse (Tejgaon)</option>
            <option value="rma" className="bg-white text-slate-900 dark:bg-navy-900 dark:text-white">CORENIX RMA Hub (Agargaon)</option>
          </select>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* View Storefront Link */}
        <Link
          href="/"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          title="Open Public Storefront"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>View Store</span>
        </Link>

        {/* Theme Toggle (Dark / Light) */}
        <ThemeToggle />

        {/* Quick POS Button */}
        <Link
          href="/admin/pos"
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Receipt className="w-4 h-4" />
          <span className="hidden sm:inline">Launch POS Terminal</span>
          <span className="sm:hidden">POS</span>
        </Link>

        {/* Notifications */}
        <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sky-500 dark:bg-cyan-400"></span>
        </button>

        {/* User status & Logout */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800 text-xs">
          <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-cyan-950 border border-sky-200 dark:border-cyan-800 flex items-center justify-center font-bold text-sky-700 dark:text-cyan-300">
            {staffUser?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden lg:block text-left">
            <span className="text-slate-900 dark:text-white font-bold block leading-tight">
              {staffUser?.name || 'Admin User'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {staffUser?.role_name || staffUser?.email || 'admin@corenix.com'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors ml-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
