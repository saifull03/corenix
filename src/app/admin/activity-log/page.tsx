import React from 'react';
import Link from 'next/link';
import { query } from '@/lib/db';
import { getCurrentUser, isSuperAdmin } from '@/lib/auth';
import AuditTrailManager from '@/components/admin/AuditTrailManager';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminActivityLogPage() {
  const currentUser = await getCurrentUser();
  const isSuper = isSuperAdmin(currentUser);

  if (!isSuper) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Super Admin Access Required
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The Enterprise Audit Trail and Security Activity Log contains sensitive organizational change data and is strictly restricted to <strong>Super Administrators</strong>.
          </p>
          <div className="pt-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-brand-500 dark:hover:bg-brand-400 text-white dark:text-navy-950 font-bold text-xs transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const logs = await query<any[]>(
    `SELECT * FROM audit_logs ORDER BY id DESC LIMIT 500`
  );

  return <AuditTrailManager initialLogs={logs} />;
}


