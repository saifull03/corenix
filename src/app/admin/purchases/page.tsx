'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Building2,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  RefreshCw,
  Search
} from 'lucide-react';

export default function AdminPurchasesPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Form states
  const [supplierId, setSupplierId] = useState<number>(1);
  const [branchId, setBranchId] = useState<number>(1);
  const [totalAmount, setTotalAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [transportCost, setTransportCost] = useState('0');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/purchases');
      const data = await res.json();
      if (data.success) {
        setPurchaseOrders(data.purchaseOrders);
        setSuppliers(data.suppliers);
        setBranches(data.branches);
        if (data.suppliers.length > 0) setSupplierId(data.suppliers[0].id);
        if (data.branches.length > 0) setBranchId(data.branches[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          branchId,
          totalAmount: parseFloat(totalAmount),
          paidAmount: parseFloat(paidAmount || '0'),
          transportCost: parseFloat(transportCost || '0'),
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to create PO');
        setSubmitting(false);
        return;
      }

      setTotalAmount('');
      setPaidAmount('');
      setNotes('');
      setIsModalOpen(false);
      fetchPurchases();
    } catch (err) {
      setErrorMsg('Failed to create purchase order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await fetch('/api/admin/purchases', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchPurchases();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = purchaseOrders.filter((po) => {
    const q = search.toLowerCase();
    return (
      po.po_number?.toLowerCase().includes(q) ||
      po.supplier_name?.toLowerCase().includes(q) ||
      po.branch_name?.toLowerCase().includes(q)
    );
  });

  const totalSpent = purchaseOrders.reduce((sum, po) => sum + Number(po.total_amount || 0), 0);
  const totalDue = purchaseOrders.reduce(
    (sum, po) => sum + (Number(po.total_amount || 0) - Number(po.paid_amount || 0)),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-cyan-400">
            Supply Chain & Procurement
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-sky-600 dark:text-cyan-400" />
            <span>Purchases & Vendor Procurement</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Procure hardware stock from authorized brand distributors into Central Warehouse (Tejgaon) and Showrooms.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-sky-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Total POs</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {purchaseOrders.length}
          </span>
          <span className="text-[10px] text-sky-600 dark:text-cyan-400 font-semibold">Procurement pipeline</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Procurement Invoiced</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            ৳{totalSpent.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Total hardware value</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Vendor Payables Due</span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
            ৳{totalDue.toLocaleString()}
          </span>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">Outstanding to suppliers</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Active Distributors</span>
          <span className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
            {suppliers.length} Partners
          </span>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Global Brand, Smart, etc.</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search PO #, Supplier, or Branch..."
            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 pl-10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
          />
        </div>

        <button
          onClick={fetchPurchases}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* PO Table */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">PO Number</th>
                <th className="py-3.5 px-4">Supplier Partner</th>
                <th className="py-3.5 px-4">Receiving Location</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Total Cost</th>
                <th className="py-3.5 px-4">Paid / Due</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No purchase orders recorded yet. Click "New Purchase Order" to procure inventory.
                  </td>
                </tr>
              ) : (
                filtered.map((po) => {
                  const due = Number(po.total_amount) - Number(po.paid_amount || 0);
                  return (
                    <tr key={po.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {po.po_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">{po.supplier_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{po.supplier_code}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{po.branch_name}</span>
                        <span className="text-[10px] text-sky-600 dark:text-cyan-400 block font-mono">{po.branch_code}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            po.status === 'received'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : po.status === 'ordered'
                              ? 'bg-sky-50 text-sky-700 dark:bg-cyan-950 dark:text-cyan-300 border border-sky-200 dark:border-cyan-800'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                        ৳{Number(po.total_amount).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold block">
                          Paid: ৳{Number(po.paid_amount || 0).toLocaleString()}
                        </span>
                        {due > 0 && (
                          <span className="text-rose-600 dark:text-rose-400 text-[10px] font-bold block">
                            Due: ৳{due.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(po.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {po.status !== 'received' && (
                          <button
                            onClick={() => handleStatusUpdate(po.id, 'received')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold transition-colors"
                          >
                            Mark Received
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create PO Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                <span>Issue Supplier Purchase Order</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreatePO} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier / Distributor Partner *
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id} className="dark:bg-navy-900">
                      {s.name} ({s.code}) - {s.payment_terms}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Receiving Destination Facility *
                </label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} className="dark:bg-navy-900">
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Total Order Value (৳) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="150000"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Paid Amount (৳)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder="50000"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Procurement Notes / Batch Details
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 10x RTX 5060 GPUs, 20x DDR5 32GB Kits"
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Generating...' : 'Issue PO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
