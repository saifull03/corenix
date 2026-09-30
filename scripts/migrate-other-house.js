const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'corenix_db',
  });

  console.log('Connected to MySQL');

  // 1. Create other_house_purchases table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`other_house_purchases\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`tracking_number\` VARCHAR(50) NOT NULL UNIQUE,
      \`house_name\` VARCHAR(150) NOT NULL,
      \`house_contact\` VARCHAR(100) NULL,
      \`house_phone\` VARCHAR(50) NULL,
      \`house_address\` TEXT NULL,
      \`supplier_id\` INT NULL,
      \`branch_id\` INT NOT NULL,
      \`product_id\` INT NULL,
      \`product_name\` VARCHAR(255) NOT NULL,
      \`product_brand\` VARCHAR(100) NULL,
      \`product_category\` VARCHAR(100) NULL,
      \`product_model\` VARCHAR(100) NULL,
      \`serial_number\` VARCHAR(255) NOT NULL,
      \`quantity\` INT NOT NULL DEFAULT 1,
      \`unit_cost\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
      \`total_cost\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
      \`selling_price\` DECIMAL(12,2) NULL DEFAULT 0.00,
      \`warranty_period\` VARCHAR(100) NULL DEFAULT '1 Year Official Warranty',
      \`is_lend\` BOOLEAN NOT NULL DEFAULT TRUE,
      \`payment_status\` ENUM('lend', 'paid', 'partially_paid') NOT NULL DEFAULT 'lend',
      \`paid_amount\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
      \`due_amount\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
      \`payment_method\` VARCHAR(50) NULL,
      \`payment_reference\` VARCHAR(100) NULL,
      \`paid_at\` DATETIME NULL,
      \`paid_by_name\` VARCHAR(100) NULL,
      \`payment_notes\` TEXT NULL,
      \`status\` ENUM('in_stock', 'sold', 'returned_to_house', 'cancelled') NOT NULL DEFAULT 'in_stock',
      \`notes\` TEXT NULL,
      \`created_by\` INT NOT NULL DEFAULT 1,
      \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX \`idx_serial\` (\`serial_number\`),
      INDEX \`idx_payment_status\` (\`payment_status\`),
      INDEX \`idx_house_name\` (\`house_name\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log('Table other_house_purchases verified/created.');

  // Check if we need to seed demo data
  const [existing] = await conn.query('SELECT COUNT(*) as cnt FROM other_house_purchases');
  if (existing[0].cnt === 0) {
    console.log('Seeding initial demo Other House purchases (both Lend and Paid)...');

    // Sample 1: Brought on Lend (Unpaid/Due)
    await conn.query(`
      INSERT INTO other_house_purchases (
        tracking_number, house_name, house_contact, house_phone, house_address,
        branch_id, product_name, product_brand, product_category, product_model,
        serial_number, quantity, unit_cost, total_cost, selling_price, warranty_period,
        is_lend, payment_status, paid_amount, due_amount,
        status, notes, created_at
      ) VALUES (
        'OHP-2026-1001', 'Star Tech & Engineering (Multiplan Branch)', 'Sabbir Hossain', '01712-345678', 'Multiplan Center, Level 4, Shop 412, Elephant Road, Dhaka',
        2, 'MSI GeForce RTX 4070 Ti SUPER 16G Ventus 3X', 'MSI', 'Graphics Cards', 'RTX 4070 Ti SUPER',
        'SN-MSI-4070-998812', 1, 108000.00, 108000.00, 118500.00, '3 Years Replacement Warranty',
        1, 'lend', 0.00, 108000.00,
        'in_stock', 'Brought on Lend for walk-in customer demand at Shop 1 Uttara. To be settled within 7 days.',
        NOW() - INTERVAL 2 DAY
      )
    `);

    // Sample 2: Brought on Lend and now PAID (shows when it was paid)
    await conn.query(`
      INSERT INTO other_house_purchases (
        tracking_number, house_name, house_contact, house_phone, house_address,
        branch_id, product_name, product_brand, product_category, product_model,
        serial_number, quantity, unit_cost, total_cost, selling_price, warranty_period,
        is_lend, payment_status, paid_amount, due_amount,
        payment_method, payment_reference, paid_at, paid_by_name, payment_notes,
        status, notes, created_at
      ) VALUES (
        'OHP-2026-1002', 'Ryans Computers Ltd (IDB Bhaban)', 'Tanvir Alam', '01819-876543', 'BCS Computer City, IDB Bhaban, Ground Floor, Agargaon, Dhaka',
        2, 'AMD Ryzen 7 7800X3D Gaming Processor Box', 'AMD', 'Processors', 'Ryzen 7 7800X3D',
        'SN-AMD-7800X3D-441029', 1, 48500.00, 48500.00, 52500.00, '3 Years Official Warranty',
        1, 'paid', 48500.00, 0.00,
        'bKash Merchant', 'TRX-BK78891024', NOW() - INTERVAL 4 HOUR, 'Admin (Saif)', 'Cleared lend via bKash Merchant payment. Receipt voucher #RC-4091.',
        'in_stock', 'Urgent custom PC build requirement. Settled on time.',
        NOW() - INTERVAL 1 DAY
      )
    `);

    // Sample 3: Brought on Lend (Unpaid/Due)
    await conn.query(`
      INSERT INTO other_house_purchases (
        tracking_number, house_name, house_contact, house_phone, house_address,
        branch_id, product_name, product_brand, product_category, product_model,
        serial_number, quantity, unit_cost, total_cost, selling_price, warranty_period,
        is_lend, payment_status, paid_amount, due_amount,
        status, notes, created_at
      ) VALUES (
        'OHP-2026-1003', 'UCC (Uttara Branch Partner)', 'Kamrul Hasan', '01911-223344', 'Sector 3, Uttara Commercial Area, Dhaka',
        2, 'Corsair Vengeance RGB DDR5 32GB (2x16GB) 6000MHz', 'Corsair', 'Memory (RAM)', 'CMH32GX5M2B6000C30',
        'SN-COR-DDR5-881240, SN-COR-DDR5-881241', 2, 14200.00, 28400.00, 31000.00, 'Lifetime Official Warranty',
        1, 'lend', 0.00, 28400.00,
        'in_stock', 'Brought 2 kits in lend for dual build setup.',
        NOW() - INTERVAL 5 HOUR
      )
    `);

    console.log('Seeded demo data successfully.');
  }

  await conn.end();
}

migrate().catch(e => {
  console.error('Migration failed:', e);
  process.exit(1);
});
