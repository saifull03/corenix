'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  ExternalLink,
  Copy,
  Edit3,
  Trash2,
  X,
  SlidersHorizontal,
  CheckCircle2,
  Barcode,
  Hash,
  Tag,
  Layers,
  Sparkles,
  ChevronDown,
  Check,
} from 'lucide-react';

export interface ProductItem {
  id: number;
  name: string;
  slug: string;
  sku: string;
  barcode?: string | null;
  model?: string | null;
  mpn?: string | null;
  brand_id: number;
  category_id: number;
  brand_name: string;
  category_name: string;
  primary_image?: string | null;
  purchase_cost: number;
  selling_price: number;
  discount_price?: number | null;
  total_stock?: number | null;
  seo_score?: number | null;
  is_featured?: number | boolean;
  is_new?: number | boolean;
  is_pc_builder?: number | boolean;
  created_at?: string;
}

interface Props {
  initialProducts: ProductItem[];
}

type SearchFieldFilter = 'all' | 'name' | 'model' | 'sku' | 'barcode';

export default function ProductsManager({ initialProducts }: Props) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<SearchFieldFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [copiedSku, setCopiedSku] = useState<string | null>(null);

  // Extract unique categories & brands for dropdown filters
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach(p => {
      if (p.category_name) set.add(p.category_name);
    });
    return Array.from(set).sort();
  }, [initialProducts]);

  const brandsList = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach(p => {
      if (p.brand_name) set.add(p.brand_name);
    });
    return Array.from(set).sort();
  }, [initialProducts]);

  // Copy SKU helper
  const handleCopySku = (sku: string) => {
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 2000);
  };

  // Filter products by search query across Name, Model, SKU, Barcode
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return products.filter(p => {
      // Category filter
      if (categoryFilter !== 'all' && p.category_name !== categoryFilter) {
        return false;
      }

      // Brand filter
      if (brandFilter !== 'all' && p.brand_name !== brandFilter) {
        return false;
      }

      // Stock filter
      if (stockFilter === 'in_stock' && (!p.total_stock || p.total_stock <= 0)) {
        return false;
      }
      if (stockFilter === 'out_of_stock' && p.total_stock && p.total_stock > 0) {
        return false;
      }

      // Search matching
      if (!q) return true;

      const name = (p.name || '').toLowerCase();
      const model = (p.model || '').toLowerCase();
      const sku = (p.sku || '').toLowerCase();
      const barcode = (p.barcode || '').toLowerCase();
      const brand = (p.brand_name || '').toLowerCase();
      const category = (p.category_name || '').toLowerCase();

      switch (searchField) {
        case 'name':
          return name.includes(q);
        case 'model':
          return model.includes(q);
        case 'sku':
          return sku.includes(q);
        case 'barcode':
          return barcode.includes(q);
        case 'all':
        default:
          return (
            name.includes(q) ||
            model.includes(q) ||
            sku.includes(q) ||
            barcode.includes(q) ||
            brand.includes(q) ||
            category.includes(q)
          );
      }
    });
  }, [products, searchQuery, searchField, categoryFilter, brandFilter, stockFilter]);

  // Helper to highlight matching text
  const highlightMatch = (text: string | null | undefined, query: string) => {
    if (!text) return text || '';
    if (!query.trim()) return text;

    const q = query.toLowerCase().trim();
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text;

    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-amber-400/40 text-amber-950 dark:text-amber-200 px-0.5 rounded font-bold">
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  const isFiltered = Boolean(
    searchQuery ||
    searchField !== 'all' ||
    categoryFilter !== 'all' ||
    brandFilter !== 'all' ||
    stockFilter !== 'all'
  );

  const resetFilters = () => {
    setSearchQuery('');
    setSearchField('all');
    setCategoryFilter('all');
    setBrandFilter('all');
    setStockFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Hardware Management
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Products Catalogue ({products.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dynamic attributes, category specification templates, and multi-location inventory.
          </p>
        </div>

        <Link
          href="/admin/products/create"
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs flex items-center gap-2 shadow transition-all hover:shadow-lg hover:shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Product (18-Step)</span>
        </Link>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={
                searchField === 'name'
                  ? 'Search by product name...'
                  : searchField === 'model'
                  ? 'Search by model number (e.g. RTX 5070, B650)...'
                  : searchField === 'sku'
                  ? 'Search by SKU code (e.g. GPU-MSI-5070)...'
                  : searchField === 'barcode'
                  ? 'Scan or enter Barcode / EAN number...'
                  : 'Search by Product Name, Model, SKU, or Barcode / EAN...'
              }
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-9 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-colors text-xs font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Target Mode Pills - Crystal Clear High Contrast in Light & Dark Mode */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start lg:self-auto overflow-x-auto shadow-2xs">
            <button
              type="button"
              onClick={() => setSearchField('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                searchField === 'all'
                  ? 'bg-brand-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              All Fields
            </button>
            <button
              type="button"
              onClick={() => setSearchField('name')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                searchField === 'name'
                  ? 'bg-brand-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              Name
            </button>
            <button
              type="button"
              onClick={() => setSearchField('model')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                searchField === 'model'
                  ? 'bg-brand-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              Model
            </button>
            <button
              type="button"
              onClick={() => setSearchField('sku')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                searchField === 'sku'
                  ? 'bg-brand-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              SKU
            </button>
            <button
              type="button"
              onClick={() => setSearchField('barcode')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                searchField === 'barcode'
                  ? 'bg-brand-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              <Barcode className="w-3.5 h-3.5" />
              <span>Barcode</span>
            </button>
          </div>
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-300 text-xs font-medium focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="all">All Categories ({categoriesList.length})</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Brand Filter */}
            <select
              value={brandFilter}
              onChange={e => setBrandFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-300 text-xs font-medium focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="all">All Brands ({brandsList.length})</option>
              {brandsList.map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-300 text-xs font-medium focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="all">All Inventory</option>
              <option value="in_stock">In Stock Only</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-brand-300 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Results Counter */}
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing <strong className="text-slate-900 dark:text-white">{filteredProducts.length}</strong> of{' '}
            <strong className="text-slate-700 dark:text-slate-200">{products.length}</strong> products
          </div>
        </div>
      </div>

      {/* ── PRODUCTS TABLE ── */}
      <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Package className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No products match your search</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              No results found for &ldquo;{searchQuery}&rdquo; in {searchField === 'all' ? 'all fields' : searchField}. Try searching by SKU, model number, or barcode.
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-brand-500 text-navy-950 font-bold text-xs hover:bg-brand-400 transition-colors"
              >
                Clear Search &amp; Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50 dark:bg-navy-950/40">
                  <th className="py-3 px-3">Product Name &amp; SKU</th>
                  <th className="py-3 px-3">Model &amp; Barcode</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Brand</th>
                  <th className="py-3 px-3 text-right">Cost Price</th>
                  <th className="py-3 px-3 text-right">Selling Price</th>
                  <th className="py-3 px-3 text-center">Total Stock</th>
                  <th className="py-3 px-3 text-center">SEO Score</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredProducts.map((p) => {
                  const margin =
                    p.selling_price > 0
                      ? (((p.selling_price - p.purchase_cost) / p.selling_price) * 100).toFixed(1)
                      : 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Name, Image & SKU */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              p.primary_image ||
                              'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=100&q=80'
                            }
                            alt={p.name}
                            className="w-10 h-10 object-contain bg-slate-50 dark:bg-navy-950 rounded-lg p-1 border border-slate-200 dark:border-slate-800 flex-shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <Link
                              href={`/admin/products/${p.id}/edit`}
                              className="font-bold text-slate-900 dark:text-white block truncate hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                              title={`Edit ${p.name}`}
                            >
                              {highlightMatch(p.name, searchQuery)}
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                                <span className="text-slate-400 dark:text-slate-500">SKU:</span>
                                <strong>{highlightMatch(p.sku, searchQuery)}</strong>
                              </span>
                              {p.is_pc_builder ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800 border border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800">
                                  PC Builder
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Model & Barcode */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          {p.model ? (
                            <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                              <span className="text-slate-400 dark:text-slate-500 text-[10px] mr-1">Model:</span>
                              {highlightMatch(p.model, searchQuery)}
                            </div>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-600 text-[11px]">&mdash;</span>
                          )}

                          {p.barcode ? (
                            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Barcode className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                              <span>{highlightMatch(p.barcode, searchQuery)}</span>
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                        {highlightMatch(p.category_name, searchQuery)}
                      </td>

                      {/* Brand */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-brand-300 dark:border-transparent font-semibold text-[11px]">
                          {highlightMatch(p.brand_name, searchQuery)}
                        </span>
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-3 text-right font-mono text-slate-500 dark:text-slate-400">
                        ৳{Number(p.purchase_cost).toLocaleString()}
                      </td>

                      {/* Selling Price & Margin */}
                      <td className="py-3 px-3 text-right">
                        <span className="font-black text-slate-900 dark:text-white block">
                          ৳{Number(p.discount_price || p.selling_price).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                          Margin: +{margin}%
                        </span>
                      </td>

                      {/* Total Stock */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            (p.total_stock || 0) > 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {p.total_stock || 0} Units
                        </span>
                      </td>

                      {/* SEO Score */}
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-950 dark:text-brand-300 dark:border-brand-800 text-[10px] font-black">
                          {p.seo_score || 90}/100
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit Product */}
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="p-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 dark:text-brand-300 transition-colors border border-brand-200/80 dark:border-brand-800/80"
                            title="Edit Product (Pricing, Stock, Specs & SEO)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>

                          {/* View Storefront */}
                          <Link
                            href={`/product/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors"
                            title="View public storefront page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Copy SKU */}
                          <button
                            type="button"
                            onClick={() => handleCopySku(p.sku)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors"
                            title={copiedSku === p.sku ? 'SKU Copied!' : 'Copy SKU code'}
                          >
                            {copiedSku === p.sku ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
