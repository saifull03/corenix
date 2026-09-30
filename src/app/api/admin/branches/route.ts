import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const branches = await query<any[]>(
      `SELECT b.*,
              (SELECT COUNT(*) FROM users WHERE branch_id = b.id) as staff_count,
              (SELECT COALESCE(SUM(quantity), 0) FROM inventory WHERE branch_id = b.id) as total_units,
              (SELECT COUNT(*) FROM orders WHERE branch_id = b.id AND order_status IN ('pending', 'confirmed', 'processing', 'shipped')) as active_orders
       FROM branches b
       ORDER BY b.id ASC`
    );

    return NextResponse.json({ success: true, branches: branches || [] });
  } catch (error: any) {
    console.error('Fetch branches error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch branches' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, code, type = 'shop', address, phone, email, isActive = true } = body;

    if (!name || !code || !address || !phone) {
      return NextResponse.json(
        { success: false, error: 'Name, Code, Address, and Phone are required.' },
        { status: 400 }
      );
    }

    const cleanCode = code.toUpperCase().trim();

    // Check duplicate code
    const existing = await queryOne<any>(`SELECT id FROM branches WHERE code = ?`, [cleanCode]);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A location with this branch code already exists.' },
        { status: 409 }
      );
    }

    const result = await query<any>(
      `INSERT INTO branches (name, code, type, address, phone, email, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name.trim(), cleanCode, type, address.trim(), phone.trim(), email ? email.trim() : null, isActive ? 1 : 0]
    );

    const newId = (result as any).insertId;

    await logAudit({
      module: 'branches',
      action: 'create_branch',
      recordId: newId,
      newData: { name, code: cleanCode, type, address, phone },
    });

    return NextResponse.json({ success: true, message: 'Branch location created successfully', branchId: newId });
  } catch (error: any) {
    console.error('Create branch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create branch' }, { status: 500 });
  }
}
