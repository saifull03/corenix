const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'corenix_db',
};

async function checkProductsTable() {
  const conn = await mysql.createConnection(dbConfig);
  try {
    const [cols] = await conn.query('DESCRIBE products');
    console.log('products columns:', cols.map(c => c.Field));
  } finally {
    await conn.end();
  }
}

checkProductsTable();
