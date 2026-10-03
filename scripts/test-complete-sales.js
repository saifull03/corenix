const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'corenix_db',
};

async function testCompleteSaleFlow() {
  const conn = await mysql.createConnection(dbConfig);
  try {
    console.log('--- 1. Checking table structure ---');
    const [cols] = await conn.query('DESCRIBE other_house_sales');
    console.log(`other_house_sales has ${cols.length} columns.`);

    console.log('--- 2. Fetching available serial for test ---');
    const [serials] = await conn.query(`
      SELECT ps.id, ps.serial_number, ps.product_id, ps.branch_id, ps.status,
             p.name as product_name, p.purchase_cost, p.selling_price
      FROM product_serials ps
      LEFT JOIN products p ON ps.product_id = p.id
      WHERE ps.status = 'available'
      LIMIT 1
    `);

    if (serials.length === 0) {
      console.log('No available serial found in DB. Creating one for testing.');
      await conn.query(`
        INSERT INTO product_serials (serial_number, product_id, branch_id, status)
        VALUES ('TEST-SN-999001', 1, 1, 'available')
      `);
    }

    const [testSerialRow] = await conn.query(`
      SELECT ps.id, ps.serial_number, ps.product_id, ps.branch_id, ps.status,
             p.name as product_name
      FROM product_serials ps
      LEFT JOIN products p ON ps.product_id = p.id
      WHERE ps.status = 'available'
      LIMIT 1
    `);

    const testItem = testSerialRow[0];
    console.log('Using Serial:', testItem.serial_number, 'for Product:', testItem.product_name);

    console.log('--- 3. Inserting test sale record into DB ---');
    const invoiceNo = `OHS-${Date.now().toString().slice(-6)}`;
    const [res] = await conn.query(`
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
      'Ryans Computers Ltd.',
      'Tanvir Hasan',
      '+8801819001122',
      'IDB Bhaban, Agargaon, Dhaka',
      testItem.branch_id,
      testItem.product_id,
      testItem.product_name || 'MSI Gaming Laptop / GPU',
      'MSI',
      'Hardware',
      'Core Edition',
      testItem.serial_number,
      1,
      45000,
      52000,
      52000,
      '2 Years Official Warranty',
      1, // is_lend
      'lend',
      0,
      52000,
      'Lend Out',
      null,
      null,
      'Accounts',
      'Test sale to house',
      'Delivered via representative',
      1
    ]);

    console.log('✅ Created sale record with ID:', res.insertId, 'Invoice:', invoiceNo);

    // 4. Mark serial as sold
    await conn.query(`UPDATE product_serials SET status = 'sold' WHERE id = ?`, [testItem.id]);
    console.log('✅ Marked serial as sold.');

    // 5. Query the sales table exactly as the GET API does
    const [salesList] = await conn.query(`
      SELECT ohs.*,
             b.name as branch_name, b.code as branch_code,
             p.sku as catalog_sku,
             (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as product_image
      FROM other_house_sales ohs
      LEFT JOIN branches b ON ohs.branch_id = b.id
      LEFT JOIN products p ON ohs.product_id = p.id
      ORDER BY ohs.created_at DESC
    `);

    console.log(`✅ Total sales in other_house_sales table: ${salesList.length}`);
    console.log('Top sale record:', {
      id: salesList[0].id,
      invoice_no: salesList[0].invoice_no,
      house_name: salesList[0].house_name,
      product_name: salesList[0].product_name,
      serial_number: salesList[0].serial_number,
      total_amount: salesList[0].total_amount,
      due_amount: salesList[0].due_amount,
      payment_status: salesList[0].payment_status,
      branch_name: salesList[0].branch_name
    });

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await conn.end();
  }
}

testCompleteSaleFlow();
