import { query } from './db';

export async function logAudit({
  userId,
  userName,
  roleName,
  module,
  action,
  recordId,
  oldData,
  newData,
  ipAddress,
}: {
  userId?: number | null;
  userName?: string;
  roleName?: string;
  module: string;
  action: string;
  recordId?: number | null;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
}) {
  try {
    await query(
      `INSERT INTO audit_logs (
        user_id, user_name, role_name, module, action, record_id,
        old_data_json, new_data_json, ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId || null,
        userName || 'System',
        roleName || 'System',
        module,
        action,
        recordId || null,
        oldData ? JSON.stringify(oldData) : null,
        newData ? JSON.stringify(newData) : null,
        ipAddress || '127.0.0.1',
      ]
    );
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
}
