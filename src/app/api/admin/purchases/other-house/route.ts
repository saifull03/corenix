import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const paymentStatus = searchParams.get('payment_status') || 'all'; // 'all', 'lend', 'paid', 'partially_paid'
    const branchId = searchParams.get('branch_id');

    let sql = `
      SELECT ohp.*,
             b.name as branch_name, b.code as branch_code
      FROM other_house_purchases ohp
      LEFT JOIN branches b ON ohp.branch_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (paymentStatus && paymentStatus !== 'all') {
      sql += ` AND ohp.payment_status = ?`;
      params.push(paymentStatus);
    }

    if (branchId) {
      sql += ` AND ohp.branch_id = ?`;
      params.push(branchId);
    }

    if (search.trim()) {
      sql += ` AND (
        ohp.tracking_number LIKE ? OR
        ohp.house_name LIKE ? OR
        ohp.product_name LIKE ? OR
        ohp.serial_number LIKE ? OR
        ohp.house_contact LIKE ? OR
        ohp.house_phone LIKE ?
      )`;
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s, s, s);
    }

    sql += ` ORDER BY ohp.created_at DESC`;

    const purchases = await query<any[]>(sql, params);

    // Compute metrics
    const [metricsRow] = await query<any[]>(`
      SELECT 
        COUNT(*) as total_count,
        COALESCE(SUM(total_cost), 0) as total_value,
        COALESCE(SUM(CASE WHEN payment_status = 'lend' OR payment_status = 'partially_paid' THEN due_amount ELSE 0 END), 0) as total_lend_due,
        COUNT(CASE WHEN payment_status = 'lend' OR payment_status = 'partially_paid' THEN 1 END) as lend_count,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_count,
        COALESCE(SUM(paid_amount), 0) as total_paid
      FROM other_house_purchases
    `);

    // Fetch active branches
    const branches = await query<any[]>(`SELECT id, name, code FROM branches WHERE is_active = 1 ORDER BY id ASC`);

    // Fetch existing catalog products for easy selection
    const products = await query<any[]>(`
      SELECT p.id, p.name, p.sku, p.selling_price, p.purchase_cost, p.warranty_period,
             b.name as brand_name, c.name as category_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'published'
      ORDER BY p.name ASC
      LIMIT 200
    `);

    // Fetch known other house names for autocomplete
    const knownHouses = await query<any[]>(`
      SELECT DISTINCT house_name, house_contact, house_phone, house_address 
      FROM other_house_purchases 
      ORDER BY house_name ASC
    `);

    return NextResponse.json({
      success: true,
      purchases: purchases || [],
      metrics: metricsRow || {
        total_count: 0,
        total_value: 0,
        total_lend_due: 0,
        lend_count: 0,
        paid_count: 0,
        total_paid: 0,
      },
      branches: branches || [],
      products: products || [],
      knownHouses: knownHouses || [],
    });
  } catch (error: any) {
    console.error('Fetch other house purchases error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch other house purchases' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      houseName,
      houseContact = '',
      housePhone = '',
      houseAddress = '',
      supplierId = null,
      branchId,
      productId = null,
      productName,
      productBrand = '',
      productCategory = '',
      productModel = '',
      serialNumber,
      quantity = 1,
      unitCost,
      totalCost,
      sellingPrice = 0,
      warrantyPeriod = '1 Year Official Warranty',
      isLend = true,
      paidAmount = 0,
      paymentMethod = null,
      paymentReference = null,
      paidByName = null,
      paymentNotes = null,
      notes = '',
      addToInventory = true,
    } = body;

    if (!houseName || !branchId || !productName || !serialNumber || unitCost === undefined) {
      return NextResponse.json(
        { success: false, error: 'House Name, Branch, Product Name, Serial Number, and Unit Cost are required.' },
        { status: 400 }
      );
    }

    const calculatedTotal = Number(totalCost) || Number(unitCost) * Number(quantity || 1);
    const initialPaid = Number(paidAmount) || 0;
    const initialDue = Math.max(0, calculatedTotal - initialPaid);

    let paymentStatus: 'lend' | 'paid' | 'partially_paid' = 'lend';
    let paidAt: Date | null = null;

    if (!isLend || initialDue <= 0) {
      paymentStatus = 'paid';
      paidAt = new Date();
    } else if (initialPaid > 0) {
      paymentStatus = 'partially_paid';
      paidAt = new Date();
    } else {
      paymentStatus = 'lend';
      paidAt = null;
    }

    const trackingNumber = `OHP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const insertResult = await query<any>(
      `INSERT INTO other_house_purchases (
        tracking_number, house_name, house_contact, house_phone, house_address,
        supplier_id, branch_id, product_id, product_name, product_brand,
        product_category, product_model, serial_number, quantity,
        unit_cost, total_cost, selling_price, warranty_period,
        is_lend, payment_status, paid_amount, due_amount,
        payment_method, payment_reference, paid_at, paid_by_name, payment_notes,
        status, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'in_stock', ?, 1)`,
      [
        trackingNumber,
        houseName.trim(),
        houseContact.trim() || null,
        housePhone.trim() || null,
        houseAddress.trim() || null,
        supplierId || null,
        branchId,
        productId || null,
        productName.trim(),
        productBrand.trim() || null,
        productCategory.trim() || null,
        productModel.trim() || null,
        serialNumber.trim(),
        quantity || 1,
        unitCost,
        calculatedTotal,
        sellingPrice || 0,
        warrantyPeriod || '1 Year Official Warranty',
        isLend ? 1 : 0,
        paymentStatus,
        initialPaid,
        initialDue,
        initialPaid > 0 ? (paymentMethod || 'Cash') : null,
        initialPaid > 0 ? paymentReference : null,
        paidAt,
        initialPaid > 0 ? (paidByName || 'Admin') : null,
        paymentNotes || null,
        notes || null,
      ]
    );

    const newId = (insertResult as any).insertId;

    // Optional inventory adjustment if linked to a registered product
    if (addToInventory && productId) {
      try {
        await query(
          `INSERT INTO inventory (product_id, branch_id, quantity)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
          [productId, branchId, quantity || 1, quantity || 1]
        );

        await query(
          `INSERT INTO inventory_transactions (
             product_id, branch_id, transaction_type, quantity, reference_type, reference_id, unit_cost, notes, created_by
           ) VALUES (?, ?, 'purchase_receipt', ?, 'other_house_purchase', ?, ?, ?, 1)`,
          [
            productId,
            branchId,
            quantity || 1,
            newId,
            unitCost,
            `Procured from Other House (${houseName}) - SN: ${serialNumber}`,
          ]
        );
      } catch (invErr) {
        console.warn('Inventory sync error (non-fatal):', invErr);
      }
    }

    await logAudit({
      module: 'purchases',
      action: 'other_house_purchase_created',
      recordId: newId,
      newData: {
        trackingNumber,
        houseName,
        productName,
        serialNumber,
        totalCost: calculatedTotal,
        isLend,
        paymentStatus,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Other House Purchase recorded successfully',
      id: newId,
      trackingNumber,
      paymentStatus,
    });
  } catch (error: any) {
    console.error('Create other house purchase error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to record purchase' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Purchase ID required' }, { status: 400 });
    }

    const current = await queryOne<any>(`SELECT * FROM other_house_purchases WHERE id = ?`, [id]);
    if (!current) {
      return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
    }

    // Action A: Settle or Make Payment for Lend
    if (action === 'settle_payment') {
      const {
        paymentAmount,
        paymentMethod = 'Cash',
        paymentReference = '',
        paidByName = 'Admin',
        paymentNotes = '',
        paidAtDate,
      } = body;

      const amountToPay = Number(paymentAmount) || Number(current.due_amount);
      if (amountToPay <= 0) {
        return NextResponse.json({ success: false, error: 'Payment amount must be greater than zero.' }, { status: 400 });
      }

      const newPaidTotal = Number(current.paid_amount || 0) + amountToPay;
      const newDue = Math.max(0, Number(current.total_cost) - newPaidTotal);
      const newStatus = newDue <= 0 ? 'paid' : 'partially_paid';
      const paymentDate = paidAtDate ? new Date(paidAtDate) : new Date();

      await query(
        `UPDATE other_house_purchases
         SET paid_amount = ?,
             due_amount = ?,
             payment_status = ?,
             payment_method = ?,
             payment_reference = ?,
             paid_at = ?,
             paid_by_name = ?,
             payment_notes = CONCAT(COALESCE(CONCAT(payment_notes, '\n---\n'), ''), ?)
         WHERE id = ?`,
        [
          newPaidTotal,
          newDue,
          newStatus,
          paymentMethod,
          paymentReference || null,
          paymentDate,
          paidByName || 'Admin',
          `[${paymentDate.toLocaleString()}] Paid ৳${amountToPay.toLocaleString()} via ${paymentMethod}${paymentReference ? ' (Ref: ' + paymentReference + ')' : ''}. Settled by: ${paidByName || 'Admin'}. ${paymentNotes || ''}`.trim(),
          id,
        ]
      );

      await logAudit({
        module: 'purchases',
        action: 'other_house_lend_settled',
        recordId: id,
        newData: {
          paidAmount: amountToPay,
          totalPaid: newPaidTotal,
          remainingDue: newDue,
          paymentStatus: newStatus,
          paidAt: paymentDate,
          paymentMethod,
          paidByName,
        },
      });

      return NextResponse.json({
        success: true,
        message: newStatus === 'paid' ? 'Lend completely cleared and marked as Paid!' : `Partial payment of ৳${amountToPay.toLocaleString()} recorded. Remaining Due: ৳${newDue.toLocaleString()}`,
        paymentStatus: newStatus,
        paidAt: paymentDate,
        dueAmount: newDue,
      });
    }

    // Action B: Update Product / Inventory Status
    if (action === 'update_status') {
      const { status, notes } = body;
      if (!status) {
        return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 });
      }

      await query(
        `UPDATE other_house_purchases SET status = ?, notes = COALESCE(?, notes) WHERE id = ?`,
        [status, notes || null, id]
      );

      await logAudit({
        module: 'purchases',
        action: 'other_house_status_updated',
        recordId: id,
        newData: { status, notes },
      });

      return NextResponse.json({ success: true, message: `Status updated to ${status}` });
    }

    return NextResponse.json({ success: false, error: 'Invalid action provided' }, { status: 400 });
  } catch (error: any) {
    console.error('Update other house purchase error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update record' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    }

    const current = await queryOne<any>(`SELECT * FROM other_house_purchases WHERE id = ?`, [id]);
    if (!current) {
      return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
    }

    await query(`DELETE FROM other_house_purchases WHERE id = ?`, [id]);

    await logAudit({
      module: 'purchases',
      action: 'other_house_purchase_deleted',
      recordId: Number(id),
      oldData: current,
    });

    return NextResponse.json({ success: true, message: 'Record deleted successfully' });
  } catch (error: any) {
    console.error('Delete other house purchase error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete' }, { status: 500 });
  }
}
