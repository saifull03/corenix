const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'corenix_db',
};

async function testDB() {
  try {
    const conn = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL successfully.');

    const [tables] = await conn.query(`SHOW TABLES LIKE '%other_house%'`);
    console.log('Other house tables:', tables);

    const [tablesAll] = await conn.query(`SHOW TABLES`);
    console.log('All tables:', tablesAll.map(t => Object.values(t)[0]));

    try {
      const [salesCols] = await conn.query(`DESCRIBE other_house_sales`);
      console.log('other_house_sales columns:', salesCols.map(c => c.Field));
      
      const [salesCount] = await conn.query(`SELECT COUNT(*) as count FROM other_house_sales`);
      console.log('other_house_sales count:', salesCount);

      const [sampleSales] = await conn.query(`SELECT * FROM other_house_sales LIMIT 5`);
      console.log('other_house_sales rows:', sampleSales);
    } catch (err) {
      console.log('other_house_sales error:', err.message);
    }

    try {
      const [serials] = await conn.query(`SELECT id, serial_number, product_id, branch_id, status FROM product_serials WHERE status = 'available' LIMIT 5`);
      console.log('Available serials sample:', serials);
    } catch (err) {
      console.log('product_serials error:', err.message);
    }

    await conn.end();
  } catch (e) {
    console.error('DB test error:', e);
  }
}

testDB();
