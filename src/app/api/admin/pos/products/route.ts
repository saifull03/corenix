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

    // Determine authorized branch
    let branchId = requestedBranchId;
    if (!isSuperAdmin(user) && user.branch_id) {
      branchId = user.branch_id;
    }
    if (!branchId) {
      branchId = 2; // Default to Shop 1 if not specified
    }

    // 1. Fetch products with inventory for the active branch
    let productSql = `
      SELECT
        p.id,
        p.name,
        p.slug,
        p.sku,
        p.barcode,
        p.model,
        p.brand_id,
        p.category_id,
        p.product_type,
        p.warranty_period,
        p.is_pc_builder,
        p.pc_builder_component,
        p.selling_price,
        p.discount_price,
        p.purchase_cost,
        COALESCE(inv.quantity, 0) as stock_quantity,
        COALESCE(inv.reserved_qty, 0) as reserved_quantity,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN inventory inv ON p.id = inv.product_id AND inv.branch_id = ?
      WHERE p.status = 'published'
    `;

    const productParams: any[] = [branchId];

    if (search) {
      productSql += ` AND (
        p.name LIKE ? OR
        p.sku LIKE ? OR
        p.model LIKE ? OR
        p.barcode LIKE ? OR
        p.id IN (
          SELECT product_id FROM product_serials
          WHERE branch_id = ? AND serial_number LIKE ?
        )
      )`;
      const wild = `%${search}%`;
      productParams.push(wild, wild, wild, wild, branchId, wild);
    }

    productSql += ` ORDER BY p.is_pc_builder DESC, p.name ASC LIMIT 80`;

    const regularProducts = await query<any[]>(productSql, productParams);

    // 2. Fetch available serial numbers for these products in this branch
    const productIds = regularProducts.map((p) => p.id);
    let serialsByProduct: Record<number, any[]> = {};

    if (productIds.length > 0) {
      const placeholders = productIds.map(() => '?').join(',');
      const serials = await query<any[]>(
        `SELECT id, product_id, branch_id, serial_number, barcode, status
         FROM product_serials
         WHERE branch_id = ? AND product_id IN (${placeholders}) AND status = 'available'
         ORDER BY id ASC`,
        [branchId, ...productIds]
      );

      for (const s of serials) {
        if (!serialsByProduct[s.product_id]) {
          serialsByProduct[s.product_id] = [];
        }
        serialsByProduct[s.product_id].push(s);
      }
    }

    const enhancedProducts = regularProducts.map((p) => {
      const availableSerials = serialsByProduct[p.id] || [];
      const isSerialized = availableSerials.length > 0 || (p.stock_quantity > 0 && p.product_type === 'physical');
      return {
        ...p,
        selling_price: Number(p.selling_price),
        discount_price: p.discount_price ? Number(p.discount_price) : null,
        purchase_cost: Number(p.purchase_cost),
        stock_quantity: Math.max(0, Number(p.stock_quantity) - Number(p.reserved_quantity)),
        available_serials: availableSerials,
        is_serialized: isSerialized,
        is_other_house: false,
        primary_image:
          p.primary_image ||
          'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=200&q=80',
      };
    });

    // 3. Fetch available Other House items (Lend/Purchased from external dealers)
    let ohSql = `
      SELECT
        oh.id,
        oh.tracking_number,
        oh.house_name,
        oh.product_id,
        oh.product_name,
        oh.product_model,
        oh.serial_number,
        oh.unit_cost,
        oh.selling_price,
        oh.warranty_period,
        oh.branch_id,
        oh.status
      FROM other_house_purchases oh
      WHERE oh.branch_id = ? AND oh.status = 'in_stock'
    `;
    const ohParams: any[] = [branchId];

    if (search) {
      ohSql += ` AND (
        oh.product_name LIKE ? OR
        oh.tracking_number LIKE ? OR
        oh.serial_number LIKE ? OR
        oh.house_name LIKE ?
      )`;
      const wild = `%${search}%`;
      ohParams.push(wild, wild, wild, wild);
    }

    ohSql += ` ORDER BY oh.id DESC LIMIT 30`;

    const otherHouseRows = await query<any[]>(ohSql, ohParams);

    const otherHouseProducts = otherHouseRows.map((oh) => ({
      id: `oh-${oh.id}`,
      original_oh_id: oh.id,
      product_id: oh.product_id || null,
      name: oh.product_name,
      slug: `oh-${oh.id}`,
      sku: oh.tracking_number,
      model: oh.product_model || 'Other House Unit',
      barcode: oh.serial_number,
      selling_price: Number(oh.selling_price) || Math.round(Number(oh.unit_cost) * 1.08),
      discount_price: null,
      purchase_cost: Number(oh.unit_cost),
      stock_quantity: 1,
      reserved_quantity: 0,
      warranty_period: oh.warranty_period || '1 Year Official Warranty',
      is_pc_builder: false,
      pc_builder_component: null,
      product_type: 'physical',
      available_serials: [
        {
          id: `oh-sn-${oh.id}`,
          serial_number: oh.serial_number,
          barcode: oh.serial_number,
          status: 'available',
        },
      ],
      is_serialized: true,
      is_other_house: true,
      house_name: oh.house_name,
      primary_image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=200&q=80',
    }));

    return NextResponse.json({
      success: true,
      branchId,
      products: [...enhancedProducts, ...otherHouseProducts],
    });
  } catch (error: any) {
    console.error('POS product search error:', error);
    return NextResponse.json({ success: false, error: 'Failed to search products' }, { status: 500 });
  }
}
