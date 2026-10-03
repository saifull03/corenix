const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'corenix_db',
};

async function migrateTable() {
  const conn = await mysql.createConnection(dbConfig);
  try {
    console.log('Migrating other_house_sales table...');
    
    await conn.query(`DROP TABLE IF EXISTS other_house_sales`);
    
    await conn.query(`
      CREATE TABLE other_house_sales (
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
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
        INDEX idx_ohs_serial (serial_number),
        INDEX idx_ohs_payment_status (payment_status),
        INDEX idx_ohs_house_name (house_name),
        INDEX idx_ohs_branch (branch_id),
        INDEX idx_ohs_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ other_house_sales table migrated successfully with full schema!');
    
    const [cols] = await conn.query(`DESCRIBE other_house_sales`);
    console.log('New columns count:', cols.length);
    console.log('Columns:', cols.map(c => c.Field).join(', '));
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await conn.end();
  }
}

migrateTable();
