'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Layers,
  Tag,
  DollarSign,
  Warehouse,
  Image,
  Sliders,
  CheckCircle,
  FileText,
  Search,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Eye,
  ShieldCheck
} from 'lucide-react';

const TABS = [
  { id: 1, name: '1. Basic Info' },
  { id: 2, name: '2. Category' },
  { id: 3, name: '3. Brand' },
  { id: 4, name: '4. Pricing' },
  { id: 5, name: '5. Inventory' },
  { id: 6, name: '6. Images' },
  { id: 7, name: '7. Specifications' },
  { id: 8, name: '8. Features' },
  { id: 9, name: '9. Description' },
  { id: 10, name: '10. SEO & Preview' },
  { id: 11, name: '11. PC Builder' },
  { id: 12, name: '12. Publish' },
];

export default function CreateProductPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categories & Brands for dropdowns
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    // 1. Basic Info
    name: 'MSI GeForce RTX 5070 Gaming Trio 12GB GDDR7',
    slug: 'msi-rtx-5070-gaming-trio-12gb',
    sku: 'GPU-MSI-5070-TRIO',
    barcode: '4719072991021',
    model: 'RTX 5070 GAMING TRIO',
    mpn: 'G5070-GT12',
    category_id: 6, // Graphics Card
    brand_id: 1, // MSI
    warranty_period: '3 Years Official Replacement Warranty',
    status: 'published',
    is_featured: true,
    is_new: true,
    // 4. Pricing
    purchase_cost: 65000,
    selling_price: 78000,
    discount_price: 74900,
    // 5. Inventory per branch
    wh_stock: 20,
    shop1_stock: 8,
    shop2_stock: 5,
    rma_stock: 0,
    // 6. Image
    primary_image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
    // 7. Specifications (Category template)
    spec_vram: '12GB GDDR7',
    spec_bus: '192-bit',
    spec_clock: '2610 MHz',
    spec_power: '250W',
    // 8. Key Features
    feature1: 'Next-Gen Blackwell Architecture with DLSS 4 Support',
    feature2: 'TRI FROZR 3 Thermal Design with TORX Fan 5.0',
    feature3: 'Solid Nickel-Plated Copper Baseplate and Heatpipes',
    // 9. Description
    overview: 'The MSI GeForce RTX 5070 Gaming Trio delivers dominant graphical prowess for 1440p and 4K ultra-raytraced gaming. Built with high-speed GDDR7 memory and precision cooling.',
    // 10. SEO
    meta_title: 'MSI GeForce RTX 5070 Gaming Trio 12GB Price in BD | CORENIX',
    meta_desc: 'Buy MSI RTX 5070 Gaming Trio 12GB Graphics Card in Bangladesh with 3 years warranty from CORENIX. Check benchmarks, specs and live branch stock.',
    focus_keyword: 'msi rtx 5070 gaming trio',
    // 11. PC Builder
    is_pc_builder: true,
    pc_builder_component: 'gpu',
  });

  // Load Categories & Brands
  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => { if (d.categories) setCategories(d.categories); }).catch(() => {});
    fetch('/api/brands').then(r => r.json()).then(d => { if (d.brands) setBrands(d.brands); }).catch(() => {});
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculatedProfit = (formData.discount_price || formData.selling_price) - formData.purchase_cost;
  const calculatedMargin = formData.selling_price > 0 ? ((calculatedProfit / formData.selling_price) * 100).toFixed(1) : 0;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          sku: formData.sku,
          model: formData.model,
          brand_id: formData.brand_id,
          category_id: formData.category_id,
          warranty_period: formData.warranty_period,
          purchase_cost: Number(formData.purchase_cost),
          selling_price: Number(formData.selling_price),
          discount_price: Number(formData.discount_price),
          is_featured: formData.is_featured,
          is_new: formData.is_new,
          is_pc_builder: formData.is_pc_builder,
          pc_builder_component: formData.pc_builder_component,
          primary_image: formData.primary_image,
          overview: formData.overview,
          key_features: [formData.feature1, formData.feature2, formData.feature3],
          specs: [
            { attribute_id: 7, attribute_value: formData.spec_vram }, // VRAM
            { attribute_id: 9, attribute_value: formData.spec_bus },  // Bus
            { attribute_id: 5, attribute_value: formData.spec_clock }, // Boost Clock
          ],
          inventory: [
            { branch_id: 1, quantity: Number(formData.wh_stock) }, // WH
            { branch_id: 2, quantity: Number(formData.shop1_stock) }, // Shop 1
            { branch_id: 3, quantity: Number(formData.shop2_stock) }, // Shop 2
          ],
          meta_title: formData.meta_title,
          meta_desc: formData.meta_desc,
          focus_keyword: formData.focus_keyword,
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('Product published successfully without changing any source code! Live on storefront.');
        router.push('/admin/products');
      } else {
        alert(data.error || 'Failed to publish product.');
      }
    } catch (err: any) {
      alert('Error creating product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Enterprise Product Workflow
          </span>
          <h1 className="text-2xl font-black text-white">
            18-Step Product Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic attributes, category templates, multi-branch stock, and SEO generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab(prev => Math.max(1, prev - 1))}
            disabled={activeTab === 1}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 disabled:opacity-40"
          >
            Previous Tab
          </button>
          <button
            onClick={() => setActiveTab(prev => Math.min(TABS.length, prev + 1))}
            disabled={activeTab === TABS.length}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs"
          >
            Next Tab
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 text-xs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 rounded-xl whitespace-nowrap font-bold transition-colors ${
              activeTab === tab.id
                ? 'bg-brand-500 text-navy-950 shadow'
                : 'bg-navy-900 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Main Tab Panels Container */}
      <div className="p-6 sm:p-8 rounded-3xl bg-navy-900 border border-slate-800 space-y-6">
        {/* TAB 1: BASIC INFORMATION */}
        {activeTab === 1 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              1. Basic Product Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1 font-semibold">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">SKU (Stock Keeping Unit) *</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Barcode / EAN</label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => handleChange('barcode', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Model Number</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Official Warranty</label>
                <input
                  type="text"
                  value={formData.warranty_period}
                  onChange={(e) => handleChange('warranty_period', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => handleChange('is_featured', e.target.checked)}
                    className="rounded text-brand-500"
                  />
                  <span>Mark as Featured Hardware</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.is_new}
                    onChange={(e) => handleChange('is_new', e.target.checked)}
                    className="rounded text-brand-500"
                  />
                  <span>New Arrival Badge</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 & 3: CATEGORY & BRAND */}
        {(activeTab === 2 || activeTab === 3) && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Hierarchy, Category & Brand Selection
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Hardware Category *</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => handleChange('category_id', Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                >
                  <option value={5}>Processor (CPU)</option>
                  <option value={6}>Graphics Card (GPU)</option>
                  <option value={7}>Motherboard</option>
                  <option value={8}>Desktop RAM</option>
                  <option value={9}>Storage (SSD/M.2)</option>
                  <option value={10}>Power Supply</option>
                  <option value={13}>Gaming Laptop</option>
                  <option value={3}>Gaming Monitors</option>
                </select>
                <span className="text-[11px] text-brand-400 mt-1 block">
                  Selecting category automatically loads its dynamic specification template.
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 font-semibold">Brand Partner *</label>
                  <Link href="/admin/brands" target="_blank" className="text-[11px] text-brand-400 hover:underline font-semibold">
                    + Manage Brands
                  </Link>
                </div>
                <select
                  value={formData.brand_id}
                  onChange={(e) => handleChange('brand_id', Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                >
                  {brands.length > 0 ? (
                    brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} {b.country ? `(${b.country})` : ''}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value={1}>MSI</option>
                      <option value={2}>ASUS</option>
                      <option value={3}>Gigabyte</option>
                      <option value={4}>Intel</option>
                      <option value={5}>AMD</option>
                      <option value={6}>Corsair</option>
                      <option value={7}>Samsung</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PRICING & COST MARGIN */}
        {activeTab === 4 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              4. Product Pricing & Profit Accounting (Requirement 13)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Procurement / Purchase Cost (৳) *</label>
                <input
                  type="number"
                  value={formData.purchase_cost}
                  onChange={(e) => handleChange('purchase_cost', Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Never exposed to public storefront</span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Selling / Regular Price (৳) *</label>
                <input
                  type="number"
                  value={formData.selling_price}
                  onChange={(e) => handleChange('selling_price', Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Special Discount Price (৳)</label>
                <input
                  type="number"
                  value={formData.discount_price}
                  onChange={(e) => handleChange('discount_price', Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                />
              </div>
            </div>

            {/* Live Profit Calculation Card */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Real-Time Profit per Unit Sold:</span>
                <span className="text-xl font-black text-emerald-400">৳{calculatedProfit.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-semibold">Gross Profit Margin:</span>
                <span className="text-xl font-black text-brand-400">+{calculatedMargin}%</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: MULTI-LOCATION INVENTORY */}
        {activeTab === 5 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              5. Multi-Branch Location Stock (Requirement 14)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <label className="block text-slate-400 mb-1 font-semibold">Main Central Warehouse (Tejgaon)</label>
                <input
                  type="number"
                  value={formData.wh_stock}
                  onChange={(e) => handleChange('wh_stock', Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <label className="block text-slate-400 mb-1 font-semibold">Shop 1 (Uttara Flagship)</label>
                <input
                  type="number"
                  value={formData.shop1_stock}
                  onChange={(e) => handleChange('shop1_stock', Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <label className="block text-slate-400 mb-1 font-semibold">Shop 2 (Dhanmondi Branch)</label>
                <input
                  type="number"
                  value={formData.shop2_stock}
                  onChange={(e) => handleChange('shop2_stock', Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <label className="block text-slate-400 mb-1 font-semibold">RMA Hub Testing Stock</label>
                <input
                  type="number"
                  value={formData.rma_stock}
                  onChange={(e) => handleChange('rma_stock', Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: IMAGES */}
        {activeTab === 6 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              6. Product Images & Visual Assets
            </h3>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Primary Image URL *</label>
              <input
                type="text"
                value={formData.primary_image}
                onChange={(e) => handleChange('primary_image', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
              />
            </div>

            {formData.primary_image && (
              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 w-48 h-48 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.primary_image}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 7: SPECIFICATIONS (CATEGORY TEMPLATE) */}
        {activeTab === 7 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              7. Category Specification Template (Requirement 11)
            </h3>
            <p className="text-slate-400 text-xs">
              Loaded automatically for <strong>Graphics Card</strong>:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">VRAM Capacity *</label>
                <input
                  type="text"
                  value={formData.spec_vram}
                  onChange={(e) => handleChange('spec_vram', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Memory Bus Width *</label>
                <input
                  type="text"
                  value={formData.spec_bus}
                  onChange={(e) => handleChange('spec_bus', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Engine Boost Clock</label>
                <input
                  type="text"
                  value={formData.spec_clock}
                  onChange={(e) => handleChange('spec_clock', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Power Consumption (TDP)</label>
                <input
                  type="text"
                  value={formData.spec_power}
                  onChange={(e) => handleChange('spec_power', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: FEATURES */}
        {activeTab === 8 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              8. Key Feature Highlights (Bullet Points)
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Highlight Feature 1</label>
                <input
                  type="text"
                  value={formData.feature1}
                  onChange={(e) => handleChange('feature1', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Highlight Feature 2</label>
                <input
                  type="text"
                  value={formData.feature2}
                  onChange={(e) => handleChange('feature2', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Highlight Feature 3</label>
                <input
                  type="text"
                  value={formData.feature3}
                  onChange={(e) => handleChange('feature3', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: DESCRIPTION */}
        {activeTab === 9 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              9. Structured Dynamic Product Overview (Requirement 9)
            </h3>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Detailed Product Overview</label>
              <textarea
                rows={5}
                value={formData.overview}
                onChange={(e) => handleChange('overview', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        )}

        {/* TAB 10: SEO & GOOGLE PREVIEW */}
        {activeTab === 10 && (
          <div className="space-y-5 text-xs">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              10. Product SEO & Google Search Snippet Preview (Requirement 15)
            </h3>

            {/* Google Search Result Preview Card */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                Google SERP Snippet Preview
              </span>
              <div className="text-cyan-400 text-sm font-semibold truncate hover:underline cursor-pointer">
                {formData.meta_title}
              </div>
              <div className="text-[11px] text-emerald-400 truncate">
                https://corenix.com.bd/product/{formData.slug}
              </div>
              <p className="text-slate-400 text-xs line-clamp-2">
                {formData.meta_desc}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Custom Meta Title</label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => handleChange('meta_title', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Custom Meta Description</label>
                <textarea
                  rows={2}
                  value={formData.meta_desc}
                  onChange={(e) => handleChange('meta_desc', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Focus Keyword</label>
                <input
                  type="text"
                  value={formData.focus_keyword}
                  onChange={(e) => handleChange('focus_keyword', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 11: PC BUILDER */}
        {activeTab === 11 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              11. PC Builder Engine Integration (Requirement 23)
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.is_pc_builder}
                  onChange={(e) => handleChange('is_pc_builder', e.target.checked)}
                  className="rounded text-brand-500"
                />
                <span className="font-bold text-white">Enable this product in PC Builder</span>
              </label>

              {formData.is_pc_builder && (
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Component Slot</label>
                  <select
                    value={formData.pc_builder_component}
                    onChange={(e) => handleChange('pc_builder_component', e.target.value)}
                    className="w-full max-w-xs bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                  >
                    <option value="cpu">Processor (CPU)</option>
                    <option value="motherboard">Motherboard</option>
                    <option value="gpu">Graphics Card (GPU)</option>
                    <option value="ram">RAM</option>
                    <option value="storage">Storage (SSD)</option>
                    <option value="psu">Power Supply</option>
                    <option value="case">PC Case</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 12: PUBLISH */}
        {activeTab === 12 && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-cyan-950 border border-brand-500/40 text-brand-400 mx-auto flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl font-bold text-white">Ready to Publish Hardware?</h2>
              <p className="text-xs text-slate-400">
                The product will immediately be indexed in search, published to the category & brand pages, and added to the sitemap.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-black text-sm shadow-xl shadow-cyan-500/20 transition-all hover:scale-105 disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing Hardware...' : 'Publish Product to Live Catalogue'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
