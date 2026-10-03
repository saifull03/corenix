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
    const productId = searchParams.get('productId') ? Number(searchParams.get('productId')) : null;
    const requestedBranchId = searchParams.get('branchId') ? Number(searchParams.get('branchId')) : null;
    const scanCode = searchParams.get('scanCode')?.trim();

    let branchId = requestedBranchId;
    if (!isSuperAdmin(user) && user.branch_id) {
      branchId = user.branch_id;
    }
    if (!branchId) {
      branchId = 2;
    }

    if (scanCode) {
      // Direct scanner query by serial number or barcode
      const serialMatch = await query<any[]>(
        `SELECT ps.*, p.name as product_name, p.sku as product_sku, p.selling_price, p.discount_price, p.warranty_period
         FROM product_serials ps
         JOIN products p ON ps.product_id = p.id
         WHERE ps.branch_id = ? AND (ps.serial_number = ? OR ps.barcode = ?) AND ps.status = 'available'
         LIMIT 1`,
        [branchId, scanCode, scanCode]
      );

      if (serialMatch.length > 0) {
        return NextResponse.json({
          success: true,
          found: true,
          type: 'regular',
          item: serialMatch[0],
        });
      }

      // Check other house purchases
      const ohMatch = await query<any[]>(
        `SELECT oh.*, oh.product_name, oh.tracking_number as product_sku, oh.selling_price, oh.warranty_period
         FROM other_house_purchases oh
         WHERE oh.branch_id = ? AND (oh.serial_number = ? OR oh.tracking_number = ?) AND oh.status = 'in_stock'
         LIMIT 1`,
        [branchId, scanCode, scanCode]
      );

      if (ohMatch.length > 0) {
        return NextResponse.json({
          success: true,
          found: true,
          type: 'other_house',
          item: ohMatch[0],
        });
      }

      return NextResponse.json({
        success: true,
        found: false,
        message: 'No available serial number or barcode match found for this branch.',
      });
    }

    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID or scanCode is required' }, { status: 400 });
    }

    const serials = await query<any[]>(
      `SELECT id, product_id, branch_id, serial_number, barcode, status
       FROM product_serials
       WHERE product_id = ? AND branch_id = ? AND status = 'available'
       ORDER BY id ASC`,
      [productId, branchId]
    );

    return NextResponse.json({
      success: true,
      branchId,
      productId,
      serials: serials || [],
    });
  } catch (error: any) {
    console.error('Fetch serials error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch serial numbers' }, { status: 500 });
  }
}
