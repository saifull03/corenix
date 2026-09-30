'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Zap, Sparkles } from 'lucide-react';
import { Product } from '@/lib/types';

interface Props {
  product: Product;
}

export default function ProductDetailActions({ product }: Props) {
  const handleAddToCart = () => {
    alert(`Success! "${product.name}" added to cart. Ready for pickup at Shop 1 (Uttara) or Shop 2 (Dhanmondi).`);
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center gap-3">
        <button
          onClick={handleAddToCart}
          className="flex-1 py-3.5 px-6 rounded-2xl bg-sky-600 hover:bg-sky-500 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-md shadow-sky-600/20 hover:shadow-lg transition-all"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Add to Cart</span>
        </button>

        <Link
          href="/checkout"
          className="flex-1 py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2.5 border border-slate-900 dark:border-white shadow-sm transition-all"
        >
          <Zap className="w-5 h-5 text-amber-400" />
          <span>Buy Now</span>
        </Link>
      </div>

      {product.is_pc_builder && (
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
