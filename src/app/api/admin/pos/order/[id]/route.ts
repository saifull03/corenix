import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser, isSuperAdmin } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const orderId = Number(resolvedParams.id);

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Invalid order ID' }, { status: 400 });
    }

    const order = await queryOne<any>(
      `SELECT
        o.*,
        b.name as branch_name,
        b.code as branch_code,
        b.address as branch_address,
        b.phone as branch_phone,
        b.email as branch_email,
        u.name as cashier_name,
        r.name as cashier_role
      FROM orders o
      LEFT JOIN branches b ON o.branch_id = b.id
      LEFT JOIN users u ON o.created_by = u.id
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE o.id = ?`,
      [orderId]
    );

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Branch authorization check
    if (!isSuperAdmin(user) && user.branch_id && order.branch_id !== user.branch_id) {
      return NextResponse.json({ success: false, error: 'Access denied to this branch order' }, { status: 403 });
    }

    // Line items
    const items = await query<any[]>(
      `SELECT
        oi.id,
        oi.product_id,
        oi.product_name,
        oi.sku,
        oi.unit_price,
        oi.quantity,
        oi.total_price,
        oi.warranty_details,
        oi.serial_number,
        oi.barcode
      FROM order_items oi
      WHERE oi.order_id = ?`,
      [orderId]
    );

    let customerInfo = {
      name: 'Walk-in Customer',
      phone: '01700000000',
      email: '',
      address: '',
    };
    try {
      if (typeof order.shipping_address_json === 'string') {
        const parsed = JSON.parse(order.shipping_address_json);
        customerInfo = {
          name: parsed.full_name || parsed.name || 'Walk-in Customer',
          phone: parsed.phone || 'N/A',
          email: parsed.email || '',
          address: parsed.address || '',
        };
      } else if (order.shipping_address_json) {
        customerInfo = order.shipping_address_json;
      }
    } catch {}

    const timestamp = new Date(order.created_at);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        date: order.created_at,
        formattedDate: timestamp.toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        branch: {
          id: order.branch_id,
          name: order.branch_name,
          code: order.branch_code,
          address: order.branch_address,
          phone: order.branch_phone,
          email: order.branch_email,
        },
        cashier: {
          id: order.created_by,
          name: order.cashier_name || 'Store Manager',
          role: order.cashier_role || 'Staff',
        },
        customer: customerInfo,
        items: items.map((i) => ({
          ...i,
          unit_price: Number(i.unit_price),
          total_price: Number(i.total_price),
        })),
        subtotal: Number(order.subtotal),
        discount: Number(order.discount_amount),
        tax: Number(order.tax_amount),
        grandTotal: Number(order.total_amount),
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        orderStatus: order.order_status,
        warrantyPolicy: '1-3 Years Official Brand Warranty on Hardware components as indicated on invoice lines.',
        returnPolicy: 'Physical goods once sold can be claimed for warranty or RMA within 7 days with original invoice & serial numbers intact.',
      },
    });
  } catch (error: any) {
    console.error('Fetch POS order error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch POS order details' }, { status: 500 });
  }
}
