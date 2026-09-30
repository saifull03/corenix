import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const pos = await query<any[]>(
      `SELECT po.*,
              s.name as supplier_name, s.code as supplier_code, s.contact_person, s.phone as supplier_phone,
              b.name as branch_name, b.code as branch_code
       FROM purchase_orders po
       JOIN suppliers s ON po.supplier_id = s.id
       JOIN branches b ON po.branch_id = b.id
       ORDER BY po.created_at DESC`
    );

    const suppliers = await query<any[]>(`SELECT id, name, code, payment_terms FROM suppliers WHERE is_active = 1`);
    const branches = await query<any[]>(`SELECT id, name, code FROM branches WHERE is_active = 1`);

    return NextResponse.json({ success: true, purchaseOrders: pos || [], suppliers: suppliers || [], branches: branches || [] });
  } catch (error: any) {
    console.error('Fetch purchases error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch purchases' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { supplierId, branchId, totalAmount, paidAmount = 0, transportCost = 0, notes } = body;

    if (!supplierId || !branchId || !totalAmount) {
      return NextResponse.json({ success: false, error: 'Supplier, Branch, and Total Amount are required.' }, { status: 400 });
    }

    const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await query<any>(
      `INSERT INTO purchase_orders (
        po_number, supplier_id, branch_id, status, total_amount, paid_amount,
        transport_cost, notes, created_by
      ) VALUES (?, ?, ?, 'ordered', ?, ?, ?, ?, 1)`,
      [poNumber, supplierId, branchId, totalAmount, paidAmount, transportCost, notes || null]
    );

    const newId = (result as any).insertId;

    await logAudit({
      module: 'purchases',
      action: 'create_purchase_order',
      recordId: newId,
      newData: { poNumber, supplierId, totalAmount },
    });

    return NextResponse.json({ success: true, message: 'Purchase Order created', poNumber, id: newId });
  } catch (error: any) {
    console.error('Create purchase order error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create purchase order' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'ID and status required' }, { status: 400 });
    }

    await query(`UPDATE purchase_orders SET status = ? WHERE id = ?`, [status, id]);
    await logAudit({ module: 'purchases', action: 'update_po_status', recordId: id, newData: { status } });

    return NextResponse.json({ success: true, message: 'PO status updated' });
  } catch (error: any) {
    console.error('Update purchase error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update PO' }, { status: 500 });
  }
}
