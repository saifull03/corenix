const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'corenix_db',
};

async function testSaleWorkflow() {
  const conn = await mysql.createConnection(dbConfig);
  try {
    console.log('Testing other_house_sales insertion and queries...');

    // 1. Check an available serial
    const [serials] = await conn.query(`
      SELECT ps.id, ps.serial_number, ps.product_id, ps.branch_id, ps.status,
             p.name as product_name, p.brand, p.category, p.model, p.purchase_price, p.selling_price
      FROM product_serials ps
      LEFT JOIN products p ON ps.product_id = p.id
      WHERE ps.status = 'available'
      LIMIT 1
    `);

    if (serials.length === 0) {
      console.log('No available serials found to test with.');
      return;
    }

    const testItem = serials[0];
    console.log('Using test product & serial:', {
      product: testItem.product_name,
      serial: testItem.serial_number,
      branch: testItem.branch_id
    });

    // 2. Insert test sale
    const invoiceNo = 'OHS-202610-TEST';
    await conn.query(`DELETE FROM other_house_sales WHERE invoice_no = ?`, [invoiceNo]);

    const [insertRes] = await conn.query(`
      INSERT INTO other_house_sales (
        invoice_no, house_name, house_contact, house_phone, house_address,
        branch_id, product_id, product_name, product_brand, product_category, product_model,
        serial_number, quantity, cost_price, unit_price, total_amount, warranty_period,
        is_lend, payment_status, paid_amount, due_amount,
        payment_method, payment_reference, paid_at, received_by_name, payment_notes,
        status, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?)
    `, [
      invoiceNo,
      'Star Tech & Engineering Ltd.',
      'Sabbir Ahmed',
      '+8801711002233',
      'Multiplan Center, Level 9, Dhaka',
      testItem.branch_id,
      testItem.product_id,
      testItem.product_name || 'GeForce RTX 5060 GAMING X 8G',
      testItem.brand || 'MSI',
      testItem.category || 'Graphics Card',
      testItem.model || 'RTX 5060 GAMING X',
      testItem.serial_number,
      1,
      testItem.purchase_price || 38000,
      44000,
      44000,
      '2 Years Official Warranty',
      true, // is_lend
      'lend',
      0,
      44000,
      'Lend Due',
      null,
      null,
      null,
      null,
      'Test sale to partner house',
      1
    ]);

    console.log('✅ Inserted sale row id:', insertRes.insertId);

    // 3. Verify querying sales
    const [fetchedSales] = await conn.query(`
      SELECT ohs.*, b.name as branch_name, b.code as branch_code
      FROM other_house_sales ohs
      LEFT JOIN branches b ON ohs.branch_id = b.id
      WHERE ohs.id = ?
    `, [insertRes.insertId]);

    console.log('✅ Fetched sale record:', fetchedSales[0]);

    // 4. Test partner houses ledger computation
    const [ledgerSummary] = await conn.query(`
      SELECT ph.name,
        COALESCE(SUM(ohp.due_amount), 0) as total_payable_due,
        COALESCE(sales_stat.total_sales_due, 0) as total_sales_due
      FROM partner_houses ph
      LEFT JOIN other_house_purchases ohp ON ph.name = ohp.house_name AND ohp.payment_status IN ('lend', 'partially_paid')
      LEFT JOIN (
        SELECT house_name,
               SUM(CASE WHEN payment_status IN ('lend', 'partially_paid') THEN due_amount ELSE 0 END) as total_sales_due
        FROM other_house_sales
        GROUP BY house_name
      ) sales_stat ON ph.name = sales_stat.house_name
      WHERE ph.name = 'Star Tech & Engineering Ltd.'
      GROUP BY ph.id
    `);

    console.log('✅ Ledger summary test for Star Tech:', ledgerSummary[0]);

    // Clean up test record
    await conn.query(`DELETE FROM other_house_sales WHERE invoice_no = ?`, [invoiceNo]);
    console.log('Cleaned up test record.');

  } catch (err) {
    console.error('Test workflow error:', err);
  } finally {
    await conn.end();
  }
}

testSaleWorkflow();
