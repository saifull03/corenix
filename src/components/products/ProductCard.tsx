'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Zap,
  Check,
} from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const stockStatus = product.stock_status || ((product.total_stock || 0) > 0 ? 'In Stock' : 'In Stock');
  const isOutOfStock = stockStatus === 'Out Of Stock' || (product.total_stock !== undefined && Number(product.total_stock) <= 0 && stockStatus === 'In Stock');
  const isCallForPrice = stockStatus === 'Call for Price';
  const isPreOrder = stockStatus === 'Pre-Order';
  const isUpcoming = stockStatus === 'Up Coming';
  const isTwoThreeDays = stockStatus === '2-3 Days';

  const discountAmount = product.discount_price
    ? product.selling_price - product.discount_price
    : 0;

  const currentPrice = product.discount_price || product.selling_price;
  const regularPrice = product.selling_price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: Number(product.discount_price || product.selling_price || 0),
      originalPrice: product.discount_price ? Number(product.selling_price) : undefined,
      image: product.primary_image || (product as any).images?.[0]?.image_url,
      warranty: product.warranty_period,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: Number(product.discount_price || product.selling_price || 0),
      originalPrice: product.discount_price ? Number(product.selling_price) : undefined,
      image: product.primary_image || (product as any).images?.[0]?.image_url,
      warranty: product.warranty_period,
    });
    router.push('/checkout');
  };

  // Render ONE unified, styled top badge
  const renderSingleTopBadge = () => {
    if (isOutOfStock) {
      return (
        <span className="bg-rose-600 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-lg tracking-wider shadow-sm flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          <span>Out Of Stock</span>
        </span>
      );
    }

    if (isPreOrder) {
      return (
        <span className="bg-purple-600 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-lg tracking-wider shadow-sm flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Pre-Order</span>
        </span>
      );
    }

    if (isUpcoming) {
      return (
        <span className="bg-amber-500 text-navy-950 font-black text-[10px] uppercase px-2.5 py-1 rounded-lg tracking-wider shadow-sm flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>Up Coming</span>
        </span>
      );
    }

    if (isCallForPrice) {
      return (
        <span className="bg-indigo-600 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-lg tracking-wider shadow-sm flex items-center gap-1">
          <PhoneCall className="w-3 h-3" />
          <span>Call for Price</span>
        </span>
      );
    }

    if (isTwoThreeDays) {
      return (
        <span className="bg-sky-600 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-lg tracking-wider shadow-sm flex items-center gap-1">
          <Truck className="w-3 h-3" />
          <span>2-3 Days</span>
        </span>
      );
    }

    // In Stock Deal / Save Badges (Only 1 clean badge)
    if (product.is_hot && discountAmount > 0) {
      return (
        <span className="bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-lg tracking-wider shadow-sm flex items-center gap-1">
          <span>🔥 Hot Deal • Save ৳{discountAmount.toLocaleString()}</span>
        </span>
      );
    }

    if (discountAmount > 0) {
      return (
        <span className="bg-rose-600 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-lg tracking-wider shadow-sm flex items-center gap-1">
          <span>Save ৳{discountAmount.toLocaleString()}</span>
        </span>
      );
    }

    if (product.is_hot) {
      return (
        <span className="bg-gradient-to-r from-amber-500 to-rose-600 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-lg tracking-wider shadow-sm flex items-center gap-1">
          <span>🔥 Hot Deal</span>
        </span>
      );
    }

    if (product.is_featured) {
      return (
        <span className="bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-lg tracking-wider shadow-sm flex items-center gap-1">
          <span>⚡ Trending</span>
        </span>
      );
    }

    if (product.is_new) {
      return (
        <span className="bg-sky-600 dark:bg-brand-500 text-white dark:text-navy-950 font-black text-[10px] uppercase px-2.5 py-1 rounded-lg tracking-wider shadow-sm flex items-center gap-1">
          <span>✨ New Arrival</span>
        </span>
      );
    }

    return null;
  };

  const renderStockFooter = () => {
    if (isOutOfStock) {
      return (
        <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
          <XCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
          <span>Out Of Stock</span>
        </span>
      );
    }
    if (isPreOrder) {
      return (
        <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold">
          <Clock className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
          <span>Pre-Order</span>
        </span>
      );
    }
    if (isUpcoming) {
      return (
        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span>Up Coming Soon</span>
        </span>
      );
    }
    if (isTwoThreeDays) {
      return (
        <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-bold">
          <Truck className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
          <span>2-3 Days Delivery</span>
        </span>
      );
    }
    if (isCallForPrice) {
      return (
        <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
          <PhoneCall className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
          <span>Call for Price</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
        <span>In Stock</span> (Available)
      </span>
    );
  };

  return (
    <div className="group relative bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-sky-500/50 dark:hover:border-brand-500/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-brand-500/10 flex flex-col justify-between">
      {/* Top Single Style Badge */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none">
        {renderSingleTopBadge()}
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

        {/* Pricing & Cart/Buy Action */}
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

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isCallForPrice ? (
              <a
                href="tel:01700000000"
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.01] shadow-xs active:scale-[0.98]"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call for Price</span>
              </a>
            ) : isOutOfStock ? (
              <button
                disabled
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200/50 dark:border-slate-700/50"
              >
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>Out of Stock</span>
              </button>
            ) : isPreOrder ? (
              <button
                onClick={handleBuyNow}
                className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.01] shadow-xs active:scale-[0.98]"
              >
                <Clock className="w-4 h-4" />
                <span>Pre-Order (Book Now)</span>
              </button>
            ) : isUpcoming ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  alert(`You will be notified as soon as "${product.name}" is released!`);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.01] shadow-xs active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Up Coming • Notify</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-brand-500 dark:hover:bg-brand-400 text-white dark:text-navy-950 text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98]"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Buy Now</span>
                </button>
                <button
                  onClick={handleAddToCart}
                  className={`p-2.5 rounded-xl border transition-all ${
                    added
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700 hover:scale-105'
                  }`}
                  title={added ? 'Added to Cart!' : 'Add to Cart'}
                >
                  {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                </button>
              </>
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
