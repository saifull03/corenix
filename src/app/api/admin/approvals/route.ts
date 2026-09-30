import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const requests = await query<any[]>(
      `SELECT cr.*,
              u.name as requester_name, u.email as requester_email,
              r.name as requester_role,
              rev.name as reviewer_name
       FROM change_requests cr
       JOIN users u ON cr.requested_by = u.id
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN users rev ON cr.reviewed_by = rev.id
       ORDER BY cr.created_at DESC`
    );

    return NextResponse.json({ success: true, requests: requests || [] });
  } catch (error: any) {
    console.error('Fetch approvals error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch change requests' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, reviewNotes } = body;

    if (!id || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Valid ID and action (approve/reject) required' }, { status: 400 });
    }

    const cr = await queryOne<any>(`SELECT * FROM change_requests WHERE id = ?`, [id]);
    if (!cr) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    await query(
      `UPDATE change_requests
       SET status = ?, reviewed_by = 1, reviewed_at = NOW(), review_notes = ?
       WHERE id = ?`,
      [newStatus, reviewNotes || `Decision by Super Administrator: ${newStatus}`, id]
    );

    // If approved, apply the changes to the live tables!
    if (action === 'approve') {
      try {
        const newVal = typeof cr.new_value_json === 'string' ? JSON.parse(cr.new_value_json) : cr.new_value_json;

        if (cr.action_type === 'price_update' && newVal.selling_price) {
          await query(`UPDATE products SET selling_price = ? WHERE id = ?`, [newVal.selling_price, cr.record_id]);
        } else if (cr.action_type === 'stock_update' && newVal.quantity && newVal.branch_id) {
          await query(
            `UPDATE inventory SET quantity = ? WHERE product_id = ? AND branch_id = ?`,
            [newVal.quantity, cr.record_id, newVal.branch_id]
          );
        }
      } catch (applyErr) {
        console.error('Error applying change request:', applyErr);
      }
    }

    await logAudit({
      module: 'approvals',
      action: `${action}_change_request`,
      recordId: id,
      newData: { status: newStatus, reviewNotes },
    });

    return NextResponse.json({
      success: true,
      message: `Change request #${id} has been ${newStatus}.`,
    });
  } catch (error: any) {
    console.error('Update approval error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process approval' }, { status: 500 });
  }
}
