import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const houseName = searchParams.get('house_name') || '';
    const fromDate = searchParams.get('from_date'); // YYYY-MM-DD
    const toDate = searchParams.get('to_date');     // YYYY-MM-DD
    const paymentStatus = searchParams.get('payment_status') || 'all';
    const branchId = searchParams.get('branch_id');

    let sql = `
      SELECT ohp.*,
             b.name as branch_name, b.code as branch_code
      FROM other_house_purchases ohp
      LEFT JOIN branches b ON ohp.branch_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (houseName && houseName !== 'all') {
      sql += ` AND ohp.house_name = ?`;
      params.push(houseName);
    }

    if (fromDate) {
      sql += ` AND DATE(ohp.created_at) >= ?`;
      params.push(fromDate);
    }

    if (toDate) {
      sql += ` AND DATE(ohp.created_at) <= ?`;
      params.push(toDate);
    }

    if (paymentStatus && paymentStatus !== 'all') {
      if (paymentStatus === 'lend') {
        sql += ` AND (ohp.payment_status = 'lend' OR ohp.payment_status = 'partially_paid')`;
      } else {
        sql += ` AND ohp.payment_status = ?`;
        params.push(paymentStatus);
      }
    }

    if (branchId && branchId !== 'all') {
      sql += ` AND ohp.branch_id = ?`;
      params.push(branchId);
    }

    sql += ` ORDER BY ohp.created_at ASC`;

    const items = await query<any[]>(sql, params);

    // Calculate totals for this filtered ledger
    let totalPurchasesCount = 0;
    let totalCost = 0;
    let totalPaid = 0;
    let totalDue = 0;
    let paidCount = 0;
    let lendCount = 0;

    items.forEach((item) => {
      totalPurchasesCount += 1;
      totalCost += Number(item.total_cost || 0);
      totalPaid += Number(item.paid_amount || 0);
      totalDue += Number(item.due_amount || 0);
      if (item.payment_status === 'paid') {
        paidCount += 1;
      } else {
        lendCount += 1;
      }
    });

    // Fetch House contact profile if specific house selected
    let houseInfo: any = null;
    if (houseName && houseName !== 'all') {
      houseInfo = await queryOne<any>(`SELECT * FROM partner_houses WHERE name = ?`, [houseName]);
      if (!houseInfo && items.length > 0) {
        // Fallback to latest purchase item info
        houseInfo = {
          name: items[0].house_name,
          contact_person: items[0].house_contact,
          phone: items[0].house_phone,
          address: items[0].house_address,
        };
      }
    }

    return NextResponse.json({
      success: true,
      house: houseInfo,
      items,
      summary: {
        totalPurchasesCount,
        totalCost,
        totalPaid,
        totalDue,
        paidCount,
        lendCount,
      },
      filters: {
        houseName: houseName || 'all',
        fromDate: fromDate || null,
        toDate: toDate || null,
        paymentStatus,
        branchId: branchId || 'all',
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Fetch other house ledger report error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate house ledger report' }, { status: 500 });
  }
}
