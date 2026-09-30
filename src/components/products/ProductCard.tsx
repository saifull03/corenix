'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Star, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isAvailable = (product.total_stock || 0) > 0;
  const discountAmount = product.discount_price
    ? product.selling_price - product.discount_price
    : 0;

  const currentPrice = product.discount_price || product.selling_price;
  const regularPrice = product.selling_price;

  return (
    <div className="group relative bg-navy-900 border border-slate-800/80 hover:border-brand-500/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10 flex flex-col justify-between">
      {/* Top badges: Discount & Status */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.discount_price && product.discount_price < product.selling_price && (
          <span className="bg-rose-600 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded-md tracking-wider shadow">
            Save ৳{discountAmount.toLocaleString()}
          </span>
        )}
        {product.is_new && (
          <span className="bg-brand-500 text-navy-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-md tracking-wider">
            New Arrival
          </span>
        )}
      </div>

      {/* Product Image */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-square p-5 bg-navy-950/40 overflow-hidden flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.primary_image || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          className="w-full h-full object-contain object-center group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category micro-tags */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
            <Link href={`/brand/${product.brand_slug}`} className="hover:text-brand-400 font-semibold uppercase tracking-wider">
              {product.brand_name}
            </Link>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 truncate max-w-[120px]">
              {product.category_name}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-semibold text-slate-100 group-hover:text-brand-300 line-clamp-2 transition-colors mb-2 min-h-[40px]">
            <Link href={`/product/${product.slug}`}>
              {product.name}
            </Link>
          </h3>

          {/* Rating & Warranty */}
          <div className="flex items-center justify-between text-xs mb-3 text-slate-400">
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-bold text-slate-200 text-xs">{Number(product.rating_avg || 5.0).toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <ShieldCheck className="w-3 h-3 text-brand-400" />
              <span className="truncate max-w-[110px]">{product.warranty_period}</span>
            </div>
          </div>
        </div>

        {/* Pricing & Cart Action */}
        <div className="pt-3 border-t border-slate-800/80">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-black text-white tracking-tight">
              ৳{currentPrice.toLocaleString()}
            </span>
            {product.discount_price && product.discount_price < product.selling_price && (
              <span className="text-xs text-slate-500 line-through">
                ৳{regularPrice.toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/product/${product.slug}`}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold text-center transition-colors"
            >
              View Specs
            </Link>

            <button
              onClick={() => {
                alert(`Added "${product.name}" to cart! Available for pickup at Shop 1 or Shop 2.`);
              }}
              className="p-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold transition-all hover:scale-105"
              title="Add to cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>

          {/* Branch Stock Status indicator */}
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span className="text-slate-300 font-medium">In Stock</span> (Uttara & Dhanmondi)
            </span>
            <span className="text-slate-500 font-mono">SKU: {product.sku}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
