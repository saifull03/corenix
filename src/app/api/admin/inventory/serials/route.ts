import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId') ? Number(searchParams.get('productId')) : null;
    const branchId = searchParams.get('branchId') ? Number(searchParams.get('branchId')) : null;
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search')?.trim() || '';
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(200, Math.max(10, Number(searchParams.get('limit')) || 50));
    const offset = (page - 1) * limit;

    let whereClauses: string[] = ['1=1'];
    const params: any[] = [];

    if (productId) {
      whereClauses.push('ps.product_id = ?');
      params.push(productId);
    }

    if (branchId) {
      whereClauses.push('ps.branch_id = ?');
      params.push(branchId);
    }

    if (status && status !== 'all') {
      whereClauses.push('ps.status = ?');
      params.push(status);
    }

    if (search) {
      whereClauses.push('(ps.serial_number LIKE ? OR ps.barcode LIKE ? OR p.name LIKE ? OR p.sku LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    const whereSql = whereClauses.join(' AND ');

    // Get total count
    const countRes = await query<any[]>(
      `SELECT COUNT(*) as total 
       FROM product_serials ps
       JOIN products p ON ps.product_id = p.id
       JOIN branches b ON ps.branch_id = b.id
       WHERE ${whereSql}`,
      params
    );
    const total = countRes[0]?.total || 0;

    // Get paginated serials
    const serials = await query<any[]>(
      `SELECT ps.id, ps.product_id, ps.branch_id, ps.serial_number, ps.barcode, ps.status, 
              ps.sold_at, ps.order_id, ps.created_at,
              p.name as product_name, p.sku as product_sku, p.selling_price, p.purchase_cost,
              b.name as branch_name, b.code as branch_code
       FROM product_serials ps
       JOIN products p ON ps.product_id = p.id
       JOIN branches b ON ps.branch_id = b.id
       WHERE ${whereSql}
       ORDER BY p.name ASC, ps.branch_id ASC, ps.serial_number ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Summary counts by status
    const statusSummary = await query<any[]>(
      `SELECT ps.status, COUNT(*) as count 
       FROM product_serials ps 
       GROUP BY ps.status`
    );

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      serials,
      statusSummary: statusSummary.reduce((acc, curr) => {
        acc[curr.status] = curr.count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error: any) {
    console.error('Fetch inventory serials error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch serials' }, { status: 500 });
  }
}
