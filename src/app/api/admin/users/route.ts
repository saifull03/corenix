import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query, queryOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const users = await query<any[]>(
      `SELECT u.id, u.name, u.email, u.phone, u.role_id, u.branch_id, u.status, u.avatar, u.created_at,
              r.name as role_name, r.slug as role_slug, r.description as role_description,
              b.name as branch_name, b.code as branch_code
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN branches b ON u.branch_id = b.id
       ORDER BY u.role_id ASC, u.name ASC`
    );

    const roles = await query<any[]>(`SELECT * FROM roles ORDER BY id ASC`);
    const branches = await query<any[]>(`SELECT id, name, code FROM branches WHERE is_active = 1`);

    return NextResponse.json({ success: true, users: users || [], roles: roles || [], branches: branches || [] });
  } catch (error: any) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password, roleId, branchId } = body;

    if (!name || !email || !password || !roleId) {
      return NextResponse.json({ success: false, error: 'Name, Email, Password, and Role are required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check duplicate email
    const existing = await queryOne<any>(`SELECT id FROM users WHERE LOWER(email) = ?`, [cleanEmail]);
    if (existing) {
      return NextResponse.json({ success: false, error: 'A staff user with this email already exists.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query<any>(
      `INSERT INTO users (name, email, phone, password_hash, role_id, branch_id, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [name.trim(), cleanEmail, phone ? phone.trim() : null, passwordHash, roleId, branchId || null]
    );

    const newId = (result as any).insertId;

    await logAudit({
      module: 'users',
      action: 'create_staff_user',
      recordId: newId,
      newData: { name, email: cleanEmail, roleId, branchId },
    });

    return NextResponse.json({ success: true, message: 'Staff user created successfully', userId: newId });
  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'ID and status required' }, { status: 400 });
    }

    await query(`UPDATE users SET status = ? WHERE id = ?`, [status, id]);
    await logAudit({ module: 'users', action: 'update_user_status', recordId: id, newData: { status } });

    return NextResponse.json({ success: true, message: 'User status updated' });
  } catch (error: any) {
    console.error('Update user status error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}
