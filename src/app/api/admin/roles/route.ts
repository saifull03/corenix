import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { getCurrentUser, isSuperAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const roles = await query<any[]>(
      `SELECT r.*,
              COUNT(DISTINCT u.id) as user_count,
              (SELECT COUNT(*) FROM role_permissions rp WHERE rp.role_id = r.id) as permission_count
       FROM roles r
       LEFT JOIN users u ON u.role_id = r.id
       GROUP BY r.id
       ORDER BY r.id ASC`
    );

    const permissions = await query<any[]>(`SELECT * FROM permissions ORDER BY module ASC, action ASC`);

    return NextResponse.json({
      success: true,
      roles: roles || [],
      permissions: permissions || [],
    });
  } catch (error: any) {
    console.error('Fetch roles error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch roles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !isSuperAdmin(currentUser)) {
      return NextResponse.json(
        { success: false, error: 'Access Denied: Only Super Administrators can create new roles.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, slug, description, permissions } = body;


    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Role name is required.' }, { status: 400 });
    }

    const cleanName = name.trim();
    let baseSlug = (slug || cleanName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!baseSlug) baseSlug = 'role-' + Date.now().toString(36);

    // Check existing role name or slug
    const existing = await queryOne<any>(
      `SELECT id FROM roles WHERE LOWER(name) = ? OR LOWER(slug) = ? LIMIT 1`,
      [cleanName.toLowerCase(), baseSlug.toLowerCase()]
    );

    if (existing) {
      return NextResponse.json({ success: false, error: 'A role with this name or slug already exists.' }, { status: 409 });
    }

    // Insert new role
    const res = await query<any>(
      `INSERT INTO roles (name, slug, description, is_system) VALUES (?, ?, ?, 0)`,
      [cleanName, baseSlug, description ? description.trim() : `Custom role: ${cleanName}`]
    );

    const newRoleId = (res as any).insertId;

    // Optional: assign selected or default permissions
    if (permissions && Array.isArray(permissions) && permissions.length > 0) {
      for (const permId of permissions) {
        await query(`INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`, [newRoleId, permId]);
      }
    } else {
      // Default basic read permissions if available
      const basicPerms = await query<any[]>(`SELECT id FROM permissions WHERE action IN ('view', 'read') LIMIT 5`);
      for (const p of basicPerms) {
        await query(`INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`, [newRoleId, p.id]);
      }
    }

    await logAudit({
      module: 'roles',
      action: 'create_role',
      recordId: newRoleId,
      newData: { name: cleanName, slug: baseSlug, description },
    });

    const newRole = await queryOne<any>(`SELECT * FROM roles WHERE id = ?`, [newRoleId]);

    return NextResponse.json({
      success: true,
      message: 'Role created successfully',
      role: newRole,
    });
  } catch (error: any) {
    console.error('Create role error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create role' }, { status: 500 });
  }
}
