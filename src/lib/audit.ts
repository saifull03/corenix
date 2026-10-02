import { query } from './db';
import { getCurrentUser } from './auth';

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
    let finalUserId = userId;
    let finalUserName = userName;
    let finalRoleName = roleName;

    // Auto-resolve current logged-in staff user if not explicitly passed
    if (!finalUserId) {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          finalUserId = currentUser.id;
          finalUserName = currentUser.name;
          finalRoleName = (currentUser as any).role_name || (currentUser as any).role_slug || 'Super Admin';
        }
      } catch (authErr) {
        // Fallback in background/cron contexts
      }
    }

    await query(
      `INSERT INTO audit_logs (
        user_id, user_name, role_name, module, action, record_id,
        old_data_json, new_data_json, ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        finalUserId || null,
        finalUserName || 'System Administrator',
        finalRoleName || 'Super Admin',
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
