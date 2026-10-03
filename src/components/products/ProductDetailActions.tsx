'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Zap, Sparkles, Check, PhoneCall } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';

interface Props {
  product: Product;
}

export default function ProductDetailActions({ product }: Props) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const stockStatus = product.stock_status || ((product.total_stock || 0) > 0 ? 'In Stock' : 'In Stock');
  const isOutOfStock = stockStatus === 'Out Of Stock';
  const isCallForPrice = stockStatus === 'Call for Price';
  const isPreOrder = stockStatus === 'Pre-Order';
  const isUpcoming = stockStatus === 'Up Coming';

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: Number(product.discount_price || product.selling_price || 0),
      originalPrice: product.discount_price ? Number(product.selling_price) : undefined,
      image: (product as any).primary_image || (product as any).images?.[0]?.image_url,
      warranty: product.warranty_period,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (isCallForPrice) {
    return (
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-3">
          <a
            href="tel:01700000000"
            className="flex-1 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.99]"
          >
            <PhoneCall className="w-5 h-5" />
            <span>Call for Price (01700-000000)</span>
          </a>
        </div>
      </div>
    );
  }

  if (isOutOfStock) {
    return (
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-3">
          <button
            disabled
            className="flex-1 py-3.5 px-6 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold text-sm flex items-center justify-center gap-2.5 cursor-not-allowed"
          >
            <ShoppingCart className="w-5 h-5 opacity-40" />
            <span>Currently Out of Stock</span>
          </button>
          <button
            onClick={() => alert(`We will notify you once "${product.name}" is back in stock!`)}
            className="py-3.5 px-6 rounded-2xl bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-brand-300 font-bold text-sm border border-sky-200 dark:border-slate-700 hover:bg-sky-100 transition-colors"
          >
            Notify Me
          </button>
        </div>
      </div>
    );
  }

  if (isUpcoming) {
    return (
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert(`You are registered to be notified when "${product.name}" launches!`)}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.99]"
          >
            <Sparkles className="w-5 h-5" />
            <span>Up Coming — Notify on Release</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center gap-3">
        <button
          onClick={handleAddToCart}
          className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.99] ${
            isPreOrder
              ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'
              : added
              ? 'bg-emerald-600 text-white shadow-emerald-600/20'
              : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20 hover:shadow-lg'
          }`}
        >
          {added ? <Check className="w-5 h-5 text-white" /> : isPreOrder ? <Sparkles className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
          <span>{added ? 'Added to Cart!' : isPreOrder ? 'Pre-Order Now' : 'Add to Cart'}</span>
        </button>

        <Link
          href="/checkout"
          onClick={() => {
            addToCart({
              id: product.id,
              name: product.name,
              slug: product.slug,
              sku: product.sku,
              price: Number(product.discount_price || product.selling_price || 0),
              originalPrice: product.discount_price ? Number(product.selling_price) : undefined,
              image: (product as any).primary_image || (product as any).images?.[0]?.image_url,
              warranty: product.warranty_period,
            });
          }}
          className="flex-1 py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2.5 border border-slate-900 dark:border-white shadow-sm transition-all text-center"
        >
          <Zap className="w-5 h-5 text-amber-400" />
          <span>{isPreOrder ? 'Advance Booking' : 'Buy Now'}</span>
        </Link>
      </div>

      {product.is_pc_builder && stockStatus === 'In Stock' && (product.total_stock === undefined || Number(product.total_stock) > 0) && (
        <Link
          href={`/pc-builder?select=${product.pc_builder_component}&pid=${product.id}`}
          className="w-full py-3 px-4 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 dark:bg-cyan-950/40 dark:border-cyan-800/60 dark:text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs"
        >
          <Sparkles className="w-4 h-4 text-sky-600 dark:text-brand-400" />
          <span>Add to Custom PC Build ({product.pc_builder_component?.toUpperCase()})</span>
        </Link>
      )}
    </div>
  );
}
