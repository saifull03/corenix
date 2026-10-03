import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { getCurrentUser, canManagePurchases, canPurchaseProducts, isStoreManagerOnly } from '@/lib/auth';

async function ensureOtherHouseSalesTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS other_house_sales (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_no VARCHAR(50) NOT NULL UNIQUE,
      house_name VARCHAR(150) NOT NULL,
      house_contact VARCHAR(100) NULL,
      house_phone VARCHAR(50) NULL,
      house_address TEXT NULL,
      branch_id INT NOT NULL,
      product_id INT NULL,
      product_name VARCHAR(255) NOT NULL,
      product_brand VARCHAR(100) NULL,
      product_category VARCHAR(100) NULL,
      product_model VARCHAR(100) NULL,
      serial_number VARCHAR(255) NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      cost_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
      unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
      total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
      warranty_period VARCHAR(100) NULL DEFAULT '1 Year Official Warranty',
      is_lend BOOLEAN NOT NULL DEFAULT TRUE,
      payment_status ENUM('lend', 'paid', 'partially_paid') NOT NULL DEFAULT 'lend',
      paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
      due_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
      payment_method VARCHAR(50) NULL,
      payment_reference VARCHAR(100) NULL,
      paid_at DATETIME NULL,
      received_by_name VARCHAR(100) NULL,
      payment_notes TEXT NULL,
      status ENUM('completed', 'delivered', 'returned_by_house', 'cancelled') NOT NULL DEFAULT 'completed',
      notes TEXT NULL,
      created_by INT NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (branch_id) REFERENCES branches(id),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
      INDEX idx_serial (serial_number),
      INDEX idx_payment_status (payment_status),
      INDEX idx_house_name (house_name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !canPurchaseProducts(user)) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Access restricted.' }, { status: 403 });
    }

    await ensureOtherHouseSalesTable();

    const { searchParams } = new URL(req.url);
    const branchFilter = searchParams.get('branch_id');
    const paymentStatus = searchParams.get('payment_status');
    const houseName = searchParams.get('house_name');
    const search = searchParams.get('search');

    let sql = `
      SELECT ohs.*,
             b.name as branch_name, b.code as branch_code,
             p.sku as catalog_sku,
             (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as product_image
      FROM other_house_sales ohs
      LEFT JOIN branches b ON ohs.branch_id = b.id
      LEFT JOIN products p ON ohs.product_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Store managers can only view sales from their assigned branch
    if (isStoreManagerOnly(user) && user.branch_id) {
      sql += ` AND ohs.branch_id = ?`;
      params.push(user.branch_id);
    } else if (branchFilter && branchFilter !== 'all') {
      sql += ` AND ohs.branch_id = ?`;
      params.push(branchFilter);
    }

    if (paymentStatus && paymentStatus !== 'all') {
      if (paymentStatus === 'lend') {
        sql += ` AND (ohs.payment_status = 'lend' OR ohs.payment_status = 'partially_paid')`;
      } else {
        sql += ` AND ohs.payment_status = ?`;
        params.push(paymentStatus);
      }
    }

    if (houseName && houseName !== 'all') {
      sql += ` AND ohs.house_name = ?`;
      params.push(houseName);
    }

    if (search && search.trim()) {
      sql += ` AND (
        ohs.invoice_no LIKE ? OR
        ohs.house_name LIKE ? OR
        ohs.product_name LIKE ? OR
        ohs.serial_number LIKE ? OR
        ohs.house_contact LIKE ? OR
        ohs.house_phone LIKE ?
      )`;
      const q = `%${search.trim()}%`;
      params.push(q, q, q, q, q, q);
    }

    sql += ` ORDER BY ohs.created_at DESC`;

    const sales = await query<any[]>(sql, params);

    // Summary metrics calculation
    let totalCount = 0;
    let totalValue = 0;
    let totalPaid = 0;
    let totalReceivableDue = 0;
    let lendCount = 0;
    let paidCount = 0;

    sales.forEach((s) => {
      totalCount++;
      totalValue += Number(s.total_amount || 0);
      totalPaid += Number(s.paid_amount || 0);
      totalReceivableDue += Number(s.due_amount || 0);
      if (s.payment_status === 'paid') {
        paidCount++;
      } else {
        lendCount++;
      }
    });

    // Known houses list
    const knownHouses = await query<any[]>(`
      SELECT DISTINCT house_name, house_contact, house_phone, house_address 
      FROM other_house_sales 
      WHERE house_name IS NOT NULL AND house_name != ''
      ORDER BY house_name ASC
    `);

    // Available inventory products for quick selection
    let branchCondition = '';
    const prodParams: any[] = [];
    if (isStoreManagerOnly(user) && user.branch_id) {
      branchCondition = 'WHERE bi.branch_id = ?';
      prodParams.push(user.branch_id);
    }

    const availableProducts = await query<any[]>(`
      SELECT p.id, p.name, p.sku, p.brand_id, p.category_id, p.purchase_cost, p.selling_price, p.warranty_period,
             b.name as brand_name, c.name as category_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.name ASC
    `);

    return NextResponse.json({
      success: true,
      sales: sales || [],
      metrics: {
        total_count: totalCount,
        total_value: totalValue,
        total_paid: totalPaid,
        total_receivable_due: totalReceivableDue,
        lend_count: lendCount,
        paid_count: paidCount,
      },
      knownHouses: knownHouses || [],
      products: availableProducts || [],
    });
  } catch (error: any) {
    console.error('Fetch other house sales error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch other house sales' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !canPurchaseProducts(user)) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Only authorized managers can sell to partner houses.' }, { status: 403 });
    }

    await ensureOtherHouseSalesTable();

    const body = await req.json();
    let {
      houseName,
      houseContact,
      housePhone,
      houseAddress,
      branchId,
      productId,
      productName,
      productBrand,
      productCategory,
      productModel,
      serialNumber,
      quantity = 1,
      costPrice = 0,
      unitPrice,
      totalAmount,
      warrantyPeriod = '1 Year Official Warranty',
      isLend = true,
      paidAmount = 0,
      paymentMethod = 'Cash',
      paymentReference = '',
      receivedByName = '',
      paymentNotes = '',
      notes = '',
    } = body;

    // Enforce Store Manager branch lock
    if (isStoreManagerOnly(user) && user.branch_id) {
      branchId = user.branch_id;
    } else {
      branchId = Number(branchId) || user.branch_id || 1;
    }

    if (!houseName || !houseName.trim()) {
      return NextResponse.json({ success: false, error: 'Partner House Name is required.' }, { status: 400 });
    }
    if (!productName || !productName.trim()) {
      return NextResponse.json({ success: false, error: 'Product Name is required.' }, { status: 400 });
    }
    if (!serialNumber || !serialNumber.trim()) {
      return NextResponse.json({ success: false, error: 'Serial Number is strictly required for selling to partner house.' }, { status: 400 });
    }

    const calculatedTotal = Number(totalAmount) || (Number(unitPrice) * Number(quantity));
    if (!calculatedTotal || calculatedTotal <= 0) {
      return NextResponse.json({ success: false, error: 'Total sale amount must be greater than 0.' }, { status: 400 });
    }

    const parsedPaid = isLend ? parseFloat(paidAmount?.toString() || '0') : calculatedTotal;
    const parsedDue = Math.max(0, calculatedTotal - parsedPaid);

    let paymentStatus = 'lend';
    if (parsedDue <= 0) {
      paymentStatus = 'paid';
    } else if (parsedPaid > 0) {
      paymentStatus = 'partially_paid';
    }

    const paidAt = (paymentStatus === 'paid' || parsedPaid > 0) ? new Date() : null;

    // Generate unique Invoice Number: OHS-YYYYMM-XXXX
    const datePrefix = new Date().toISOString().slice(0, 7).replace('-', '');
    const countRes = await queryOne<{ total: number }>(
      `SELECT COUNT(*) as total FROM other_house_sales WHERE invoice_no LIKE ?`,
      [`OHS-${datePrefix}-%`]
    );
    const seq = ((countRes?.total || 0) + 1).toString().padStart(4, '0');
    const invoiceNo = `OHS-${datePrefix}-${seq}`;

    const trimmedSerial = serialNumber.trim();

    const insertResult: any = await query(
      `INSERT INTO other_house_sales (
        invoice_no, house_name, house_contact, house_phone, house_address,
        branch_id, product_id, product_name, product_brand, product_category, product_model,
        serial_number, quantity, cost_price, unit_price, total_amount, warranty_period,
        is_lend, payment_status, paid_amount, due_amount,
        payment_method, payment_reference, paid_at, received_by_name, payment_notes,
        status, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?)`,
      [
        invoiceNo,
        houseName.trim(),
        houseContact?.trim() || null,
        housePhone?.trim() || null,
        houseAddress?.trim() || null,
        branchId,
        productId || null,
        productName.trim(),
        productBrand?.trim() || null,
        productCategory?.trim() || null,
        productModel?.trim() || null,
        trimmedSerial,
        Number(quantity) || 1,
        parseFloat(costPrice?.toString() || '0'),
        parseFloat(unitPrice?.toString() || '0'),
        calculatedTotal,
        warrantyPeriod?.trim() || '1 Year Official Warranty',
        isLend ? 1 : 0,
        paymentStatus,
        parsedPaid,
        parsedDue,
        parsedPaid > 0 ? paymentMethod : null,
        paymentReference?.trim() || null,
        paidAt,
        receivedByName?.trim() || user.name || 'Manager',
        paymentNotes?.trim() || null,
        notes?.trim() || null,
        user.id || 1,
      ]
    );

    // Also deduct stock from product_serials if this serial is currently in stock
    const serialMatch = await queryOne<any>(
      `SELECT id, product_id, branch_id FROM product_serials WHERE serial_number = ? AND branch_id = ? AND status = 'available'`,
      [trimmedSerial, branchId]
    );
    if (serialMatch) {
      await query(
        `UPDATE product_serials SET status = 'sold', updated_at = NOW() WHERE id = ?`,
        [serialMatch.id]
      );
      // Decrement inventory if available
      await query(
        `UPDATE inventory SET quantity = GREATEST(0, quantity - 1), updated_at = NOW() WHERE product_id = ? AND branch_id = ?`,
        [serialMatch.product_id, branchId]
      );
    }

    // Also check if this serial was from other_house_purchases
    await query(
      `UPDATE other_house_purchases SET status = 'sold', updated_at = NOW() WHERE serial_number = ? AND branch_id = ? AND status = 'in_stock'`,
      [trimmedSerial, branchId]
    );

    // If upfront payment collected, record in partner_house_payments
    if (parsedPaid > 0) {
      try {
        await query(
          `INSERT INTO partner_house_payments (
            house_name, branch_id, type, sale_id, reference_no,
            product_name, serial_number, amount, payment_method, payment_reference,
            notes, received_by_name, recorded_by, created_at
          ) VALUES (?, ?, 'sale_collection', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            houseName.trim(),
            branchId,
            insertResult.insertId,
            invoiceNo,
            productName.trim(),
            trimmedSerial,
            parsedPaid,
            paymentMethod,
            paymentReference?.trim() || null,
            paymentNotes?.trim() || 'Payment received on sale',
            receivedByName?.trim() || user.name || 'Manager',
            user.id || 1,
          ]
        );
      } catch (phpErr) {
        console.warn('partner_house_payments log error:', phpErr);
      }
    }

    await logAudit({
      module: 'purchases',
      action: 'other_house_sale_created',
      recordId: insertResult.insertId,
      newData: {
        invoice_no: invoiceNo,
        house_name: houseName,
        product_name: productName,
        serial_number: trimmedSerial,
        total_amount: calculatedTotal,
        payment_status: paymentStatus,
        branch_id: branchId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Sale to "${houseName}" recorded successfully with Invoice #${invoiceNo}!`,
      saleId: insertResult.insertId,
      invoiceNo,
    });
  } catch (error: any) {
    console.error('Create other house sale error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to record sale to house' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManagePurchases(user)) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Only Accounts Manager, Admin, and HR can settle receivables and edit house sales.' }, { status: 403 });
    }

    await ensureOtherHouseSalesTable();

    const body = await req.json();
    const {
      id,
      action,
      paymentAmount,
      paymentMethod = 'Cash',
      paymentReference = '',
      paidAtDate,
      receivedByName,
      paymentNotes = '',
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Sale ID is required.' }, { status: 400 });
    }

    const current = await queryOne<any>(`SELECT * FROM other_house_sales WHERE id = ?`, [id]);
    if (!current) {
      return NextResponse.json({ success: false, error: 'House sale record not found.' }, { status: 404 });
    }

    if (action === 'settle_receivable' || action === 'record_payment') {
      const amt = parseFloat(paymentAmount);
      if (!amt || amt <= 0) {
        return NextResponse.json({ success: false, error: 'Payment amount must be greater than 0.' }, { status: 400 });
      }

      const newPaid = Number(current.paid_amount || 0) + amt;
      const totalAmount = Number(current.total_amount || 0);
      const newDue = Math.max(0, totalAmount - newPaid);

      let newStatus = 'partially_paid';
      if (newDue <= 0) {
        newStatus = 'paid';
      }

      const settleDate = paidAtDate ? new Date(paidAtDate) : new Date();

      await query(
        `UPDATE other_house_sales
         SET paid_amount = ?,
             due_amount = ?,
             payment_status = ?,
             payment_method = ?,
             payment_reference = COALESCE(?, payment_reference),
             paid_at = ?,
             received_by_name = ?,
             payment_notes = CONCAT(COALESCE(payment_notes, ''), '\n[Payment: ৳', ?, ' via ', ?, ' at ', NOW(), ' - ', ?, ']'),
             updated_at = NOW()
         WHERE id = ?`,
        [
          newPaid,
          newDue,
          newStatus,
          paymentMethod,
          paymentReference || null,
          settleDate,
          receivedByName || user.name || 'Accounts',
          amt,
          paymentMethod,
          paymentNotes || 'Settlement',
          id,
        ]
      );

      // Record day-by-day collection entry in partner_house_payments
      try {
        await query(
          `INSERT INTO partner_house_payments (
            house_name, branch_id, type, sale_id, reference_no,
            product_name, serial_number, amount, payment_method, payment_reference,
            notes, received_by_name, recorded_by, created_at
          ) VALUES (?, ?, 'sale_collection', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            current.house_name,
            current.branch_id,
            id,
            current.invoice_no,
            current.product_name,
            current.serial_number,
            amt,
            paymentMethod,
            paymentReference || null,
            paymentNotes || 'Receivable payment collected',
            receivedByName || user.name || 'Accounts',
            user.id || 1,
            settleDate,
          ]
        );
      } catch (phpErr) {
        console.warn('partner_house_payments log error:', phpErr);
      }

      await logAudit({
        module: 'purchases',
        action: 'other_house_sale_settled',
        recordId: id,
        oldData: { paid_amount: current.paid_amount, due_amount: current.due_amount, payment_status: current.payment_status },
        newData: { paid_amount: newPaid, due_amount: newDue, payment_status: newStatus, payment_collected: amt },
      });

      return NextResponse.json({
        success: true,
        message: `Payment of ৳${amt.toLocaleString()} received from "${current.house_name}". Remaining due: ৳${newDue.toLocaleString()}.`,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action specified.' }, { status: 400 });
  } catch (error: any) {
    console.error('Update other house sale error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update house sale' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManagePurchases(user)) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Only Accounts Manager, Admin, and HR can delete house sale records.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Sale ID is required.' }, { status: 400 });
    }

    const current = await queryOne<any>(`SELECT * FROM other_house_sales WHERE id = ?`, [id]);
    if (!current) {
      return NextResponse.json({ success: false, error: 'Record not found.' }, { status: 404 });
    }

    // Restore serial if it was marked as sold
    if (current.serial_number && current.branch_id) {
      await query(
        `UPDATE product_serials SET status = 'available', updated_at = NOW() WHERE serial_number = ? AND branch_id = ? AND status = 'sold'`,
        [current.serial_number, current.branch_id]
      );
    }

    // Restore inventory quantity
    if (current.product_id && current.branch_id) {
      await query(
        `UPDATE inventory SET quantity = quantity + 1, updated_at = NOW() WHERE product_id = ? AND branch_id = ?`,
        [current.product_id, current.branch_id]
      );
    }

    await query(`DELETE FROM other_house_sales WHERE id = ?`, [id]);

    await logAudit({
      module: 'purchases',
      action: 'other_house_sale_deleted',
      recordId: Number(id),
      oldData: current,
    });

    return NextResponse.json({
      success: true,
      message: `Sale record "${current.invoice_no}" deleted successfully. Serial number restored to stock.`,
    });
  } catch (error: any) {
    console.error('Delete other house sale error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete sale record' }, { status: 500 });
  }
}
