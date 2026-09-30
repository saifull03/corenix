'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  Cpu,
  MapPin,
  User,
  ShieldCheck,
  ChevronDown,
  Layers,
  Menu,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import ThemeToggle from '@/components/theme/ThemeToggle';

export default function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ text: string; type: string; slug: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(1);
  const searchRef = useRef<HTMLDivElement>(null);

  // Autocomplete debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        // Fallback
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close autocomplete
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-navy-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Top micro-bar: Branch info, Hotline & Admin access */}
      <div className="bg-slate-50/90 dark:bg-navy-900/90 border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-1.5 text-xs text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-sky-600 dark:text-brand-400 font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <span>Showrooms: Uttara (Shop 1) & Dhanmondi (Shop 2)</span>
            </span>
            <span className="hidden md:inline-block text-slate-300 dark:text-slate-600">|</span>
            <span className="hidden md:inline-block text-slate-600 dark:text-slate-400">
              Hotline: <strong className="text-slate-800 dark:text-slate-200 font-bold">+880 9600-267364</strong> (10 AM - 9 PM)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/rma" className="hover:text-sky-600 dark:hover:text-brand-400 flex items-center gap-1 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600 dark:text-brand-400" />
              <span>RMA & Warranty Status</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <Link href="/admin" className="text-slate-700 hover:text-sky-600 dark:text-slate-300 dark:hover:text-brand-400 font-semibold transition-colors">
              Staff / Admin Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Cpu className="w-6 h-6 text-white font-bold" />
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
              CORENIX<span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-brand-400"></span>
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-sky-600 dark:text-cyan-400 -mt-0.5">
              Next-Gen Tech
            </div>
          </div>
        </Link>

        {/* Global Search Bar with Live Suggestions */}
        <div className="flex-1 max-w-2xl relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
              placeholder="Search RTX 5060, Core i7, DDR5 RAM, Gaming Laptops, SKU..."
              className="w-full bg-slate-100/90 dark:bg-navy-900/90 border border-slate-200 dark:border-slate-700/80 focus:border-sky-500 dark:focus:border-brand-500 focus:bg-white dark:focus:bg-navy-900 focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-brand-500/20 rounded-xl px-4 py-2.5 pl-11 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-2 top-2 px-3.5 py-1 bg-sky-600 hover:bg-sky-500 dark:bg-brand-500 dark:hover:bg-brand-400 text-white dark:text-navy-950 text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              Search
            </button>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Instant Suggestions</span>
                <span className="text-sky-600 dark:text-brand-400">Press Enter for full search</span>
              </div>
              <ul className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
                {suggestions.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      href={item.slug}
                      onClick={() => setShowSuggestions(false)}
                      className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          item.type === 'product' ? 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-cyan-950 dark:text-brand-300 dark:border-brand-800' :
                          item.type === 'category' ? 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800' :
                          'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                        }`}>
                          {item.type}
                        </span>
                        <span className="text-sm text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-brand-300 font-medium">
                          {item.text}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons: PC Builder, Account, Cart */}
        <div className="flex items-center gap-3">
          {/* PC Builder Callout Button */}
          <Link
            href="/pc-builder"
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/30 dark:hover:border-brand-500 font-semibold text-xs tracking-wide transition-all shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-sky-600 dark:text-brand-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>PC Builder</span>
          </Link>

          {/* Theme Toggle (Dark / Light) */}
          <ThemeToggle />

          {/* Account */}
          <Link
            href="/account"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="hidden lg:inline-block">Account</span>
          </Link>

          {/* Cart Drawer Trigger */}
          <Link
            href="/cart"
            className="relative flex items-center justify-center p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-100 transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-sky-600 dark:text-brand-400" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-sky-600 dark:bg-brand-500 text-white dark:text-navy-950 font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Categories Bar */}
      <nav className="bg-slate-50/90 dark:bg-navy-900/60 border-t border-slate-200/80 dark:border-slate-800/80 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300 overflow-x-auto py-2.5">
          <Link href="/products" className="flex items-center gap-1.5 text-sky-600 dark:text-brand-400 hover:text-sky-700 dark:hover:text-brand-300 font-bold whitespace-nowrap">
            <Layers className="w-4 h-4" />
            <span>All Products</span>
          </Link>
          <Link href="/category/processor" className="hover:text-sky-600 dark:hover:text-brand-400 whitespace-nowrap transition-colors">
            Processors
          </Link>
          <Link href="/category/graphics-card" className="hover:text-sky-600 dark:hover:text-brand-400 whitespace-nowrap transition-colors">
            Graphics Cards
          </Link>
          <Link href="/category/motherboard" className="hover:text-sky-600 dark:hover:text-brand-400 whitespace-nowrap transition-colors">
            Motherboards
          </Link>
          <Link href="/category/ram" className="hover:text-sky-600 dark:hover:text-brand-400 whitespace-nowrap transition-colors">
            Desktop RAM
          </Link>
          <Link href="/category/storage" className="hover:text-sky-600 dark:hover:text-brand-400 whitespace-nowrap transition-colors">
            Storage (SSDs)
          </Link>
          <Link href="/category/power-supply" className="hover:text-sky-600 dark:hover:text-brand-400 whitespace-nowrap transition-colors">
            Power Supplies
          </Link>
          <Link href="/category/laptops" className="hover:text-sky-600 dark:hover:text-brand-400 whitespace-nowrap transition-colors">
            Laptops
          </Link>
          <Link href="/category/monitors" className="hover:text-sky-600 dark:hover:text-brand-400 whitespace-nowrap transition-colors">
            Monitors
          </Link>
          <Link href="/offers" className="text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300 whitespace-nowrap font-bold ml-auto">
            Hot Deals & Offers
          </Link>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-navy-950 border-t border-slate-800 px-4 py-4 space-y-3">
          <Link
            href="/pc-builder"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-300 font-bold text-sm"
          >
            <span>Interactive PC Builder</span>
            <Sparkles className="w-4 h-4" />
          </Link>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link href="/category/processor" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded bg-slate-900 text-slate-300">
              Processors
            </Link>
            <Link href="/category/graphics-card" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded bg-slate-900 text-slate-300">
              Graphics Cards
            </Link>
            <Link href="/category/motherboard" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded bg-slate-900 text-slate-300">
              Motherboards
            </Link>
            <Link href="/category/laptops" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded bg-slate-900 text-slate-300">
              Laptops
            </Link>
            <Link href="/category/monitors" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded bg-slate-900 text-slate-300">
              Monitors
            </Link>
            <Link href="/offers" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded bg-amber-950 text-amber-300 font-bold">
              Special Offers
            </Link>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <Link href="/stores" onClick={() => setIsMobileMenuOpen(false)}>Shop 1 & Shop 2</Link>
            <Link href="/rma" onClick={() => setIsMobileMenuOpen(false)}>RMA Service</Link>
            <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-brand-400 font-semibold">Admin</Link>
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
