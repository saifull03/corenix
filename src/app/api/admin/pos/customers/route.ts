import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();

    let sql = `
      SELECT 
        c.id,
        c.name,
        c.phone,
        c.email,
        COALESCE(c.address, ca.address_line1, '') as address,
        COALESCE(c.reward_points, 0) as reward_points,
        c.created_at
      FROM customers c
      LEFT JOIN customer_addresses ca ON c.id = ca.customer_id AND ca.is_default = 1
    `;

    const params: any[] = [];

    if (q) {
      sql += ` WHERE (c.name LIKE ? OR c.phone LIKE ? OR c.email LIKE ? OR c.address LIKE ?) `;
      const pattern = `%${q}%`;
      params.push(pattern, pattern, pattern, pattern);
    }

    sql += ` ORDER BY c.updated_at DESC, c.id DESC LIMIT 20`;

    const customers = await query<any[]>(sql, params);

    return NextResponse.json({
      success: true,
      customers: customers.map((c) => ({
        id: c.id,
        name: c.name || '',
        phone: c.phone || '',
        email: c.email || '',
        address: c.address || '',
        reward_points: c.reward_points || 0,
      })),
    });
  } catch (error: any) {
    console.error('Customer search error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to search customers' },
      { status: 500 }
    );
  }
}
