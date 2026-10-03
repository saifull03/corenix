'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Layers,
  Tag,
  DollarSign,
  Warehouse,
  Image as ImageIcon,
  Sliders,
  CheckCircle2,
  FileText,
  Search,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Plus,
  Trash2,
  Loader2,
  Save,
  Barcode,
  HelpCircle,
  AlertCircle,
  Check,
  Eye,
} from 'lucide-react';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
}

interface BrandItem {
  id: number;
  name: string;
  slug: string;
}

interface SpecItem {
  attribute_id?: number;
  custom_label: string;
  attribute_value: string;
}

interface InventoryItem {
  branch_id: number;
  branch_name: string;
  branch_code: string;
  quantity: number;
  shelf_location: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reference lists
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);

  // Main Product Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    model: '',
    barcode: '',
    mpn: '',
    brand_id: 1,
    category_id: 1,
    warranty_period: '1 Year Official Warranty',
    status: 'published',
    stock_status: 'In Stock',
    is_featured: false,
    is_hot: false,
    is_new: false,
    is_pc_builder: false,
    pc_builder_component: '',
    // Pricing
    purchase_cost: 0,
    selling_price: 0,
    discount_price: 0,
    // Media
    primary_image: '',
    // Overview & Descriptions
    overview: '',
    key_features: [''],
    what_in_box: 'Product, User Manual, Power Cable/Accessories',
    warranty_info: 'Official Manufacturer Warranty Support',
    // SEO
    meta_title: '',
    meta_desc: '',
    focus_keyword: '',
  });

  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [specsList, setSpecsList] = useState<SpecItem[]>([]);

  // Show toast notification
  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        // 1. Fetch categories and brands
        const [catsRes, brandsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/brands'),
        ]);

        if (catsRes.ok) {
          const cData = await catsRes.json();
          if (cData.categories) setCategories(cData.categories);
        }
        if (brandsRes.ok) {
          const bData = await brandsRes.json();
          if (bData.brands) setBrands(bData.brands);
        }

        // 2. Fetch current product
        const prodRes = await fetch(`/api/products/${productId}`);
        if (!prodRes.ok) {
          throw new Error('Product not found');
        }

        const data = await prodRes.json();
        const p = data.product;

        let parsedFeatures: string[] = [''];
        if (p.description?.key_features_json) {
          try {
            const parsed = JSON.parse(p.description.key_features_json);
            if (Array.isArray(parsed) && parsed.length > 0) parsedFeatures = parsed;
          } catch {}
        }

        setFormData({
          name: p.name || '',
          slug: p.slug || '',
          sku: p.sku || '',
          model: p.model || '',
          barcode: p.barcode || '',
          mpn: p.mpn || '',
          brand_id: p.brand_id || 1,
          category_id: p.category_id || 1,
          warranty_period: p.warranty_period || '1 Year Official Warranty',
          status: p.status || 'published',
          stock_status: p.stock_status || 'In Stock',
          is_featured: Boolean(p.is_featured),
          is_hot: Boolean(p.is_hot),
          is_new: Boolean(p.is_new),
          is_pc_builder: Boolean(p.is_pc_builder),
          pc_builder_component: p.pc_builder_component || '',
          purchase_cost: Number(p.purchase_cost) || 0,
          selling_price: Number(p.selling_price) || 0,
          discount_price: p.discount_price ? Number(p.discount_price) : 0,
          primary_image: p.images?.[0]?.image_url || '',
          overview: p.description?.overview || '',
          key_features: parsedFeatures,
          what_in_box: p.description?.what_in_box || 'Product, User Manual, Power Cable/Accessories',
          warranty_info: p.description?.warranty_info || 'Official Manufacturer Warranty Support',
          meta_title: p.seo?.meta_title || `${p.name} Price in Bangladesh | CORENIX`,
          meta_desc: p.seo?.meta_desc || `Buy authentic ${p.name} in Bangladesh with warranty at CORENIX.`,
          focus_keyword: p.seo?.focus_keyword || (p.name || '').toLowerCase(),
        });

        // Set Inventory
        if (p.inventory && p.inventory.length > 0) {
          setInventoryList(
            p.inventory.map((inv: any) => ({
              branch_id: inv.branch_id,
              branch_name: inv.branch_name || `Branch #${inv.branch_id}`,
              branch_code: inv.branch_code || `BR-${inv.branch_id}`,
              quantity: inv.quantity || 0,
              shelf_location: inv.shelf_location || `SHELF-${inv.branch_id}-01`,
            }))
          );
        } else {
          // Default branches
          setInventoryList([
            { branch_id: 1, branch_name: 'Central Warehouse', branch_code: 'WH-MAIN', quantity: 10, shelf_location: 'SHELF-WH-01' },
            { branch_id: 2, branch_name: 'Uttara Flagship', branch_code: 'SHOP-1', quantity: 5, shelf_location: 'SHELF-U1-01' },
            { branch_id: 3, branch_name: 'Dhanmondi Branch', branch_code: 'SHOP-2', quantity: 5, shelf_location: 'SHELF-DH-01' },
          ]);
        }

        // Set Specs
        if (p.specs && p.specs.length > 0) {
          setSpecsList(
            p.specs.map((s: any) => ({
              attribute_id: s.attribute_id,
              custom_label: s.custom_label || s.attr_name || 'Spec',
              attribute_value: s.attribute_value || '',
            }))
          );
        } else {
          setSpecsList([
            { custom_label: 'Processor / Core', attribute_value: '' },
            { custom_label: 'Memory / RAM', attribute_value: '' },
            { custom_label: 'Storage Capacity', attribute_value: '' },
            { custom_label: 'Graphics / GPU', attribute_value: '' },
          ]);
        }
      } catch (err: any) {
        showToast('error', err.message || 'Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    }

    if (productId) loadData();
  }, [productId]);

  // Handle Form Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Inventory Qty Change
  const handleInventoryChange = (branchId: number, field: 'quantity' | 'shelf_location', val: any) => {
    setInventoryList(prev =>
      prev.map(item => {
        if (item.branch_id === branchId) {
          return {
            ...item,
            [field]: field === 'quantity' ? Math.max(0, parseInt(val, 10) || 0) : val,
          };
        }
        return item;
      })
    );
  };

  // Key Features
  const handleFeatureChange = (index: number, val: string) => {
    const updated = [...formData.key_features];
    updated[index] = val;
    setFormData(prev => ({ ...prev, key_features: updated }));
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, key_features: [...prev.key_features, ''] }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      key_features: prev.key_features.filter((_, i) => i !== index),
    }));
  };

  // Specs
  const handleSpecChange = (index: number, field: 'custom_label' | 'attribute_value', val: string) => {
    const updated = [...specsList];
    updated[index] = { ...updated[index], [field]: val };
    setSpecsList(updated);
  };

  const addSpec = () => {
    setSpecsList(prev => [...prev, { custom_label: '', attribute_value: '' }]);
  };

  const removeSpec = (index: number) => {
    setSpecsList(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate Margin
  const profitMargin =
    formData.selling_price > 0 && formData.purchase_cost > 0
      ? (((Number(formData.discount_price || formData.selling_price) - Number(formData.purchase_cost)) /
          Number(formData.discount_price || formData.selling_price)) *
          100).toFixed(1)
      : '0.0';

  const totalUnits = inventoryList.reduce((sum, inv) => sum + (Number(inv.quantity) || 0), 0);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || !formData.selling_price) {
      showToast('error', 'Please fill in required fields: Product Name, SKU, and Selling Price');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        ...formData,
        purchase_cost: Number(formData.purchase_cost),
        selling_price: Number(formData.selling_price),
        discount_price: formData.discount_price ? Number(formData.discount_price) : null,
        brand_id: Number(formData.brand_id),
        category_id: Number(formData.category_id),
        inventory: inventoryList,
        specs: specsList.filter(s => s.custom_label.trim() && s.attribute_value.trim()),
        key_features: formData.key_features.filter(f => f.trim().length > 0),
      };

      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update product');

      showToast('success', 'Product updated successfully!');
      setTimeout(() => {
        router.push('/admin/products');
      }, 1200);
    } catch (err: any) {
      showToast('error', err.message || 'Error updating product');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Loading Product Specifications &amp; Inventory...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-white" />
          ) : (
            <AlertCircle className="w-4 h-4 text-white" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-500 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Products Catalogue
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <span>Edit Product</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-normal">
              #{productId}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Update pricing, specifications, multi-branch stock levels, and SEO metadata.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/product/${formData.slug}`}
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>Storefront View</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ── SECTION 1: CORE INFORMATION ── */}
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Package className="w-4 h-4 text-brand-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              1. Basic Identification &amp; Publishing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Product Name */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. HP Pro Tower 290 G9 Core i5 13th Gen Desktop PC"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Catalogue Visibility
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="published">Published (Visible on Store)</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Stock Status / Product Availability */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Product Stock Status / Availability <span className="text-brand-500">*</span>
              </label>
              <select
                name="stock_status"
                value={formData.stock_status || 'In Stock'}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-brand-600 dark:text-brand-400 font-bold focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="In Stock">In Stock</option>
                <option value="Out Of Stock">Out Of Stock</option>
                <option value="Pre-Order">Pre-Order</option>
                <option value="Up Coming">Up Coming</option>
                <option value="2-3 Days">2-3 Days</option>
                <option value="Call for Price">Call for Price</option>
              </select>
            </div>

            {/* SKU */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Stock Keeping Unit (SKU) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g. DESK-HP-290G9-I5"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white font-bold focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            {/* URL Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                URL Slug
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="hp-pro-tower-290-g9-core-i5"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Model */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Model Number
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g. Pro Tower 290 G9"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Barcode / EAN */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Barcode / EAN-13
              </label>
              <div className="relative">
                <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  placeholder="e.g. 197029384721"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Warranty Period */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Warranty Period
              </label>
              <input
                type="text"
                name="warranty_period"
                value={formData.warranty_period}
                onChange={handleChange}
                placeholder="e.g. 3 Years Official Replacement Warranty"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Flags */}
            <div className="flex items-center gap-6 pt-5 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="rounded border-slate-300 dark:border-slate-700 text-brand-500 focus:ring-brand-400 w-4 h-4"
                />
                <span>⭐ Featured / Trending on Homepage</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  name="is_hot"
                  checked={formData.is_hot}
                  onChange={handleChange}
                  className="rounded border-slate-300 dark:border-slate-700 text-rose-500 focus:ring-rose-400 w-4 h-4"
                />
                <span>🔥 Hot Deal Badge</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  name="is_new"
                  checked={formData.is_new}
                  onChange={handleChange}
                  className="rounded border-slate-300 dark:border-slate-700 text-brand-500 focus:ring-brand-400 w-4 h-4"
                />
                <span>✨ New Arrival Badge</span>
              </label>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: CATEGORY & BRAND ── */}
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Layers className="w-4 h-4 text-brand-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              2. Categorization &amp; Brand Relationship
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Product Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Manufacturer Brand <span className="text-rose-500">*</span>
              </label>
              <select
                name="brand_id"
                value={formData.brand_id}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                {brands.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* PC Builder Compatibility */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>PC Builder Component?</span>
              </label>
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_pc_builder"
                    checked={formData.is_pc_builder}
                    onChange={handleChange}
                    className="rounded border-slate-300 dark:border-slate-700 text-brand-500 w-4 h-4"
                  />
                  <span>Enable for PC Customizer</span>
                </label>
              </div>

              {formData.is_pc_builder && (
                <div className="pt-2">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    Slot Assignment (Auto-detected from category if empty):
                  </label>
                  <select
                    name="pc_builder_component"
                    value={formData.pc_builder_component || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="">Auto-Detect from Category</option>
                    <option value="cpu">Processor (CPU)</option>
                    <option value="motherboard">Motherboard</option>
                    <option value="cooler">CPU Cooler</option>
                    <option value="ram">RAM (Desktop Memory)</option>
                    <option value="storage">Storage (SSD / HDD)</option>
                    <option value="gpu">Graphics Card (GPU)</option>
                    <option value="psu">Power Supply (PSU)</option>
                    <option value="case">PC Case / Casing</option>
                    <option value="monitor">Monitor / Display</option>
                    <option value="keyboard">Keyboard</option>
                    <option value="mouse">Gaming Mouse</option>
                    <option value="ups">UPS (Power Backup)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── SECTION 3: PRICING & MARGINS ── */}
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                3. Financials, Pricing &amp; Profit Margin
              </h2>
            </div>
            <div className="text-xs px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold">
              Estimated Margin: +{profitMargin}%
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Purchase Cost */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Purchase / Cost Price (৳)
              </label>
              <input
                type="number"
                name="purchase_cost"
                value={formData.purchase_cost}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                min={0}
              />
            </div>

            {/* Regular Selling Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Regular Selling Price (৳) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="selling_price"
                value={formData.selling_price}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono font-black text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                min={0}
                required
              />
            </div>

            {/* Special Discount Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Special Offer / Discount Price (৳)
              </label>
              <input
                type="number"
                name="discount_price"
                value={formData.discount_price}
                onChange={handleChange}
                placeholder="Optional promo price"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-brand-500"
                min={0}
              />
            </div>
          </div>
        </div>

        {/* ── SECTION 4: MULTI-BRANCH INVENTORY ── */}
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-cyan-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                4. Multi-Location Stock Distribution ({totalUnits} Total Units)
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {inventoryList.map(inv => (
              <div
                key={inv.branch_id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {inv.branch_name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                    {inv.branch_code}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Stock Quantity (Units)
                  </label>
                  <input
                    type="number"
                    value={inv.quantity}
                    onChange={e => handleInventoryChange(inv.branch_id, 'quantity', e.target.value)}
                    className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white"
                    min={0}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Physical Shelf / Bin Location
                  </label>
                  <input
                    type="text"
                    value={inv.shelf_location}
                    onChange={e => handleInventoryChange(inv.branch_id, 'shelf_location', e.target.value)}
                    placeholder="e.g. SHELF-A-01"
                    className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-[11px] font-mono text-slate-700 dark:text-slate-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 5: MEDIA & IMAGES ── */}
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <ImageIcon className="w-4 h-4 text-purple-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              5. Product Images &amp; Visuals
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Primary High-Res Image URL
              </label>
              <input
                type="text"
                name="primary_image"
                value={formData.primary_image}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/... or /images/..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-brand-500"
              />
              <p className="text-[11px] text-slate-400">
                Provide a direct CDN link or static image path for high resolution showcase.
              </p>
            </div>

            {/* Live Image Preview */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[140px]">
              {formData.primary_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={formData.primary_image}
                  alt={formData.name || 'Product Preview'}
                  className="max-h-28 max-w-full object-contain rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-center text-slate-400 text-xs">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <span>No image specified</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── SECTION 6: KEY FEATURES & OVERVIEW ── */}
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              6. Overview &amp; Key Highlights
            </h2>
          </div>

          {/* Overview */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Detailed Product Overview / Marketing Summary
            </label>
            <textarea
              name="overview"
              value={formData.overview}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the product's engineering, performance capabilities, and target use cases..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Key Features List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Key Bullet Points (Quick Specs)
              </label>
              <button
                type="button"
                onClick={addFeature}
                className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Point
              </button>
            </div>

            <div className="space-y-2">
              {formData.key_features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={e => handleFeatureChange(idx, e.target.value)}
                    placeholder="e.g. 13th Gen Intel Core i5-13400 Processor (10 Cores, 16 Threads)"
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                  {formData.key_features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(idx)}
                      className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove feature point"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SECTION 7: TECHNICAL SPECIFICATIONS ── */}
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                7. Technical Specifications Table
              </h2>
            </div>
            <button
              type="button"
              onClick={addSpec}
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Specification
            </button>
          </div>

          <div className="space-y-2.5">
            {specsList.map((spec, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="text"
                  value={spec.custom_label}
                  onChange={e => handleSpecChange(idx, 'custom_label', e.target.value)}
                  placeholder="Attribute (e.g. Processor)"
                  className="w-1/3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
                <input
                  type="text"
                  value={spec.attribute_value}
                  onChange={e => handleSpecChange(idx, 'attribute_value', e.target.value)}
                  placeholder="Value (e.g. Intel Core i7-13700 16-Core up to 5.2GHz)"
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={() => removeSpec(idx)}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Remove spec"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 8: SEO & SEARCH METADATA ── */}
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Search className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              8. Search Engine Optimization (SEO)
            </h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                SEO Meta Title
              </label>
              <input
                type="text"
                name="meta_title"
                value={formData.meta_title}
                onChange={handleChange}
                placeholder="Product Title | CORENIX Bangladesh"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                SEO Meta Description
              </label>
              <textarea
                name="meta_desc"
                value={formData.meta_desc}
                onChange={handleChange}
                rows={2}
                placeholder="Meta description for Google search snippet..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* ── STICKY BOTTOM SAVE BAR ── */}
        <div className="sticky bottom-4 z-40 p-4 rounded-2xl bg-white/95 dark:bg-navy-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-2xl">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Editing <strong className="text-slate-900 dark:text-white">{formData.name || 'Product'}</strong> (SKU: {formData.sku})
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
