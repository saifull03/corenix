const mysql = require('mysql2/promise');

async function cleanPrebuiltFlags() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'corenix_db',
  });

  console.log('Connected to MySQL.');

  // Set is_pc_builder = 0 and pc_builder_component = NULL for all pre-built desktops, laptops, servers, all-in-ones, etc.
  const [res] = await conn.query(`
    UPDATE products p
    JOIN categories c ON p.category_id = c.id
    SET p.is_pc_builder = 0, p.pc_builder_component = NULL
    WHERE c.slug IN ('desktop-pc', 'hp-desktop-pc', 'dell-desktop-pc', 'asus-desktop-pc', 'lenovo-desktop-pc', 'all-in-one-pc', 'brand-pc', 'gaming-laptop', 'laptop', 'macbook', 'ultrabook', 'server')
       OR c.name LIKE '%Desktop PC%'
       OR c.name LIKE '%Brand PC%'
       OR c.name LIKE '%All-in-One%'
       OR c.name LIKE '%Laptop%'
       OR c.name LIKE '%Server%'
       OR p.name LIKE '%ProDesk%'
       OR p.name LIKE '%EliteDesk%'
       OR p.name LIKE '%ThinkCentre%'
       OR p.name LIKE '%OptiPlex%'
       OR p.name LIKE '%Vostro%'
       OR p.name LIKE '%Commercial Desktop%'
       OR p.name LIKE '%Mac Mini%'
       OR p.name LIKE '%iMac%'
  `);

  console.log(`Cleaned ${res.affectedRows} pre-built desktop/laptop products from PC Builder component flag.`);

  // Verify HP ProDesk 400 G9
  const [prodesk] = await conn.query(`
    SELECT p.id, p.name, p.is_pc_builder, p.pc_builder_component, c.name as category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.name LIKE '%ProDesk%'
  `);

  console.log('HP ProDesk Status:', prodesk);

  await conn.end();
}

cleanPrebuiltFlags().catch(console.error);
