import { NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch customer's orders
    const orders = await query<any[]>(
      `SELECT o.id, o.order_number, o.branch_id, o.order_status, o.payment_status,
              o.payment_method, o.total_amount, o.created_at, b.name as branch_name,
              COUNT(oi.id) as item_count
       FROM orders o
       LEFT JOIN branches b ON o.branch_id = b.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.customer_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [customer.id]
    );

    // Fetch customer's RMA tickets
    const rmaCases = await query<any[]>(
      `SELECT r.id, r.rma_number, r.serial_number, r.problem_description,
              r.warranty_status, r.status, r.created_at, p.name as product_name
       FROM rma_cases r
       LEFT JOIN products p ON r.product_id = p.id
       WHERE r.customer_id = ?
       ORDER BY r.created_at DESC`,
      [customer.id]
    );

    // Fetch saved addresses
    const addresses = await query<any[]>(
      `SELECT id, title, full_name, phone, address_line1, address_line2, city, zone, is_default
       FROM customer_addresses
       WHERE customer_id = ?
       ORDER BY is_default DESC, id DESC`,
      [customer.id]
    );

    return NextResponse.json({
      success: true,
      customer,
      orders: orders || [],
      rmaCases: rmaCases || [],
      addresses: addresses || [],
    });
  } catch (error: any) {
    console.error('Account data fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load account data' }, { status: 500 });
  }
}
