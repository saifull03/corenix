import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

const SAFE_STOCK_THRESHOLD = 10;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branch = searchParams.get('branch'); // 'all', 'shop1', 'shop2', 'wh', 'rma', or branch ID

    // 1. Fetch recent orders (last 48 hours or latest 25 orders)
    let orderSql = `
      SELECT o.id, o.order_number, o.customer_id, o.branch_id, o.order_status, o.payment_status,
             o.total_amount, o.created_at, o.payment_method,
             c.name as customer_name, c.phone as customer_phone,
             b.name as branch_name, b.code as branch_code
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN branches b ON o.branch_id = b.id
    `;
    const orderParams: any[] = [];

    if (branch && branch !== 'all') {
      if (branch === 'shop1') {
        orderSql += ` WHERE b.code LIKE '%SHOP-1%' OR b.id = 2`;
      } else if (branch === 'shop2') {
        orderSql += ` WHERE b.code LIKE '%SHOP-2%' OR b.id = 3`;
      } else if (branch === 'wh') {
        orderSql += ` WHERE b.code LIKE '%WH%' OR b.id = 1`;
      } else if (branch === 'rma') {
        orderSql += ` WHERE b.code LIKE '%RMA%' OR b.id = 4`;
      } else if (!isNaN(Number(branch))) {
        orderSql += ` WHERE o.branch_id = ?`;
        orderParams.push(Number(branch));
      }
    }

    orderSql += ` ORDER BY o.created_at DESC LIMIT 20`;

    const rawOrders = await query<any[]>(orderSql, orderParams);

    // 2. Fetch Low Stock & Out of Stock items (Quantity <= 10)
    let stockSql = `
      SELECT inv.id as inventory_id, inv.quantity, inv.reserved_qty, inv.min_stock_level,
             (inv.quantity - COALESCE(inv.reserved_qty, 0)) as available_qty,
             p.id as product_id, p.name as product_name, p.sku,
             (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as image,
             p.selling_price,
             b.id as branch_id, b.name as branch_name, b.code as branch_code
      FROM inventory inv
      JOIN products p ON inv.product_id = p.id
      JOIN branches b ON inv.branch_id = b.id
      WHERE (inv.quantity - COALESCE(inv.reserved_qty, 0)) <= ?
    `;
    const stockParams: any[] = [SAFE_STOCK_THRESHOLD];

    if (branch && branch !== 'all') {
      if (branch === 'shop1') {
        stockSql += ` AND (b.code LIKE '%SHOP-1%' OR b.id = 2)`;
      } else if (branch === 'shop2') {
        stockSql += ` AND (b.code LIKE '%SHOP-2%' OR b.id = 3)`;
      } else if (branch === 'wh') {
        stockSql += ` AND (b.code LIKE '%WH%' OR b.id = 1)`;
      } else if (branch === 'rma') {
        stockSql += ` AND (b.code LIKE '%RMA%' OR b.id = 4)`;
      } else if (!isNaN(Number(branch))) {
        stockSql += ` AND inv.branch_id = ?`;
        stockParams.push(Number(branch));
      }
    }

    stockSql += ` ORDER BY (inv.quantity - COALESCE(inv.reserved_qty, 0)) ASC, p.name ASC LIMIT 50`;

    const rawStock = await query<any[]>(stockSql, stockParams);

    // 3. Format notifications into standard schema
    const notifications: Array<{
      id: string;
      category: 'order' | 'low_stock';
      type: 'new_order' | 'low_stock' | 'out_of_stock';
      title: string;
      message: string;
      details?: string;
      time: string;
      timestamp: number;
      link: string;
      severity: 'info' | 'warning' | 'critical';
      stock?: number;
      safeStockThreshold: number;
      orderNumber?: string;
      orderStatus?: string;
      amount?: number;
      customerName?: string;
      branchName?: string;
      sku?: string;
      productId?: number;
    }> = [];

    // Format orders
    for (const ord of rawOrders) {
      const isPos = ord.order_number?.startsWith('POS-') || ord.payment_method === 'cash';
      const createdAtDate = new Date(ord.created_at);
      const isRecent = (Date.now() - createdAtDate.getTime()) < 24 * 60 * 60 * 1000;

      notifications.push({
        id: `order-${ord.id}`,
        category: 'order',
        type: 'new_order',
        title: isPos ? `New POS Sale: ${ord.order_number}` : `New Online Order: ${ord.order_number}`,
        message: `${ord.customer_name || 'Walk-in Customer'} • ৳${Number(ord.total_amount || 0).toLocaleString()}`,
        details: `Branch: ${ord.branch_name || 'Main'} • Status: ${ord.order_status?.toUpperCase() || 'COMPLETED'}`,
        time: ord.created_at,
        timestamp: createdAtDate.getTime(),
        link: `/admin/orders?search=${encodeURIComponent(ord.order_number)}`,
        severity: isRecent ? 'info' : 'info',
        orderNumber: ord.order_number,
        orderStatus: ord.order_status,
        amount: Number(ord.total_amount || 0),
        customerName: ord.customer_name || 'Walk-in Customer',
        branchName: ord.branch_name || 'Main Branch',
        safeStockThreshold: SAFE_STOCK_THRESHOLD,
      });
    }

    // Format low stock
    let outOfStockCount = 0;
    let lowStockCount = 0;

    for (const stk of rawStock) {
      const avail = Math.max(0, Number(stk.available_qty || 0));
      const isOut = avail <= 0;

      if (isOut) {
        outOfStockCount++;
      } else {
        lowStockCount++;
      }

      notifications.push({
        id: `stock-${stk.inventory_id}`,
        category: 'low_stock',
        type: isOut ? 'out_of_stock' : 'low_stock',
        title: isOut ? `Out of Stock: ${stk.product_name}` : `Low Stock Alert: ${stk.product_name}`,
        message: isOut
          ? `0 units remaining in ${stk.branch_name} (Safe stock: ${SAFE_STOCK_THRESHOLD})`
          : `Only ${avail} unit${avail === 1 ? '' : 's'} left in ${stk.branch_name} (Safe stock: ${SAFE_STOCK_THRESHOLD})`,
        details: `SKU: ${stk.sku} • Price: ৳${Number(stk.selling_price || 0).toLocaleString()}`,
        time: new Date().toISOString(),
        timestamp: Date.now() - (avail * 60000), // Sort 0 stock higher
        link: `/admin/inventory?sku=${encodeURIComponent(stk.sku)}`,
        severity: isOut ? 'critical' : 'warning',
        stock: avail,
        safeStockThreshold: SAFE_STOCK_THRESHOLD,
        sku: stk.sku,
        productId: stk.product_id,
        branchName: stk.branch_name,
      });
    }

    // Sort all combined by timestamp desc
    notifications.sort((a, b) => {
      // Critical stock alerts first, then newest
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (b.severity === 'critical' && a.severity !== 'critical') return 1;
      return b.timestamp - a.timestamp;
    });

    return NextResponse.json({
      success: true,
      notifications,
      safeStockThreshold: SAFE_STOCK_THRESHOLD,
      stats: {
        totalCount: notifications.length,
        newOrdersCount: rawOrders.length,
        lowStockCount: lowStockCount,
        outOfStockCount: outOfStockCount,
        totalStockAlerts: rawStock.length,
      },
    });
  } catch (error: any) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
