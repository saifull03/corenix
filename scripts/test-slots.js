const mysql = require('mysql2/promise');

async function testSlots() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'corenix_db'
  });

  const [products] = await conn.query(`
    SELECT p.id, p.name, p.pc_builder_component, p.is_pc_builder, c.slug as category_slug, c.name as category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.status = 'published'
  `);

  console.log(`Total active products: ${products.length}\n`);

  const slots = ['cpu', 'motherboard', 'cooler', 'ram', 'ram2', 'storage', 'storage2', 'gpu', 'psu', 'case', 'monitor', 'keyboard', 'mouse', 'ups'];

  const slotCategoryMap = {
    cpu: ['processor', 'processors', 'cpu'],
    motherboard: ['motherboard', 'motherboards', 'mobo'],
    cooler: ['cpu-cooler', 'cooler', 'cooling', 'aio-cooler'],
    ram: ['ram', 'memory', 'desktop-ram', 'ram-desktop-memory'],
    ram2: ['ram', 'memory', 'desktop-ram', 'ram-desktop-memory'],
    storage: ['storage', 'ssd', 'hdd', 'storage-ssd-hdd', 'm2-nvme'],
    storage2: ['storage', 'ssd', 'hdd', 'storage-ssd-hdd', 'm2-nvme'],
    gpu: ['graphics-card', 'gpu', 'video-card'],
    psu: ['power-supply', 'psu'],
    case: ['pc-case', 'casing', 'case', 'chassis'],
    monitor: ['monitors', 'monitor', 'display'],
    keyboard: ['keyboards', 'keyboard'],
    mouse: ['gaming-mouse', 'mouse', 'mice'],
    ups: ['ups', 'ups-power-backup'],
  };

  for (const slot of slots) {
    const target = slot === 'ram2' ? 'ram' : slot === 'storage2' ? 'storage' : slot;
    const allowedCats = slotCategoryMap[slot];
    const matches = products.filter(p => {
      // Direct category or pc_builder_component match
      const catSlug = (p.category_slug || '').toLowerCase();
      const comp = (p.pc_builder_component || '').toLowerCase();
      return comp === target || allowedCats.includes(catSlug);
    });

    console.log(`Slot [${slot}] -> ${matches.length} products`);
    matches.forEach(m => console.log(`   - ${m.name.substring(0, 50)} (Category: ${m.category_slug}, Comp: ${m.pc_builder_component})`));
  }

  await conn.end();
}

testSlots().catch(console.error);
