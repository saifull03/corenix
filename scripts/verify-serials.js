const mysql = require('mysql2/promise');

async function test() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'corenix_db'
  });

  const [products] = await conn.query(`
    SELECT p.id, p.name, p.sku, 
           (SELECT quantity FROM inventory WHERE product_id = p.id AND branch_id = 1) as wh_stock,
           (SELECT COUNT(*) FROM product_serials WHERE product_id = p.id AND branch_id = 1 AND status = 'available') as wh_available_serials
    FROM products p
    WHERE (SELECT quantity FROM inventory WHERE product_id = p.id AND branch_id = 1) > 0
    ORDER BY p.id ASC
    LIMIT 15
  `);

  console.log('Central Main Warehouse (Branch 1) - Stock vs Available Serials:');
  console.table(products);

  const [ryzenSerials] = await conn.query(`
    SELECT serial_number, barcode, status 
    FROM product_serials 
    WHERE product_id = 18 AND branch_id = 1 AND status = 'available'
    ORDER BY serial_number ASC
  `);
  console.log('\nAll 13 Serials for AMD Ryzen 5 7600X (SKU: CPU-AMD-7600X) at Central Main Warehouse:');
  console.table(ryzenSerials);

  await conn.end();
}

test();
