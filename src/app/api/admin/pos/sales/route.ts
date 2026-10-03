import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser, isSuperAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q')?.trim() || '';
    const requestedBranchId = searchParams.get('branchId') ? Number(searchParams.get('branchId')) : null;
    const paymentMethod = searchParams.get('paymentMethod');
    const dateRange = searchParams.get('dateRange'); // 'today' | '7days' | '30days' | 'all'
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50;

    // Branch filtering
    let branchId = requestedBranchId;
    if (!isSuperAdmin(user) && user.branch_id) {
      branchId = user.branch_id;
    }

    let sql = `
      SELECT
        o.id,
        o.order_number,
        o.branch_id,
        o.customer_id,
        o.order_type,
        o.order_status,
        o.payment_status,
        o.payment_method,
        o.subtotal,
        o.discount_amount,
        o.tax_amount,
        o.total_amount,
        o.paid_amount,
        o.gross_profit,
        o.shipping_address_json,
        o.notes,
        o.created_by,
        o.created_at,
        b.name as branch_name,
        b.code as branch_code,
        u.name as cashier_name
      FROM orders o
      LEFT JOIN branches b ON o.branch_id = b.id
      LEFT JOIN users u ON o.created_by = u.id
      WHERE o.order_type = 'pos'
    `;

    const params: any[] = [];

    if (branchId) {
      sql += ` AND o.branch_id = ?`;
      params.push(branchId);
    }

    if (paymentMethod && paymentMethod !== 'all') {
      sql += ` AND o.payment_method = ?`;
      params.push(paymentMethod);
    }

    if (dateRange && dateRange !== 'all') {
      if (dateRange === 'today') {
        sql += ` AND DATE(o.created_at) = CURDATE()`;
      } else if (dateRange === '7days') {
        sql += ` AND o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
      } else if (dateRange === '30days') {
        sql += ` AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
      }
    }

    if (search) {
      sql += ` AND (
        o.order_number LIKE ? OR
        o.shipping_address_json LIKE ? OR
        o.notes LIKE ? OR
        o.id IN (
          SELECT order_id FROM order_items
          WHERE product_name LIKE ? OR sku LIKE ? OR serial_number LIKE ?
        )
      )`;
      const wild = `%${search}%`;
      params.push(wild, wild, wild, wild, wild, wild);
    }

    sql += ` ORDER BY o.id DESC LIMIT ?`;
    params.push(limit);

    const orders = await query<any[]>(sql, params);

    // Fetch line items for these orders
    const orderIds = orders.map((o) => o.id);
    let itemsByOrder: Record<number, any[]> = {};

    if (orderIds.length > 0) {
      const placeholders = orderIds.map(() => '?').join(',');
      const items = await query<any[]>(
        `SELECT
          oi.id,
          oi.order_id,
          oi.product_id,
          oi.product_name,
          oi.sku,
          oi.unit_price,
          oi.unit_cost,
          oi.quantity,
          oi.total_price,
          oi.total_cost,
          oi.warranty_details,
          oi.serial_number,
          oi.barcode
        FROM order_items oi
        WHERE oi.order_id IN (${placeholders})`,
        orderIds
      );

      for (const it of items) {
        if (!itemsByOrder[it.order_id]) {
          itemsByOrder[it.order_id] = [];
        }
        itemsByOrder[it.order_id].push(it);
      }
    }

    const enhancedOrders = orders.map((o) => {
      let customerInfo = {
        name: 'Walk-in Customer',
        phone: '01700000000',
        email: '',
        address: '',
      };
      try {
        if (typeof o.shipping_address_json === 'string') {
          const parsed = JSON.parse(o.shipping_address_json);
          customerInfo = {
            name: parsed.full_name || parsed.name || 'Walk-in Customer',
            phone: parsed.phone || 'N/A',
            email: parsed.email || '',
            address: parsed.address || '',
          };
        } else if (o.shipping_address_json) {
          customerInfo = o.shipping_address_json;
        }
      } catch {}

      return {
        ...o,
        customer: customerInfo,
        items: itemsByOrder[o.id] || [],
        total_amount: Number(o.total_amount),
        gross_profit: Number(o.gross_profit || 0),
      };
    });

    return NextResponse.json({
      success: true,
      orders: enhancedOrders,
    });
  } catch (error: any) {
    console.error('Fetch POS sales error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch POS sales history' }, { status: 500 });
  }
}
