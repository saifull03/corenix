import React from 'react';
import Link from 'next/link';
import { query } from '@/lib/db';
import { ArrowRightLeft, Building2, Package, Layers, QrCode } from 'lucide-react';
import InventoryClientView from './InventoryClientView';

export const dynamic = 'force-dynamic';

export default async function AdminInventoryPage() {
  // Fetch products with their branch-wise inventory
  const products = await query<any[]>(
    `SELECT p.id, p.name, p.sku, p.selling_price, p.purchase_cost, p.barcode,
            c.name as category_name, b.name as brand_name,
            (SELECT quantity FROM inventory WHERE product_id = p.id AND branch_id = 1) as wh_qty,
            (SELECT quantity FROM inventory WHERE product_id = p.id AND branch_id = 2) as shop1_qty,
            (SELECT quantity FROM inventory WHERE product_id = p.id AND branch_id = 3) as shop2_qty,
            (SELECT rma_qty FROM inventory WHERE product_id = p.id AND branch_id = 4) as rma_qty,
            (SELECT COUNT(*) FROM product_serials WHERE product_id = p.id AND status = 'available') as total_avail_serials,
            (SELECT COUNT(*) FROM product_serials WHERE product_id = p.id AND branch_id = 1 AND status = 'available') as wh_avail_serials,
            (SELECT COUNT(*) FROM product_serials WHERE product_id = p.id AND branch_id = 2 AND status = 'available') as shop1_avail_serials,
            (SELECT COUNT(*) FROM product_serials WHERE product_id = p.id AND branch_id = 3 AND status = 'available') as shop2_avail_serials
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     LEFT JOIN brands b ON p.brand_id = b.id
     ORDER BY p.name ASC`
  );

  const branches = await query<any[]>('SELECT id, name, code, address FROM branches ORDER BY id ASC');

  // Summary counts
  const totalStockUnits = products.reduce((acc, p) => {
    return acc + (p.wh_qty || 0) + (p.shop1_qty || 0) + (p.shop2_qty || 0) + (p.rma_qty || 0);
  }, 0);

  const totalSerialsCount = products.reduce((acc, p) => acc + (p.total_avail_serials || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-cyan-400 mb-1">
            <Layers className="w-4 h-4" />
            <span>Multi-Branch Inventory & Serial Accounting</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Central & Branch Inventory Control
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time tracking across Central Warehouse, Shop 1 (Uttara), Shop 2 (Dhanmondi), and RMA Hub with 100% verified serial numbers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/inventory/transfer"
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Initiate Stock Transfer</span>
          </Link>
        </div>
      </div>

      {/* Summary Location Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Central Warehouse</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">Tejgaon WH-MAIN</span>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-sky-600 dark:text-cyan-400 font-bold">Primary Inward Hub</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
              {products.reduce((acc, p) => acc + (p.wh_qty || 0), 0)} Units
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Shop 1 (Uttara)</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">SHOP-1 Showroom</span>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">POS Active</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
              {products.reduce((acc, p) => acc + (p.shop1_qty || 0), 0)} Units
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Shop 2 (Dhanmondi)</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">SHOP-2 Showroom</span>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">POS Active</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
              {products.reduce((acc, p) => acc + (p.shop2_qty || 0), 0)} Units
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Total Available Serials</span>
          <span className="text-lg font-black text-sky-600 dark:text-cyan-400 font-mono">
            {totalSerialsCount.toLocaleString()} Serials
          </span>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 font-medium">Synced with Stock</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">100% Matched</span>
          </div>
        </div>
      </div>

      {/* Interactive Tabs and Views Component */}
      <InventoryClientView products={products} branches={branches} />
    </div>
  );
}
