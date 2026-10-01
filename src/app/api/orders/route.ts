import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { getCurrentCustomer } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      deliveryType,
      branchId = 2, // Default Shop 1 Uttara
      shippingAddress,
      paymentMethod,
      items = [],
      subtotal = 46900,
      shippingFee = 0,
      discountAmount = 0,
    } = body;

    const totalAmount = subtotal + shippingFee - discountAmount;
    const orderNumber = `CRX-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // 1. Create or find customer (check logged in session first, then email/phone)
    let customerId = null;
    try {
      const authCustomer = await getCurrentCustomer();
      if (authCustomer?.id) {
        customerId = authCustomer.id;
      }
    } catch (e) {}

    if (!customerId && (customerEmail || customerPhone)) {
      const existingCustomer = await queryOne<any>(
        `SELECT id FROM customers WHERE (LOWER(email) = LOWER(?) AND ? != '') OR (phone = ? AND ? != '') LIMIT 1`,
        [customerEmail || '', customerEmail || '', customerPhone || '', customerPhone || '']
      );
      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        try {
          const custRes = await query<any>(
            `INSERT INTO customers (name, email, phone, password_hash) VALUES (?, ?, ?, ?)`,
            [
              customerName || 'Customer',
              customerEmail || `customer_${Date.now()}@corenix.com`,
              customerPhone || `017${Math.floor(10000000 + Math.random() * 90000000)}`,
              '$2a$10$abcdefghijklmnopqrstuvwxyz'
            ]
          );
          customerId = (custRes as any).insertId;
        } catch (err) {
          // If collision, try finding by phone or email again
          const retryCustomer = await queryOne<any>(
            `SELECT id FROM customers WHERE email = ? OR phone = ? LIMIT 1`,
            [customerEmail || '', customerPhone || '']
          );
          if (retryCustomer) customerId = retryCustomer.id;
        }
      }
    }

    // 2. Insert Order
    const orderRes = await query<any>(
      `INSERT INTO orders (
        order_number, customer_id, branch_id, order_type, order_status,
        payment_status, payment_method, subtotal, shipping_fee, discount_amount,
        total_amount, paid_amount, due_amount, cogs_total, gross_profit,
        shipping_address_json, notes
      ) VALUES (?, ?, ?, 'online', 'pending', 'unpaid', ?, ?, ?, ?, ?, 0.00, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        customerId,
        branchId,
        paymentMethod || 'cod',
        subtotal,
        shippingFee,
        discountAmount,
        totalAmount,
        totalAmount,
        subtotal * 0.82, // Estimated COGS
        subtotal * 0.18, // Estimated Gross Profit
        JSON.stringify({
          address: shippingAddress,
          deliveryType,
          phone: customerPhone,
          name: customerName,
          email: customerEmail,
        }),
        `Online order placed via CORENIX portal. Delivery: ${deliveryType}`
      ]
    );

    const orderId = (orderRes as any).insertId;

    // 3. Insert Order Items & deduct / reserve inventory
    for (const item of items) {
      await query(
        `INSERT INTO order_items (
          order_id, product_id, product_name, sku, unit_price, unit_cost, quantity, total_price, total_cost, warranty_details
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.id || 1,
          item.name || 'Component Item',
          item.sku || 'SKU-ITEM',
          item.price || 46900,
          (item.price || 46900) * 0.82,
          item.quantity || 1,
          (item.price || 46900) * (item.quantity || 1),
          (item.price || 46900) * 0.82 * (item.quantity || 1),
          item.warranty || 'Official Warranty'
        ]
      );

      // Reserve stock in branch
      await query(
        `UPDATE inventory
         SET reserved_qty = reserved_qty + ?
         WHERE product_id = ? AND branch_id = ?`,
        [item.quantity || 1, item.id || 1, branchId]
      );

      // Record transaction
      await query(
        `INSERT INTO inventory_transactions (
          product_id, branch_id, transaction_type, quantity, reference_type, reference_id, notes
        ) VALUES (?, ?, 'sale', ?, 'order', ?, 'Online Order Reservation')`,
        [item.id || 1, branchId, item.quantity || 1, orderId]
      );
    }

    // 4. Audit Log
    await logAudit({
      module: 'Orders',
      action: 'Create Online Order',
      recordId: orderId,
      newData: { orderNumber, totalAmount, paymentMethod, branchId },
    });

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId,
      totalAmount,
      message: 'Order created successfully!',
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
