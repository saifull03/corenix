const mysql = require('mysql2/promise');

async function seedPcBuilderProducts() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'corenix_db',
  });

  console.log('Connected to MySQL corenix_db.');

  // Fetch or create categories
  async function getOrCreateCategory(name, slug, parentSlug = null) {
    let parentId = null;
    if (parentSlug) {
      const [p] = await connection.query(`SELECT id FROM categories WHERE slug = ?`, [parentSlug]);
      if (p.length > 0) parentId = p[0].id;
    }
    const [existing] = await connection.query(`SELECT id FROM categories WHERE slug = ?`, [slug]);
    if (existing.length > 0) return existing[0].id;

    const [res] = await connection.query(
      `INSERT INTO categories (parent_id, name, slug, h1, short_desc, meta_title, meta_desc, focus_keyword, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        parentId,
        name,
        slug,
        `${name} Price in Bangladesh`,
        `Explore authentic ${name} at CORENIX with official manufacturer warranty.`,
        `${name} Price in Bangladesh | Official CORENIX`,
        `Buy authentic ${name} with official warranty and fast shipping.`,
        name.toLowerCase()
      ]
    );
    return res.insertId;
  }

  // Fetch or create brands
  async function getOrCreateBrand(name, slug, country = 'Global') {
    const [existing] = await connection.query(`SELECT id FROM brands WHERE slug = ?`, [slug]);
    if (existing.length > 0) return existing[0].id;

    const [res] = await connection.query(
      `INSERT INTO brands (name, slug, country, is_active) VALUES (?, ?, ?, 1)`,
      [name, slug, country]
    );
    return res.insertId;
  }

  // Categories
  const catProcessor = await getOrCreateCategory('Processor', 'processor', 'components');
  const catMobo = await getOrCreateCategory('Motherboard', 'motherboard', 'components');
  const catCooler = await getOrCreateCategory('CPU Cooler', 'cpu-cooler', 'components');
  const catRam = await getOrCreateCategory('RAM (Desktop Memory)', 'ram', 'components');
  const catStorage = await getOrCreateCategory('Storage (SSD & HDD)', 'storage', 'components');
  const catGpu = await getOrCreateCategory('Graphics Card', 'graphics-card', 'components');
  const catPsu = await getOrCreateCategory('Power Supply', 'power-supply', 'components');
  const catCase = await getOrCreateCategory('PC Case', 'pc-case', 'components');
  const catMonitor = await getOrCreateCategory('Monitors', 'monitors');
  const catKeyboard = await getOrCreateCategory('Keyboards', 'keyboards', 'peripherals');
  const catMouse = await getOrCreateCategory('Gaming Mouse', 'gaming-mouse', 'peripherals');
  const catUps = await getOrCreateCategory('UPS (Power Backup)', 'ups', 'accessories');

  // Brands
  const brandAmd = await getOrCreateBrand('AMD', 'amd', 'USA');
  const brandIntel = await getOrCreateBrand('Intel', 'intel', 'USA');
  const brandGigabyte = await getOrCreateBrand('Gigabyte', 'gigabyte', 'Taiwan');
  const brandMsi = await getOrCreateBrand('MSI', 'msi', 'Taiwan');
  const brandAsus = await getOrCreateBrand('ASUS', 'asus', 'Taiwan');
  const brandCorsair = await getOrCreateBrand('Corsair', 'corsair', 'USA');
  const brandSamsung = await getOrCreateBrand('Samsung', 'samsung', 'South Korea');
  const brandDeepcool = await getOrCreateBrand('DeepCool', 'deepcool', 'China');
  const brandLianLi = await getOrCreateBrand('Lian Li', 'lian-li', 'Taiwan');
  const brandNzxt = await getOrCreateBrand('NZXT', 'nzxt', 'USA');
  const brandGskill = await getOrCreateBrand('G.SKILL', 'g-skill', 'Taiwan');
  const brandRazer = await getOrCreateBrand('Razer', 'razer', 'USA');
  const brandLogitech = await getOrCreateBrand('Logitech', 'logitech', 'Switzerland');
  const brandApc = await getOrCreateBrand('APC', 'apc', 'USA');
  const brandMaxgreen = await getOrCreateBrand('MaxGreen', 'maxgreen', 'China');

  // Comprehensive list of PC Builder hardware components
  const pcComponents = [
    // 1. PROCESSORS (CPU)
    {
      name: 'AMD Ryzen 7 9800X3D 8-Core 16-Thread Gaming Processor with 3D V-Cache',
      slug: 'amd-ryzen-7-9800x3d-processor',
      sku: 'CPU-AMD-9800X3D',
      model: '100-100001084WOF',
      brand_id: brandAmd,
      category_id: catProcessor,
      warranty: '3 Years Official Warranty',
      cost: 52000,
      price: 64500,
      discount_price: 59900,
      pc_component: 'cpu',
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'AMD Ryzen 5 7600X 6-Core 12-Thread AM5 Desktop Processor',
      slug: 'amd-ryzen-5-7600x-processor',
      sku: 'CPU-AMD-7600X',
      model: '100-100000593WOF',
      brand_id: brandAmd,
      category_id: catProcessor,
      warranty: '3 Years Official Warranty',
      cost: 21000,
      price: 26500,
      discount_price: 24900,
      pc_component: 'cpu',
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Intel Core i7-14700K 20-Core 28-Thread Raptor Lake Desktop Processor',
      slug: 'intel-core-i7-14700k-processor',
      sku: 'CPU-INTEL-14700K',
      model: 'BX8071514700K',
      brand_id: brandIntel,
      category_id: catProcessor,
      warranty: '3 Years Official Warranty',
      cost: 41000,
      price: 52000,
      discount_price: 48900,
      pc_component: 'cpu',
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80',
    },

    // 2. MOTHERBOARDS
    {
      name: 'GIGABYTE X870 GAMING X WIFI7 DDR5 AMD AM5 ATX Motherboard',
      slug: 'gigabyte-x870-gaming-x-wifi7',
      sku: 'MB-GIG-X870-GX',
      model: 'X870 GAMING X WIFI7',
      brand_id: brandGigabyte,
      category_id: catMobo,
      warranty: '3 Years Official Warranty',
      cost: 28000,
      price: 35000,
      discount_price: 32900,
      pc_component: 'motherboard',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'MSI MAG B650 TOMAHAWK WIFI AMD AM5 DDR5 ATX Motherboard',
      slug: 'msi-mag-b650-tomahawk-wifi',
      sku: 'MB-MSI-B650-TOMAHAWK',
      model: 'MAG B650 TOMAHAWK WIFI',
      brand_id: brandMsi,
      category_id: catMobo,
      warranty: '3 Years Official Warranty',
      cost: 22000,
      price: 27500,
      discount_price: 25900,
      pc_component: 'motherboard',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'ASUS ROG Strix B760-F Gaming WiFi DDR5 Motherboard',
      slug: 'asus-rog-strix-b760-f-gaming-wifi',
      sku: 'MB-ASUS-B760F-WIFI',
      model: 'ROG STRIX B760-F GAMING WIFI',
      brand_id: brandAsus,
      category_id: catMobo,
      warranty: '3 Years Official Warranty',
      cost: 25000,
      price: 31500,
      discount_price: 29500,
      pc_component: 'motherboard',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    },

    // 3. CPU COOLERS
    {
      name: 'DeepCool AK620 High-Performance Dual-Tower CPU Cooler',
      slug: 'deepcool-ak620-high-performance-cpu-cooler',
      sku: 'CLR-DC-AK620',
      model: 'R-AK620-BKNNMT-G',
      brand_id: brandDeepcool,
      category_id: catCooler,
      warranty: '3 Years Official Warranty',
      cost: 5800,
      price: 7800,
      discount_price: 6990,
      pc_component: 'cooler',
      image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'NZXT Kraken 360 RGB All-in-One Liquid CPU Cooler (Black)',
      slug: 'nzxt-kraken-360-rgb-aio-liquid-cooler',
      sku: 'CLR-NZXT-KRAKEN-360',
      model: 'RL-KR360-B1',
      brand_id: brandNzxt,
      category_id: catCooler,
      warranty: '5 Years Official Warranty',
      cost: 19000,
      price: 25500,
      discount_price: 23900,
      pc_component: 'cooler',
      image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
    },

    // 4. RAM (MEMORY)
    {
      name: 'Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL36 Desktop RAM',
      slug: 'corsair-vengeance-rgb-32gb-ddr5-6000mhz',
      sku: 'RAM-COR-VENG-32GB-D5',
      model: 'CMH32GX5M2B6000C36',
      brand_id: brandCorsair,
      category_id: catRam,
      warranty: 'Lifetime Official Warranty',
      cost: 12500,
      price: 17500,
      discount_price: 15900,
      pc_component: 'ram',
      image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'G.SKILL Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz CL32 Gaming RAM (Silver)',
      slug: 'gskill-trident-z5-rgb-32gb-ddr5-6400',
      sku: 'RAM-GSK-TZ5-32GB-6400',
      model: 'F5-6400J3239G16GX2-TZ5RS',
      brand_id: brandGskill,
      category_id: catRam,
      warranty: 'Lifetime Official Warranty',
      cost: 15000,
      price: 19500,
      discount_price: 17900,
      pc_component: 'ram',
      image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=800&q=80',
    },

    // 5. STORAGE (SSD)
    {
      name: 'Samsung 990 PRO 1TB PCIe 4.0 M.2 NVMe Internal SSD with Heatsink',
      slug: 'samsung-990-pro-1tb-nvme-ssd',
      sku: 'SSD-SAM-990PRO-1TB',
      model: 'MZ-V9P1T0CW',
      brand_id: brandSamsung,
      category_id: catStorage,
      warranty: '5 Years Official Warranty',
      cost: 11000,
      price: 14500,
      discount_price: 13200,
      pc_component: 'storage',
      image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80',
    },

    // 6. GRAPHICS CARD (GPU)
    {
      name: 'MSI GeForce RTX 5070 Gaming Trio 12GB GDDR7 Graphics Card',
      slug: 'msi-geforce-rtx-5070-gaming-trio-12gb',
      sku: 'GPU-MSI-RTX5070-12G',
      model: 'RTX 5070 GAMING TRIO 12G',
      brand_id: brandMsi,
      category_id: catGpu,
      warranty: '3 Years Official Warranty',
      cost: 65000,
      price: 82000,
      discount_price: 74900,
      pc_component: 'gpu',
      image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'MSI GeForce RTX 5060 Gaming X 8GB GDDR6 Graphics Card',
      slug: 'msi-geforce-rtx-5060-gaming-x-8gb',
      sku: 'GPU-MSI-RTX5060-8G',
      model: 'RTX 5060 GAMING X 8G',
      brand_id: brandMsi,
      category_id: catGpu,
      warranty: '3 Years Official Warranty',
      cost: 38000,
      price: 46000,
      discount_price: 43500,
      pc_component: 'gpu',
      image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
    },

    // 7. POWER SUPPLY (PSU)
    {
      name: 'Corsair RM750e 750W 80 PLUS Gold Fully Modular ATX 3.0 Power Supply',
      slug: 'corsair-rm750e-750w-power-supply',
      sku: 'PSU-COR-RM750E',
      model: 'CP-9020262-NA',
      brand_id: brandCorsair,
      category_id: catPsu,
      warranty: '7 Years Official Warranty',
      cost: 9500,
      price: 13500,
      discount_price: 11900,
      pc_component: 'psu',
      image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
    },

    // 8. PC CASES (CASING)
    {
      name: 'Lian Li O11 Dynamic EVO RGB Dual-Chamber Panoramic Tempered Glass PC Case',
      slug: 'lian-li-o11-dynamic-evo-rgb-case',
      sku: 'CASE-LL-O11D-EVO-RGB',
      model: 'O11D EVO RGB Black',
      brand_id: brandLianLi,
      category_id: catCase,
      warranty: '1 Year Official Warranty',
      cost: 16500,
      price: 21500,
      discount_price: 19900,
      pc_component: 'case',
      image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'NZXT H9 Flow Dual-Chamber Mid-Tower Airflow PC Casing (Matte White)',
      slug: 'nzxt-h9-flow-dual-chamber-casing-white',
      sku: 'CASE-NZXT-H9-FLOW-WH',
      model: 'CM-H91FW-01',
      brand_id: brandNzxt,
      category_id: catCase,
      warranty: '2 Years Official Warranty',
      cost: 15500,
      price: 19900,
      discount_price: 18500,
      pc_component: 'case',
      image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Corsair 4000D Airflow Tempered Glass Mid-Tower PC Case (Black)',
      slug: 'corsair-4000d-airflow-mid-tower-case',
      sku: 'CASE-COR-4000D-AIR-BK',
      model: 'CC-9011200-WW',
      brand_id: brandCorsair,
      category_id: catCase,
      warranty: '2 Years Official Warranty',
      cost: 7500,
      price: 10500,
      discount_price: 9400,
      pc_component: 'case',
      image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
    },

    // 9. MONITORS
    {
      name: 'MSI Optix MAG274QRF-QD 27" WQHD 165Hz Rapid IPS Esports Gaming Monitor',
      slug: 'msi-optix-mag274qrf-qd-27-gaming-monitor',
      sku: 'MON-MSI-MAG274',
      model: 'Optix MAG274QRF-QD',
      brand_id: brandMsi,
      category_id: catMonitor,
      warranty: '3 Years Official Warranty',
      cost: 38000,
      price: 49000,
      discount_price: 44900,
      pc_component: 'monitor',
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    },

    // 10. KEYBOARDS
    {
      name: 'Razer BlackWidow V4 Pro Mechanical Gaming Keyboard RGB (Green Switch)',
      slug: 'razer-blackwidow-v4-pro-keyboard',
      sku: 'KB-RAZ-BW-V4-PRO',
      model: 'RZ03-04680100-R3M1',
      brand_id: brandRazer,
      category_id: catKeyboard,
      warranty: '2 Years Official Warranty',
      cost: 18500,
      price: 24500,
      discount_price: 22900,
      pc_component: 'keyboard',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Corsair K70 RGB PRO Mechanical Gaming Keyboard (Cherry MX Speed)',
      slug: 'corsair-k70-rgb-pro-keyboard',
      sku: 'KB-COR-K70-PRO',
      model: 'CH-9109414-NA',
      brand_id: brandCorsair,
      category_id: catKeyboard,
      warranty: '2 Years Official Warranty',
      cost: 14500,
      price: 18900,
      discount_price: 17500,
      pc_component: 'keyboard',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    },

    // 11. GAMING MOUSE
    {
      name: 'Logitech G PRO X SUPERLIGHT 2 Wireless Ultra-Lightweight Gaming Mouse (White)',
      slug: 'logitech-g-pro-x-superlight-2-mouse',
      sku: 'MS-LOG-GPX-SL2-WH',
      model: '910-006679',
      brand_id: brandLogitech,
      category_id: catMouse,
      warranty: '2 Years Official Replacement Warranty',
      cost: 13500,
      price: 17500,
      discount_price: 16200,
      pc_component: 'mouse',
      image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Razer DeathAdder V3 Pro Wireless Gaming Mouse 30K Optical Sensor (Black)',
      slug: 'razer-deathadder-v3-pro-wireless-mouse',
      sku: 'MS-RAZ-DA-V3-PRO',
      model: 'RZ01-04630100-R3A1',
      brand_id: brandRazer,
      category_id: catMouse,
      warranty: '2 Years Official Warranty',
      cost: 12000,
      price: 15500,
      discount_price: 14400,
      pc_component: 'mouse',
      image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    },

    // 12. UPS (POWER BACKUP)
    {
      name: 'MaxGreen 1200VA Offline UPS with Digital Display and AVR Protection',
      slug: 'maxgreen-1200va-offline-ups',
      sku: 'UPS-MG-1200VA-LED',
      model: 'MG-LI-1200VA',
      brand_id: brandMaxgreen,
      category_id: catUps,
      warranty: '1 Year Official Warranty',
      cost: 5600,
      price: 7500,
      discount_price: 6900,
      pc_component: 'ups',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'APC Back-UPS Pro 1500VA Line Interactive Sine Wave UPS (BR1500GI)',
      slug: 'apc-back-ups-pro-1500va-sine-wave',
      sku: 'UPS-APC-BR1500GI',
      model: 'BR1500GI',
      brand_id: brandApc,
      category_id: catUps,
      warranty: '2 Years Official Warranty',
      cost: 24000,
      price: 31000,
      discount_price: 28900,
      pc_component: 'ups',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    },
  ];

  for (const p of pcComponents) {
    const discountAmount = p.price - p.discount_price;
    const discountPercent = Math.round((discountAmount / p.price) * 100);

    await connection.query(
      `INSERT INTO products (
        name, slug, sku, model, brand_id, category_id, warranty_period,
        purchase_cost, avg_cost, selling_price, discount_price, min_selling_price,
        discount_amount, discount_percent, is_featured, is_new, is_pc_builder, pc_builder_component, seo_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 1, ?, 95)
      ON DUPLICATE KEY UPDATE
        category_id = VALUES(category_id),
        pc_builder_component = VALUES(pc_builder_component),
        is_pc_builder = 1,
        selling_price = VALUES(selling_price),
        discount_price = VALUES(discount_price),
        warranty_period = VALUES(warranty_period)`,
      [
        p.name, p.slug, p.sku, p.model, p.brand_id, p.category_id, p.warranty,
        p.cost, p.cost, p.price, p.discount_price, p.cost + 500,
        discountAmount, discountPercent, p.pc_component
      ]
    );

    const [row] = await connection.query(`SELECT id FROM products WHERE slug = ?`, [p.slug]);
    if (row.length > 0) {
      const pid = row[0].id;
      await connection.query(
        `INSERT IGNORE INTO product_images (product_id, image_url, alt_text, is_primary) VALUES (?, ?, ?, 1)`,
        [pid, p.image, p.name]
      );
      // Seed inventory
      await connection.query(
        `INSERT INTO inventory (product_id, branch_id, quantity) VALUES (?, 1, 25), (?, 2, 10), (?, 3, 5)
         ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)`,
        [pid, pid, pid]
      );
    }
  }

  // Ensure all existing products have their pc_builder_component properly normalized based on category slug
  await connection.query(`
    UPDATE products p
    JOIN categories c ON p.category_id = c.id
    SET p.pc_builder_component = 'cpu', p.is_pc_builder = 1
    WHERE c.slug IN ('processor', 'processors', 'cpu')
  `);

  await connection.query(`
    UPDATE products p
    JOIN categories c ON p.category_id = c.id
    SET p.pc_builder_component = 'motherboard', p.is_pc_builder = 1
    WHERE c.slug IN ('motherboard', 'motherboards', 'mobo')
  `);

  await connection.query(`
    UPDATE products p
    JOIN categories c ON p.category_id = c.id
    SET p.pc_builder_component = 'cooler', p.is_pc_builder = 1
    WHERE c.slug IN ('cpu-cooler', 'cooler', 'cooling')
  `);

  await connection.query(`
    UPDATE products p
    JOIN categories c ON p.category_id = c.id
    SET p.pc_builder_component = 'ram', p.is_pc_builder = 1
    WHERE c.slug IN ('ram', 'ram-desktop-memory', 'memory')
  `);

  await connection.query(`
    UPDATE products p
    JOIN categories c ON p.category_id = c.id
    SET p.pc_builder_component = 'storage', p.is_pc_builder = 1
    WHERE c.slug IN ('storage', 'storage-ssd-hdd', 'ssd', 'm2-nvme')
  `);

  await connection.query(`
    UPDATE products p
    JOIN categories c ON p.category_id = c.id
    SET p.pc_builder_component = 'gpu', p.is_pc_builder = 1
    WHERE c.slug IN ('graphics-card', 'gpu')
  `);

  await connection.query(`
    UPDATE products p
    JOIN categories c ON p.category_id = c.id
    SET p.pc_builder_component = 'psu', p.is_pc_builder = 1
    WHERE c.slug IN ('power-supply', 'psu')
  `);

  await connection.query(`
    UPDATE products p
    JOIN categories c ON p.category_id = c.id
    SET p.pc_builder_component = 'case', p.is_pc_builder = 1
    WHERE c.slug IN ('pc-case', 'casing', 'case')
  `);

  await connection.query(`
    UPDATE products p
    JOIN categories c ON p.category_id = c.id
    SET p.pc_builder_component = 'monitor', p.is_pc_builder = 1
    WHERE c.slug IN ('monitors', 'monitor', 'display')
  `);

  await connection.query(`
    UPDATE products p
    JOIN categories c ON p.category_id = c.id
    SET p.pc_builder_component = 'keyboard', p.is_pc_builder = 1
    WHERE c.slug IN ('keyboards', 'keyboard')
  `);

  await connection.query(`
    UPDATE products p
    JOIN categories c ON p.category_id = c.id
    SET p.pc_builder_component = 'mouse', p.is_pc_builder = 1
    WHERE c.slug IN ('gaming-mouse', 'mouse')
  `);

  await connection.query(`
    UPDATE products p
    JOIN categories c ON p.category_id = c.id
    SET p.pc_builder_component = 'ups', p.is_pc_builder = 1
    WHERE c.slug IN ('ups')
  `);

  // Explicitly ensure Laptops are NEVER pc_builder components
  await connection.query(`
    UPDATE products p
    JOIN categories c ON p.category_id = c.id
    SET p.is_pc_builder = 0, p.pc_builder_component = NULL
    WHERE c.slug IN ('gaming-laptop', 'laptops', 'ultrabooks')
       OR p.name LIKE '%Laptop%' OR p.name LIKE '%Notebook%' OR p.name LIKE '%Zephyrus%'
  `);

  console.log('Successfully seeded and normalized all PC builder components!');
  await connection.end();
}

seedPcBuilderProducts().catch(err => {
  console.error('Error seeding PC Builder products:', err);
});
