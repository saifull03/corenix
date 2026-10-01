import { NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const customerPhone = customer.phone || '';
    const customerEmail = customer.email || '';

    // 1. Auto-link unlinked orders matching customer phone or email
    if (customerPhone || customerEmail) {
      try {
        await query(
          `UPDATE orders
           SET customer_id = ?
           WHERE customer_id IS NULL
             AND (
               (? != '' AND (shipping_address_json LIKE ? OR notes LIKE ?))
               OR (? != '' AND (shipping_address_json LIKE ? OR notes LIKE ?))
             )`,
          [
            customer.id,
            customerPhone, `%${customerPhone}%`, `%${customerPhone}%`,
            customerEmail, `%${customerEmail}%`, `%${customerEmail}%`
          ]
        );
      } catch (e) {}
    }

    // 2. Fetch customer's orders
    const orders = await query<any[]>(
      `SELECT o.id, o.order_number, o.customer_id, o.branch_id, o.order_type, o.order_status, o.payment_status,
              o.payment_method, o.subtotal, o.discount_amount, o.coupon_code, o.shipping_fee,
              o.tax_amount, o.total_amount, o.paid_amount, o.due_amount,
              o.shipping_address_json, o.notes, o.created_at, o.updated_at,
              b.name as branch_name, b.code as branch_code
       FROM orders o
       LEFT JOIN branches b ON o.branch_id = b.id
       WHERE o.customer_id = ?
          OR (? != '' AND o.shipping_address_json LIKE ?)
          OR (? != '' AND o.shipping_address_json LIKE ?)
          OR (? != '' AND o.notes LIKE ?)
       ORDER BY o.created_at DESC`,
      [
        customer.id,
        customerPhone, `%${customerPhone}%`,
        customerEmail, `%${customerEmail}%`,
        customerEmail, `%${customerEmail}%`
      ]
    );

    // 3. Fetch order items with product details & image
    let orderItems: any[] = [];
    if (orders && orders.length > 0) {
      const orderIds = orders.map((o) => o.id);
      const placeholders = orderIds.map(() => '?').join(',');
      orderItems = await query<any[]>(
        `SELECT oi.id, oi.order_id, oi.product_id, oi.product_name, oi.sku,
                oi.unit_price, oi.quantity, oi.total_price, oi.warranty_details,
                p.slug as product_slug,
                (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = oi.product_id ORDER BY pi.is_primary DESC, pi.id ASC LIMIT 1) as image_url,
                (SELECT r.serial_number FROM rma_cases r WHERE r.order_id = oi.order_id AND r.product_id = oi.product_id LIMIT 1) as serial_numbers
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id IN (${placeholders})`,
        orderIds
      );
    }

    // 4. Attach populated items to each order (with robust fallback if no order_items rows exist)
    const populatedOrders = (orders || []).map((ord) => {
      let items = orderItems.filter((item) => item.order_id === ord.id);
      let parsedAddress = null;
      if (ord.shipping_address_json) {
        try {
          parsedAddress = typeof ord.shipping_address_json === 'string'
            ? JSON.parse(ord.shipping_address_json)
            : ord.shipping_address_json;
        } catch (e) {}
      }

      if (items.length === 0) {
        items = [{
          id: `gen-${ord.id}`,
          order_id: ord.id,
          product_name: ord.order_type === 'pos' ? 'In-Store POS Hardware Purchase' : 'CORENIX Custom Hardware Order',
          sku: `ORD-${ord.order_number?.substring(4) || ord.id}`,
          unit_price: ord.total_amount || ord.subtotal || 0,
          quantity: 1,
          total_price: ord.total_amount || ord.subtotal || 0,
          warranty_details: 'Official 1-3 Years Warranty (Subject to product)',
          product_slug: null,
          image_url: null,
          serial_numbers: null
        }];
      }

      return {
        ...ord,
        shipping_address: parsedAddress,
        item_count: items.length,
        items,
      };
    });

    // 4. Fetch customer's RMA tickets
    const rmaCases = await query<any[]>(
      `SELECT r.id, r.rma_number, r.serial_number, r.problem_description,
              r.warranty_status, r.status, r.created_at, p.name as product_name
       FROM rma_cases r
       LEFT JOIN products p ON r.product_id = p.id
       WHERE r.customer_id = ?
       ORDER BY r.created_at DESC`,
      [customer.id]
    );

    // 5. Fetch saved addresses
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
      orders: populatedOrders,
      rmaCases: rmaCases || [],
      addresses: addresses || [],
    });
  } catch (error: any) {
    console.error('Account data fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load account data' }, { status: 500 });
  }
}
