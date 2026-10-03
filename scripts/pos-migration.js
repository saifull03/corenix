const mysql = require('mysql2/promise');

async function runMigration() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'corenix_db',
  });

  try {
    console.log('Connected to MySQL database.');

    // 1. Create product_serials table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS product_serials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        branch_id INT NOT NULL,
        serial_number VARCHAR(100) NOT NULL UNIQUE,
        barcode VARCHAR(100) NULL,
        status ENUM('available', 'reserved', 'sold', 'rma', 'damaged') DEFAULT 'available',
        order_id INT NULL,
        order_item_id INT NULL,
        sold_at DATETIME NULL,
        notes VARCHAR(255) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_prod_branch_status (product_id, branch_id, status),
        INDEX idx_serial (serial_number),
        INDEX idx_barcode (barcode),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('1. product_serials table verified/created.');

    // 2. Add serial_number and barcode to order_items if not present
    const [cols] = await conn.query('DESCRIBE order_items');
    const fieldNames = cols.map((c) => c.Field);
    if (!fieldNames.includes('serial_number')) {
      await conn.query('ALTER TABLE order_items ADD COLUMN serial_number VARCHAR(255) NULL AFTER warranty_details');
      console.log('2a. Added serial_number column to order_items.');
    }
    if (!fieldNames.includes('barcode')) {
      await conn.query('ALTER TABLE order_items ADD COLUMN barcode VARCHAR(100) NULL AFTER serial_number');
      console.log('2b. Added barcode column to order_items.');
    }

    // 3. Ensure payment_method can store all payment methods
    await conn.query("ALTER TABLE orders MODIFY COLUMN payment_method VARCHAR(50) NOT NULL DEFAULT 'cash_pos'");
    console.log('3. orders.payment_method modified to VARCHAR(50).');

    // 4. Seed realistic serial numbers for key products across branches if empty
    const [countRes] = await conn.query('SELECT COUNT(*) as count FROM product_serials');
    if (countRes[0].count === 0) {
      const [prods] = await conn.query('SELECT id, sku, barcode, model FROM products');
      const branches = [1, 2, 3]; // WH-MAIN, SHOP-1, SHOP-2
      let totalSeeded = 0;
      for (const p of prods) {
        for (const bId of branches) {
          const cleanSku = (p.sku || 'PRD').replace(/[^a-zA-Z0-9-]/g, '');
          for (let i = 1; i <= 3; i++) {
            const sn = `SN-${cleanSku}-B${bId}-${String(i).padStart(3, '0')}`;
            const barcode = p.barcode || `880${String(p.id).padStart(4, '0')}${bId}${i}`;
            await conn.query(
              'INSERT IGNORE INTO product_serials (product_id, branch_id, serial_number, barcode, status) VALUES (?, ?, ?, ?, ?)',
              [p.id, bId, sn, barcode, 'available']
            );
            totalSeeded++;
          }
        }
      }
      console.log(`4. Seeded ${totalSeeded} product serial numbers.`);
    } else {
      console.log(`4. product_serials already contains ${countRes[0].count} records.`);
    }

    console.log('POS Database Migration completed successfully.');
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

runMigration();
