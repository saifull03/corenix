import React from 'react';
import Link from 'next/link';
import { query } from '@/lib/db';
import { Tag, Plus, ExternalLink, Globe } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminBrandsPage() {
  const brands = await query<any[]>(
    `SELECT b.*,
            (SELECT COUNT(*) FROM products WHERE brand_id = b.id) as product_count
     FROM brands b
     ORDER BY b.is_featured DESC, b.name ASC`
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Brand Partners
          </span>
          <h1 className="text-2xl font-black text-white">
            Brand Management ({brands.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage partner logos, warranty origins, dedicated brand landing pages, and SEO metadata.
          </p>
        </div>

        <button
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Brand</span>
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Brand Name</th>
                <th className="py-3 px-4">Origin Country</th>
                <th className="py-3 px-4">Brand URL Slug</th>
                <th className="py-3 px-4 text-center">Products</th>
                <th className="py-3 px-4 text-center">Featured Partner</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {brands.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">
                    {b.name}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {b.country || 'Global'}
                  </td>
                  <td className="py-3 px-4 font-mono text-cyan-400">
                    /brand/{b.slug}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-200">
                    {b.product_count}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {b.is_featured ? (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-brand-300 border border-brand-800 text-[10px] font-bold">
                        Featured
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[10px]">Standard</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/brand/${b.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white inline-block"
                      title="View public brand page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
