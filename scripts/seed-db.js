const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'corenix_db',
  });

  console.log('Connected to MySQL. Starting dynamic seeding for CORENIX...');

  const passwordHash = await bcrypt.hash('admin123', 10);
  const operatorPasswordHash = await bcrypt.hash('operator123', 10);
  const customerPasswordHash = await bcrypt.hash('customer123', 10);

  // 1. Roles
  const roles = [
    ['Super Admin', 'super-admin', 'Full platform control over all locations, catalogues, finance, and settings', 1],
    ['Admin', 'admin', 'High-level business administration, approvals, and reports', 1],
    ['Shop Manager', 'shop-manager', 'Manages a specific shop branch operations, POS, and daily stock', 1],
    ['Shop Staff', 'shop-staff', 'Branch-specific sales operator and order processing', 1],
    ['Purchase Manager', 'purchase-manager', 'Procurement, supplier orders, and goods receiving', 1],
    ['Inventory Manager', 'inventory-manager', 'Warehouse management and stock transfers', 1],
    ['RMA Manager', 'rma-manager', 'Warranty handling, repair management, and RMA costs', 1],
    ['Technician', 'technician', 'Diagnosis, repair execution, and RMA testing', 1],
    ['SEO Manager', 'seo-manager', 'SEO landing pages, metadata, sitemaps, and search optimization', 1],
    ['Operator', 'operator', 'Data entry with change-request approval workflow', 1],
  ];

  for (const r of roles) {
    await connection.query(
      `INSERT IGNORE INTO roles (name, slug, description, is_system) VALUES (?, ?, ?, ?)`,
      r
    );
  }

  // 2. Branches
  const branches = [
    ['Central Main Warehouse', 'WH-MAIN', 'warehouse', 'Plot 42, Tejgaon Industrial Area, Dhaka', '+8801700000001', 'warehouse@corenix.com'],
    ['Shop 1 (Uttara Flagship)', 'SHOP-1', 'shop', 'Sector 3, Uttara Model Town, Dhaka', '+8801700000002', 'uttara@corenix.com'],
    ['Shop 2 (Dhanmondi Branch)', 'SHOP-2', 'shop', 'Road 27, Dhanmondi, Dhaka', '+8801700000003', 'dhanmondi@corenix.com'],
    ['CORENIX RMA & Service Hub', 'RMA-HUB', 'rma_center', 'Level 4, IT Plaza, Agargaon, Dhaka', '+8801700000004', 'rma@corenix.com'],
  ];

  for (const b of branches) {
    await connection.query(
      `INSERT IGNORE INTO branches (name, code, type, address, phone, email) VALUES (?, ?, ?, ?, ?, ?)`,
      b
    );
  }

  // 3. Users
  const [roleRows] = await connection.query(`SELECT id, slug FROM roles`);
  const roleMap = Object.fromEntries(roleRows.map(r => [r.slug, r.id]));

  const [branchRows] = await connection.query(`SELECT id, code FROM branches`);
  const branchMap = Object.fromEntries(branchRows.map(b => [b.code, b.id]));

  const users = [
    ['Super Admin', 'admin@corenix.com', '+8801711111111', passwordHash, roleMap['super-admin'], null],
    ['Uttara Shop Manager', 'shop1@corenix.com', '+8801722222222', passwordHash, roleMap['shop-manager'], branchMap['SHOP-1']],
    ['Dhanmondi Shop Manager', 'shop2@corenix.com', '+8801733333333', passwordHash, roleMap['shop-manager'], branchMap['SHOP-2']],
    ['Procurement Lead', 'purchase@corenix.com', '+8801744444444', passwordHash, roleMap['purchase-manager'], branchMap['WH-MAIN']],
    ['Warehouse Head', 'inventory@corenix.com', '+8801755555555', passwordHash, roleMap['inventory-manager'], branchMap['WH-MAIN']],
    ['RMA Lead', 'rma@corenix.com', '+8801766666666', passwordHash, roleMap['rma-manager'], branchMap['RMA-HUB']],
    ['SEO Specialist', 'seo@corenix.com', '+8801777777777', passwordHash, roleMap['seo-manager'], null],
    ['Junior Operator', 'operator@corenix.com', '+8801788888888', operatorPasswordHash, roleMap['operator'], branchMap['SHOP-1']],
  ];

  for (const u of users) {
    await connection.query(
      `INSERT IGNORE INTO users (name, email, phone, password_hash, role_id, branch_id) VALUES (?, ?, ?, ?, ?, ?)`,
      u
    );
  }

  // 4. Categories & Hierarchy
  const categories = [
    // Top-Level
    { name: 'Computer Components', slug: 'components', parent: null, h1: 'High Performance PC Components in Bangladesh', short_desc: 'Browse top tier CPUs, GPUs, motherboards, RAM, and power supplies with official warranty.' },
    { name: 'Laptops', slug: 'laptops', parent: null, h1: 'Official Laptops Price in Bangladesh', short_desc: 'Discover gaming laptops, ultrabooks, and productivity machines from top global brands.' },
    { name: 'Monitors', slug: 'monitors', parent: null, h1: 'Gaming & Professional Display Monitors', short_desc: 'High refresh rate, 4K UHD, OLED, and IPS monitors for esports and creative workflows.' },
    { name: 'Peripherals', slug: 'peripherals', parent: null, h1: 'Gaming Peripherals & Accessories', short_desc: 'Mechanical keyboards, ultra-lightweight mice, headsets, and gaming gear.' },
    // Sub-Categories of Components
    { name: 'Processor', slug: 'processor', parent: 'components', h1: 'Processor (CPU) Price in Bangladesh', short_desc: 'Intel Core and AMD Ryzen desktop processors with multi-core performance.' },
    { name: 'Graphics Card', slug: 'graphics-card', parent: 'components', h1: 'Graphics Card (GPU) Price in Bangladesh', short_desc: 'NVIDIA GeForce RTX 50 & 40 series and AMD Radeon graphics cards for 4K gaming.' },
    { name: 'Motherboard', slug: 'motherboard', parent: 'components', h1: 'Gaming & Workstation Motherboards', short_desc: 'Intel and AMD motherboards featuring PCIe 5.0, WiFi 7, and DDR5 support.' },
    { name: 'RAM (Desktop Memory)', slug: 'ram', parent: 'components', h1: 'Desktop RAM (DDR4 & DDR5)', short_desc: 'High-speed RGB gaming memory and low-profile desktop modules.' },
    { name: 'Storage (SSD & HDD)', slug: 'storage', parent: 'components', h1: 'High Speed NVMe M.2 SSDs', short_desc: 'PCIe Gen 4 and Gen 5 M.2 SSDs with blazing read/write speeds.' },
    { name: 'Power Supply', slug: 'power-supply', parent: 'components', h1: '80 PLUS Certified Power Supplies', short_desc: 'ATX 3.0 compatible Gold and Platinum certified modular power supplies.' },
    { name: 'CPU Cooler', slug: 'cpu-cooler', parent: 'components', h1: 'AIO Liquid & Air CPU Coolers', short_desc: 'Keep your enthusiast processor cool with 360mm liquid coolers and dual-tower air coolers.' },
    { name: 'PC Case', slug: 'pc-case', parent: 'components', h1: 'Gaming Casing & Chasis', short_desc: 'High airflow mesh and dual-chamber panoramic glass PC cases.' },
    // Sub-Categories of Laptops
    { name: 'Gaming Laptop', slug: 'gaming-laptop', parent: 'laptops', h1: 'Ultimate Gaming Laptops in Bangladesh', short_desc: 'RTX graphics powered gaming notebooks with high refresh displays.' },
    { name: 'Ultrabook & Business', slug: 'ultrabook', parent: 'laptops', h1: 'Thin, Light & Business Laptops', short_desc: 'All-day battery life, slim form factor, and vivid OLED screens.' },
  ];

  for (const c of categories) {
    let parentId = null;
    if (c.parent) {
      const [p] = await connection.query(`SELECT id FROM categories WHERE slug = ?`, [c.parent]);
      if (p.length > 0) parentId = p[0].id;
    }

    await connection.query(
      `INSERT INTO categories (parent_id, name, slug, h1, short_desc, meta_title, meta_desc, focus_keyword)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE h1 = VALUES(h1), short_desc = VALUES(short_desc)`,
      [
        parentId,
        c.name,
        c.slug,
        c.h1,
        c.short_desc,
        `${c.name} Price in Bangladesh | CORENIX`,
        `Buy authentic ${c.name} in Bangladesh from CORENIX with official manufacturer warranty and fast delivery.`,
        c.name.toLowerCase()
      ]
    );
  }

  // 5. Brands
  const brands = [
    { name: 'MSI', slug: 'msi', country: 'Taiwan', website: 'https://www.msi.com', desc: 'Micro-Star International is a world leader in gaming, content creation, and AI PC hardware.' },
    { name: 'ASUS', slug: 'asus', country: 'Taiwan', website: 'https://www.asus.com', desc: 'ASUS is renowned for gaming motherboards, ROG laptops, graphics cards, and premium displays.' },
    { name: 'Gigabyte', slug: 'gigabyte', country: 'Taiwan', website: 'https://www.gigabyte.com', desc: 'Gigabyte delivers AORUS gaming hardware, motherboards, GPUs, and high-performance monitors.' },
    { name: 'Intel', slug: 'intel', country: 'USA', website: 'https://www.intel.com', desc: 'Intel creates world-changing technology that enables global progress and enriches lives.' },
    { name: 'AMD', slug: 'amd', country: 'USA', website: 'https://www.amd.com', desc: 'AMD drives innovation in high-performance computing, graphics and visualization technologies.' },
    { name: 'Corsair', slug: 'corsair', country: 'USA', website: 'https://www.corsair.com', desc: 'Corsair is a leading global developer and manufacturer of high-performance gear for gamers and creators.' },
    { name: 'Samsung', slug: 'samsung', country: 'South Korea', website: 'https://www.samsung.com', desc: 'Samsung Electronics is a global leader in high-speed V-NAND SSDs and state of the art OLED monitors.' },
    { name: 'DeepCool', slug: 'deepcool', country: 'China', website: 'https://www.deepcool.com', desc: 'DeepCool builds premier thermal solutions, AIO liquid coolers, and designer computer cases.' },
    { name: 'Razer', slug: 'razer', country: 'USA/Singapore', website: 'https://www.razer.com', desc: 'For Gamers. By Gamers. Razer is the global leading lifestyle brand for gamers.' },
    { name: 'Kingston', slug: 'kingston', country: 'USA', website: 'https://www.kingston.com', desc: 'Kingston Technology is the world leader in memory products and storage solutions.' },
  ];

  for (const b of brands) {
    await connection.query(
      `INSERT INTO brands (name, slug, logo, country, website, description, short_desc, is_featured, meta_title, meta_desc, focus_keyword)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
       ON DUPLICATE KEY UPDATE description = VALUES(description), logo = VALUES(logo)`,
      [
        b.name,
        b.slug,
        `/images/brands/${b.slug}.svg`,
        b.country,
        b.website,
        b.desc,
        `Official ${b.name} products available at CORENIX with genuine warranty.`,
        `${b.name} Products Price in Bangladesh | CORENIX`,
        `Explore genuine ${b.name} components, laptops, and peripherals at CORENIX Bangladesh. Official distributor guarantee.`,
        b.name.toLowerCase()
      ]
    );
  }

  // 6. Dynamic Attribute Groups & Attributes
  const groups = [
    { name: 'Processor Specs', order: 1 },
    { name: 'GPU & Graphics', order: 2 },
    { name: 'Memory & Storage', order: 3 },
    { name: 'Display & Screen', order: 4 },
    { name: 'Power & Thermal', order: 5 },
    { name: 'General & Physical', order: 6 },
  ];

  const groupMap = {};
  for (const g of groups) {
    const [res] = await connection.query(
      `INSERT INTO attribute_groups (name, order_index) VALUES (?, ?) ON DUPLICATE KEY UPDATE order_index = VALUES(order_index)`,
      [g.name, g.order]
    );
    const [row] = await connection.query(`SELECT id FROM attribute_groups WHERE name = ?`, [g.name]);
    groupMap[g.name] = row[0].id;
  }

  const attributes = [
    // CPU
    { group: 'Processor Specs', name: 'CPU Socket', code: 'cpu_socket', type: 'select', filterable: true },
    { group: 'Processor Specs', name: 'Total Cores', code: 'cpu_cores', type: 'number', filterable: true },
    { group: 'Processor Specs', name: 'Total Threads', code: 'cpu_threads', type: 'number', filterable: false },
    { group: 'Processor Specs', name: 'Base Clock', code: 'cpu_base_clock', type: 'text', filterable: false },
    { group: 'Processor Specs', name: 'Boost Clock', code: 'cpu_boost_clock', type: 'text', filterable: false },
    // GPU
    { group: 'GPU & Graphics', name: 'GPU Chipset', code: 'gpu_chipset', type: 'select', filterable: true },
    { group: 'GPU & Graphics', name: 'VRAM Capacity', code: 'gpu_vram', type: 'select', filterable: true },
    { group: 'GPU & Graphics', name: 'Memory Type', code: 'gpu_memory_type', type: 'select', filterable: true },
    { group: 'GPU & Graphics', name: 'Memory Bus', code: 'gpu_memory_bus', type: 'select', filterable: true },
    { group: 'GPU & Graphics', name: 'GPU Length (mm)', code: 'gpu_length', type: 'number', filterable: false },
    // Memory & Storage
    { group: 'Memory & Storage', name: 'RAM Capacity', code: 'ram_capacity', type: 'select', filterable: true },
    { group: 'Memory & Storage', name: 'RAM Speed (MHz)', code: 'ram_speed', type: 'select', filterable: true },
    { group: 'Memory & Storage', name: 'RAM Standard', code: 'ram_type', type: 'select', filterable: true },
    { group: 'Memory & Storage', name: 'Storage Capacity', code: 'storage_capacity', type: 'select', filterable: true },
    { group: 'Memory & Storage', name: 'SSD Interface', code: 'ssd_interface', type: 'select', filterable: true },
    // Display
    { group: 'Display & Screen', name: 'Screen Size', code: 'screen_size', type: 'select', filterable: true },
    { group: 'Display & Screen', name: 'Resolution', code: 'screen_resolution', type: 'select', filterable: true },
    { group: 'Display & Screen', name: 'Refresh Rate', code: 'refresh_rate', type: 'select', filterable: true },
    { group: 'Display & Screen', name: 'Panel Type', code: 'panel_type', type: 'select', filterable: true },
    // Power
    { group: 'Power & Thermal', name: 'Wattage (W)', code: 'psu_wattage', type: 'select', filterable: true },
    { group: 'Power & Thermal', name: 'Efficiency Rating', code: 'psu_rating', type: 'select', filterable: true },
    { group: 'Power & Thermal', name: 'Cooler Socket Support', code: 'cooler_socket', type: 'multiselect', filterable: true },
  ];

  const attrMap = {};
  for (const a of attributes) {
    await connection.query(
      `INSERT INTO attributes (group_id, name, code, input_type, is_filterable)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), is_filterable = VALUES(is_filterable)`,
      [groupMap[a.group], a.name, a.code, a.type, a.filterable]
    );
    const [row] = await connection.query(`SELECT id FROM attributes WHERE code = ?`, [a.code]);
    attrMap[a.code] = row[0].id;
  }

  // 7. Products
  const [catRows] = await connection.query(`SELECT id, slug FROM categories`);
  const catMap = Object.fromEntries(catRows.map(c => [c.slug, c.id]));

  const [bRows] = await connection.query(`SELECT id, slug FROM brands`);
  const brandLookup = Object.fromEntries(bRows.map(b => [b.slug, b.id]));

  const products = [
    {
      name: 'MSI GeForce RTX 5060 Gaming X 8GB GDDR6 Graphics Card',
      slug: 'msi-rtx-5060-gaming-x-8gb',
      sku: 'GPU-MSI-5060-GX',
      model: 'RTX 5060 Gaming X 8G',
      brand: 'msi',
      category: 'graphics-card',
      warranty: '3 Years Official Replacement Warranty',
      cost: 41000,
      price: 49500,
      discount_price: 46900,
      is_featured: 1,
      is_new: 1,
      is_pc_builder: 1,
      pc_component: 'gpu',
      specs: [
        { code: 'gpu_chipset', val: 'NVIDIA GeForce RTX 5060' },
        { code: 'gpu_vram', val: '8GB' },
        { code: 'gpu_memory_type', val: 'GDDR6' },
        { code: 'gpu_memory_bus', val: '128-bit' },
        { code: 'gpu_length', val: '247' },
      ],
      overview: 'The MSI GeForce RTX 5060 Gaming X 8GB brings next-gen AI gaming performance to competitive and AAA gamers alike, featuring TWIN FROZR 9 thermal architecture, TORX Fan 5.0, and zero-RPM silent cooling.',
      features: ['NVIDIA Blackwell Architecture & DLSS 4 AI Upscaling', 'TWIN FROZR 9 Dual Fan Thermal Design', 'Reinforced Metal Backplate with Flow-Through Venting', 'MSI Center Software for Real-Time Overclocking and Mystic Light RGB'],
      inBox: 'MSI RTX 5060 Gaming X GPU, Quick Start Guide, Warranty Card, Anti-sag Bracket',
      seoTitle: 'MSI RTX 5060 Gaming X 8GB Price in Bangladesh | CORENIX',
      seoDesc: 'Buy MSI RTX 5060 Gaming X 8GB Graphics Card in Bangladesh. Check latest price, benchmark specs, 3 years warranty and branch availability from CORENIX.',
      keyword: 'msi rtx 5060 gaming x'
    },
    {
      name: 'Intel Core i7-14700K 20-Core 28-Thread Raptor Lake Processor',
      slug: 'intel-core-i7-14700k-processor',
      sku: 'CPU-INTEL-14700K',
      model: 'BX8071514700K',
      brand: 'intel',
      category: 'processor',
      warranty: '3 Years Official Warranty',
      cost: 43000,
      price: 52000,
      discount_price: 48900,
      is_featured: 1,
      is_new: 1,
      is_pc_builder: 1,
      pc_component: 'cpu',
      specs: [
        { code: 'cpu_socket', val: 'LGA 1700' },
        { code: 'cpu_cores', val: '20' },
        { code: 'cpu_threads', val: '28' },
        { code: 'cpu_base_clock', val: '3.40 GHz' },
        { code: 'cpu_boost_clock', val: '5.60 GHz' },
      ],
      overview: 'Experience extreme desktop performance with Intel Core i7-14700K featuring 8 Performance-cores and 12 Efficient-cores. Ideal for 4K video rendering, heavy multitasking, and esports gaming.',
      features: ['20 Cores (8 P-Cores + 12 E-Cores) & 28 Threads', 'Up to 5.6 GHz Max Turbo Frequency', 'Intel UHD Graphics 770 Integrated', 'Supports both DDR4 and DDR5 Memory Platforms'],
      inBox: 'Intel Core i7-14700K Desktop Processor, Installation Manual, Intel Inside Sticker',
      seoTitle: 'Intel Core i7-14700K 20-Core Processor Price in BD | CORENIX',
      seoDesc: 'Buy Intel Core i7-14700K 14th Gen Processor in Bangladesh at the lowest price from CORENIX. 20 cores, 28 threads, 5.6GHz boost with 3 years warranty.',
      keyword: 'intel i7 14700k'
    },
    {
      name: 'ASUS ROG Strix B760-F Gaming WiFi DDR5 Motherboard',
      slug: 'asus-rog-strix-b760-f-gaming-wifi',
      sku: 'MB-ASUS-B760F-WIFI',
      model: 'ROG STRIX B760-F GAMING WIFI',
      brand: 'asus',
      category: 'motherboard',
      warranty: '3 Years Official Warranty',
      cost: 27000,
      price: 33500,
      discount_price: 31900,
      is_featured: 1,
      is_new: 0,
      is_pc_builder: 1,
      pc_component: 'motherboard',
      specs: [
        { code: 'cpu_socket', val: 'LGA 1700' },
        { code: 'ram_type', val: 'DDR5' },
      ],
      overview: 'Dive into high-performance gaming with the ROG Strix B760-F Gaming WiFi. Robust 16+1 power delivery, PCIe 5.0 graphics slot, triple PCIe 4.0 M.2 slots with heatsinks, and built-in WiFi 6E.',
      features: ['Intel LGA 1700 Socket for 14th, 13th & 12th Gen Processors', '16+1 Power Stages rated for 60A per stage', 'PCIe 5.0 x16 Safeslot for next-gen GPUs', 'Onboard WiFi 6E and Intel 2.5Gb Ethernet'],
      inBox: 'ROG Strix B760-F Motherboard, 2x SATA Cables, WiFi Antenna, ROG Keyring, Sticker Pack',
      seoTitle: 'ASUS ROG Strix B760-F Gaming WiFi Motherboard Price in BD | CORENIX',
      seoDesc: 'Check price of ASUS ROG Strix B760-F Gaming WiFi Motherboard in Bangladesh. DDR5, PCIe 5.0, WiFi 6E with 3 years warranty from CORENIX.',
      keyword: 'asus rog strix b760-f'
    },
    {
      name: 'Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL36 Desktop RAM',
      slug: 'corsair-vengeance-rgb-32gb-ddr5-6000mhz',
      sku: 'RAM-COR-32G-6000-RGB',
      model: 'CMH32GX5M2B6000C36',
      brand: 'corsair',
      category: 'ram',
      warranty: 'Lifetime Official Warranty',
      cost: 11000,
      price: 14500,
      discount_price: 13200,
      is_featured: 1,
      is_new: 1,
      is_pc_builder: 1,
      pc_component: 'ram',
      specs: [
        { code: 'ram_capacity', val: '32GB (2x16GB)' },
        { code: 'ram_speed', val: '6000MHz' },
        { code: 'ram_type', val: 'DDR5' },
      ],
      overview: 'Corsair Vengeance RGB DDR5 delivers performance, higher capacities, and ten-zone dynamic RGB lighting powered by iCUE software. Custom performance PCB guarantees signal quality.',
      features: ['32GB Kit (2 x 16GB) DDR5 at 6000MHz CL36', 'Dynamic Ten-Zone Panoramic RGB Lighting', 'Onboard Voltage Regulation for Easy Overclocking', 'Supports Intel XMP 3.0 and AMD EXPO'],
      inBox: '2x 16GB Corsair Vengeance RGB DDR5 Memory Modules, Safety Sheet',
      seoTitle: 'Corsair Vengeance RGB 32GB DDR5 6000MHz RAM Price in BD | CORENIX',
      seoDesc: 'Buy Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL36 RAM in Bangladesh with lifetime warranty at CORENIX.',
      keyword: 'corsair vengeance 32gb ddr5'
    },
    {
      name: 'Samsung 990 PRO 1TB PCIe 4.0 M.2 NVMe SSD with Heatsink',
      slug: 'samsung-990-pro-1tb-nvme-ssd',
      sku: 'SSD-SAM-990PRO-1TB',
      model: 'MZ-V9P1T0CW',
      brand: 'samsung',
      category: 'storage',
      warranty: '5 Years Official Warranty',
      cost: 13500,
      price: 17500,
      discount_price: 15900,
      is_featured: 1,
      is_new: 0,
      is_pc_builder: 1,
      pc_component: 'storage',
      specs: [
        { code: 'storage_capacity', val: '1TB' },
        { code: 'ssd_interface', val: 'PCIe Gen 4.0 x4, NVMe 2.0' },
      ],
      overview: 'Reach near-maximum performance of PCIe 4.0 with Samsung 990 PRO. Sequential read speeds up to 7,450 MB/s and write speeds up to 6,900 MB/s. Built-in heatsink keeps thermals optimal.',
      features: ['Sequential Read: up to 7,450 MB/s, Sequential Write: up to 6,900 MB/s', 'Integrated Slim Heatsink for PS5 and Desktop PC', 'Samsung Pascal Controller & 2GB LPDDR4 Cache', 'Samsung Magician Software for Health Monitoring and Firmware Updates'],
      inBox: 'Samsung 990 PRO 1TB Heatsink SSD, Installation Guide',
      seoTitle: 'Samsung 990 PRO 1TB NVMe SSD Price in Bangladesh | CORENIX',
      seoDesc: 'Buy authentic Samsung 990 PRO 1TB PCIe 4.0 NVMe SSD in Bangladesh with 5 years warranty from CORENIX.',
      keyword: 'samsung 990 pro 1tb'
    },
    {
      name: 'DeepCool AK620 High-Performance Dual-Tower CPU Cooler',
      slug: 'deepcool-ak620-dual-tower-cooler',
      sku: 'CLR-DC-AK620',
      model: 'R-AK620-BKNNMT-G',
      brand: 'deepcool',
      category: 'cpu-cooler',
      warranty: '3 Years Official Warranty',
      cost: 5800,
      price: 7800,
      discount_price: 6990,
      is_featured: 0,
      is_new: 0,
      is_pc_builder: 1,
      pc_component: 'cooler',
      specs: [
        { code: 'cooler_socket', val: 'LGA1700, AM5, AM4, LGA1200' },
      ],
      overview: 'Achieve dominant cooling and quiet efficiency with the DeepCool AK620 High-Performance Dual-Tower CPU Cooler featuring six heatpipes and two 120mm FDB fluid-bearing fans.',
      features: ['260W TDP Maximum Heat Dissipation Power', 'Six 6mm Copper Heatpipes with Dense Dual Matrix Fin Array', 'Two 120mm PWM Fluid Dynamic Bearing Fans (500-1850 RPM)', 'Includes Sturdy All-Metal Mounting Bracket'],
      inBox: 'DeepCool AK620 Cooler, 2x 120mm Fans, Mounting Kit for Intel/AMD, Thermal Paste Tube, L-Screwdriver',
      seoTitle: 'DeepCool AK620 Dual-Tower CPU Cooler Price in BD | CORENIX',
      seoDesc: 'Order DeepCool AK620 CPU Cooler in Bangladesh at best price from CORENIX. 260W TDP capacity, ultra quiet performance.',
      keyword: 'deepcool ak620 cooler'
    },
    {
      name: 'Corsair RM750e 750W 80 PLUS Gold Fully Modular ATX 3.0 Power Supply',
      slug: 'corsair-rm750e-750w-gold-psu',
      sku: 'PSU-COR-RM750E-ATX3',
      model: 'CP-9020262-NA',
      brand: 'corsair',
      category: 'power-supply',
      warranty: '7 Years Official Replacement Warranty',
      cost: 10200,
      price: 13200,
      discount_price: 12400,
      is_featured: 1,
      is_new: 1,
      is_pc_builder: 1,
      pc_component: 'psu',
      specs: [
        { code: 'psu_wattage', val: '750W' },
        { code: 'psu_rating', val: '80 PLUS Gold' },
      ],
      overview: 'Corsair RMe Series fully modular power supplies deliver quiet, reliable power with 80 PLUS Gold efficiency. ATX 3.0 and PCIe 5.0 compliant with native 12VHPWR GPU cable.',
      features: ['750W True Output with ATX 3.0 & PCIe 5.0 12VHPWR Compatibility', '80 PLUS Gold Certified for up to 90% Energy Efficiency', 'Zero RPM Fan Mode for near-silent operation at light loads', '100% Industrial-grade 105°C-rated primary capacitors'],
      inBox: 'Corsair RM750e PSU, AC Power Cable, Modular Cable Pack, Cable Ties, Mounting Screws',
      seoTitle: 'Corsair RM750e 750W ATX 3.0 Gold PSU Price in BD | CORENIX',
      seoDesc: 'Buy Corsair RM750e 750W 80 PLUS Gold ATX 3.0 Modular Power Supply in Bangladesh with 7 years warranty from CORENIX.',
      keyword: 'corsair rm750e 750w'
    },
    {
      name: 'MSI Optix MAG274QRF-QD 27" WQHD 165Hz Rapid IPS Esports Gaming Monitor',
      slug: 'msi-optix-mag274qrf-qd-gaming-monitor',
      sku: 'MON-MSI-MAG274-QD',
      model: 'Optix MAG274QRF-QD',
      brand: 'msi',
      category: 'monitors',
      warranty: '3 Years Official Warranty',
      cost: 39000,
      price: 48500,
      discount_price: 44900,
      is_featured: 1,
      is_new: 0,
      is_pc_builder: 0,
      specs: [
        { code: 'screen_size', val: '27 Inch' },
        { code: 'screen_resolution', val: '2560 x 1440 (WQHD)' },
        { code: 'refresh_rate', val: '165Hz' },
        { code: 'panel_type', val: 'Rapid IPS with Quantum Dot' },
      ],
      overview: 'Visualize your victory with MSI Optix MAG274QRF-QD esports gaming monitor. Equipped with 2560x1440 WQHD resolution, 165Hz refresh rate, 1ms GTG response time and Quantum Dot color vibrancy.',
      features: ['27" WQHD (2560 x 1440) Quantum Dot Rapid IPS Display', '165Hz Ultra-Fast Refresh Rate & 1ms GtG Response Time', 'NVIDIA G-SYNC Compatible for tear-free gaming', 'USB Type-C connectivity with DP Alt Mode and 15W Charging'],
      inBox: 'MSI Monitor, Ergonomic Stand, Power Brick, DisplayPort Cable, HDMI Cable, USB Uplink Cable',
      seoTitle: 'MSI Optix MAG274QRF-QD 27" 165Hz Monitor Price in BD | CORENIX',
      seoDesc: 'Check price of MSI Optix MAG274QRF-QD 27 Inch WQHD 165Hz Quantum Dot Rapid IPS Monitor in Bangladesh from CORENIX. 3 years warranty.',
      keyword: 'msi mag274qrf-qd 27'
    },
    {
      name: 'ASUS ROG Zephyrus G16 (2024) Core Ultra 9 RTX 4080 32GB RAM 2.5K OLED Gaming Laptop',
      slug: 'asus-rog-zephyrus-g16-2024-oled',
      sku: 'LAP-ASUS-G16-4080',
      model: 'GU605MZ-QR042W',
      brand: 'asus',
      category: 'gaming-laptop',
      warranty: '2 Years International Official Warranty',
      cost: 295000,
      price: 355000,
      discount_price: 339000,
      is_featured: 1,
      is_new: 1,
      is_pc_builder: 0,
      specs: [
        { code: 'screen_size', val: '16 Inch 2.5K 240Hz OLED' },
        { code: 'ram_capacity', val: '32GB LPDDR5X' },
        { code: 'storage_capacity', val: '1TB PCIe 4.0 NVMe SSD' },
        { code: 'gpu_chipset', val: 'NVIDIA GeForce RTX 4080 12GB GDDR6' },
      ],
      overview: 'Precision craftsmanship meets pinnacle AI gaming. The all-new Zephyrus G16 is CNC-machined from single-block aluminum, powered by Intel Core Ultra 9 185H and RTX 4080 in an ultra-slim 1.49cm chassis.',
      features: ['Intel Core Ultra 9 185H AI Processor with NPU', 'NVIDIA GeForce RTX 4080 12GB GDDR6 GPU (115W TGP)', '16" 2.5K (2560 x 1600) 240Hz 0.2ms ROG Nebula OLED Display', 'Slash Lighting Array on CNC Aluminum Lid with 6-Speaker Dolby Atmos Sound'],
      inBox: 'ASUS ROG Zephyrus G16 Laptop, 240W AC Adapter, 100W USB-C Travel Charger, ROG Impact Mouse, Sleeve',
      seoTitle: 'ASUS ROG Zephyrus G16 OLED Core Ultra 9 RTX 4080 Laptop BD | CORENIX',
      seoDesc: 'Buy ASUS ROG Zephyrus G16 (2024) Core Ultra 9 RTX 4080 2.5K OLED Gaming Laptop in Bangladesh with 2 years warranty from CORENIX.',
      keyword: 'asus rog zephyrus g16 rtx 4080'
    }
  ];

  for (const p of products) {
    const brandId = brandLookup[p.brand];
    const catId = catMap[p.category];

    const discountAmount = p.price - p.discount_price;
    const discountPercent = Math.round((discountAmount / p.price) * 100);

    const [pRes] = await connection.query(
      `INSERT INTO products (
        name, slug, sku, model, brand_id, category_id, warranty_period,
        purchase_cost, avg_cost, selling_price, discount_price, min_selling_price,
        discount_amount, discount_percent, is_featured, is_new, is_pc_builder, pc_builder_component, seo_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 94)
      ON DUPLICATE KEY UPDATE
        selling_price = VALUES(selling_price),
        discount_price = VALUES(discount_price),
        discount_amount = VALUES(discount_amount),
        discount_percent = VALUES(discount_percent)`,
      [
        p.name, p.slug, p.sku, p.model, brandId, catId, p.warranty,
        p.cost, p.cost, p.price, p.discount_price, p.cost + 1000,
        discountAmount, discountPercent, p.is_featured, p.is_new, p.is_pc_builder, p.pc_component || null
      ]
    );

    const [row] = await connection.query(`SELECT id FROM products WHERE slug = ?`, [p.slug]);
    const productId = row[0].id;

    // Image
    await connection.query(
      `INSERT IGNORE INTO product_images (product_id, image_url, alt_text, is_primary, order_index)
       VALUES (?, ?, ?, 1, 0)`,
      [productId, `https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80`, p.name]
    );

    // Dynamic Specs
    if (p.specs && p.specs.length > 0) {
      for (let i = 0; i < p.specs.length; i++) {
        const s = p.specs[i];
        const attrId = attrMap[s.code];
        if (attrId) {
          await connection.query(
            `INSERT INTO product_specifications (product_id, attribute_id, attribute_value, order_index)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE attribute_value = VALUES(attribute_value)`,
            [productId, attrId, s.val, i]
          );
        }
      }
    }

    // Description & Structured rich content
    await connection.query(
      `INSERT INTO product_descriptions (product_id, overview, key_features_json, what_in_box, warranty_info)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE overview = VALUES(overview), key_features_json = VALUES(key_features_json)`,
      [
        productId,
        p.overview,
        JSON.stringify(p.features),
        p.inBox,
        p.warranty
      ]
    );

    // Dedicated SEO
    await connection.query(
      `INSERT INTO product_seo (product_id, meta_title, meta_desc, focus_keyword, canonical_url, og_title, og_desc)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE meta_title = VALUES(meta_title), meta_desc = VALUES(meta_desc)`,
      [
        productId,
        p.seoTitle,
        p.seoDesc,
        p.keyword,
        `https://corenix.com.bd/product/${p.slug}`,
        p.seoTitle,
        p.seoDesc
      ]
    );

    // Multi-branch Inventory
    // Distribute stock realistically: Warehouse: 15, Shop 1: 5, Shop 2: 3, RMA: 1
    const inventoryDistribution = [
      { branch: 'WH-MAIN', qty: 15, reserved: 0 },
      { branch: 'SHOP-1', qty: 6, reserved: 1 },
      { branch: 'SHOP-2', qty: 4, reserved: 0 },
      { branch: 'RMA-HUB', qty: 1, reserved: 0, rma_qty: 1 },
    ];

    for (const inv of inventoryDistribution) {
      const bId = branchMap[inv.branch];
      await connection.query(
        `INSERT INTO inventory (product_id, branch_id, quantity, reserved_qty, rma_qty, min_stock_level, shelf_location)
         VALUES (?, ?, ?, ?, ?, 2, ?)
         ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)`,
        [productId, bId, inv.qty, inv.reserved, inv.rma_qty || 0, `SHELF-${inv.branch.substring(0,3)}-01`]
      );
    }
  }

  // 8. SEO Landing Pages Builder Seed
  const seoLandingPages = [
    {
      slug: 'rtx-5060',
      h1: 'NVIDIA GeForce RTX 5060 Graphics Cards in Bangladesh',
      intro: 'Looking for the best price on RTX 5060 GPUs? Explore authentic MSI, ASUS, and Gigabyte custom cards at CORENIX with verified warranties and zero-wait stock.',
      title: 'RTX 5060 Graphics Card Price in Bangladesh 2026 | CORENIX',
      desc: 'Buy GeForce RTX 5060 graphics cards in Bangladesh. Check live stock, brand comparisons, benchmarks and best deals at CORENIX.',
      keyword: 'rtx 5060 bd price'
    },
    {
      slug: 'gaming-laptop',
      h1: 'Top Rated Gaming Laptops in Bangladesh 2026',
      intro: 'Experience unbeatable portable gaming power. Choose from ASUS ROG, MSI Raider, and Razer Blade series backed by official distributor warranty.',
      title: 'Best Gaming Laptops Price in Bangladesh | CORENIX',
      desc: 'Browse gaming laptops with RTX 40 and 50 series graphics, 240Hz OLED screens and Intel Core Ultra CPUs at CORENIX Bangladesh.',
      keyword: 'gaming laptop bd'
    },
    {
      slug: '1tb-ssd',
      h1: 'Ultra Fast 1TB NVMe PCIe 4.0 SSDs in Bangladesh',
      intro: 'Supercharge your boot times and workflow loading with genuine high-speed Samsung, Corsair, and Kingston 1TB solid state drives.',
      title: '1TB M.2 NVMe SSD Price in Bangladesh | CORENIX',
      desc: 'Compare and buy 1TB NVMe SSDs in BD from Samsung, Kingston and Corsair at lowest rates with 5-year replacement warranty.',
      keyword: '1tb nvme ssd price in bd'
    }
  ];

  for (const slp of seoLandingPages) {
    await connection.query(
      `INSERT INTO seo_landing_pages (slug, h1, intro_text, meta_title, meta_desc, focus_keyword, canonical_url, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE h1 = VALUES(h1), intro_text = VALUES(intro_text)`,
      [slp.slug, slp.h1, slp.intro, slp.title, slp.desc, slp.keyword, `https://corenix.com.bd/${slp.slug}`]
    );
  }

  // 9. Suppliers & Procurement
  const suppliers = [
    ['Global Brand PLC', 'SUP-GBP', 'Rafiqul Islam', '+8801712000001', 'info@globalbrand.com.bd', 'IDB Bhaban, Dhaka', 'Net 30', 'TIN-99210012'],
    ['Smart Technologies Ltd', 'SUP-SMART', 'Tanvir Ahmed', '+8801712000002', 'contact@smart-tech.bd', 'Mirpur 10, Dhaka', 'Net 15', 'TIN-44810231'],
    ['Star Distribution Ltd', 'SUP-STAR', 'Mohammad Kabir', '+8801712000003', 'sales@stardist.com.bd', 'Elephant Road, Dhaka', 'Immediate', 'TIN-77199201']
  ];

  for (const s of suppliers) {
    await connection.query(
      `INSERT IGNORE INTO suppliers (name, code, contact_person, phone, email, address, payment_terms, tax_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      s
    );
  }

  // 10. Expense Categories & Expenses
  const expCats = [
    ['Shop Rent & Utilities', 'RENT_UTIL'],
    ['Electricity & Power', 'ELECTRICITY'],
    ['Staff Salaries & Benefits', 'SALARY'],
    ['Packaging & Couriers', 'SHIPPING_PACK'],
    ['RMA Transport & Parts', 'RMA_EXP'],
    ['Digital Marketing & Ads', 'MARKETING']
  ];

  for (const ec of expCats) {
    await connection.query(
      `INSERT IGNORE INTO expense_categories (name, code) VALUES (?, ?)`,
      ec
    );
  }

  // 11. Technicians & Service Vendors for RMA
  const techs = [
    ['Engr. Tariqul Hasan', '+8801713000011', 'tariqul@corenix.com', 'GPU & Motherboard SMD Level Repair'],
    ['Kazi Munir', '+8801713000012', 'munir@corenix.com', 'Display, Panel & Power Rail Diagnostics']
  ];

  for (const t of techs) {
    await connection.query(
      `INSERT IGNORE INTO technicians (name, phone, email, specialization) VALUES (?, ?, ?, ?)`,
      t
    );
  }

  const vendors = [
    ['MSI Official Service Center Bangladesh', 'Engr. Shafi', '+8801714000021', 'rma@msi-bd.service', 'Panthapath, Dhaka'],
    ['ASUS Service Hub BD', 'Ziaur Rahman', '+8801714000022', 'support@asus-bd.service', 'Tejgaon, Dhaka']
  ];

  for (const v of vendors) {
    await connection.query(
      `INSERT IGNORE INTO service_vendors (name, contact_person, phone, email, address) VALUES (?, ?, ?, ?, ?)`,
      v
    );
  }

  // 12. CMS Pages & Banners
  const cmsPages = [
    ['About CORENIX', 'about', 'CORENIX is the premier computing and enterprise hardware destination in Bangladesh, established to deliver 100% genuine technology components, multi-branch service centers, and custom enthusiast PC builds.'],
    ['Warranty & RMA Policy', 'warranty-policy', 'All products sold by CORENIX carry official manufacturer warranties. We operate dedicated diagnosis and RMA tracking at our Agargaon Service Hub.'],
    ['Contact & Showroom Locations', 'contact', 'Visit our flagship showrooms in Uttara and Dhanmondi, or our central distribution hub in Tejgaon. Contact hotline: +880 9600-CORENIX.'],
    ['Customer Complaint Cell', 'complaint', 'Submit formal service escalations directly to executive management for rapid resolution within 24 business hours.']
  ];

  for (const cp of cmsPages) {
    await connection.query(
      `INSERT INTO cms_pages (title, slug, content, meta_title, meta_desc)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE content = VALUES(content)`,
      [cp[0], cp[1], cp[2], `${cp[0]} | CORENIX`, `Learn more about ${cp[0]} at CORENIX Bangladesh.`]
    );
  }

  const banners = [
    ['Next-Gen Computing Unleashed', 'Experience high-octane gaming with NVIDIA RTX 50 Series and Intel 14th Gen CPUs', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80', '/category/graphics-card', 'Shop GPUs', 'hero', 1],
    ['Custom PC Builder Engine', 'Verify component socket, TDP wattage, and form factor compatibility in real-time', 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=1600&q=80', '/pc-builder', 'Build Your PC', 'hero', 2],
    ['OLED & High Refresh Monitors', 'Esports 240Hz and Quantum Dot displays from MSI, ASUS and Samsung', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1600&q=80', '/category/monitors', 'View Displays', 'middle', 1]
  ];

  for (const bn of banners) {
    await connection.query(
      `INSERT IGNORE INTO banners (title, subtitle, image_url, link_url, button_text, position, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      bn
    );
  }

  // 13. FAQs
  const faqs = [
    ['Are all products sold at CORENIX 100% genuine with official warranty?', 'Yes. CORENIX only procures directly from authorized brand distributors with genuine manufacturer warranties verifiable by serial number.', 'General', 1],
    ['How does the online PC Builder check component compatibility?', 'Our PC Builder dynamically verifies socket standards (e.g. LGA1700 vs AM5), RAM generations (DDR4 vs DDR5), power supply capacity, and case clearances.', 'PC Builder', 2],
    ['Can I order online and pick up my product from Shop 1 or Shop 2?', 'Yes! During checkout, select "Branch Pickup" and choose between Shop 1 (Uttara) or Shop 2 (Dhanmondi) with live stock reservation.', 'Ordering', 3],
    ['How can I track my RMA / Service status?', 'Enter your unique RMA tracking number on the /rma or customer account portal to see live diagnosis notes, technician updates, and parts progress.', 'RMA', 4]
  ];

  for (const f of faqs) {
    await connection.query(
      `INSERT IGNORE INTO faqs (question, answer, category, order_index) VALUES (?, ?, ?, ?)`,
      f
    );
  }

  // 14. Global Business Settings
  const settings = [
    ['company_name', 'CORENIX Technologies Ltd.', 'general', 'Official registered company name'],
    ['hotline_phone', '+880 9600-267364', 'contact', 'Customer support hotline'],
    ['support_email', 'support@corenix.com.bd', 'contact', 'Customer service email'],
    ['currency_code', 'BDT', 'commerce', 'Primary currency code'],
    ['currency_symbol', '৳', 'commerce', 'Currency display symbol'],
    ['vat_rate_percent', '5', 'tax', 'Standard VAT rate percentage'],
    ['inside_dhaka_shipping', '70', 'shipping', 'Standard shipping fee inside Dhaka (BDT)'],
    ['outside_dhaka_shipping', '130', 'shipping', 'Standard shipping fee outside Dhaka (BDT)'],
    ['seo_site_title_suffix', ' | CORENIX Bangladesh', 'seo', 'Default suffix appended to public meta titles'],
  ];

  for (const s of settings) {
    await connection.query(
      `INSERT INTO business_settings (setting_key, setting_value, setting_group, description)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      s
    );
  }

  // 15. Sample Customer & Initial Order / RMA Case
  const [custRes] = await connection.query(
    `INSERT INTO customers (name, email, phone, password_hash, is_verified, reward_points)
     VALUES (?, ?, ?, ?, 1, 150)
     ON DUPLICATE KEY UPDATE reward_points = 150`,
    ['Mahmudul Karim', 'customer@gmail.com', '+8801799999999', customerPasswordHash]
  );

  const [custRows] = await connection.query(`SELECT id FROM customers WHERE email = ?`, ['customer@gmail.com']);
  const customerId = custRows[0].id;

  // Customer Address
  await connection.query(
    `INSERT IGNORE INTO customer_addresses (customer_id, title, full_name, phone, address_line1, city, is_default)
     VALUES (?, 'Home', 'Mahmudul Karim', '+8801799999999', 'House 14, Road 5, Block B, Uttara', 'Dhaka', 1)`,
    [customerId]
  );

  // Initial Order for demo
  const [orderRes] = await connection.query(
    `INSERT INTO orders (
      order_number, customer_id, branch_id, order_type, order_status, payment_status,
      payment_method, subtotal, shipping_fee, total_amount, paid_amount, cogs_total, gross_profit
    ) VALUES (?, ?, ?, 'online', 'delivered', 'paid', 'bkash', 46900.00, 70.00, 46970.00, 46970.00, 41000.00, 5900.00)
    ON DUPLICATE KEY UPDATE total_amount = VALUES(total_amount)`,
    ['CRX-2026-1001', customerId, branchMap['SHOP-1']]
  );

  console.log('Dynamic Seeding Completed Successfully! All tables populated with authentic data.');
  await connection.end();
}

seed().catch(err => {
  console.error('Seeding Error:', err);
  process.exit(1);
});
