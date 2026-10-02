import React from 'react';
import { query } from '@/lib/db';
import AuditTrailManager from '@/components/admin/AuditTrailManager';

export const dynamic = 'force-dynamic';

export default async function AdminActivityLogPage() {
  const logs = await query<any[]>(
    `SELECT * FROM audit_logs ORDER BY id DESC LIMIT 500`
  );

  return <AuditTrailManager initialLogs={logs} />;
}

