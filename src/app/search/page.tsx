import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { searchProducts } from '@/lib/search';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import type { Metadata } from 'next';

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sParams = await searchParams;
  const q = sParams.q || '';
  return {
    title: q ? `Search results for "${q}" | CORENIX` : 'Search Products | CORENIX',
    description: `Search results for ${q} at CORENIX Bangladesh. Find graphics cards, processors, gaming laptops and components.`,
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const sParams = await searchParams;
  const q = sParams.q || '';
  const category = sParams.category;
  const brand = sParams.brand;
  const sortBy = (sParams.sort as any) || 'relevance';

  const { products, total, facets } = await searchProducts({
    q,
    category,
    brand,
    sortBy,
    limit: 24,
  });

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Search Header Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-900 to-slate-900 border border-slate-800 mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-brand-400 mb-1">
              <Search className="w-4 h-4" />
              <span>Search Results</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {q ? (
                <>Results for &ldquo;<span className="text-brand-400">{q}</span>&rdquo;</>
              ) : (
                'All Catalogue Products'
              )}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Found <strong className="text-white">{total}</strong> products matching your search criteria
            </p>
          </div>
        </div>

        {/* Layout: Facets + Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Facets Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-brand-400" />
                  Filter Results
                </span>
                {(category || brand) && (
                  <Link href={`/search?q=${encodeURIComponent(q)}`} className="text-[11px] text-rose-400 hover:underline">
                    Clear
                  </Link>
                )}
              </div>

              {/* Category Facet */}
              {facets.categories.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-400">
                    Categories
                  </h4>
                  <div className="space-y-1">
                    {facets.categories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/search?q=${encodeURIComponent(q)}&category=${c.slug}${brand ? `&brand=${brand}` : ''}`}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                          category === c.slug
                            ? 'bg-brand-500 text-navy-950 font-bold'
                            : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="truncate">{c.name}</span>
                        <span className="text-[10px] text-slate-400">({c.count})</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Brand Facet */}
              {facets.brands.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-400">
                    Brands
                  </h4>
                  <div className="space-y-1">
                    {facets.brands.map((b) => (
                      <Link
                        key={b.id}
                        href={`/search?q=${encodeURIComponent(q)}&brand=${b.slug}${category ? `&category=${category}` : ''}`}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                          brand === b.slug
                            ? 'bg-brand-500 text-navy-950 font-bold'
                            : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <span>{b.name}</span>
                        <span className="text-[10px] text-slate-400">({b.count})</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Results Grid & Sorting */}
          <div className="lg:col-span-9 space-y-6">
            <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 flex items-center justify-between flex-wrap gap-4 text-xs">
              <span className="text-slate-400">
                Displaying <strong>{products.length}</strong> items
              </span>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
                </span>
                <Link
                  href={`/search?q=${encodeURIComponent(q)}&sort=relevance${category ? `&category=${category}` : ''}${brand ? `&brand=${brand}` : ''}`}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                    sortBy === 'relevance' ? 'bg-brand-500 text-navy-950' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Relevance
                </Link>
                <Link
                  href={`/search?q=${encodeURIComponent(q)}&sort=price_asc${category ? `&category=${category}` : ''}${brand ? `&brand=${brand}` : ''}`}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                    sortBy === 'price_asc' ? 'bg-brand-500 text-navy-950' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Price: Low to High
                </Link>
                <Link
                  href={`/search?q=${encodeURIComponent(q)}&sort=price_desc${category ? `&category=${category}` : ''}${brand ? `&brand=${brand}` : ''}`}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                    sortBy === 'price_desc' ? 'bg-brand-500 text-navy-950' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Price: High to Low
                </Link>
              </div>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="p-16 text-center rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">No products found for &ldquo;{q}&rdquo;</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Our system has recorded this query in the Search Analytics log so our inventory procurement team can evaluate adding it.
                </p>
                <Link
                  href="/products"
                  className="inline-block px-5 py-2.5 rounded-xl bg-brand-500 text-navy-950 font-bold text-xs"
                >
                  Browse Full Catalogue
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
