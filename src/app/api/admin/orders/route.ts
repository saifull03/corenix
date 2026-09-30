import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let sql = `
      SELECT o.*,
             b.name as branch_name, b.code as branch_code,
             c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      LEFT JOIN branches b ON o.branch_id = b.id
      LEFT JOIN customers c ON o.customer_id = c.id
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      sql += ` WHERE o.order_status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY o.created_at DESC`;

    const orders = await query<any[]>(sql, params);

    // Also get order line items for all orders
    const orderItems = await query<any[]>(
      `SELECT oi.*, p.name as product_name, p.sku
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id`
    );

    const itemsByOrder: Record<number, any[]> = {};
    for (const item of orderItems) {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push(item);
    }

    const enhanced = orders.map((o) => ({
      ...o,
      items: itemsByOrder[o.id] || [],
    }));

    return NextResponse.json({ success: true, orders: enhanced });
  } catch (error: any) {
    console.error('Fetch admin orders error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, orderStatus, paymentStatus } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const oldOrder = await queryOne<any>(`SELECT * FROM orders WHERE id = ?`, [id]);
    if (!oldOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (orderStatus) {
      updates.push('order_status = ?');
      params.push(orderStatus);
    }
    if (paymentStatus) {
      updates.push('payment_status = ?');
      params.push(paymentStatus);
    }

    if (updates.length > 0) {
      params.push(id);
      await query(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, params);

      await logAudit({
        module: 'orders',
        action: 'update_order_status',
        recordId: id,
        oldData: { status: oldOrder.order_status, payment: oldOrder.payment_status },
        newData: { orderStatus, paymentStatus },
      });
    }

    return NextResponse.json({ success: true, message: 'Order status updated successfully' });
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}
