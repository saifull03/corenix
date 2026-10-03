import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const transferId = Number(id);

    if (!transferId) {
      return NextResponse.json({ success: false, error: 'Invalid transfer ID' }, { status: 400 });
    }

    const transfer = await queryOne<any>(
      `SELECT st.*,
              fb.name as from_branch_name, fb.code as from_branch_code, fb.address as from_branch_address, fb.phone as from_branch_phone,
              tb.name as to_branch_name, tb.code as to_branch_code, tb.address as to_branch_address, tb.phone as to_branch_phone,
              u.name as created_by_name, u.email as created_by_email
       FROM stock_transfers st
       LEFT JOIN branches fb ON st.from_branch_id = fb.id
       LEFT JOIN branches tb ON st.to_branch_id = tb.id
       LEFT JOIN users u ON st.created_by = u.id
       WHERE st.id = ?`,
      [transferId]
    );

    if (!transfer) {
      return NextResponse.json({ success: false, error: 'Transfer not found' }, { status: 404 });
    }

    const items = await query<any[]>(
      `SELECT sti.*, p.name as product_name, p.sku, p.barcode, p.model, p.selling_price, p.purchase_cost,
              c.name as category_name, b.name as brand_name,
              (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as image
       FROM stock_transfer_items sti
       JOIN products p ON sti.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE sti.transfer_id = ?`,
      [transferId]
    );

    const enhancedItems = items.map((item) => {
      let parsedSerials: string[] = [];
      if (item.serials_json) {
        try {
          parsedSerials = typeof item.serials_json === 'string' ? JSON.parse(item.serials_json) : item.serials_json;
        } catch (e) {}
      }
      return {
        ...item,
        serials: parsedSerials,
      };
    });

    return NextResponse.json({
      success: true,
      transfer: {
        ...transfer,
        items: enhancedItems,
      },
    });
  } catch (error: any) {
    console.error('Fetch transfer detail error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch transfer' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const transferId = Number(id);
    const user = await getCurrentUser();
    const body = await req.json();
    const { action } = body; // 'receive' | 'cancel'

    if (!transferId) {
      return NextResponse.json({ success: false, error: 'Invalid transfer ID' }, { status: 400 });
    }

    const transfer = await queryOne<any>('SELECT * FROM stock_transfers WHERE id = ?', [transferId]);
    if (!transfer) {
      return NextResponse.json({ success: false, error: 'Transfer not found' }, { status: 404 });
    }

    if (transfer.status === 'received') {
      return NextResponse.json({ success: false, error: 'This transfer has already been received and completed.' }, { status: 400 });
    }

    if (transfer.status === 'cancelled') {
      return NextResponse.json({ success: false, error: 'This transfer was cancelled and cannot be modified.' }, { status: 400 });
    }

    const items = await query<any[]>('SELECT * FROM stock_transfer_items WHERE transfer_id = ?', [transferId]);

    if (action === 'receive') {
      // 1. Update transfer status
      await query('UPDATE stock_transfers SET status = "received", received_at = NOW() WHERE id = ?', [transferId]);

      // 2. Add inventory to destination branch and update serial numbers
      for (const item of items) {
        const qty = Number(item.quantity);
        const productId = Number(item.product_id);

        // Update items table received_qty
        await query('UPDATE stock_transfer_items SET received_qty = ? WHERE id = ?', [qty, item.id]);

        // Upsert to destination branch inventory
        const destInv = await queryOne<any>(
          `SELECT id FROM inventory WHERE product_id = ? AND branch_id = ?`,
          [productId, transfer.to_branch_id]
        );

        if (destInv) {
          await query(`UPDATE inventory SET quantity = quantity + ? WHERE id = ?`, [qty, destInv.id]);
        } else {
          await query(
            `INSERT INTO inventory (product_id, branch_id, quantity, reserved_qty, min_stock_level) VALUES (?, ?, ?, 0, 5)`,
            [productId, transfer.to_branch_id, qty]
          );
        }

        // Update serial numbers
        if (item.serials_json) {
          let serials: string[] = [];
          try {
            serials = typeof item.serials_json === 'string' ? JSON.parse(item.serials_json) : item.serials_json;
          } catch (e) {}

          for (const sn of serials) {
            await query(
              `UPDATE product_serials SET branch_id = ?, status = 'available' WHERE product_id = ? AND serial_number = ?`,
              [transfer.to_branch_id, productId, sn]
            );
          }
        }

        // Record inventory transaction
        await query(
          `INSERT INTO inventory_transactions (
            product_id, branch_id, transaction_type, quantity, reference_type, reference_id, notes, created_by, created_at
          ) VALUES (?, ?, 'transfer_in', ?, 'stock_transfer', ?, ?, ?, NOW())`,
          [productId, transfer.to_branch_id, qty, transferId, `Received in branch (${transfer.transfer_number})`, user?.id || 1]
        );
      }

      await logAudit({
        userId: user?.id || 1,
        userName: user?.name || 'Staff User',
        roleName: (user as any)?.role_name || 'Admin',
        module: 'Inventory',
        action: `Received Stock Transfer ${transfer.transfer_number}`,
        recordId: transferId,
      });

      return NextResponse.json({ success: true, message: `Transfer ${transfer.transfer_number} marked as received!` });
    } else if (action === 'cancel') {
      // Revert stock back to source branch
      await query('UPDATE stock_transfers SET status = "cancelled" WHERE id = ?', [transferId]);

      for (const item of items) {
        const qty = Number(item.quantity);
        const productId = Number(item.product_id);

        await query(
          `UPDATE inventory SET quantity = quantity + ? WHERE product_id = ? AND branch_id = ?`,
          [qty, productId, transfer.from_branch_id]
        );

        if (item.serials_json) {
          let serials: string[] = [];
          try {
            serials = typeof item.serials_json === 'string' ? JSON.parse(item.serials_json) : item.serials_json;
          } catch (e) {}

          for (const sn of serials) {
            await query(
              `UPDATE product_serials SET status = 'available' WHERE product_id = ? AND serial_number = ?`,
              [productId, sn]
            );
          }
        }

        await query(
          `INSERT INTO inventory_transactions (
            product_id, branch_id, transaction_type, quantity, reference_type, reference_id, notes, created_by, created_at
          ) VALUES (?, ?, 'adjustment', ?, 'stock_transfer_cancel', ?, ?, ?, NOW())`,
          [productId, transfer.from_branch_id, qty, transferId, `Reverted cancelled transfer (${transfer.transfer_number})`, user?.id || 1]
        );
      }

      await logAudit({
        userId: user?.id || 1,
        userName: user?.name || 'Staff User',
        roleName: (user as any)?.role_name || 'Admin',
        module: 'Inventory',
        action: `Cancelled Stock Transfer ${transfer.transfer_number}`,
        recordId: transferId,
      });

      return NextResponse.json({ success: true, message: `Transfer ${transfer.transfer_number} has been cancelled.` });
    }

    return NextResponse.json({ success: false, error: 'Invalid action specified' }, { status: 400 });
  } catch (error: any) {
    console.error('Update transfer error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update transfer' }, { status: 500 });
  }
}
