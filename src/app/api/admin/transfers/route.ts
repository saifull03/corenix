import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const fromBranch = searchParams.get('from_branch');
    const toBranch = searchParams.get('to_branch');
    const search = searchParams.get('search') || '';

    let sql = `
      SELECT st.*,
             fb.name as from_branch_name, fb.code as from_branch_code,
             tb.name as to_branch_name, tb.code as to_branch_code,
             u.name as created_by_name,
             (SELECT COUNT(*) FROM stock_transfer_items WHERE transfer_id = st.id) as item_count,
             (SELECT COALESCE(SUM(quantity), 0) FROM stock_transfer_items WHERE transfer_id = st.id) as total_quantity
      FROM stock_transfers st
      LEFT JOIN branches fb ON st.from_branch_id = fb.id
      LEFT JOIN branches tb ON st.to_branch_id = tb.id
      LEFT JOIN users u ON st.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      sql += ` AND st.status = ?`;
      params.push(status);
    }

    if (fromBranch && fromBranch !== 'all') {
      sql += ` AND st.from_branch_id = ?`;
      params.push(Number(fromBranch));
    }

    if (toBranch && toBranch !== 'all') {
      sql += ` AND st.to_branch_id = ?`;
      params.push(Number(toBranch));
    }

    if (search.trim()) {
      sql += ` AND (st.transfer_number LIKE ? OR st.notes LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    sql += ` ORDER BY st.created_at DESC LIMIT 100`;

    const transfers = await query<any[]>(sql, params);

    // Fetch items with products for all returned transfers
    const transferIds = transfers.map((t) => t.id);
    let itemsByTransfer: Record<number, any[]> = {};

    if (transferIds.length > 0) {
      const items = await query<any[]>(
        `SELECT sti.*, p.name as product_name, p.sku, p.selling_price, p.purchase_cost,
                (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as image
         FROM stock_transfer_items sti
         JOIN products p ON sti.product_id = p.id
         WHERE sti.transfer_id IN (${transferIds.map(() => '?').join(',')})`,
        transferIds
      );

      for (const item of items) {
        if (!itemsByTransfer[item.transfer_id]) {
          itemsByTransfer[item.transfer_id] = [];
        }
        let parsedSerials: string[] = [];
        if (item.serials_json) {
          try {
            parsedSerials = typeof item.serials_json === 'string' ? JSON.parse(item.serials_json) : item.serials_json;
          } catch (e) {}
        }
        itemsByTransfer[item.transfer_id].push({
          ...item,
          serials: parsedSerials,
        });
      }
    }

    const enhanced = transfers.map((t) => ({
      ...t,
      items: itemsByTransfer[t.id] || [],
    }));

    return NextResponse.json({ success: true, transfers: enhanced });
  } catch (error: any) {
    console.error('Fetch transfers error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch transfers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { from_branch_id, to_branch_id, items, notes, status = 'received' } = body;

    const fromBranchId = Number(from_branch_id);
    const toBranchId = Number(to_branch_id);

    if (!fromBranchId || !toBranchId) {
      return NextResponse.json({ success: false, error: 'Source and destination branches are required.' }, { status: 400 });
    }

    if (fromBranchId === toBranchId) {
      return NextResponse.json({ success: false, error: 'Source and destination locations cannot be the same.' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one product item is required for transfer.' }, { status: 400 });
    }

    // 1. Verify branches exist
    const fromBranch = await queryOne<any>('SELECT * FROM branches WHERE id = ?', [fromBranchId]);
    const toBranch = await queryOne<any>('SELECT * FROM branches WHERE id = ?', [toBranchId]);

    if (!fromBranch || !toBranch) {
      return NextResponse.json({ success: false, error: 'Invalid source or destination branch specified.' }, { status: 400 });
    }

    // 2. Validate stock availability & serials for each item
    for (const item of items) {
      const productId = Number(item.product_id);
      const qty = Number(item.quantity);

      if (!productId || qty <= 0) {
        return NextResponse.json({ success: false, error: 'Each transfer item must have a valid product and quantity > 0.' }, { status: 400 });
      }

      // Check current source branch stock
      const invRow = await queryOne<any>(
        'SELECT quantity, reserved_qty FROM inventory WHERE product_id = ? AND branch_id = ?',
        [productId, fromBranchId]
      );

      const availableQty = invRow ? Number(invRow.quantity) - Number(invRow.reserved_qty || 0) : 0;
      if (availableQty < qty) {
        const prod = await queryOne<any>('SELECT name, sku FROM products WHERE id = ?', [productId]);
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for "${prod?.name || 'Product'}" at ${fromBranch.name}. Available: ${availableQty}, requested: ${qty}.`,
          },
          { status: 400 }
        );
      }

      // If serial numbers are provided, validate they belong to from_branch and are available
      if (item.serial_numbers && Array.isArray(item.serial_numbers) && item.serial_numbers.length > 0) {
        if (item.serial_numbers.length !== qty) {
          return NextResponse.json(
            {
              success: false,
              error: `Item quantity (${qty}) must match the number of selected serial numbers (${item.serial_numbers.length}).`,
            },
            { status: 400 }
          );
        }

        for (const sn of item.serial_numbers) {
          const serialRow = await queryOne<any>(
            `SELECT id, status, branch_id FROM product_serials WHERE product_id = ? AND serial_number = ?`,
            [productId, sn]
          );

          if (!serialRow) {
            return NextResponse.json({ success: false, error: `Serial number ${sn} does not exist in the database.` }, { status: 400 });
          }

          if (serialRow.branch_id !== fromBranchId) {
            return NextResponse.json(
              { success: false, error: `Serial number ${sn} is not located at source branch ${fromBranch.name}.` },
              { status: 400 }
            );
          }

          if (serialRow.status !== 'available') {
            return NextResponse.json(
              { success: false, error: `Serial number ${sn} is not available (current status: ${serialRow.status}).` },
              { status: 400 }
            );
          }
        }
      }
    }

    // 3. Generate unique transfer number
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const transferNumber = `TRF-${fromBranch.code || 'SRC'}-${toBranch.code || 'DST'}-${dateStr}-${randCode}`;

    const createdBy = user?.id || 1;
    const finalStatus = status === 'in_transit' ? 'in_transit' : 'received';
    const receivedAt = finalStatus === 'received' ? new Date() : null;

    // 4. Insert into stock_transfers
    const transferResult = await query<any>(
      `INSERT INTO stock_transfers (
        transfer_number, from_branch_id, to_branch_id, status, notes, created_by, created_at, received_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [transferNumber, fromBranchId, toBranchId, finalStatus, notes || null, createdBy, receivedAt]
    );

    const transferId = transferResult.insertId;

    // 5. Insert transfer items & update inventory / serials
    for (const item of items) {
      const productId = Number(item.product_id);
      const qty = Number(item.quantity);
      const serialsJson = item.serial_numbers ? JSON.stringify(item.serial_numbers) : null;

      await query(
        `INSERT INTO stock_transfer_items (
          transfer_id, product_id, quantity, received_qty, serials_json
        ) VALUES (?, ?, ?, ?, ?)`,
        [transferId, productId, qty, finalStatus === 'received' ? qty : 0, serialsJson]
      );

      // Execute inventory movement
      if (finalStatus === 'received') {
        // 1. Deduct from source branch
        await query(
          `UPDATE inventory SET quantity = GREATEST(0, quantity - ?) WHERE product_id = ? AND branch_id = ?`,
          [qty, productId, fromBranchId]
        );

        // 2. Add to destination branch (Upsert)
        const destInv = await queryOne<any>(
          `SELECT id FROM inventory WHERE product_id = ? AND branch_id = ?`,
          [productId, toBranchId]
        );

        if (destInv) {
          await query(`UPDATE inventory SET quantity = quantity + ? WHERE id = ?`, [qty, destInv.id]);
        } else {
          await query(
            `INSERT INTO inventory (product_id, branch_id, quantity, reserved_qty, min_stock_level) VALUES (?, ?, ?, 0, 5)`,
            [productId, toBranchId, qty]
          );
        }

        // 3. Move serial numbers to destination branch
        if (item.serial_numbers && Array.isArray(item.serial_numbers)) {
          for (const sn of item.serial_numbers) {
            await query(
              `UPDATE product_serials SET branch_id = ?, status = 'available' WHERE product_id = ? AND serial_number = ?`,
              [toBranchId, productId, sn]
            );
          }
        }

        // 4. Record audit transactions
        await query(
          `INSERT INTO inventory_transactions (
            product_id, branch_id, transaction_type, quantity, reference_type, reference_id, notes, created_by, created_at
          ) VALUES (?, ?, 'transfer_out', ?, 'stock_transfer', ?, ?, ?, NOW())`,
          [productId, fromBranchId, qty, transferId, `Transferred out to ${toBranch.name} (${transferNumber})`, createdBy]
        );

        await query(
          `INSERT INTO inventory_transactions (
            product_id, branch_id, transaction_type, quantity, reference_type, reference_id, notes, created_by, created_at
          ) VALUES (?, ?, 'transfer_in', ?, 'stock_transfer', ?, ?, ?, NOW())`,
          [productId, toBranchId, qty, transferId, `Received from ${fromBranch.name} (${transferNumber})`, createdBy]
        );
      } else {
        // In Transit: Deduct from source branch, mark serials in_transit
        await query(
          `UPDATE inventory SET quantity = GREATEST(0, quantity - ?) WHERE product_id = ? AND branch_id = ?`,
          [qty, productId, fromBranchId]
        );

        if (item.serial_numbers && Array.isArray(item.serial_numbers)) {
          for (const sn of item.serial_numbers) {
            await query(
              `UPDATE product_serials SET status = 'in_transit' WHERE product_id = ? AND serial_number = ?`,
              [productId, sn]
            );
          }
        }

        await query(
          `INSERT INTO inventory_transactions (
            product_id, branch_id, transaction_type, quantity, reference_type, reference_id, notes, created_by, created_at
          ) VALUES (?, ?, 'transfer_out', ?, 'stock_transfer', ?, ?, ?, NOW())`,
          [productId, fromBranchId, qty, transferId, `Dispatched in-transit to ${toBranch.name} (${transferNumber})`, createdBy]
        );
      }
    }

    // 6. Log activity audit
    await logAudit({
      userId: user?.id || 1,
      userName: user?.name || 'Staff User',
      roleName: (user as any)?.role_name || 'Admin',
      module: 'Inventory',
      action: `Stock Transfer (${transferNumber}): ${fromBranch.name} -> ${toBranch.name}`,
      recordId: transferId,
      newData: {
        transferNumber,
        fromBranch: fromBranch.name,
        toBranch: toBranch.name,
        status: finalStatus,
        itemCount: items.length,
        notes,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Stock transfer ${transferNumber} created successfully!`,
      transferId,
      transferNumber,
      status: finalStatus,
    });
  } catch (error: any) {
    console.error('Create stock transfer error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to process stock transfer' }, { status: 500 });
  }
}
