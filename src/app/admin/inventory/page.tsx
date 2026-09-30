import React from 'react';
import Link from 'next/link';
import { query } from '@/lib/db';
import { Warehouse, ArrowRightLeft, Building2, AlertTriangle, CheckCircle2, Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminInventoryPage() {
  // Fetch products with their branch-wise inventory
  const products = await query<any[]>(
    `SELECT p.id, p.name, p.sku, p.selling_price, p.purchase_cost,
            c.name as category_name, b.name as brand_name,
            (SELECT quantity FROM inventory WHERE product_id = p.id AND branch_id = 1) as wh_qty,
            (SELECT quantity FROM inventory WHERE product_id = p.id AND branch_id = 2) as shop1_qty,
            (SELECT quantity FROM inventory WHERE product_id = p.id AND branch_id = 3) as shop2_qty,
            (SELECT rma_qty FROM inventory WHERE product_id = p.id AND branch_id = 4) as rma_qty
     FROM products p
     JOIN categories c ON p.category_id = c.id
     JOIN brands b ON p.brand_id = b.id
     ORDER BY p.name ASC`
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Multi-Location Stock Accounting
          </span>
          <h1 className="text-2xl font-black text-white">
            Central & Branch Inventory Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking across Central Warehouse, Shop 1 (Uttara), Shop 2 (Dhanmondi), and RMA Hub.
          </p>
        </div>

        <button
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Initiate Stock Transfer</span>
        </button>
      </div>

      {/* Summary Location Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Central Warehouse</span>
          <span className="text-xl font-black text-white">Tejgaon WH-MAIN</span>
          <span className="text-xs text-brand-400 font-bold mt-1 block">Primary Inward Hub</span>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Shop 1 (Uttara)</span>
          <span className="text-xl font-black text-white">SHOP-1 Showroom</span>
          <span className="text-xs text-emerald-400 font-bold mt-1 block">POS Active</span>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Shop 2 (Dhanmondi)</span>
          <span className="text-xl font-black text-white">SHOP-2 Showroom</span>
          <span className="text-xs text-emerald-400 font-bold mt-1 block">POS Active</span>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Service & Warranty</span>
          <span className="text-xl font-black text-white">RMA-HUB Agargaon</span>
          <span className="text-xs text-purple-400 font-bold mt-1 block">Diagnosis Center</span>
        </div>
      </div>

      {/* Stock Matrix Table */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4 text-center">WH-MAIN</th>
                <th className="py-3 px-4 text-center">Shop 1 (Uttara)</th>
                <th className="py-3 px-4 text-center">Shop 2 (Dhanmondi)</th>
                <th className="py-3 px-4 text-center">RMA Hub</th>
                <th className="py-3 px-4 text-center">Total Stock</th>
                <th className="py-3 px-4 text-right">Asset Valuation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {products.map((p) => {
                const total = (p.wh_qty || 0) + (p.shop1_qty || 0) + (p.shop2_qty || 0) + (p.rma_qty || 0);
                const assetValue = total * p.purchase_cost;

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block">{p.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">SKU: {p.sku}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {p.brand_name}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-200">
                      {p.wh_qty || 0}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                      {p.shop1_qty || 0}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                      {p.shop2_qty || 0}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-purple-400">
                      {p.rma_qty || 0}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-white font-bold text-[11px]">
                        {total} Units
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-brand-400">
                      ৳{assetValue.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
