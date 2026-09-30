import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const suppliers = await query<any[]>(
      `SELECT s.*,
              (SELECT COUNT(*) FROM purchase_orders WHERE supplier_id = s.id) as total_pos,
              (SELECT COALESCE(SUM(total_amount), 0) FROM purchase_orders WHERE supplier_id = s.id) as total_purchased
       FROM suppliers s
       ORDER BY s.is_active DESC, s.name ASC`
    );

    return NextResponse.json({ success: true, suppliers: suppliers || [] });
  } catch (error: any) {
    console.error('Fetch suppliers error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, code, contactPerson, phone, email, address, paymentTerms = 'Net 30', taxId } = body;

    if (!name || !code || !phone) {
      return NextResponse.json({ success: false, error: 'Name, Code, and Phone are required.' }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().trim();

    // Check duplicate code
    const existing = await queryOne<any>(`SELECT id FROM suppliers WHERE code = ?`, [cleanCode]);
    if (existing) {
      return NextResponse.json({ success: false, error: 'A supplier with this code already exists.' }, { status: 409 });
    }

    const result = await query<any>(
      `INSERT INTO suppliers (name, code, contact_person, phone, email, address, payment_terms, tax_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [name.trim(), cleanCode, contactPerson || null, phone.trim(), email || null, address || null, paymentTerms, taxId || null]
    );

    const newId = (result as any).insertId;

    await logAudit({
      module: 'suppliers',
      action: 'create_supplier',
      recordId: newId,
      newData: { name, code: cleanCode, contactPerson, phone },
    });

    return NextResponse.json({ success: true, message: 'Supplier registered successfully', supplierId: newId });
  } catch (error: any) {
    console.error('Create supplier error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create supplier' }, { status: 500 });
  }
}
