import React from 'react';
import { query } from '@/lib/db';
import { FileText, Shield, User, Clock, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminActivityLogPage() {
  const logs = await query<any[]>(
    `SELECT * FROM audit_logs ORDER BY id DESC LIMIT 50`
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            System Compliance & Security
          </span>
          <h1 className="text-2xl font-black text-white">
            Enterprise Audit Trail ({logs.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log of all catalogue modifications, price updates, stock movements, and user approvals.
          </p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User & Role</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Details / Payload</th>
                <th className="py-3 px-4 text-center">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-white block">{l.user_name || 'System Administrator'}</span>
                    <span className="text-[10px] text-brand-400">{l.role_name || 'Super Admin'}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-semibold">
                    {l.module}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-white font-medium">
                      {l.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 max-w-xs font-mono text-[11px] text-slate-400 truncate" title={l.new_data_json}>
                    {l.new_data_json || 'System Event'}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-500">
                    {l.ip_address || '127.0.0.1'}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No activity logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
