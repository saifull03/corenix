const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'corenix_db',
};

async function createPaymentsTable() {
  const conn = await mysql.createConnection(dbConfig);
  try {
    console.log('Creating partner_house_payments table...');
    
    await conn.query(`
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

    console.log('✅ partner_house_payments table created successfully!');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    await conn.end();
  }
}

createPaymentsTable();
