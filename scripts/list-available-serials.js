const mysql = require('mysql2/promise');

async function listAll() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'corenix_db'
  });

  const [products] = await conn.query(`
    SELECT p.id, p.name, p.sku, 
           (SELECT quantity FROM inventory WHERE product_id = p.id AND branch_id = 1) as wh_qty,
           (SELECT quantity FROM inventory WHERE product_id = p.id AND branch_id = 2) as shop1_qty,
           (SELECT quantity FROM inventory WHERE product_id = p.id AND branch_id = 3) as shop2_qty,
           (SELECT COUNT(*) FROM product_serials WHERE product_id = p.id AND status = 'available') as total_serials
    FROM products p
    WHERE (SELECT COALESCE(SUM(quantity), 0) FROM inventory WHERE product_id = p.id) > 0
    ORDER BY p.name ASC
  `);

  console.log(`TOTAL PRODUCTS WITH AVAILABLE STOCK: ${products.length}\n`);

  for (const p of products) {
    const totalStock = (p.wh_qty || 0) + (p.shop1_qty || 0) + (p.shop2_qty || 0);
    console.log(`=======================================================`);
    console.log(`📦 [ID: ${p.id}] ${p.name}`);
    console.log(`   SKU: ${p.sku} | Total Stock: ${totalStock} Units (WH: ${p.wh_qty || 0}, Uttara: ${p.shop1_qty || 0}, Dhanmondi: ${p.shop2_qty || 0})`);
    console.log(`   Available Serials: ${p.total_serials}`);

    const [serials] = await conn.query(`
      SELECT ps.serial_number, ps.barcode, b.code as branch_code
      FROM product_serials ps
      JOIN branches b ON ps.branch_id = b.id
      WHERE ps.product_id = ? AND ps.status = 'available'
      ORDER BY ps.branch_id, ps.serial_number
    `, [p.id]);

    if (serials.length > 0) {
      console.log(`   Serials List:`);
      serials.forEach((s, idx) => {
        console.log(`     ${idx + 1}. [${s.branch_code}] ${s.serial_number} (Barcode: ${s.barcode || 'N/A'})`);
      });
    }
  }

  await conn.end();
}

listAll();
