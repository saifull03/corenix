'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bell,
  Package,
  ShoppingCart,
  AlertTriangle,
  AlertOctagon,
  CheckCheck,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  X
} from 'lucide-react';

interface NotificationItem {
  id: string;
  category: 'order' | 'low_stock';
  type: 'new_order' | 'low_stock' | 'out_of_stock';
  title: string;
  message: string;
  details?: string;
  time: string;
  timestamp: number;
  link: string;
  severity: 'info' | 'warning' | 'critical';
  stock?: number;
  safeStockThreshold: number;
  orderNumber?: string;
  orderStatus?: string;
  amount?: number;
  customerName?: string;
  branchName?: string;
  sku?: string;
  productId?: number;
}

interface NotificationDropdownProps {
  activeBranch?: string;
}

export default function NotificationDropdown({ activeBranch = 'all' }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'orders' | 'stock'>('all');
  const [stats, setStats] = useState({
    totalCount: 0,
    newOrdersCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalStockAlerts: 0,
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load read notifications from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('corenix_read_notifications');
      if (saved) {
        setReadIds(new Set(JSON.parse(saved)));
      }
    } catch (e) {}
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/notifications?branch=${encodeURIComponent(activeBranch)}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Real-time polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [activeBranch]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const markAllAsRead = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadIds(allIds);
    try {
      localStorage.setItem('corenix_read_notifications', JSON.stringify(Array.from(allIds)));
    } catch (e) {}
  };

  const markAsRead = (id: string) => {
    const next = new Set(readIds);
    next.add(id);
    setReadIds(next);
    try {
      localStorage.setItem('corenix_read_notifications', JSON.stringify(Array.from(next)));
    } catch (e) {}
  };

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;
  const unreadOrdersCount = notifications.filter((n) => n.category === 'order' && !readIds.has(n.id)).length;
  const unreadStockCount = notifications.filter((n) => n.category === 'low_stock' && !readIds.has(n.id)).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'orders') return n.category === 'order';
    if (activeTab === 'stock') return n.category === 'low_stock';
    return true;
  });

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-xl transition-all relative border ${
          isOpen
            ? 'bg-sky-100 dark:bg-slate-700 text-sky-700 dark:text-cyan-300 border-sky-300 dark:border-cyan-700'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white border-slate-200 dark:border-slate-700/80'
        }`}
        title="Notifications: New Orders & Stock Alerts (Safe Stock 10)"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center px-1 rounded-full bg-rose-500 text-[10px] font-black text-white shadow-sm ring-2 ring-white dark:ring-navy-900 animate-in zoom-in-50">
            {unreadCount > 99 ? '99+' : unreadCount}
            <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping -z-10" />
          </span>
        )}
      </button>

      {/* Dropdown Box */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-[420px] max-w-[calc(100vw-24px)] bg-white dark:bg-navy-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50/80 dark:bg-navy-950/80 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-cyan-950/80 border border-sky-200 dark:border-cyan-800/80 flex items-center justify-center text-sky-600 dark:text-cyan-400">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs leading-none">
                  Notification Center
                </h3>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  Safe Stock Limit: 10 Units
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={fetchNotifications}
                disabled={loading}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                title="Refresh notifications"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-50 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 text-sky-700 dark:text-cyan-400 text-[10px] font-bold transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Mark read</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Filters / Tabs */}
          <div className="px-3 pt-2.5 pb-1 bg-slate-50/40 dark:bg-navy-950/40 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <span>All</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[9px]">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <ShoppingCart className="w-3 h-3" />
              <span>Orders</span>
              {unreadOrdersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-sky-500 text-white text-[9px]">
                  {unreadOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('stock')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'stock'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-amber-300" />
              <span>Low Stock (≤10)</span>
              {unreadStockCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px]">
                  {unreadStockCount}
                </span>
              )}
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
            {filteredNotifications.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <CheckCheck className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No notifications to display
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  All inventory is healthy (&gt;10 units) and orders are up to date.
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const isRead = readIds.has(n.id);
                const isOutOfStock = n.type === 'out_of_stock';
                const isLowStock = n.type === 'low_stock';
                const isOrder = n.category === 'order';

                return (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-3 rounded-xl transition-all relative group flex gap-3 items-start ${
                      isRead
                        ? 'opacity-70 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        : isOutOfStock
                        ? 'bg-rose-50/60 dark:bg-rose-950/20 hover:bg-rose-100/60 dark:hover:bg-rose-950/40'
                        : isLowStock
                        ? 'bg-amber-50/60 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-950/40'
                        : 'bg-sky-50/50 dark:bg-sky-950/20 hover:bg-sky-100/60 dark:hover:bg-sky-950/40'
                    }`}
                  >
                    {/* Unread indicator dot */}
                    {!isRead && (
                      <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-sky-500 dark:bg-cyan-400 ring-2 ring-white dark:ring-navy-900" />
                    )}

                    {/* Icon */}
                    <div
                      className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border shadow-2xs ${
                        isOutOfStock
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900'
                          : isLowStock
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900'
                          : 'bg-sky-100 dark:bg-cyan-950 text-sky-600 dark:text-cyan-400 border-sky-200 dark:border-cyan-800'
                      }`}
                    >
                      {isOutOfStock ? (
                        <AlertOctagon className="w-4 h-4" />
                      ) : isLowStock ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <ShoppingCart className="w-4 h-4" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                            isOutOfStock
                              ? 'bg-rose-600 text-white'
                              : isLowStock
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-sky-600 text-white'
                          }`}
                        >
                          {isOutOfStock
                            ? '0 STOCK'
                            : isLowStock
                            ? `STOCK ≤ 10`
                            : 'NEW ORDER'}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          {formatRelativeTime(n.timestamp)}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1 line-clamp-1">
                        {n.title}
                      </h4>

                      <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                        {n.message}
                      </p>

                      {/* Stock meter visual for low stock */}
                      {(isLowStock || isOutOfStock) && typeof n.stock === 'number' && (
                        <div className="mt-2 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 w-full overflow-hidden flex">
                          <div
                            className={`h-full rounded-full transition-all ${
                              n.stock === 0
                                ? 'w-0 bg-rose-600'
                                : n.stock <= 3
                                ? 'bg-rose-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, (n.stock / 10) * 100)}%` }}
                          />
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">
                          {n.details}
                        </span>

                        <Link
                          href={n.link}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-cyan-400 hover:underline shrink-0"
                        >
                          <span>{isOrder ? 'View Order' : 'Manage'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer summary & quick links */}
          <div className="p-3 bg-slate-50/90 dark:bg-navy-950/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Showing {filteredNotifications.length} alerts
            </span>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/inventory"
                onClick={() => setIsOpen(false)}
                className="font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Stock Matrix
              </Link>
              <Link
                href="/admin/orders"
                onClick={() => setIsOpen(false)}
                className="font-bold text-sky-600 dark:text-cyan-400 hover:underline"
              >
                All Orders
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
