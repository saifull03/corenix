const mysql = require('mysql2/promise');

async function normalizeCategories() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'corenix_db'
  });

  console.log('Connected to MySQL corenix_db.');

  // 1. Reset all products pc_builder_component and is_pc_builder
  await conn.query(`UPDATE products SET is_pc_builder = 0, pc_builder_component = NULL`);

  // 2. Set pc_builder_component strictly according to actual category slug
  const categorySlotMappings = [
    { slot: 'cpu', slugs: ['processor', 'processors', 'cpu'] },
    { slot: 'motherboard', slugs: ['motherboard', 'motherboards', 'mobo'] },
    { slot: 'cooler', slugs: ['cpu-cooler', 'cooler', 'cooling', 'aio-cooler'] },
    { slot: 'ram', slugs: ['ram', 'memory', 'desktop-ram', 'ram-desktop-memory'] },
    { slot: 'storage', slugs: ['storage', 'ssd', 'hdd', 'storage-ssd-hdd', 'm2-nvme', 'internal-storage'] },
    { slot: 'gpu', slugs: ['graphics-card', 'gpu', 'video-card'] },
    { slot: 'psu', slugs: ['power-supply', 'psu'] },
    { slot: 'case', slugs: ['pc-case', 'casing', 'case', 'chassis'] },
    { slot: 'monitor', slugs: ['monitors', 'monitor', 'display'] },
    { slot: 'keyboard', slugs: ['keyboards', 'keyboard'] },
    { slot: 'mouse', slugs: ['gaming-mouse', 'mouse', 'mice'] },
    { slot: 'ups', slugs: ['ups', 'ups-power-backup'] },
  ];

  for (const item of categorySlotMappings) {
    const placeholders = item.slugs.map(() => '?').join(',');
    await conn.query(`
      UPDATE products p
      JOIN categories c ON p.category_id = c.id
      SET p.pc_builder_component = ?, p.is_pc_builder = 1
      WHERE c.slug IN (${placeholders})
    `, [item.slot, ...item.slugs]);
  }

  // 3. Explicitly ensure laptops, desktops, and AIOs are never in pc builder
  await conn.query(`
    UPDATE products p
    JOIN categories c ON p.category_id = c.id
    SET p.is_pc_builder = 0, p.pc_builder_component = NULL
    WHERE c.slug IN (
      'gaming-laptop', 'laptops', 'ultrabooks',
      'brand-desktops', 'hp-desktop-pc', 'hp-aio', 'dell-desktop-pc', 'dell-aio',
      'lenovo-desktop-pc', 'lenovo-aio', 'mac-mini', 'mac-studio', 'apple-imac', 'asus-desktop-pc'
    )
    OR p.name LIKE '%Laptop%'
    OR p.name LIKE '%Notebook%'
    OR p.name LIKE '%Desktop PC%'
    OR p.name LIKE '%All-in-One%'
    OR p.name LIKE '%iMac%'
    OR p.name LIKE '%Mac mini%'
  `);

  console.log('Product categories and pc_builder_component strictly normalized!');
  await conn.end();
}

normalizeCategories().catch(console.error);
