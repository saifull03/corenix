import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import ProductDetailActions from '@/components/products/ProductDetailActions';
import { query, queryOne } from '@/lib/db';
import { Product, ProductSpecification, ProductInventory } from '@/lib/types';
import {
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Star,
  ShoppingCart,
  Zap,
  ArrowRight,
  Package,
  Layers,
  Sparkles,
  HelpCircle,
  Truck,
  CreditCard
} from 'lucide-react';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await queryOne<any>(
    `SELECT p.name, p.slug, b.name as brand_name,
            ps.meta_title, ps.meta_desc, ps.canonical_url, ps.og_title, ps.og_desc
     FROM products p
     JOIN brands b ON p.brand_id = b.id
     LEFT JOIN product_seo ps ON p.id = ps.product_id
     WHERE p.slug = ?`,
    [slug]
  );

  if (!product) {
    return { title: 'Product Not Found | CORENIX' };
  }

  const title = product.meta_title || `${product.name} Price in Bangladesh | CORENIX`;
  const description = product.meta_desc || `Buy ${product.name} from ${product.brand_name} at CORENIX. Official warranty and multi-branch stock.`;

  return {
    title,
    description,
    openGraph: {
      title: product.og_title || title,
      description: product.og_desc || description,
      url: `https://corenix.com.bd/product/${product.slug}`,
      siteName: 'CORENIX',
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  // 1. Fetch main product
  const product = await queryOne<Product>(
    `SELECT p.*,
            b.name as brand_name, b.slug as brand_slug,
            c.name as category_name, c.slug as category_slug,
            pd.overview, pd.key_features_json, pd.what_in_box, pd.warranty_info, pd.faq_json,
            pi.image_url as primary_image
     FROM products p
     JOIN brands b ON p.brand_id = b.id
     JOIN categories c ON p.category_id = c.id
     LEFT JOIN product_descriptions pd ON p.id = pd.product_id
     LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
     WHERE p.slug = ?`,
    [slug]
  );

  if (!product) {
    notFound();
  }

  // 2. Fetch specifications dynamically
  const specs = await query<ProductSpecification[]>(
    `SELECT ps.id, ps.attribute_id, ps.attribute_value, ps.custom_label,
            a.name as attribute_name, a.code as attribute_code,
            ag.name as group_name
     FROM product_specifications ps
     JOIN attributes a ON ps.attribute_id = a.id
     LEFT JOIN attribute_groups ag ON a.group_id = ag.id
     WHERE ps.product_id = ?
     ORDER BY ag.order_index ASC, ps.order_index ASC`,
    [product.id]
  );

  // 3. Fetch location-based inventory (Main Warehouse, Shop 1, Shop 2, RMA Center)
  const inventory = await query<ProductInventory[]>(
    `SELECT inv.branch_id, b.name as branch_name, b.code as branch_code,
            inv.quantity, inv.reserved_qty, inv.rma_qty
     FROM inventory inv
     JOIN branches b ON inv.branch_id = b.id
     WHERE inv.product_id = ?
     ORDER BY b.type = 'shop' DESC, b.name ASC`,
    [product.id]
  );

  // 4. Fetch related products in the same category
  const related = await query<Product[]>(
    `SELECT p.*,
            b.name as brand_name, b.slug as brand_slug,
            c.name as category_name, c.slug as category_slug,
            pi.image_url as primary_image,
            (SELECT SUM(quantity - reserved_qty) FROM inventory WHERE product_id = p.id) as total_stock
     FROM products p
     JOIN brands b ON p.brand_id = b.id
     JOIN categories c ON p.category_id = c.id
     LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
     WHERE p.category_id = ? AND p.id != ? AND p.status = 'published'
     LIMIT 4`,
    [product.category_id, product.id]
  );

  const currentPrice = product.discount_price || product.selling_price;
  const regularPrice = product.selling_price;
  const discountAmount = product.discount_price ? regularPrice - product.discount_price : 0;
  const keyFeatures: string[] = typeof (product as any).key_features_json === 'string'
    ? JSON.parse((product as any).key_features_json || '[]')
    : (product as any).key_features_json || [];

  const totalAvailableStock = inventory.reduce((acc, curr) => acc + Math.max(0, curr.quantity - curr.reserved_qty), 0);

  // Structured Data (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: [product.primary_image || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'],
    description: (product as any).overview || product.name,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand_name,
    },
    offers: {
      '@type': 'Offer',
      url: `https://corenix.com.bd/product/${product.slug}`,
      priceCurrency: 'BDT',
      price: currentPrice,
      availability: totalAvailableStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 flex-wrap">
          <Link href="/" className="hover:text-brand-400">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-brand-400">Products</Link>
          <span>/</span>
          <Link href={`/category/${product.category_slug}`} className="hover:text-brand-400">
            {product.category_name}
          </Link>
          <span>/</span>
          <span className="text-slate-200 truncate max-w-xs">{product.name}</span>
        </nav>

        {/* TOP SECTION: Gallery + Key Info & Branch Availability */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Left: Product Image Gallery */}
          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-square bg-navy-900 border border-slate-800 rounded-3xl p-8 flex items-center justify-center relative overflow-hidden shadow-2xl">
              {product.discount_price && product.discount_price < product.selling_price && (
                <div className="absolute top-4 left-4 bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-lg uppercase tracking-wider shadow">
                  Save ৳{discountAmount.toLocaleString()}
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.primary_image || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80'}
                alt={product.name}
                className="w-full h-full object-contain hover:scale-108 transition-transform duration-500"
              />
            </div>

            {/* Quick badges under image */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-navy-900 border border-slate-800 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-brand-400 flex-shrink-0" />
                <div>
                  <span className="text-white font-bold block">{product.warranty_period}</span>
                  <span className="text-[11px] text-slate-400">Official Brand Warranty</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-navy-900 border border-slate-800 flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <div>
                  <span className="text-white font-bold block">0% EMI Available</span>
                  <span className="text-[11px] text-slate-400">Up to 12 Months</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Product Details, Pricing, Stock & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-3 text-xs mb-2">
                <Link
                  href={`/brand/${product.brand_slug}`}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-brand-300 font-bold uppercase tracking-wider"
                >
                  {product.brand_name}
                </Link>
                <span className="text-slate-500 font-mono">SKU: {product.sku}</span>
                {product.model && <span className="text-slate-500 font-mono">Model: {product.model}</span>}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white leading-snug">
                {product.name}
              </h1>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="font-bold text-slate-100">{Number(product.rating_avg || 5.0).toFixed(1)}</span>
                  <span className="text-slate-400">({product.rating_count || 12} reviews)</span>
                </div>
                <span className="text-slate-600">|</span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Verifiable Genuine Serial
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 flex items-baseline justify-between flex-wrap gap-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Cash Special Price
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-brand-400 tracking-tight">
                    ৳{currentPrice.toLocaleString()}
                  </span>
                  {product.discount_price && product.discount_price < product.selling_price && (
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-500 line-through">
                        Regular: ৳{regularPrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-rose-400 font-bold">
                        Save ৳{discountAmount.toLocaleString()} ({product.discount_percent}% OFF)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Estimated EMI</span>
                <span className="text-sm font-bold text-white">৳{(Math.round(currentPrice / 12)).toLocaleString()} / mo</span>
              </div>
            </div>

            {/* Key Features Bullet Points */}
            {keyFeatures.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Key Specifications:
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  {keyFeatures.map((kf, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 flex-shrink-0"></span>
                      <span>{kf}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* LOCATION-BASED INVENTORY (Requirement 14 & 26) */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-400" />
                  Live Branch & Warehouse Availability:
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  totalAvailableStock > 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300'
                }`}>
                  {totalAvailableStock > 0 ? `Total In Stock: ${totalAvailableStock} Units` : 'Out of Stock'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {inventory.map((inv) => {
                  const avail = Math.max(0, inv.quantity - inv.reserved_qty);
                  return (
                    <div key={inv.branch_id} className="p-2.5 rounded-lg bg-navy-950 border border-slate-800 text-center">
                      <span className="text-[11px] font-semibold text-slate-400 block truncate" title={inv.branch_name}>
                        {inv.branch_code}
                      </span>
                      <span className={`text-sm font-black mt-0.5 block ${
                        avail > 0 ? 'text-emerald-400' : 'text-slate-500'
                      }`}>
                        {avail > 0 ? `${avail} in Stock` : '0 Units'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA Buttons: Add to Cart, Buy Now, Add to PC Builder */}
            <ProductDetailActions product={product} />
          </div>
        </div>

        {/* BOTTOM SECTION: Tabs / Rich Content Overview & Dynamic Specifications */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          <div className="lg:col-span-8 space-y-8">
            {/* Overview & Description */}
            <div className="p-6 sm:p-8 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-400" />
                <span>Product Overview & Details</span>
              </h2>
              <div className="text-sm text-slate-300 leading-relaxed space-y-4 whitespace-pre-line">
                {(product as any).overview || 'No additional overview provided.'}
              </div>
            </div>

            {/* Dynamic Specifications Table (Requirement 10 & 11) */}
            <div className="p-6 sm:p-8 rounded-2xl bg-navy-900 border border-slate-800 space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-400" />
                <span>Technical Specifications</span>
              </h2>

              {specs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <tbody>
                      {specs.map((s, idx) => (
                        <tr key={idx} className="border-b border-slate-800/80 hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-400 w-1/3 bg-slate-900/40">
                            {s.custom_label || s.attribute_name}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-200">
                            {s.attribute_value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Standard specifications apply.</p>
              )}
            </div>

            {/* What's in the Box & Warranty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand-400" />
                  <span>What&apos;s in the Box</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {(product as any).what_in_box || 'Standard retail package accessories and official documents.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-400" />
                  <span>Warranty & Service Policy</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {product.warranty_period}. Serviced at CORENIX Agargaon RMA Hub or official authorized distributor centers with replacement guarantee.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Related Hardware Recommendations */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center justify-between">
                <span>Related Products</span>
                <Link href={`/category/${product.category_slug}`} className="text-xs text-brand-400 hover:underline">
                  View More
                </Link>
              </h3>

              <div className="space-y-4">
                {related.map((rp) => (
                  <Link
                    key={rp.id}
                    href={`/product/${rp.slug}`}
                    className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 flex items-center gap-3 transition-colors group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={rp.primary_image || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80'}
                      alt={rp.name}
                      className="w-14 h-14 object-contain bg-navy-950 rounded-lg p-1"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-200 group-hover:text-brand-300 truncate">
                        {rp.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-brand-400">
                          ৳{(rp.discount_price || rp.selling_price).toLocaleString()}
                        </span>
                        {rp.discount_price && (
                          <span className="text-[10px] text-slate-500 line-through">
                            ৳{rp.selling_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* RMA Assistance Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-navy-900 border border-brand-500/30 space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-400">
                Official After-Sales Guarantee
              </span>
              <h4 className="text-sm font-bold text-white">Need Technical Support or RMA Service?</h4>
              <p className="text-xs text-slate-400">
                Direct component replacement and status tracking at our dedicated Agargaon RMA Hub.
              </p>
              <Link
                href="/rma"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-400 hover:text-brand-300"
              >
                <span>Track or Claim RMA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
