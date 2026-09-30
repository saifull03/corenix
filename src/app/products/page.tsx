import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { query } from '@/lib/db';
import { Product, Category, Brand } from '@/lib/types';
import { Layers, ArrowUpDown, Filter } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Hardware & PC Components Catalogue | CORENIX',
  description: 'Explore full computing hardware catalogue at CORENIX Bangladesh. Processors, Graphics Cards, Laptops, Motherboards, RAM and SSDs with official warranty.',
};

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function ProductsCataloguePage({ searchParams }: Props) {
  const sParams = await searchParams;
  const categoryFilter = sParams.category;
  const brandFilter = sParams.brand;
  const sortBy = sParams.sort || 'featured';

  const conditions: string[] = ['p.status = "published"'];
  const params: any[] = [];

  if (categoryFilter) {
    conditions.push('(c.slug = ? OR c.parent_id IN (SELECT id FROM categories WHERE slug = ?))');
    params.push(categoryFilter, categoryFilter);
  }

  if (brandFilter) {
    conditions.push('b.slug = ?');
    params.push(brandFilter);
  }

  let orderBy = 'p.is_featured DESC, p.created_at DESC';
  if (sortBy === 'price_asc') orderBy = 'p.selling_price ASC';
  if (sortBy === 'price_desc') orderBy = 'p.selling_price DESC';
  if (sortBy === 'newest') orderBy = 'p.created_at DESC';

  const products = await query<Product[]>(
    `SELECT p.*,
            b.name as brand_name, b.slug as brand_slug,
            c.name as category_name, c.slug as category_slug,
            pi.image_url as primary_image,
            (SELECT SUM(quantity - reserved_qty) FROM inventory WHERE product_id = p.id) as total_stock
     FROM products p
     JOIN brands b ON p.brand_id = b.id
     JOIN categories c ON p.category_id = c.id
     LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
     WHERE ${conditions.join(' AND ')}
     ORDER BY ${orderBy}`,
    params
  );

  const categories = await query<Category[]>(
    `SELECT id, name, slug FROM categories WHERE is_active = 1 ORDER BY order_index ASC`
  );

  const brands = await query<Brand[]>(
    `SELECT id, name, slug FROM brands WHERE is_active = 1 ORDER BY name ASC`
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-navy-950 dark:text-slate-100 font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-gradient-to-r dark:from-navy-900 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 mb-8 flex items-center justify-between flex-wrap gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-sky-600 dark:text-brand-400 mb-1">
              <Layers className="w-4 h-4" />
              <span>Full Technology Catalogue</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Hardware Components & Systems
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-2xl leading-relaxed">
              All authentic products in stock with official brand warranty. Pick up from Shop 1 (Uttara), Shop 2 (Dhanmondi), or order for nationwide express delivery.
            </p>
          </div>
        </div>

        {/* Layout: Sidebar Filter + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3 space-y-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-sky-600 dark:text-brand-400" /> Filter Catalogue
                </span>
                {(categoryFilter || brandFilter) && (
                  <Link href="/products" className="text-[11px] text-rose-500 hover:underline font-semibold">
                    Reset
                  </Link>
                )}
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-brand-400">
                  Categories
                </h4>
                <div className="space-y-1 max-h-56 overflow-y-auto">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/products?category=${c.slug}${brandFilter ? `&brand=${brandFilter}` : ''}`}
                      className={`block px-3 py-1.5 rounded-xl text-xs transition-colors ${
                        categoryFilter === c.slug
                          ? 'bg-sky-600 text-white dark:bg-brand-500 dark:text-navy-950 font-bold shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-brand-400">
                  Brands
                </h4>
                <div className="space-y-1 max-h-56 overflow-y-auto">
                  {brands.map((b) => (
                    <Link
                      key={b.id}
                      href={`/products?brand=${b.slug}${categoryFilter ? `&category=${categoryFilter}` : ''}`}
                      className={`block px-3 py-1.5 rounded-xl text-xs transition-colors ${
                        brandFilter === b.slug
                          ? 'bg-sky-600 text-white dark:bg-brand-500 dark:text-navy-950 font-bold shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {b.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div className="lg:col-span-9 space-y-6">
            <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4 text-xs shadow-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Showing <strong className="text-slate-900 dark:text-white font-bold">{products.length}</strong> products
              </span>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                  <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
                </span>
                <Link
                  href={`/products?sort=featured${categoryFilter ? `&category=${categoryFilter}` : ''}${brandFilter ? `&brand=${brandFilter}` : ''}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    sortBy === 'featured'
                      ? 'bg-sky-600 text-white dark:bg-brand-500 dark:text-navy-950 shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  Featured
                </Link>
                <Link
                  href={`/products?sort=price_asc${categoryFilter ? `&category=${categoryFilter}` : ''}${brandFilter ? `&brand=${brandFilter}` : ''}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    sortBy === 'price_asc'
                      ? 'bg-sky-600 text-white dark:bg-brand-500 dark:text-navy-950 shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  Price: Low to High
                </Link>
                <Link
                  href={`/products?sort=price_desc${categoryFilter ? `&category=${categoryFilter}` : ''}${brandFilter ? `&brand=${brandFilter}` : ''}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    sortBy === 'price_desc'
                      ? 'bg-sky-600 text-white dark:bg-brand-500 dark:text-navy-950 shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  Price: High to Low
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
