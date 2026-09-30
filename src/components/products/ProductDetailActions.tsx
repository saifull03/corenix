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
          className="flex-1 py-3.5 px-6 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-102"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Add to Cart</span>
        </button>

        <Link
          href="/checkout"
          className="flex-1 py-3.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all"
        >
          <Zap className="w-5 h-5 text-amber-400" />
          <span>Buy Now</span>
        </Link>
      </div>

      {product.is_pc_builder && (
        <Link
          href={`/pc-builder?select=${product.pc_builder_component}&pid=${product.id}`}
          className="w-full py-2.5 px-4 rounded-xl bg-cyan-950/60 hover:bg-cyan-950 border border-brand-500/40 text-brand-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>Add to Custom PC Build ({product.pc_builder_component?.toUpperCase()})</span>
        </Link>
      )}
    </div>
  );
}
