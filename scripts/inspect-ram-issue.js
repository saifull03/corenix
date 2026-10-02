const mysql = require('mysql2/promise');

async function inspect() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'corenix_db'
  });

  // 1. Check all categories matching RAM
  const [ramCats] = await conn.query(`
    SELECT id, parent_id, name, slug
    FROM categories
    WHERE name LIKE '%RAM%' OR name LIKE '%Memory%' OR slug LIKE '%ram%' OR slug LIKE '%memory%'
  `);
  console.log('RAM Categories in DB:', ramCats);

  // 2. Check Kingston products or recently updated products
  const [kingstonProducts] = await conn.query(`
    SELECT p.id, p.name, p.category_id, c.name as category_name, c.slug as category_slug,
           p.is_pc_builder, p.pc_builder_component, p.status, p.selling_price, p.discount_price
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN brands b ON p.brand_id = b.id
    WHERE b.slug = 'kingston' OR p.name LIKE '%Kingston%' OR c.slug LIKE '%ram%'
    ORDER BY p.id DESC
  `);
  console.log('\nKingston / RAM Products:', kingstonProducts);

  await conn.end();
}

inspect().catch(console.error);
