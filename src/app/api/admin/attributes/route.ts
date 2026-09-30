import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const groups = await query<any[]>(
      `SELECT * FROM attribute_groups ORDER BY order_index ASC, id ASC`
    );

    const attributes = await query<any[]>(
      `SELECT a.*, ag.name as group_name
       FROM attributes a
       LEFT JOIN attribute_groups ag ON a.group_id = ag.id
       ORDER BY a.group_id ASC, a.order_index ASC, a.name ASC`
    );

    return NextResponse.json({ success: true, groups: groups || [], attributes: attributes || [] });
  } catch (error: any) {
    console.error('Fetch attributes error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch attributes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, code, groupId, inputType = 'text', isFilterable = true, isRequired = false } = body;

    if (!name || !code) {
      return NextResponse.json({ success: false, error: 'Name and Code are required' }, { status: 400 });
    }

    const cleanCode = code.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');

    // Check duplicate code
    const existing = await queryOne<any>(`SELECT id FROM attributes WHERE code = ?`, [cleanCode]);
    if (existing) {
      return NextResponse.json({ success: false, error: 'An attribute with this code already exists' }, { status: 409 });
    }

    const result = await query<any>(
      `INSERT INTO attributes (group_id, name, code, input_type, is_filterable, is_required)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [groupId || 1, name.trim(), cleanCode, inputType, isFilterable ? 1 : 0, isRequired ? 1 : 0]
    );

    const newId = (result as any).insertId;

    await logAudit({
      module: 'attributes',
      action: 'create_attribute',
      recordId: newId,
      newData: { name, code: cleanCode, groupId, inputType },
    });

    return NextResponse.json({ success: true, message: 'Attribute created successfully', attributeId: newId });
  } catch (error: any) {
    console.error('Create attribute error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create attribute' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Attribute ID required' }, { status: 400 });
    }

    await query(`DELETE FROM attributes WHERE id = ?`, [id]);
    await logAudit({ module: 'attributes', action: 'delete_attribute', recordId: Number(id) });

    return NextResponse.json({ success: true, message: 'Attribute deleted' });
  } catch (error: any) {
    console.error('Delete attribute error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete attribute' }, { status: 500 });
  }
}
