import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { query, queryOne } from '@/lib/db';
import { Category, Product, Brand } from '@/lib/types';
import { Filter, SlidersHorizontal, ArrowUpDown, ChevronRight, HelpCircle } from 'lucide-react';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await queryOne<Category>(
    `SELECT name, slug, h1, meta_title, meta_desc, focus_keyword, canonical_url, og_title, og_desc
     FROM categories WHERE slug = ?`,
    [slug]
  );

  if (!category) {
    return { title: 'Category Not Found | CORENIX' };
  }

  const title = category.meta_title || `${category.name} Price in Bangladesh | CORENIX`;
  const description = category.meta_desc || `Buy ${category.name} in Bangladesh with official manufacturer warranty at CORENIX. Check price, specs & availability.`;

  return {
    title,
    description,
    openGraph: {
      title: category.og_title || title,
      description: category.og_desc || description,
      url: `https://corenix.com.bd/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sParams = await searchParams;

  // 1. Fetch Category
  const category = await queryOne<Category>(
    `SELECT * FROM categories WHERE slug = ? AND is_active = 1`,
    [slug]
  );

  if (!category) {
    notFound();
  }

  // 2. Build Filters
  const brandFilter = sParams.brand;
  const sortBy = sParams.sort || 'featured';

  const conditions: string[] = [
    'p.status = "published"',
    '(c.id = ? OR c.parent_id = ?)'
  ];
  const queryParams: any[] = [category.id, category.id];

  if (brandFilter) {
    conditions.push('b.slug = ?');
    queryParams.push(brandFilter);
  }

  let orderBy = 'p.is_featured DESC, p.created_at DESC';
  if (sortBy === 'price_asc') orderBy = 'p.selling_price ASC';
  if (sortBy === 'price_desc') orderBy = 'p.selling_price DESC';
  if (sortBy === 'newest') orderBy = 'p.created_at DESC';

  // 3. Fetch Products
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
    queryParams
  );

  // 4. Fetch available Brands in this category
  const availableBrands = await query<Brand[]>(
    `SELECT DISTINCT b.id, b.name, b.slug
     FROM products p
     JOIN brands b ON p.brand_id = b.id
     JOIN categories c ON p.category_id = c.id
     WHERE (c.id = ? OR c.parent_id = ?) AND p.status = 'published'`,
    [category.id, category.id]
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-navy-950 dark:text-slate-100 font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4 flex-wrap">
          <Link href="/" className="hover:text-sky-600 dark:hover:text-brand-400 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
          <Link href="/products" className="hover:text-sky-600 dark:hover:text-brand-400 transition-colors">Catalogue</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
          <span className="text-slate-900 dark:text-slate-200 font-semibold">{category.name}</span>
        </nav>

        {/* Category Header with SEO H1 and Intro */}
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-gradient-to-r dark:from-navy-900 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {category.h1 || `${category.name} Price in Bangladesh`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-3xl leading-relaxed">
            {category.short_desc || `Browse all authentic ${category.name} products with official manufacturer warranties, verified stock, and branch pickup availability.`}
          </p>
        </div>

        {/* Main Content Layout: Filters Sidebar + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-sky-600 dark:text-brand-400" /> Filter Hardware
                </span>
                {brandFilter && (
                  <Link href={`/category/${category.slug}`} className="text-[11px] text-rose-500 hover:underline font-semibold">
                    Clear Filters
                  </Link>
                )}
              </div>

              {/* Brands Filter */}
              {availableBrands.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-brand-400">
                    Brand
                  </h4>
                  <div className="space-y-1.5">
                    {availableBrands.map((b) => (
                      <Link
                        key={b.id}
                        href={`/category/${category.slug}${brandFilter === b.slug ? '' : `?brand=${b.slug}`}`}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                          brandFilter === b.slug
                            ? 'bg-sky-600 text-white dark:bg-brand-500 dark:text-navy-950 font-bold shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <span>{b.name}</span>
                        {brandFilter === b.slug && <span className="text-[10px]">Active</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability Filter Indicator */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-brand-400">
                  Stock Status
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-slate-700 text-sky-600 dark:text-brand-500" readOnly />
                  <span>In Stock (Shop 1, 2 & WH)</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid & Sorting */}
          <div className="lg:col-span-9 space-y-6">
            {/* Top Toolbar: Result Count & Sort Options */}
            <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4 text-xs shadow-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Showing <strong className="text-slate-900 dark:text-white font-bold">{products.length}</strong> items in <span className="text-sky-600 dark:text-brand-400 font-semibold">{category.name}</span>
              </span>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                  <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
                </span>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/category/${category.slug}?sort=featured${brandFilter ? `&brand=${brandFilter}` : ''}`}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      sortBy === 'featured'
                        ? 'bg-sky-600 text-white dark:bg-brand-500 dark:text-navy-950 shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Featured
                  </Link>
                  <Link
                    href={`/category/${category.slug}?sort=price_asc${brandFilter ? `&brand=${brandFilter}` : ''}`}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      sortBy === 'price_asc'
                        ? 'bg-sky-600 text-white dark:bg-brand-500 dark:text-navy-950 shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Price: Low to High
                  </Link>
                  <Link
                    href={`/category/${category.slug}?sort=price_desc${brandFilter ? `&brand=${brandFilter}` : ''}`}
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
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs">
                <p className="text-slate-500 dark:text-slate-400 text-sm">No products found matching your current filter criteria.</p>
                <Link
                  href={`/category/${category.slug}`}
                  className="inline-block px-4 py-2 bg-sky-600 hover:bg-sky-500 dark:bg-brand-500 dark:hover:bg-brand-400 text-white dark:text-navy-950 font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Reset Filters
                </Link>
              </div>
            )}

            {/* SEO Content & Long Description at Bottom (Requirement 5) */}
            <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-white dark:bg-navy-900/60 border border-slate-200/80 dark:border-slate-800 space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Buying Guide: Best {category.name} in Bangladesh
              </h3>
              <p>
                When purchasing {category.name} hardware at CORENIX, you receive 100% genuine components backed by official brand warranty and multi-branch support. Compare models, review benchmark specifications, and pick up directly from our Uttara Flagship (Shop 1) or Dhanmondi branch (Shop 2).
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
