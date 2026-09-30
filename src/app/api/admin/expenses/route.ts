import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const expenses = await query<any[]>(
      `SELECT e.*,
              ec.name as category_name, ec.code as category_code,
              b.name as branch_name, b.code as branch_code
       FROM expenses e
       JOIN expense_categories ec ON e.category_id = ec.id
       JOIN branches b ON e.branch_id = b.id
       ORDER BY e.expense_date DESC, e.created_at DESC`
    );

    const categories = await query<any[]>(`SELECT * FROM expense_categories ORDER BY id ASC`);
    const branches = await query<any[]>(`SELECT id, name, code FROM branches WHERE is_active = 1`);

    return NextResponse.json({ success: true, expenses: expenses || [], categories: categories || [], branches: branches || [] });
  } catch (error: any) {
    console.error('Fetch expenses error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { branchId, categoryId, title, amount, expenseDate, paymentMethod = 'Cash', notes } = body;

    if (!branchId || !categoryId || !title || !amount) {
      return NextResponse.json(
        { success: false, error: 'Branch, Category, Title, and Amount are required.' },
        { status: 400 }
      );
    }

    const date = expenseDate || new Date().toISOString().split('T')[0];

    const result = await query<any>(
      `INSERT INTO expenses (branch_id, category_id, title, amount, expense_date, payment_method, notes, created_by, is_approved)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1)`,
      [branchId, categoryId, title.trim(), parseFloat(amount), date, paymentMethod, notes || null]
    );

    const newId = (result as any).insertId;

    await logAudit({
      module: 'expenses',
      action: 'record_expense',
      recordId: newId,
      newData: { title, amount, branchId, categoryId },
    });

    return NextResponse.json({ success: true, message: 'Expense recorded successfully', expenseId: newId });
  } catch (error: any) {
    console.error('Record expense error:', error);
    return NextResponse.json({ success: false, error: 'Failed to record expense' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    await query(`DELETE FROM expenses WHERE id = ?`, [id]);
    await logAudit({ module: 'expenses', action: 'delete_expense', recordId: Number(id) });

    return NextResponse.json({ success: true, message: 'Expense deleted' });
  } catch (error: any) {
    console.error('Delete expense error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete expense' }, { status: 500 });
  }
}
