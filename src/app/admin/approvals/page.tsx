'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  ArrowRight,
  User,
  Tag,
  Warehouse
} from 'lucide-react';

export default function AdminApprovalsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/approvals');
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id: number, action: 'approve' | 'reject') => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (data.success) {
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const parseJson = (str: any) => {
    if (!str) return {};
    if (typeof str === 'object') return str;
    try {
      return JSON.parse(str);
    } catch {
      return { raw: str };
    }
  };

  const filtered = requests.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-cyan-400">
            Governance & Approval Workflow
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-sky-600 dark:text-cyan-400" />
            <span>Operator Change Requests & Authorizations</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review and authorize price modifications, stock reconciliations, and catalogue revisions submitted by junior operators.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Pending Approval</span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">{pendingCount}</span>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Requires executive review</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Approved Changes</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{approvedCount}</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Live in database</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Rejected Submissions</span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">{rejectedCount}</span>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">Audited and denied</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Four-Eyes Protocol</span>
          <span className="text-2xl font-black text-sky-600 dark:text-cyan-400 mt-1 block">Active</span>
          <span className="text-[10px] text-sky-600 dark:text-cyan-400 font-semibold">Enterprise safety checks</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
            statusFilter === 'pending'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Pending Queue ({pendingCount})
        </button>
        <button
          onClick={() => setStatusFilter('approved')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
            statusFilter === 'approved'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Approved Archive ({approvedCount})
        </button>
        <button
          onClick={() => setStatusFilter('rejected')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
            statusFilter === 'rejected'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Rejected Archive ({rejectedCount})
        </button>
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
            statusFilter === 'all'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Requests ({requests.length})
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-bold text-slate-700 dark:text-slate-200">No pending operator requests</p>
            <p className="text-xs mt-1">All data updates have been reviewed and committed.</p>
          </div>
        ) : (
          filtered.map((req) => {
            const oldVal = parseJson(req.old_value_json);
            const newVal = parseJson(req.new_value_json);

            return (
              <div
                key={req.id}
                className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center font-bold text-sky-600 dark:text-cyan-400">
                      #{req.id}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white capitalize">
                          {req.action_type.replace('_', ' ')}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {req.module} (ID: #{req.record_id})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>Submitted by <strong className="text-slate-800 dark:text-slate-200">{req.requester_name}</strong> ({req.requester_role})</span>
                        <span>•</span>
                        <span>{new Date(req.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start md:self-center ${
                      req.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : req.status === 'rejected'
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                {/* Diff Viewer */}
                <div className="my-4 p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/40">
                      <span className="text-[10px] font-sans font-bold text-rose-600 uppercase block mb-1">
                        Current Live Value
                      </span>
                      <pre className="text-xs text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(oldVal, null, 2)}
                      </pre>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40">
                      <span className="text-[10px] font-sans font-bold text-emerald-600 uppercase block mb-1">
                        Proposed New Value
                      </span>
                      <pre className="text-xs text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(newVal, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {req.reason && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
                      <span className="font-bold text-slate-500 dark:text-slate-400">Operator Reason: </span>
                      <span className="text-slate-700 dark:text-slate-300 italic">"{req.reason}"</span>
                    </div>
                  )}

                  {req.review_notes && (
                    <div className="mt-1 text-xs text-sky-600 dark:text-cyan-400">
                      <strong>Executive Review Note:</strong> {req.review_notes}
                    </div>
                  )}
                </div>

                {/* Action Buttons for Pending Requests */}
                {req.status === 'pending' && (
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleDecision(req.id, 'reject')}
                      disabled={actionLoading === req.id}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 dark:border-rose-900/60 transition-colors disabled:opacity-50"
                    >
                      Reject Request
                    </button>
                    <button
                      onClick={() => handleDecision(req.id, 'approve')}
                      disabled={actionLoading === req.id}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors disabled:opacity-50"
                    >
                      Approve & Apply to Database
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
