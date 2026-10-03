const mysql = require('mysql2/promise');

async function check() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'corenix_db'
  });

  const [tables] = await conn.query("SHOW TABLES LIKE 'stock_transfer%'");
  console.log('Stock transfer tables:', tables);

  const [branches] = await conn.query('SELECT id, name, code FROM branches');
  console.log('Branches:', branches);

  const [invCols] = await conn.query('SHOW COLUMNS FROM inventory');
  console.log('Inventory cols:', invCols.map(c => c.Field));

  const [stCols] = await conn.query('SHOW COLUMNS FROM stock_transfers');
  console.log('Stock transfer cols:', stCols.map(c => c.Field));

  const [stiCols] = await conn.query('SHOW COLUMNS FROM stock_transfer_items');
  console.log('Stock transfer items cols:', stiCols.map(c => c.Field));

  await conn.end();
}

check().catch(console.error);
