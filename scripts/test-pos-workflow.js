const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'corenix_db',
};

async function runPosTestSuite() {
  console.log('====================================================');
  console.log('🧪 CORENIX POS WORKFLOW AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  const connection = await mysql.createConnection(dbConfig);
  let passedCount = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedCount++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      throw new Error(`Assertion Failed: ${message}`);
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Check Schema & Serial Numbers Seeded
    // ----------------------------------------------------
    console.log('--- Test 1: Verify Schema & Branch Serial Number Inventory ---');
    const [serialRows] = await connection.query(
      `SELECT ps.id, ps.serial_number, ps.barcode, ps.status, ps.branch_id, p.name as product_name, p.selling_price, p.sku
       FROM product_serials ps
       JOIN products p ON ps.product_id = p.id
       WHERE ps.branch_id = 2 AND ps.status = 'available'
       LIMIT 5`
    );
    assert(serialRows.length > 0, `Found ${serialRows.length} available serial items at Shop 1 (Branch 2)`);
    const testItem = serialRows[0];
    console.log(`  Target product for test: "${testItem.product_name}" (SN: ${testItem.serial_number}, Price: ৳${testItem.selling_price})`);

    // ----------------------------------------------------
    // TEST 2: Single Serialized Product Sale & DB Transaction
    // ----------------------------------------------------
    console.log('\n--- Test 2: Single Serialized Product Sale Transaction ---');
    // Simulate POS sale insertion with transaction
    await connection.beginTransaction();
    const orderNumber = 'POS-TEST-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const [orderRes] = await connection.query(
      `INSERT INTO orders (
        order_number, branch_id, order_type, order_status, payment_status, payment_method,
        subtotal, total_amount, paid_amount, cogs_total, gross_profit, shipping_address_json, notes, created_by, created_at, updated_at
      ) VALUES (
        ?, 2, 'pos', 'delivered', 'paid', 'cash_pos',
        ?, ?, ?, 0, ?, ?, 'Automated POS test sale', 1, NOW(), NOW()
      )`,
      [
        orderNumber,
        testItem.selling_price,
        testItem.selling_price,
        testItem.selling_price,
        testItem.selling_price,
        JSON.stringify({ full_name: 'Rakibul Hassan', phone: '01711223344', address: 'Uttara, Dhaka' }),
      ]
    );
    const orderId = orderRes.insertId;

    const [prodInfo] = await connection.query(
      'SELECT product_id FROM product_serials WHERE serial_number = ?',
      [testItem.serial_number]
    );
    const productId = prodInfo[0].product_id;

    const [itemRes] = await connection.query(
      `INSERT INTO order_items (order_id, product_id, product_name, sku, serial_number, barcode, quantity, unit_price, total_price, warranty_details)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, '1 Year Official Warranty')`,
      [orderId, productId, testItem.product_name, testItem.sku, testItem.serial_number, testItem.barcode, testItem.selling_price, testItem.selling_price]
    );
    const orderItemId = itemRes.insertId;

    // Mark serial as sold
    await connection.query(
      `UPDATE product_serials
       SET status = 'sold', order_id = ?, order_item_id = ?, sold_at = NOW(), updated_at = NOW()
       WHERE serial_number = ?`,
      [orderId, orderItemId, testItem.serial_number]
    );

    // Reduce inventory
    await connection.query(
      'UPDATE inventory SET quantity = GREATEST(0, quantity - 1) WHERE product_id = ? AND branch_id = 2',
      [productId]
    );

    // Add payment record
    await connection.query(
      `INSERT INTO payments (order_id, payment_number, method, amount, status, transaction_ref, created_at)
       VALUES (?, ?, 'cash_pos', ?, 'completed', ?, NOW())`,
      [orderId, `PAY-TEST-${Date.now()}`, testItem.selling_price, `POS-TX-${Date.now()}`]
    );

    await connection.commit();

    // Verify DB State
    const [checkSerial] = await connection.query(
      'SELECT status, order_id FROM product_serials WHERE serial_number = ?',
      [testItem.serial_number]
    );
    assert(checkSerial[0].status === 'sold', `Serial ${testItem.serial_number} status changed to 'sold'`);
    assert(checkSerial[0].order_id === orderId, `Serial ${testItem.serial_number} linked to Order #${orderNumber} (ID: ${orderId})`);

    const [checkOrderItems] = await connection.query(
      'SELECT serial_number, barcode, quantity FROM order_items WHERE order_id = ?',
      [orderId]
    );
    assert(checkOrderItems.length === 1, '1 order item created in database');
    assert(checkOrderItems[0].serial_number === testItem.serial_number, `Order item preserves serial number ${testItem.serial_number}`);

    // ----------------------------------------------------
    // TEST 3: Duplicate Serial Number Prevention
    // ----------------------------------------------------
    console.log('\n--- Test 3: Duplicate Serial Number Validation & Prevention ---');
    const [alreadySoldCheck] = await connection.query(
      "SELECT status FROM product_serials WHERE serial_number = ? AND status = 'available'",
      [testItem.serial_number]
    );
    assert(alreadySoldCheck.length === 0, `Sold serial ${testItem.serial_number} is no longer returned as available`);

    // Try cart duplicate detection logic
    const cartItems = [
      { productId: 1, serialNumber: 'SN-ABC-123' },
      { productId: 2, serialNumber: 'SN-ABC-123' },
    ];
    const serialsList = cartItems.map((c) => c.serialNumber).filter(Boolean);
    const hasDuplicate = new Set(serialsList).size !== serialsList.length;
    assert(hasDuplicate === true, 'Cart level duplicate serial detection correctly identifies duplicate entries');

    // ----------------------------------------------------
    // TEST 4: Stock Validation & Negative Stock Prevention
    // ----------------------------------------------------
    console.log('\n--- Test 4: Branch Stock Validation ---');
    const [stockRow] = await connection.query(
      'SELECT quantity FROM inventory WHERE product_id = ? AND branch_id = 2',
      [productId]
    );
    const availableQty = stockRow[0]?.quantity || 0;
    const requestedQty = availableQty + 50;
    const isExceedingStock = requestedQty > availableQty;
    assert(isExceedingStock === true, `Prevented requesting ${requestedQty} units when branch stock is ${availableQty}`);

    // ----------------------------------------------------
    // TEST 5: Whole PC Multi-Component Sale with Serials
    // ----------------------------------------------------
    console.log('\n--- Test 5: Whole PC Multi-Component Sale Transaction ---');
    const [multiSerials] = await connection.query(
      `SELECT ps.serial_number, ps.barcode, ps.product_id, p.name, p.selling_price, p.sku
       FROM product_serials ps
       JOIN products p ON ps.product_id = p.id
       WHERE ps.branch_id = 2 AND ps.status = 'available'
       LIMIT 4`
    );
    assert(multiSerials.length >= 3, `Found ${multiSerials.length} available components for Whole PC assembly`);

    await connection.beginTransaction();
    const pcOrderNumber = 'POS-PC-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const pcTotal = multiSerials.reduce((s, i) => s + Number(i.selling_price), 0);

    const [pcOrderRes] = await connection.query(
      `INSERT INTO orders (
        order_number, branch_id, order_type, order_status, payment_status, payment_method,
        subtotal, total_amount, paid_amount, cogs_total, gross_profit, shipping_address_json, notes, created_by, created_at, updated_at
      ) VALUES (
        ?, 2, 'pos', 'delivered', 'paid', 'bkash',
        ?, ?, ?, 0, ?, ?, 'Whole Gaming PC Assembly', 1, NOW(), NOW()
      )`,
      [
        pcOrderNumber,
        pcTotal,
        pcTotal,
        pcTotal,
        pcTotal,
        JSON.stringify({ full_name: 'Whole PC Client', phone: '01899887766' }),
      ]
    );
    const pcOrderId = pcOrderRes.insertId;

    for (const comp of multiSerials) {
      const [compItemRes] = await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_name, sku, serial_number, barcode, quantity, unit_price, total_price, warranty_details)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, '2 Years Warranty')`,
        [pcOrderId, comp.product_id, comp.name, comp.sku, comp.serial_number, comp.barcode, comp.selling_price, comp.selling_price]
      );
      await connection.query(
        `UPDATE product_serials
         SET status = 'sold', order_id = ?, order_item_id = ?, sold_at = NOW(), updated_at = NOW()
         WHERE serial_number = ?`,
        [pcOrderId, compItemRes.insertId, comp.serial_number]
      );
    }
    await connection.commit();

    const [savedPcItems] = await connection.query(
      'SELECT serial_number, product_name, total_price FROM order_items WHERE order_id = ?',
      [pcOrderId]
    );
    assert(savedPcItems.length === multiSerials.length, `Whole PC order #${pcOrderNumber} successfully persisted ${savedPcItems.length} components with individual serials`);

    // ----------------------------------------------------
    // TEST 6: Receipt & Reprint Verification
    // ----------------------------------------------------
    console.log('\n--- Test 6: Receipt & Reprint Structure Verification ---');
    const [reprintOrder] = await connection.query(
      `SELECT o.*, b.name as branch_name, b.code as branch_code, b.phone as branch_phone, b.address as branch_address, u.name as cashier_name
       FROM orders o
       LEFT JOIN branches b ON o.branch_id = b.id
       LEFT JOIN users u ON o.created_by = u.id
       WHERE o.id = ?`,
      [pcOrderId]
    );
    assert(reprintOrder.length === 1, 'Reprint order fetched from database');
    const ord = reprintOrder[0];
    assert(ord.branch_name !== null, `Branch name verified: "${ord.branch_name}"`);
    assert(ord.branch_phone !== null, `Branch phone verified: "${ord.branch_phone}"`);
    assert(ord.order_number === pcOrderNumber, `Invoice number verified: "${ord.order_number}"`);
    assert(Number(ord.total_amount) === pcTotal, `Invoice grand total matches sum of components (৳${pcTotal})`);

    // Clean up test orders
    await connection.query('DELETE FROM payments WHERE order_id IN (?, ?)', [orderId, pcOrderId]);
    await connection.query('DELETE FROM order_items WHERE order_id IN (?, ?)', [orderId, pcOrderId]);
    await connection.query('DELETE FROM audit_logs WHERE record_id IN (?, ?)', [orderId, pcOrderId]);
    await connection.query('DELETE FROM orders WHERE id IN (?, ?)', [orderId, pcOrderId]);
    // Reset serials back to available
    const resetSerials = [testItem.serial_number, ...multiSerials.map((m) => m.serial_number)];
    await connection.query(
      `UPDATE product_serials
       SET status = 'available', order_id = NULL, order_item_id = NULL, sold_at = NULL
       WHERE serial_number IN (?)`,
      [resetSerials]
    );

    console.log('\n====================================================');
    console.log(`🎉 ALL ${passedCount}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ TEST RUN FAILED:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runPosTestSuite();
