'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  Tag,
  Sliders,
  Warehouse,
  Building2,
  ShoppingCart,
  Receipt,
  Truck,
  Wrench,
  DollarSign,
  BarChart3,
  Search,
  Users,
  CheckSquare,
  RefreshCw,
  FileText,
  Shield,
  ExternalLink
} from 'lucide-react';

const menuItems = [
  { label: 'Executive Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products Catalogue', href: '/admin/products', icon: Package },
  { label: 'Add New Product', href: '/admin/products/create', icon: Package, indent: true },
  { label: 'Categories', href: '/admin/categories', icon: Layers },
  { label: 'Brands', href: '/admin/brands', icon: Tag },
  { label: 'Dynamic Attributes', href: '/admin/attributes', icon: Sliders },
  { label: 'Multi-Branch Inventory', href: '/admin/inventory', icon: Warehouse },
  { label: 'Branches & Locations', href: '/admin/branches', icon: Building2 },
  { label: 'Customer Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Point of Sale (POS)', href: '/admin/pos', icon: Receipt },
  { label: 'Purchases & Procurement', href: '/admin/purchases', icon: Truck },
  { label: 'Suppliers Management', href: '/admin/suppliers', icon: Building2 },
  { label: 'RMA & Service Center', href: '/admin/rma', icon: Wrench },
  { label: 'Expenses & Finance', href: '/admin/expenses', icon: DollarSign },
  { label: 'Reports & Profit Analysis', href: '/admin/reports', icon: BarChart3 },
  { label: 'SEO & Landing Pages', href: '/admin/seo', icon: Search },
  { label: 'Users & Staff RBAC', href: '/admin/users', icon: Users },
  { label: 'Operator Approvals', href: '/admin/approvals', icon: CheckSquare },
  { label: 'ERP Integration Sync', href: '/admin/erp', icon: RefreshCw },
  { label: 'Enterprise Audit Trail', href: '/admin/activity-log', icon: FileText },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-navy-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 overflow-y-auto">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center font-bold text-navy-950">
              C
            </div>
            <div>
              <span className="text-base font-black text-white tracking-wider block">CORENIX</span>
              <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider block -mt-1">
                Enterprise Hub
              </span>
            </div>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            title="View Storefront"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 text-xs font-semibold">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                  item.indent ? 'pl-7 text-[11px]' : ''
                } ${
                  isActive
                    ? 'bg-brand-500 text-navy-950 font-bold shadow-md shadow-cyan-500/10'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-navy-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Role Badge and System Status */}
      <div className="p-4 border-t border-slate-800 bg-navy-950/60 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-cyan-950 border border-brand-500/30 flex items-center justify-center font-bold text-brand-400">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-white font-bold block truncate">Super Administrator</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              All Branches Active
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
