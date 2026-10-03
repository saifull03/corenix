import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser, canManagePurchases } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!canManagePurchases(user)) {
      return NextResponse.json({ success: false, error: 'Forbidden: Only Accounts Manager, Admin, and HR can view financial ledgers' }, { status: 403 });
    }

    // Ensure tables exist
    await query(`
      CREATE TABLE IF NOT EXISTS partner_house_payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        house_name VARCHAR(150) NOT NULL,
        branch_id INT NOT NULL,
        type ENUM('purchase_payment', 'sale_collection', 'purchase_invoice', 'sale_invoice') NOT NULL,
        purchase_id INT NULL,
        sale_id INT NULL,
        reference_no VARCHAR(100) NULL,
        product_name VARCHAR(255) NULL,
        serial_number VARCHAR(255) NULL,
        amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        payment_method VARCHAR(50) NOT NULL DEFAULT 'Cash',
        payment_reference VARCHAR(100) NULL,
        notes TEXT NULL,
        received_by_name VARCHAR(100) NULL,
        recorded_by INT NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_php_house (house_name),
        INDEX idx_php_branch (branch_id),
        INDEX idx_php_created_at (created_at),
        INDEX idx_php_type (type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const { searchParams } = new URL(req.url);
    const houseName = searchParams.get('house_name') || '';
    const fromDate = searchParams.get('from_date') || ''; // YYYY-MM-DD
    const toDate = searchParams.get('to_date') || '';     // YYYY-MM-DD
    const paymentStatus = searchParams.get('payment_status') || 'all';
    const branchId = searchParams.get('branch_id') || 'all';
    const transactionType = searchParams.get('type') || 'all'; // 'all' | 'purchases' | 'sales' | 'payments' | 'collections'
    const searchQuery = searchParams.get('search') || '';
    const sortOrder = searchParams.get('sort_order') || 'asc'; // 'asc' (oldest first) | 'desc' (newest first)

    // =========================================================================
    // 1. CALCULATE OPENING BALANCE (Prior to fromDate if fromDate is provided)
    // =========================================================================
    let openingBalance = 0;

    if (fromDate) {
      // Prior Purchases Due (Payable - we owe them)
      let priorPurchasesSql = `
        SELECT COALESCE(SUM(due_amount), 0) as prior_purchases_due,
               COALESCE(SUM(total_cost), 0) as prior_purchases_cost,
               COALESCE(SUM(paid_amount), 0) as prior_purchases_paid
        FROM other_house_purchases
        WHERE DATE(created_at) < ?
      `;
      const priorPurchasesParams: any[] = [fromDate];
      if (houseName && houseName !== 'all') {
        priorPurchasesSql += ` AND house_name = ?`;
        priorPurchasesParams.push(houseName);
      }
      if (branchId && branchId !== 'all') {
        priorPurchasesSql += ` AND branch_id = ?`;
        priorPurchasesParams.push(branchId);
      }
      const priorPurchasesRes = await queryOne<any>(priorPurchasesSql, priorPurchasesParams);

      // Prior Sales Due (Receivable - they owe us)
      let priorSalesSql = `
        SELECT COALESCE(SUM(due_amount), 0) as prior_sales_due,
               COALESCE(SUM(total_amount), 0) as prior_sales_amount,
               COALESCE(SUM(paid_amount), 0) as prior_sales_paid
        FROM other_house_sales
        WHERE DATE(created_at) < ?
      `;
      const priorSalesParams: any[] = [fromDate];
      if (houseName && houseName !== 'all') {
        priorSalesSql += ` AND house_name = ?`;
        priorSalesParams.push(houseName);
      }
      if (branchId && branchId !== 'all') {
        priorSalesSql += ` AND branch_id = ?`;
        priorSalesParams.push(branchId);
      }
      const priorSalesRes = await queryOne<any>(priorSalesSql, priorSalesParams);

      const priorSalesDue = Number(priorSalesRes?.prior_sales_due || 0);
      const priorPurchasesDue = Number(priorPurchasesRes?.prior_purchases_due || 0);

      // Opening Balance = Prior Receivable Due - Prior Payable Due
      openingBalance = priorSalesDue - priorPurchasesDue;
    }

    // =========================================================================
    // 2. FETCH IN-PERIOD TRANSACTIONS
    // =========================================================================

    // (A) Purchases from House
    let purchaseSql = `
      SELECT ohp.*,
             'purchase' as transaction_type,
             ohp.tracking_number as doc_no,
             b.name as branch_name, b.code as branch_code,
             u.name as recorded_by_name
      FROM other_house_purchases ohp
      LEFT JOIN branches b ON ohp.branch_id = b.id
      LEFT JOIN users u ON ohp.created_by = u.id
      WHERE 1=1
    `;
    const purchaseParams: any[] = [];

    if (houseName && houseName !== 'all') {
      purchaseSql += ` AND ohp.house_name = ?`;
      purchaseParams.push(houseName);
    }
    if (fromDate) {
      purchaseSql += ` AND DATE(ohp.created_at) >= ?`;
      purchaseParams.push(fromDate);
    }
    if (toDate) {
      purchaseSql += ` AND DATE(ohp.created_at) <= ?`;
      purchaseParams.push(toDate);
    }
    if (paymentStatus && paymentStatus !== 'all') {
      if (paymentStatus === 'lend') {
        purchaseSql += ` AND (ohp.payment_status = 'lend' OR ohp.payment_status = 'partially_paid')`;
      } else {
        purchaseSql += ` AND ohp.payment_status = ?`;
        purchaseParams.push(paymentStatus);
      }
    }
    if (branchId && branchId !== 'all') {
      purchaseSql += ` AND ohp.branch_id = ?`;
      purchaseParams.push(branchId);
    }
    purchaseSql += ` ORDER BY ohp.created_at ASC`;

    const purchaseItems = (transactionType === 'sales' || transactionType === 'collections')
      ? []
      : await query<any[]>(purchaseSql, purchaseParams);

    // (B) Sales to House
    let salesSql = `
      SELECT ohs.*,
             'sale' as transaction_type,
             ohs.invoice_no as doc_no,
             b.name as branch_name, b.code as branch_code,
             u.name as recorded_by_name
      FROM other_house_sales ohs
      LEFT JOIN branches b ON ohs.branch_id = b.id
      LEFT JOIN users u ON ohs.created_by = u.id
      WHERE 1=1
    `;
    const salesParams: any[] = [];

    if (houseName && houseName !== 'all') {
      salesSql += ` AND ohs.house_name = ?`;
      salesParams.push(houseName);
    }
    if (fromDate) {
      salesSql += ` AND DATE(ohs.created_at) >= ?`;
      salesParams.push(fromDate);
    }
    if (toDate) {
      salesSql += ` AND DATE(ohs.created_at) <= ?`;
      salesParams.push(toDate);
    }
    if (paymentStatus && paymentStatus !== 'all') {
      if (paymentStatus === 'lend') {
        salesSql += ` AND (ohs.payment_status = 'lend' OR ohs.payment_status = 'partially_paid')`;
      } else {
        salesSql += ` AND ohs.payment_status = ?`;
        salesParams.push(paymentStatus);
      }
    }
    if (branchId && branchId !== 'all') {
      salesSql += ` AND ohs.branch_id = ?`;
      salesParams.push(branchId);
    }
    salesSql += ` ORDER BY ohs.created_at ASC`;

    const salesItems = (transactionType === 'purchases' || transactionType === 'payments')
      ? []
      : await query<any[]>(salesSql, salesParams);

    // (C) Dedicated Payment History Records
    let paymentsSql = `
      SELECT php.*,
             b.name as branch_name, b.code as branch_code,
             u.name as recorded_by_user_name
      FROM partner_house_payments php
      LEFT JOIN branches b ON php.branch_id = b.id
      LEFT JOIN users u ON php.recorded_by = u.id
      WHERE 1=1
    `;
    const paymentParams: any[] = [];

    if (houseName && houseName !== 'all') {
      paymentsSql += ` AND php.house_name = ?`;
      paymentParams.push(houseName);
    }
    if (fromDate) {
      paymentsSql += ` AND DATE(php.created_at) >= ?`;
      paymentParams.push(fromDate);
    }
    if (toDate) {
      paymentsSql += ` AND DATE(php.created_at) <= ?`;
      paymentParams.push(toDate);
    }
    if (branchId && branchId !== 'all') {
      paymentsSql += ` AND php.branch_id = ?`;
      paymentParams.push(branchId);
    }
    if (transactionType === 'payments') {
      paymentsSql += ` AND php.type = 'purchase_payment'`;
    } else if (transactionType === 'collections') {
      paymentsSql += ` AND php.type = 'sale_collection'`;
    }
    paymentsSql += ` ORDER BY php.created_at ASC`;

    const paymentRecords = (transactionType === 'purchases' || transactionType === 'sales')
      ? []
      : await query<any[]>(paymentsSql, paymentParams);

    // =========================================================================
    // 3. BUILD COMPLETE ACTIVITY ITEMS WITH DETAILED ACCOUNTING FIELDS
    // =========================================================================
    const allActivities: any[] = [];

    // Map Sales (Receivable Invoices)
    salesItems.forEach((s) => {
      allActivities.push({
        id: `sale-${s.id}`,
        db_id: s.id,
        activity_type: 'sale_delivery',
        category: 'sale',
        type_display: 'SALE / বিক্রয়',
        type_code: 'SALE',
        direction: 'receivable_increase',
        title: `Sale to House`,
        doc_no: s.invoice_no,
        date: s.created_at,
        house_name: s.house_name,
        house_contact: s.house_contact,
        house_phone: s.house_phone,
        house_address: s.house_address,
        branch_id: s.branch_id,
        branch_name: s.branch_name || 'Main Branch',
        branch_code: s.branch_code || 'MAIN',
        product_id: s.product_id,
        product_name: s.product_name,
        product_brand: s.product_brand,
        product_category: s.product_category,
        product_model: s.product_model,
        sku: s.product_model || s.product_brand || 'SKU-GEN',
        serial_number: s.serial_number,
        quantity: Number(s.quantity || 1),
        unit_price: Number(s.unit_price || 0),
        cost_price: Number(s.cost_price || 0),
        total_value: Number(s.total_amount || 0),
        paid_amount: Number(s.paid_amount || 0),
        due_amount: Number(s.due_amount || 0),
        debit: Number(s.total_amount || 0), // House owes us Debit
        credit: 0,
        warranty_period: s.warranty_period,
        payment_status: s.payment_status,
        payment_method: s.payment_method || 'On Lend / Credit',
        payment_reference: s.payment_reference,
        paid_at: s.paid_at,
        staff_name: s.received_by_name || s.recorded_by_name || 'Store Executive',
        notes: s.notes || s.payment_notes,
      });
    });

    // Map Purchases (Payable Inward)
    purchaseItems.forEach((p) => {
      allActivities.push({
        id: `purchase-${p.id}`,
        db_id: p.id,
        activity_type: 'purchase_inward',
        category: 'purchase',
        type_display: 'PURCHASE / ক্রয়',
        type_code: 'PURCHASE',
        direction: 'payable_increase',
        title: `Purchase from House`,
        doc_no: p.tracking_number,
        date: p.created_at,
        house_name: p.house_name,
        house_contact: p.house_contact,
        house_phone: p.house_phone,
        house_address: p.house_address,
        branch_id: p.branch_id,
        branch_name: p.branch_name || 'Main Branch',
        branch_code: p.branch_code || 'MAIN',
        product_id: p.product_id,
        product_name: p.product_name,
        product_brand: p.product_brand,
        product_category: p.product_category,
        product_model: p.product_model,
        sku: p.product_model || p.product_brand || 'SKU-GEN',
        serial_number: p.serial_number,
        quantity: Number(p.quantity || 1),
        unit_price: Number(p.unit_cost || 0),
        cost_price: Number(p.unit_cost || 0),
        selling_price: Number(p.selling_price || 0),
        total_value: Number(p.total_cost || 0),
        paid_amount: Number(p.paid_amount || 0),
        due_amount: Number(p.due_amount || 0),
        debit: 0,
        credit: Number(p.total_cost || 0), // We owe them Credit
        warranty_period: p.warranty_period,
        payment_status: p.payment_status,
        payment_method: p.payment_method || 'On Lend / Credit',
        payment_reference: p.payment_reference,
        paid_at: p.paid_at,
        staff_name: p.paid_by_name || p.recorded_by_name || 'Store Executive',
        notes: p.notes || p.payment_notes,
      });
    });

    // Map Payment / Collection Records
    paymentRecords.forEach((pay) => {
      const isCollection = pay.type === 'sale_collection';
      allActivities.push({
        id: `payment-${pay.id}`,
        db_id: pay.id,
        activity_type: isCollection ? 'sale_collection' : 'purchase_payment',
        category: 'payment',
        type_display: isCollection ? 'COLLECTION / আদায়' : 'PAYMENT / পরিশোধ',
        type_code: isCollection ? 'COLLECTION' : 'PAYMENT',
        direction: isCollection ? 'receivable_decrease' : 'payable_decrease',
        title: isCollection ? `Payment Received from House` : `Payment Paid to House`,
        doc_no: pay.reference_no || `PAY-${pay.id}`,
        date: pay.created_at,
        house_name: pay.house_name,
        house_contact: '',
        house_phone: '',
        house_address: '',
        branch_id: pay.branch_id,
        branch_name: pay.branch_name || 'Main Branch',
        branch_code: pay.branch_code || 'MAIN',
        product_name: pay.product_name || (isCollection ? 'Sale Due Collection' : 'Purchase Lend Settlement'),
        sku: 'PAYMENT',
        serial_number: pay.serial_number || '',
        quantity: 1,
        unit_price: Number(pay.amount || 0),
        total_value: Number(pay.amount || 0),
        paid_amount: Number(pay.amount || 0),
        due_amount: 0,
        debit: isCollection ? 0 : Number(pay.amount || 0),   // Paying to house = Debit (reduces our payable)
        credit: isCollection ? Number(pay.amount || 0) : 0,  // Receiving from house = Credit (reduces their receivable)
        payment_status: 'paid',
        payment_method: pay.payment_method || 'Cash',
        payment_reference: pay.payment_reference,
        staff_name: pay.received_by_name || pay.recorded_by_user_name || 'Accounts Officer',
        notes: pay.notes,
      });
    });

    // =========================================================================
    // 4. SORT CHRONOLOGICALLY ASCENDING TO CALCULATE RUNNING BALANCE
    // =========================================================================
    allActivities.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningNet = openingBalance;
    let periodPurchases = 0;
    let periodSales = 0;
    let periodCollections = 0;
    let periodPaymentsPaid = 0;
    let periodReturns = 0;

    allActivities.forEach((act) => {
      if (act.activity_type === 'sale_delivery') {
        runningNet += act.due_amount; // Net Receivable increases
        periodSales += act.total_value;
      } else if (act.activity_type === 'purchase_inward') {
        runningNet -= act.due_amount; // Net Payable increases (Net Receivable decreases)
        periodPurchases += act.total_value;
      } else if (act.activity_type === 'sale_collection') {
        runningNet -= act.total_value; // Cash collected reduces receivable
        periodCollections += act.total_value;
      } else if (act.activity_type === 'purchase_payment') {
        runningNet += act.total_value; // Cash paid reduces payable
        periodPaymentsPaid += act.total_value;
      }
      act.running_balance = runningNet;
      act.running_status = runningNet > 0 ? 'Receivable (পাওনা)' : runningNet < 0 ? 'Payable (দেনা)' : 'Settled (০)';
    });

    // Filter by Search Query if specified
    let filteredActivities = allActivities;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filteredActivities = allActivities.filter((act) => {
        return (
          (act.doc_no && act.doc_no.toLowerCase().includes(q)) ||
          (act.product_name && act.product_name.toLowerCase().includes(q)) ||
          (act.serial_number && act.serial_number.toLowerCase().includes(q)) ||
          (act.sku && act.sku.toLowerCase().includes(q)) ||
          (act.house_name && act.house_name.toLowerCase().includes(q)) ||
          (act.staff_name && act.staff_name.toLowerCase().includes(q)) ||
          (act.payment_method && act.payment_method.toLowerCase().includes(q)) ||
          (act.notes && act.notes.toLowerCase().includes(q))
        );
      });
    }

    // =========================================================================
    // 5. GROUP ACTIVITIES BY DAY (WITH DAILY OPENING & CLOSING SUMMARIES)
    // =========================================================================
    const dayMap = new Map<string, {
      date: string;
      dayFormatted: string;
      dayFullFormatted: string;
      openingBalance: number;
      closingBalance: number;
      totalSales: number;
      totalPurchases: number;
      totalCollections: number;
      totalPaymentsPaid: number;
      totalReturns: number;
      transactionCount: number;
      activities: any[];
    }>();

    // Group in chronological order first
    filteredActivities.forEach((act) => {
      const dateObj = new Date(act.date);
      const dayKey = dateObj.toISOString().slice(0, 10);
      const dayFormatted = dateObj.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const dayFullFormatted = dateObj.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

      if (!dayMap.has(dayKey)) {
        dayMap.set(dayKey, {
          date: dayKey,
          dayFormatted,
          dayFullFormatted,
          openingBalance: act.running_balance - (
            act.activity_type === 'sale_delivery' ? act.due_amount :
            act.activity_type === 'purchase_inward' ? -act.due_amount :
            act.activity_type === 'sale_collection' ? -act.total_value :
            act.activity_type === 'purchase_payment' ? act.total_value : 0
          ),
          closingBalance: act.running_balance,
          totalSales: 0,
          totalPurchases: 0,
          totalCollections: 0,
          totalPaymentsPaid: 0,
          totalReturns: 0,
          transactionCount: 0,
          activities: [],
        });
      }

      const grp = dayMap.get(dayKey)!;
      grp.activities.push(act);
      grp.transactionCount += 1;
      grp.closingBalance = act.running_balance;

      if (act.activity_type === 'sale_delivery') grp.totalSales += act.total_value;
      if (act.activity_type === 'purchase_inward') grp.totalPurchases += act.total_value;
      if (act.activity_type === 'sale_collection') grp.totalCollections += act.total_value;
      if (act.activity_type === 'purchase_payment') grp.totalPaymentsPaid += act.total_value;
    });

    let groupedByDay = Array.from(dayMap.values());

    // Sort according to requested sort order
    if (sortOrder === 'desc') {
      groupedByDay = groupedByDay.reverse();
      groupedByDay.forEach(g => {
        g.activities = [...g.activities].reverse();
      });
    }

    const displayedActivities = sortOrder === 'desc' ? [...filteredActivities].reverse() : filteredActivities;

    // Fetch House profile if specific house selected
    let houseInfo: any = null;
    if (houseName && houseName !== 'all') {
      houseInfo = await queryOne<any>(`SELECT * FROM partner_houses WHERE name = ?`, [houseName]);
      if (!houseInfo) {
        const found = purchaseItems[0] || salesItems[0] || paymentRecords[0];
        if (found) {
          houseInfo = {
            name: found.house_name,
            contact_person: found.house_contact,
            phone: found.house_phone,
            address: found.house_address,
          };
        }
      }
    }

    const closingBalance = runningNet;

    return NextResponse.json({
      success: true,
      house: houseInfo,
      openingBalance,
      closingBalance,
      activities: displayedActivities,
      allActivitiesChronological: allActivities,
      groupedByDay,
      summary: {
        openingBalance,
        closingBalance,
        totalPurchasesCost: periodPurchases,
        totalPurchasesCount: purchaseItems.length,
        totalSalesAmount: periodSales,
        totalSalesCount: salesItems.length,
        totalSalesPaid: periodCollections,
        totalPurchasesPaid: periodPaymentsPaid,
        totalCollectionsAmount: periodCollections,
        totalPaidToHouseAmount: periodPaymentsPaid,
        totalReturns: periodReturns,
        netBalance: closingBalance,
        netStatus: closingBalance > 0 ? 'receivable' : closingBalance < 0 ? 'payable' : 'settled',
        netBalanceFormatted: Math.abs(closingBalance),
      },
      filters: {
        houseName: houseName || 'all',
        fromDate: fromDate || null,
        toDate: toDate || null,
        paymentStatus,
        branchId: branchId || 'all',
        transactionType,
        search: searchQuery,
        sortOrder,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Fetch other house ledger report error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate house ledger report' }, { status: 500 });
  }
}

