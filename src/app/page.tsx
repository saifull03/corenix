import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import HeroSlider from '@/components/layout/HeroSlider';
import { query } from '@/lib/db';
import { Product, Category, Brand } from '@/lib/types';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Monitor,
  Laptop,
  HardDrive,
  Zap,
  MapPin,
  Flame,
  CheckCircle,
  Truck
} from 'lucide-react';

export const revalidate = 60; // ISR cache revalidation

export default async function HomePage() {
  // Fetch hero banners for slider
  const heroBanners = await query<any[]>(
    `SELECT * FROM banners WHERE position = 'hero' AND is_active = 1 ORDER BY order_index ASC, id ASC`
  );

  const categories = await query<Category[]>(
    `SELECT id, name, slug, short_desc
     FROM categories
     WHERE is_active = 1 AND parent_id IS NOT NULL
     ORDER BY order_index ASC LIMIT 8`
  );

  // Fetch featured products
  const featuredProducts = await query<Product[]>(
    `SELECT p.*,
            b.name as brand_name, b.slug as brand_slug,
            c.name as category_name, c.slug as category_slug,
            pi.image_url as primary_image,
            (SELECT SUM(quantity - reserved_qty) FROM inventory WHERE product_id = p.id) as total_stock
     FROM products p
     JOIN brands b ON p.brand_id = b.id
     JOIN categories c ON p.category_id = c.id
     LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
     WHERE p.status = 'published'
     ORDER BY p.is_featured DESC, p.created_at DESC
     LIMIT 8`
  );

  // Fetch official brands
  const brands = await query<Brand[]>(
    `SELECT id, name, slug, country, short_desc
     FROM brands
     WHERE is_active = 1
     ORDER BY is_featured DESC, name ASC LIMIT 10`
  );

  // Category Icon helper
  const getCatIcon = (slug: string) => {
    switch (slug) {
      case 'processor': return <Cpu className="w-6 h-6 text-brand-400" />;
      case 'graphics-card': return <Zap className="w-6 h-6 text-amber-400" />;
      case 'motherboard': return <Cpu className="w-6 h-6 text-purple-400" />;
      case 'storage': return <HardDrive className="w-6 h-6 text-emerald-400" />;
      case 'monitors': return <Monitor className="w-6 h-6 text-blue-400" />;
      case 'gaming-laptop': return <Laptop className="w-6 h-6 text-rose-400" />;
      default: return <Cpu className="w-6 h-6 text-brand-400" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-navy-950 dark:text-slate-100 font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1">
        {/* HERO SLIDER SECTION */}
        <section className="w-full border-b border-slate-200/80 dark:border-slate-800/80">
          <HeroSlider initialBanners={heroBanners ?? []} />
        </section>

        {/* TRUST BADGES STRIP */}
        <div className="bg-white dark:bg-navy-900 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
              <span className="font-semibold">100% Genuine Official Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-sky-600 dark:text-brand-400 flex-shrink-0" />
              <span className="font-semibold">Live Stock at Shop 1 &amp; Shop 2</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="font-semibold">Dedicated In-House RMA Hub</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400 flex-shrink-0" />
              <span className="font-semibold">DLSS 4 &amp; RTX 50 Series Available</span>
            </div>
          </div>
        </div>

        {/* DYNAMIC CATEGORY SHOWCASE */}
        <section className="py-16 max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-brand-400 mb-1">
                Browse Components & Systems
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Featured Hardware Categories
              </h2>
            </div>
            <Link href="/products" className="text-xs font-bold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-brand-400 flex items-center gap-1">
              <span>View All Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 hover:border-sky-500/50 hover:bg-slate-50/80 dark:hover:bg-slate-900/80 transition-all duration-300 flex flex-col justify-between shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-sky-50 dark:bg-slate-800/80 dark:group-hover:bg-brand-500/10 flex items-center justify-center transition-colors">
                    {getCatIcon(cat.slug)}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white group-hover:text-sky-600 dark:group-hover:text-brand-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                    {cat.short_desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* FEATURED PRODUCTS GRID */}
        <section className="py-16 bg-white/70 dark:bg-navy-900/40 border-y border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-brand-400 mb-1">
                  High Demand Hardware
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Trending Products & Hot Deals
                </h2>
              </div>
              <Link href="/products" className="text-xs font-bold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-brand-400 flex items-center gap-1">
                <span>See All Hardware</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        </section>

        {/* INTERACTIVE PC BUILDER CALLOUT BANNER */}
        <section className="py-16 max-w-7xl mx-auto px-4">
          <div className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-sky-900 via-slate-900 to-navy-900 border border-sky-500/30 overflow-hidden shadow-xl text-white">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none"></div>

            <div className="max-w-2xl relative z-10 space-y-4">
              <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30 uppercase tracking-wider">
                Automated Compatibility Engine
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Design Your Dream Custom Rig with Zero Compatibility Errors
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Our dynamic PC Builder instantly verifies motherboard socket types, DDR4 vs DDR5 RAM compatibility, estimated PSU power wattage, and GPU clearances before you purchase.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/pc-builder"
                  className="px-6 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-navy-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all hover:scale-102"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Custom Build</span>
                </Link>

                <div className="flex items-center gap-4 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Real-time Wattage Calc
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Socket Validation
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OFFICIAL BRANDS DIRECTORY */}
        <section className="py-12 bg-slate-50 dark:bg-navy-900/30 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-brand-400">Authorized Partners</span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">Official Brand Ecosystem</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Direct procurement with verifiable serial numbers and manufacturer warranties.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {brands.map((b) => (
                <Link
                  key={b.id}
                  href={`/brand/${b.slug}`}
                  className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 hover:border-sky-500/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-all text-center group shadow-2xs hover:shadow-xs"
                >
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-brand-400 block transition-colors">
                    {b.name}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5 block">
                    {b.country}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* PHYSICAL BRANCHES LOCATOR HIGHLIGHTS */}
        <section className="py-16 max-w-7xl mx-auto px-4">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-brand-400">Our Presence</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Showrooms & Service Centers</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pick up orders instantly, test components live, or drop off hardware for warranty diagnosis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800 text-xs font-bold">
                    Shop 1 • Flagship Store
                  </span>
                  <MapPin className="w-5 h-5 text-sky-600 dark:text-brand-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Uttara Showroom</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Sector 3, Uttara Model Town, Dhaka. Complete PC build testing counter, gaming peripherals exhibition, and instant cash/POS pickup.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Hotline:</span> +880 1700-000002
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800 text-xs font-bold">
                    Shop 2 • South Branch
                  </span>
                  <MapPin className="w-5 h-5 text-sky-600 dark:text-brand-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dhanmondi Branch</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Road 27, Dhanmondi, Dhaka. Dedicated high-end laptop lounge, monitor display wall, and enthusiast component stock.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Hotline:</span> +880 1700-000003
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800 text-xs font-bold">
                    Central Service Hub
                  </span>
                  <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Agargaon RMA Center</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Level 4, IT Plaza, Agargaon, Dhaka. Certified SMD-level micro-soldering, RMA diagnostic testing, and direct vendor dispatch.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">RMA Helpdesk:</span> +880 1700-000004
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
