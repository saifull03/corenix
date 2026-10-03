import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get('branch_id');
    const search = searchParams.get('search') || '';

    if (!branchId) {
      return NextResponse.json({ success: false, error: 'branch_id parameter is required' }, { status: 400 });
    }

    let sql = `
      SELECT p.id, p.name, p.sku, p.barcode, p.model, p.selling_price, p.purchase_cost,
             c.name as category_name, b.name as brand_name,
             COALESCE(inv.quantity, 0) as branch_stock,
             COALESCE(inv.reserved_qty, 0) as reserved_qty,
             (COALESCE(inv.quantity, 0) - COALESCE(inv.reserved_qty, 0)) as available_stock,
             (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as image,
             (SELECT COUNT(*) FROM product_serials ps WHERE ps.product_id = p.id AND ps.branch_id = ? AND ps.status = 'available') as available_serials_count
      FROM products p
      LEFT JOIN inventory inv ON p.id = inv.product_id AND inv.branch_id = ?
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE (COALESCE(inv.quantity, 0) - COALESCE(inv.reserved_qty, 0)) > 0
    `;
    const params: any[] = [Number(branchId), Number(branchId)];

    if (search.trim()) {
      sql += ` AND (p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ? OR p.model LIKE ? OR p.id IN (SELECT product_id FROM product_serials WHERE (serial_number LIKE ? OR barcode LIKE ?) AND branch_id = ? AND status = 'available'))`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term, term, Number(branchId));
    }

    sql += ` ORDER BY p.name ASC LIMIT 50`;

    const products = await query<any[]>(sql, params);

    // Fetch available serial numbers for these products at this branch
    const productIds = products.map((p) => p.id);
    let serialsByProduct: Record<number, any[]> = {};

    if (productIds.length > 0) {
      const serialRows = await query<any[]>(
        `SELECT id, product_id, serial_number, barcode, status
         FROM product_serials
         WHERE product_id IN (${productIds.map(() => '?').join(',')})
           AND branch_id = ?
           AND status = 'available'
         ORDER BY serial_number ASC`,
        [...productIds, Number(branchId)]
      );

      for (const row of serialRows) {
        if (!serialsByProduct[row.product_id]) {
          serialsByProduct[row.product_id] = [];
        }
        serialsByProduct[row.product_id].push(row);
      }
    }

    const enhanced = products.map((p) => ({
      ...p,
      serials: serialsByProduct[p.id] || [],
      requires_serial: (serialsByProduct[p.id] || []).length > 0 || p.available_serials_count > 0,
    }));

    return NextResponse.json({
      success: true,
      products: enhanced,
    });
  } catch (error: any) {
    console.error('Fetch branch transfer products error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}
