const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'corenix_db'
  });
  
  const [cols] = await conn.query('DESCRIBE products');
  const hasStockStatus = cols.some(c => c.Field === 'stock_status');
  if (!hasStockStatus) {
    console.log('Adding stock_status column to products table...');
    await conn.query("ALTER TABLE products ADD COLUMN stock_status VARCHAR(50) NOT NULL DEFAULT 'In Stock' AFTER status");
    console.log('stock_status column added successfully!');
  } else {
    console.log('stock_status column already exists.');
  }
  
  await conn.end();
}

migrate()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
