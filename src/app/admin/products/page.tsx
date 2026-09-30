import React from 'react';
import Link from 'next/link';
import { query } from '@/lib/db';
import {
  Package,
  Plus,
  Search,
  ExternalLink,
  Copy,
  Trash2,
  Edit3,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const products = await query<any[]>(
    `SELECT p.*,
            b.name as brand_name,
            c.name as category_name,
            pi.image_url as primary_image,
            (SELECT SUM(quantity) FROM inventory WHERE product_id = p.id) as total_stock
     FROM products p
     JOIN brands b ON p.brand_id = b.id
     JOIN categories c ON p.category_id = c.id
     LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
     ORDER BY p.id DESC`
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Hardware Management
          </span>
          <h1 className="text-2xl font-black text-white">
            Products Catalogue ({products.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic attributes, category specification templates, and multi-location inventory.
          </p>
        </div>

        <Link
          href="/admin/products/create"
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs flex items-center gap-2 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Product (18-Step)</span>
        </Link>
      </div>

      {/* Products Table */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Product Name & SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Brand</th>
                <th className="py-3 px-3 text-right">Cost Price</th>
                <th className="py-3 px-3 text-right">Selling Price</th>
                <th className="py-3 px-3 text-center">Total Stock</th>
                <th className="py-3 px-3 text-center">SEO Score</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {products.map((p) => {
                const margin = p.selling_price > 0
                  ? (((p.selling_price - p.purchase_cost) / p.selling_price) * 100).toFixed(1)
                  : 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Name, Image & SKU */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.primary_image || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=100&q=80'}
                          alt={p.name}
                          className="w-10 h-10 object-contain bg-navy-950 rounded-lg p-1 border border-slate-800 flex-shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <span className="font-bold text-white block truncate" title={p.name}>
                            {p.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            SKU: {p.sku} {p.is_pc_builder ? '• PC Builder' : ''}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 text-slate-300 font-medium">
                      {p.category_name}
                    </td>

                    {/* Brand */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-brand-300 font-semibold text-[11px]">
                        {p.brand_name}
                      </span>
                    </td>

                    {/* Cost */}
                    <td className="py-3 px-3 text-right font-mono text-slate-400">
                      ৳{Number(p.purchase_cost).toLocaleString()}
                    </td>

                    {/* Selling Price & Margin */}
                    <td className="py-3 px-3 text-right">
                      <span className="font-black text-white block">
                        ৳{Number(p.discount_price || p.selling_price).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold block">
                        Margin: +{margin}%
                      </span>
                    </td>

                    {/* Total Stock */}
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        (p.total_stock || 0) > 0
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300'
                      }`}>
                        {p.total_stock || 0} Units
                      </span>
                    </td>

                    {/* SEO Score */}
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-cyan-950 text-brand-300 border border-brand-800 text-[10px] font-black">
                        {p.seo_score || 90}/100
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/product/${p.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="View on Storefront"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-brand-300"
                          title="Duplicate Product (Requirement 54)"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
