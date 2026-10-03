'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Star,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Truck,
  PhoneCall,
} from 'lucide-react';
import { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const stockStatus = product.stock_status || ((product.total_stock || 0) > 0 ? 'In Stock' : 'In Stock');
  const isOutOfStock = stockStatus === 'Out Of Stock';
  const isCallForPrice = stockStatus === 'Call for Price';
  const isPreOrder = stockStatus === 'Pre-Order';
  const isUpcoming = stockStatus === 'Up Coming';
  const isTwoThreeDays = stockStatus === '2-3 Days';

  const discountAmount = product.discount_price
    ? product.selling_price - product.discount_price
    : 0;

  const currentPrice = product.discount_price || product.selling_price;
  const regularPrice = product.selling_price;

  // Render status helper
  const renderStatusBadge = () => {
    switch (stockStatus) {
      case 'Out Of Stock':
        return (
          <span className="bg-rose-600 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md tracking-wider shadow-sm flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <span>Out Of Stock</span>
          </span>
        );
      case 'Pre-Order':
        return (
          <span className="bg-purple-600 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md tracking-wider shadow-sm flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Pre-Order</span>
          </span>
        );
      case 'Up Coming':
        return (
          <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md tracking-wider shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Up Coming</span>
          </span>
        );
      case '2-3 Days':
        return (
          <span className="bg-sky-600 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md tracking-wider shadow-sm flex items-center gap-1">
            <Truck className="w-3 h-3" />
            <span>2-3 Days</span>
          </span>
        );
      case 'Call for Price':
        return (
          <span className="bg-indigo-600 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md tracking-wider shadow-sm flex items-center gap-1">
            <PhoneCall className="w-3 h-3" />
            <span>Call for Price</span>
          </span>
        );
      default:
        return null;
    }
  };

  const renderStockFooter = () => {
    switch (stockStatus) {
      case 'Out Of Stock':
        return (
          <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
            <XCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
            <span>Out Of Stock</span>
          </span>
        );
      case 'Pre-Order':
        return (
          <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold">
            <Clock className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
            <span>Pre-Order (Book Now)</span>
          </span>
        );
      case 'Up Coming':
        return (
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span>Up Coming Soon</span>
          </span>
        );
      case '2-3 Days':
        return (
          <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-bold">
            <Truck className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
            <span>2-3 Days Delivery</span>
          </span>
        );
      case 'Call for Price':
        return (
          <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
            <PhoneCall className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            <span>Call for Best Price</span>
          </span>
        );
      case 'In Stock':
      default:
        return (
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span>In Stock</span> (Available)
          </span>
        );
    }
  };

  return (
    <div className="group relative bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-sky-500/50 dark:hover:border-brand-500/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-brand-500/10 flex flex-col justify-between">
      {/* Top badges: Stock Status, Discount & Highlights */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {/* Status Badge (if not regular In Stock) */}
        {renderStatusBadge()}

        {product.is_hot ? (
          <span className="bg-gradient-to-r from-amber-500 to-rose-600 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md tracking-wider shadow-sm flex items-center gap-1">
            <span>🔥 Hot Deal</span>
          </span>
        ) : null}
        {product.is_featured ? (
          <span className="bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md tracking-wider shadow-sm flex items-center gap-1">
            <span>⚡ Trending</span>
          </span>
        ) : null}
        {product.discount_price && product.discount_price < product.selling_price && !isCallForPrice && (
          <span className="bg-rose-500 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded-md tracking-wider shadow-sm">
            Save ৳{discountAmount.toLocaleString()}
          </span>
        )}
        {product.is_new && !product.is_hot && !product.is_featured && stockStatus === 'In Stock' && (
          <span className="bg-sky-600 dark:bg-brand-500 text-white dark:text-navy-950 font-bold text-[10px] uppercase px-2 py-0.5 rounded-md tracking-wider shadow-sm">
            New Arrival
          </span>
        )}
      </div>

      {/* Product Image */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-square p-5 bg-slate-50/70 dark:bg-navy-950/40 overflow-hidden flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.primary_image || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          className={`w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500 ${
            isOutOfStock ? 'opacity-60 grayscale-[40%]' : ''
          }`}
          loading="lazy"
        />
      </Link>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category micro-tags */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
            <Link href={`/brand/${product.brand_slug}`} className="hover:text-sky-600 dark:hover:text-brand-400 font-semibold uppercase tracking-wider">
              {product.brand_name}
            </Link>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
              {product.category_name}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-brand-300 line-clamp-2 transition-colors mb-2 min-h-[40px]">
            <Link href={`/product/${product.slug}`}>
              {product.name}
            </Link>
          </h3>

          {/* Rating & Warranty */}
          <div className="flex items-center justify-between text-xs mb-3 text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{Number(product.rating_avg || 5.0).toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600 dark:text-brand-400" />
              <span className="truncate max-w-[110px]">{product.warranty_period}</span>
            </div>
          </div>
        </div>

        {/* Pricing & Cart Action */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-baseline gap-2 mb-3 min-h-[28px]">
            {isCallForPrice ? (
              <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4" />
                Call for Price
              </span>
            ) : (
              <>
                <span className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  ৳{currentPrice.toLocaleString()}
                </span>
                {product.discount_price && product.discount_price < product.selling_price && (
                  <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                    ৳{regularPrice.toLocaleString()}
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/product/${product.slug}`}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold text-center transition-colors"
            >
              View Specs
            </Link>

            {isCallForPrice ? (
              <a
                href="tel:01700000000"
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all hover:scale-105 shadow-xs"
                title="Call for price inquiry"
              >
                <PhoneCall className="w-4 h-4" />
              </a>
            ) : isOutOfStock ? (
              <button
                disabled
                className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed font-bold"
                title="Currently Out of Stock"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            ) : isPreOrder ? (
              <button
                onClick={() => {
                  alert(`Pre-order request placed for "${product.name}"! Our team will contact you shortly.`);
                }}
                className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all hover:scale-105 shadow-xs"
                title="Pre-Order Now"
              >
                <Clock className="w-4 h-4" />
              </button>
            ) : isUpcoming ? (
              <button
                onClick={() => {
                  alert(`You will be notified as soon as "${product.name}" is released!`);
                }}
                className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold transition-all hover:scale-105 shadow-xs"
                title="Notify on Release"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  alert(`Added "${product.name}" to cart! Available for pickup at Shop 1 or Shop 2.`);
                }}
                className="p-2 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-brand-500 dark:hover:bg-brand-400 text-white dark:text-navy-950 font-bold transition-all hover:scale-105 shadow-xs"
                title="Add to cart"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Branch Stock Status indicator */}
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
            {renderStockFooter()}
            <span className="text-slate-400 dark:text-slate-500 font-mono">SKU: {product.sku}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
