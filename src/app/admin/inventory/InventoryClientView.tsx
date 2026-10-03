'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  QrCode,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  X,
  Copy,
  ExternalLink,
  ChevronRight,
  Package,
  Building2,
  ArrowRightLeft,
  RefreshCw,
  Barcode
} from 'lucide-react';

interface ProductData {
  id: number;
  name: string;
  sku: string;
  barcode?: string;
  selling_price: number;
  purchase_cost: number;
  category_name?: string;
  brand_name?: string;
  wh_qty: number;
  shop1_qty: number;
  shop2_qty: number;
  rma_qty: number;
  total_avail_serials: number;
  wh_avail_serials: number;
  shop1_avail_serials: number;
  shop2_avail_serials: number;
}

interface BranchData {
  id: number;
  name: string;
  code: string;
  address?: string;
}

export default function InventoryClientView({
  products,
  branches,
}: {
  products: ProductData[];
  branches: BranchData[];
}) {
  const [activeTab, setActiveTab] = useState<'matrix' | 'serials'>('matrix');
  const [searchMatrix, setSearchMatrix] = useState('');

  // Serial Directory State
  const [serialSearch, setSerialSearch] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('available');
  const [serialsList, setSerialsList] = useState<any[]>([]);
  const [loadingSerials, setLoadingSerials] = useState(false);
  const [serialPage, setSerialPage] = useState(1);
  const [totalSerials, setTotalSerials] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [copiedSerial, setCopiedSerial] = useState<string | null>(null);

  // Active Product Serial Modal
  const [modalProduct, setModalProduct] = useState<ProductData | null>(null);
  const [modalSerials, setModalSerials] = useState<any[]>([]);
  const [loadingModalSerials, setLoadingModalSerials] = useState(false);
  const [modalSearch, setModalSearch] = useState('');

  // Fetch serials list when serials tab is active
  const fetchSerialsList = async () => {
    try {
      setLoadingSerials(true);
      const params = new URLSearchParams({
        page: String(serialPage),
        limit: '50',
        search: serialSearch.trim(),
        status: selectedStatusFilter,
      });
      if (selectedBranchFilter !== 'all') {
        params.append('branchId', selectedBranchFilter);
      }

      const res = await fetch(`/api/admin/inventory/serials?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSerialsList(data.serials || []);
        setTotalSerials(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (e) {
      console.error('Error fetching serials directory:', e);
    } finally {
      setLoadingSerials(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'serials') {
      fetchSerialsList();
    }
  }, [activeTab, serialPage, serialSearch, selectedBranchFilter, selectedStatusFilter]);

  // Open Product Serials Modal
  const openProductSerialsModal = async (p: ProductData) => {
    setModalProduct(p);
    setModalSearch('');
    try {
      setLoadingModalSerials(true);
      const res = await fetch(`/api/admin/inventory/serials?productId=${p.id}&limit=200`);
      const data = await res.json();
      if (data.success) {
        setModalSerials(data.serials || []);
      }
    } catch (e) {
      console.error('Error fetching product serials:', e);
    } finally {
      setLoadingModalSerials(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSerial(text);
    setTimeout(() => setCopiedSerial(null), 2000);
  };

  // Filtered Matrix Products
  const filteredProducts = products.filter((p) => {
    const q = searchMatrix.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.brand_name && p.brand_name.toLowerCase().includes(q)) ||
      (p.category_name && p.category_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* View Switcher Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-1.5 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'matrix'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Stock Matrix & Location Quantities</span>
          </button>

          <button
            onClick={() => setActiveTab('serials')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'serials'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Serial Numbers Directory & Scanner</span>
          </button>
        </div>

        <div className="text-xs font-mono text-slate-500 dark:text-slate-400 px-3">
          {products.length} Products Cataloged
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: STOCK MATRIX                                      */}
      {/* ======================================================== */}
      {activeTab === 'matrix' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchMatrix}
                onChange={(e) => setSearchMatrix(e.target.value)}
                placeholder="Search products by title, SKU, brand..."
                className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-sky-500 transition-colors"
              />
              {searchMatrix && (
                <button
                  onClick={() => setSearchMatrix('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-900 dark:text-white">{filteredProducts.length}</span> products
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Item & SKU</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4 text-center">WH-MAIN</th>
                  <th className="py-3 px-4 text-center">Shop 1 (Uttara)</th>
                  <th className="py-3 px-4 text-center">Shop 2 (Dhanmondi)</th>
                  <th className="py-3 px-4 text-center">Total Stock</th>
                  <th className="py-3 px-4 text-center">Verified Serials</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredProducts.map((p) => {
                  const total = (p.wh_qty || 0) + (p.shop1_qty || 0) + (p.shop2_qty || 0) + (p.rma_qty || 0);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">{p.name}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">SKU: {p.sku}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {p.brand_name || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        <span className={(p.wh_qty || 0) <= 0 ? 'text-rose-500' : 'text-slate-800 dark:text-slate-200'}>
                          {p.wh_qty || 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        <span className={(p.shop1_qty || 0) <= 0 ? 'text-rose-500 font-black' : 'text-emerald-600 dark:text-emerald-400'}>
                          {p.shop1_qty || 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        <span className={(p.shop2_qty || 0) <= 0 ? 'text-rose-500 font-black' : 'text-emerald-600 dark:text-emerald-400'}>
                          {p.shop2_qty || 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full font-black text-xs font-mono ${
                          total <= 0
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400'
                            : total <= 10
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-white'
                        }`}>
                          {total} Units
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-xl bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400 font-mono font-black text-xs inline-flex items-center gap-1.5">
                          <QrCode className="w-3.5 h-3.5" />
                          <span>{p.total_avail_serials} Serials</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openProductSerialsModal(p)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Serials</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: SERIAL NUMBERS DIRECTORY & SCANNER                */}
      {/* ======================================================== */}
      {activeTab === 'serials' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={serialSearch}
                onChange={(e) => {
                  setSerialSearch(e.target.value);
                  setSerialPage(1);
                }}
                placeholder="Search serial number, barcode, product name, or SKU..."
                className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-sky-500 transition-colors"
              />
              {serialSearch && (
                <button
                  onClick={() => {
                    setSerialSearch('');
                    setSerialPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Branch Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedBranchFilter}
                onChange={(e) => {
                  setSelectedBranchFilter(e.target.value);
                  setSerialPage(1);
                }}
                className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="all">All Branches & Locations</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedStatusFilter}
                onChange={(e) => {
                  setSelectedStatusFilter(e.target.value);
                  setSerialPage(1);
                }}
                className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="available">Status: Available In Stock</option>
                <option value="sold">Status: Sold / Dispatched</option>
                <option value="reserved">Status: Reserved</option>
                <option value="rma">Status: RMA / Warranty</option>
                <option value="all">Status: All Statuses</option>
              </select>
            </div>
          </div>

          {/* Serials Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            {loadingSerials ? (
              <div className="py-16 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-sky-600 dark:text-cyan-400" />
                <span>Loading serials...</span>
              </div>
            ) : serialsList.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs">
                <QrCode className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
                <p className="font-bold text-slate-700 dark:text-slate-300">No serial numbers found</p>
                <p className="text-[11px] text-slate-400 mt-1">Try adjusting your search query or filters.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Serial Number</th>
                    <th className="py-3 px-4">Barcode</th>
                    <th className="py-3 px-4">Product Name & SKU</th>
                    <th className="py-3 px-4">Current Branch</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {serialsList.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{s.serial_number}</span>
                          <button
                            onClick={() => copyToClipboard(s.serial_number)}
                            title="Copy Serial Number"
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                          >
                            {copiedSerial === s.serial_number ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                        {s.barcode || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">{s.product_name}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">SKU: {s.product_sku}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{s.branch_name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{s.branch_code}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            s.status === 'available'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400'
                              : s.status === 'sold'
                              ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-400'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href="/admin/inventory/transfer"
                          className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400 font-bold text-[11px] hover:bg-sky-100 transition-colors inline-flex items-center gap-1"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>Transfer</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Page <span className="font-bold text-slate-900 dark:text-white">{serialPage}</span> of{' '}
                <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span> ({totalSerials} Total Serials)
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={serialPage <= 1}
                  onClick={() => setSerialPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Previous
                </button>
                <button
                  disabled={serialPage >= totalPages}
                  onClick={() => setSerialPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: VIEW ALL SERIALS FOR A SPECIFIC PRODUCT           */}
      {/* ======================================================== */}
      {modalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/20 border border-sky-200 dark:border-sky-500/40 flex items-center justify-center text-sky-600 dark:text-cyan-400 shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {modalProduct.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    <span>SKU: {modalProduct.sku}</span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {modalSerials.length} Registered Serials
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setModalProduct(null)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="Filter serial numbers or barcodes..."
                  className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Serials List */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-100 dark:divide-slate-800/60">
              {loadingModalSerials ? (
                <div className="py-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-600 dark:text-cyan-400" />
                  <span>Loading serials...</span>
                </div>
              ) : (
                modalSerials
                  .filter((s) => {
                    const q = modalSearch.trim().toLowerCase();
                    if (!q) return true;
                    return (
                      s.serial_number.toLowerCase().includes(q) ||
                      (s.barcode && s.barcode.toLowerCase().includes(q)) ||
                      (s.branch_name && s.branch_name.toLowerCase().includes(q))
                    );
                  })
                  .map((s) => (
                    <div
                      key={s.id}
                      className="pt-2 pb-2 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 p-2 rounded-xl transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                            {s.serial_number}
                          </span>
                          <button
                            onClick={() => copyToClipboard(s.serial_number)}
                            title="Copy"
                            className="p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          >
                            {copiedSerial === s.serial_number ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span>Barcode: {s.barcode || 'N/A'}</span>
                          <span>•</span>
                          <span>Location: {s.branch_name} ({s.branch_code})</span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          s.status === 'available'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400'
                            : s.status === 'sold'
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                  ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex justify-end">
              <button
                onClick={() => setModalProduct(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
