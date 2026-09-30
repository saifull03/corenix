'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  User,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Building2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Package,
  Wrench,
  Gift,
  LogOut,
  Sparkles,
  ExternalLink,
  ChevronRight,
  MapPin,
  Clock
} from 'lucide-react';

interface AuthSession {
  authenticated: boolean;
  userType: 'staff' | 'customer' | null;
  user: any | null;
}

export default function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialMode);
  const [session, setSession] = useState<AuthSession>({ authenticated: false, userType: null, user: null });
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Form states - Login
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccessMessage, setLoginSuccessMessage] = useState('');

  // Form states - Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccessMessage, setRegSuccessMessage] = useState('');

  // Customer account data (when logged in)
  const [accountData, setAccountData] = useState<{
    orders: any[];
    rmaCases: any[];
    addresses: any[];
  }>({ orders: [], rmaCases: [], addresses: [] });
  const [customerTab, setCustomerTab] = useState<'overview' | 'orders' | 'rma'>('overview');

  // Fetch session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setIsLoadingSession(true);
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated) {
        setSession(data);
        if (data.userType === 'customer') {
          fetchCustomerData();
        }
      } else {
        setSession({ authenticated: false, userType: null, user: null });
      }
    } catch (err) {
      console.error('Session check failed', err);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const fetchCustomerData = async () => {
    try {
      const res = await fetch('/api/account/data');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAccountData({
            orders: data.orders || [],
            rmaCases: data.rmaCases || [],
            addresses: data.addresses || [],
          });
        }
      }
    } catch (err) {
      console.error('Failed to load customer details', err);
    }
  };

  // Handle Unified Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccessMessage('');

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setLoginError('Please enter your email or phone number and password.');
      return;
    }

    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginError(data.error || 'Invalid email or password.');
        setLoginLoading(false);
        return;
      }

      setLoginSuccessMessage(data.message);

      // Route based on role: Admin/Staff -> /admin, Customer -> /
      setTimeout(() => {
        if (data.userType === 'staff') {
          window.location.href = data.redirect || '/admin';
        } else {
          window.location.href = data.redirect || '/';
        }
      }, 1000);
    } catch (err: any) {
      setLoginError('An error occurred during sign in. Please try again.');
      setLoginLoading(false);
    }
  };

  // Handle Customer Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccessMessage('');

    if (!regName.trim()) {
      setRegError('Please provide your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Please enter a valid email address.');
      return;
    }
    if (!regPhone.trim()) {
      setRegError('Please enter your phone number.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }

    setRegLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim(),
          password: regPassword,
          confirmPassword: regConfirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setRegError(data.error || 'Failed to create account.');
        setRegLoading(false);
        return;
      }

      setRegSuccessMessage(data.message);

      // Auto-redirect to homepage as logged-in customer
      setTimeout(() => {
        window.location.href = data.redirect || '/';
      }, 1200);
    } catch (err) {
      setRegError('Failed to create account. Please try again.');
      setRegLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setSession({ authenticated: false, userType: null, user: null });
      setLoginSuccessMessage('');
      setLoginIdentifier('');
      setLoginPassword('');
      setActiveTab('login');
      window.location.reload();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Preset demo account filler
  const fillDemo = (id: string, pass: string) => {
    setLoginIdentifier(id);
    setLoginPassword(pass);
    setLoginError('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Top Breadcrumb & Title */}
          <div className="mb-8 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              <Link href="/" className="hover:text-sky-600 dark:hover:text-cyan-400">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-800 dark:text-slate-200">Account Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              CORENIX Authentication Hub
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Unified authentication for Customers, Branch Managers, Diagnosticians, and System Administrators.
            </p>
          </div>

          {/* Condition 1: Already Authenticated as Staff / Admin */}
          {session.authenticated && session.userType === 'staff' && (
            <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-sky-500/10 to-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-sky-500/20">
                    {session.user?.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{session.user?.name}</h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-100 text-sky-800 dark:bg-cyan-950 dark:text-cyan-300 border border-sky-300 dark:border-cyan-800">
                        {session.user?.role_name || session.user?.role_slug || 'Staff'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{session.user?.email}</p>
                    {session.user?.branch_name && (
                      <div className="flex items-center gap-1.5 text-xs text-sky-600 dark:text-cyan-400 font-semibold mt-1">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Assigned Location: {session.user.branch_name} ({session.user.branch_code})</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="self-start md:self-center flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 dark:border-rose-900/60 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>

              <div className="pt-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                  Administrative Workspace Shortcuts
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link
                    href="/admin"
                    className="p-5 rounded-2xl bg-slate-50 hover:bg-sky-50/80 dark:bg-navy-800/80 dark:hover:bg-navy-800 border border-slate-200 dark:border-slate-700/80 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-sky-600/10 text-sky-600 dark:text-cyan-400 flex items-center justify-center mb-3">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-cyan-400 transition-colors">
                        Admin Executive Dashboard
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Catalogue, inventory across 4 branches, procurement, and reports.
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-cyan-400 mt-4 group-hover:translate-x-1 transition-transform">
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>

                  <Link
                    href="/admin/pos"
                    className="p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50/80 dark:bg-navy-800/80 dark:hover:bg-navy-800 border border-slate-200 dark:border-slate-700/80 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                        <Package className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        Branch POS Counter Terminal
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        High-speed barcode scanner checkout and instant invoices.
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-4 group-hover:translate-x-1 transition-transform">
                      <span>Launch POS</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>

                  <Link
                    href="/"
                    className="p-5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-navy-800/80 dark:hover:bg-navy-800 border border-slate-200 dark:border-slate-700/80 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-slate-600/10 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-3">
                        <ExternalLink className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-cyan-400 transition-colors">
                        Public Storefront
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Browse active deals, PC builder, and published products as a shopper.
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 mt-4 group-hover:translate-x-1 transition-transform">
                      <span>Go to Store</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Condition 2: Already Authenticated as Customer */}
          {session.authenticated && session.userType === 'customer' && (
            <div className="space-y-6">
              {/* Customer Profile Banner */}
              <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-black shadow-md shadow-sky-500/20">
                    {session.user?.name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{session.user?.name}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{session.user?.email} • {session.user?.phone}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                        <Gift className="w-3.5 h-3.5 text-amber-500" />
                        <span>{session.user?.reward_points || 0} Reward Points</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified Customer
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="/"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-colors"
                  >
                    Continue Shopping
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 dark:border-rose-900/60 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {/* Customer Portal Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                  onClick={() => setCustomerTab('overview')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    customerTab === 'overview'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Account Overview
                </button>
                <button
                  onClick={() => setCustomerTab('orders')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    customerTab === 'orders'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>My Orders ({accountData.orders.length})</span>
                </button>
                <button
                  onClick={() => setCustomerTab('rma')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    customerTab === 'rma'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  <span>RMA & Warranty Claims ({accountData.rmaCases.length})</span>
                </button>
              </div>

              {/* Tab 1: Overview */}
              {customerTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                      <Package className="w-5 h-5 text-sky-600 dark:text-cyan-400" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">
                      {accountData.orders.length}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {accountData.orders.filter(o => o.order_status === 'delivered').length} delivered successfully
                    </p>
                  </div>

                  <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Active RMA Claims</span>
                      <Wrench className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">
                      {accountData.rmaCases.length}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Protected under official manufacturer warranty
                    </p>
                  </div>

                  <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Reward Balance</span>
                      <Gift className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
                      {session.user?.reward_points || 0} pts
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Equivalent to ৳{session.user?.reward_points || 0} discount on your next checkout
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Orders List */}
              {customerTab === 'orders' && (
                <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">Your Orders</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Track shipments and purchase invoices</p>
                    </div>
                  </div>

                  {accountData.orders.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                      <Package className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                      <p className="font-semibold">No orders found</p>
                      <p className="text-xs mt-1">Explore our technology catalogue and place your first order.</p>
                      <Link
                        href="/products"
                        className="inline-block mt-4 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold shadow-sm"
                      >
                        Explore Catalogue
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {accountData.orders.map((ord) => (
                        <div key={ord.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">{ord.order_number}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                ord.order_status === 'delivered' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                                ord.order_status === 'shipped' ? 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-cyan-300' :
                                'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              }`}>
                                {ord.order_status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                              <span>Placed on {new Date(ord.created_at).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{ord.branch_name || 'CORENIX Fulfillment'}</span>
                              <span>•</span>
                              <span className="capitalize">{ord.payment_method} ({ord.payment_status})</span>
                            </div>
                          </div>
                          <div className="text-right sm:text-right">
                            <div className="text-lg font-black text-slate-900 dark:text-white">
                              ৳{Number(ord.total_amount).toLocaleString()}
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{ord.item_count || 1} item(s)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: RMA Claims */}
              {customerTab === 'rma' && (
                <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">Active Warranty & Service Tickets</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Inspections handled at Agargaon Central RMA Hub</p>
                    </div>
                    <Link
                      href="/rma"
                      className="px-3.5 py-1.5 rounded-xl bg-sky-50 dark:bg-cyan-950 text-sky-700 dark:text-cyan-300 border border-sky-200 dark:border-cyan-800 text-xs font-bold"
                    >
                      File New Claim
                    </Link>
                  </div>

                  {accountData.rmaCases.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                      <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                      <p className="font-semibold">All products running healthy!</p>
                      <p className="text-xs mt-1">No open RMA tickets recorded for your account.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {accountData.rmaCases.map((rma) => (
                        <div key={rma.id} className="p-4 sm:p-6">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white">{rma.rma_number}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                              Status: {rma.status}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1">
                            {rma.product_name || 'Hardware Component'} (Serial: <code className="text-sky-600 dark:text-cyan-400">{rma.serial_number}</code>)
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Issue: {rma.problem_description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Condition 3: NOT Logged In - Show Unified Auth Form */}
          {!session.authenticated && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Unified Auth Box */}
              <div className="lg:col-span-7 bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl relative">
                {/* Mode Selector Tabs */}
                <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-6">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); setLoginError(''); setRegError(''); }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                      activeTab === 'login'
                        ? 'bg-white dark:bg-navy-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Sign In (Unified Portal)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('register'); setLoginError(''); setRegError(''); }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                      activeTab === 'register'
                        ? 'bg-white dark:bg-navy-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Create Customer Account
                  </button>
                </div>

                {/* TAB 1: UNIFIED SIGN IN */}
                {activeTab === 'login' && (
                  <div>
                    {/* Auto-routing Banner */}
                    <div className="mb-6 p-3.5 rounded-2xl bg-sky-50/80 dark:bg-navy-800/80 border border-sky-200/80 dark:border-sky-500/30 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-sky-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 dark:text-white font-bold block">
                          Smart Single-Sign-On
                        </strong>
                        Admins and Staff are automatically routed to the <strong>Admin Dashboard</strong>. Retail Customers are routed to the <strong>Storefront</strong>.
                      </div>
                    </div>

                    {loginError && (
                      <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{loginError}</span>
                      </div>
                    )}

                    {loginSuccessMessage && (
                      <div className="mb-5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>{loginSuccessMessage}</span>
                      </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Email Address or Phone Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={loginIdentifier}
                            onChange={(e) => setLoginIdentifier(e.target.value)}
                            placeholder="admin@corenix.com or customer@gmail.com"
                            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                          />
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Password
                          </label>
                          <span className="text-[11px] text-sky-600 dark:text-cyan-400 hover:underline cursor-pointer">
                            Forgot Password?
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="Enter your account password"
                            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 pl-10 pr-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                          />
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-bold text-sm shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loginLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Authenticating...</span>
                          </>
                        ) : (
                          <>
                            <span>Sign In to Account</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Quick Demo Logins Chips */}
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          One-Click Demo Credentials
                        </span>
                        <span className="text-[10px] text-slate-400">Click to autofill</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => fillDemo('admin@corenix.com', 'admin123')}
                          className="p-2.5 rounded-xl text-left bg-slate-50 hover:bg-sky-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-cyan-400">
                              🛡️ Super Admin
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-cyan-950 dark:text-cyan-300 font-bold">
                              → /admin
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                            admin@corenix.com
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => fillDemo('customer@gmail.com', 'customer123')}
                          className="p-2.5 rounded-xl text-left bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                              👤 Retail Customer
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                              → Store (/)
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                            customer@gmail.com
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => fillDemo('shop1@corenix.com', 'admin123')}
                          className="p-2.5 rounded-xl text-left bg-slate-50 hover:bg-sky-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-cyan-400">
                              🏪 Shop 1 Manager
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-cyan-950 dark:text-cyan-300 font-bold">
                              → /admin
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                            shop1@corenix.com
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => fillDemo('operator@corenix.com', 'operator123')}
                          className="p-2.5 rounded-xl text-left bg-slate-50 hover:bg-sky-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-cyan-400">
                              ⚙️ Data Operator
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-cyan-950 dark:text-cyan-300 font-bold">
                              → /admin
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                            operator@corenix.com
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: CREATE CUSTOMER ACCOUNT */}
                {activeTab === 'register' && (
                  <div>
                    <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-500/30 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
                      <Gift className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 dark:text-white font-bold block">
                          Instant 50 Welcome Points
                        </strong>
                        Create an account today to earn immediate reward points, save wishlist components, and track live order status.
                      </div>
                    </div>

                    {regError && (
                      <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{regError}</span>
                      </div>
                    )}

                    {regSuccessMessage && (
                      <div className="mb-5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>{regSuccessMessage}</span>
                      </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Full Name *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder="e.g. Tanvir Ahmed"
                            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                          />
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            Email Address *
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              required
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              placeholder="you@example.com"
                              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                            />
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            Phone Number *
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              required
                              value={regPhone}
                              onChange={(e) => setRegPhone(e.target.value)}
                              placeholder="+8801700000000"
                              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                            />
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            Password (min 6 characters) *
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              required
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                            />
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            Confirm Password *
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              required
                              value={regConfirmPassword}
                              onChange={(e) => setRegConfirmPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                            />
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        By creating an account, you agree to CORENIX Terms of Service and Privacy Policy.
                      </div>

                      <button
                        type="submit"
                        disabled={regLoading}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {regLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Creating Account...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Create Account & Get 50 Points</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Right Column: Platform Features & Info Card */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-gradient-to-br from-slate-900 to-navy-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

                  <h3 className="text-xl font-extrabold tracking-tight mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    <span>The CORENIX Ecosystem</span>
                  </h3>

                  <ul className="space-y-4 text-xs text-slate-300">
                    <li className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-white block font-bold">Multi-Branch Showrooms</strong>
                        Uttara Sector 3 Flagship & Dhanmondi Road 27 Branch with immediate showroom collection.
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-white block font-bold">Central Agargaon RMA Hub</strong>
                        Direct diagnosis, serial-number tracking, and official brand replacement warranties.
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-white block font-bold">Interactive PC Builder</strong>
                        Real-time socket, DDR5 RAM compatibility validation, and wattage load calculation.
                      </div>
                    </li>
                  </ul>

                  <div className="mt-6 pt-6 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                    <span>Customer Support Hotline:</span>
                    <strong className="text-cyan-400 font-bold">+880 9600-267364</strong>
                  </div>
                </div>

                {/* Showroom Operating Hours Card */}
                <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 text-xs text-slate-600 dark:text-slate-400 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                    <Clock className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                    <span>Showroom Hours</span>
                  </div>
                  <p>Saturday – Thursday: 10:00 AM – 9:00 PM</p>
                  <p>Friday: 2:00 PM – 9:00 PM (Showrooms open)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
