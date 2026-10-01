const mysql = require('mysql2/promise');

async function seedBrandDesktops() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'corenix_db',
  });

  try {
    console.log('--- Seeding Brand Desktop PCs ---');

    // 1. Ensure Brands exist
    const brandsToEnsure = [
      { name: 'HP', slug: 'hp', country: 'USA', website: 'https://www.hp.com' },
      { name: 'Dell', slug: 'dell', country: 'USA', website: 'https://www.dell.com' },
      { name: 'Lenovo', slug: 'lenovo', country: 'China', website: 'https://www.lenovo.com' },
      { name: 'Apple', slug: 'apple', country: 'USA', website: 'https://www.apple.com' },
      { name: 'Acer', slug: 'acer', country: 'Taiwan', website: 'https://www.acer.com' },
    ];

    const brandMap = {};

    // Fetch all current brands
    const [existingBrands] = await conn.query('SELECT id, name, slug FROM brands');
    existingBrands.forEach((b) => {
      brandMap[b.slug.toLowerCase()] = b.id;
      brandMap[b.name.toLowerCase()] = b.id;
    });

    for (const b of brandsToEnsure) {
      if (!brandMap[b.slug]) {
        const [res] = await conn.query(
          `INSERT INTO brands (name, slug, country, website, is_active, is_featured, short_desc)
           VALUES (?, ?, ?, ?, 1, 1, ?)`,
          [b.name, b.slug, b.country, b.website, `Official ${b.name} genuine products and desktop systems.`]
        );
        brandMap[b.slug] = res.insertId;
        brandMap[b.name.toLowerCase()] = res.insertId;
        console.log(`Created brand: ${b.name} (ID: ${res.insertId})`);
      }
    }

    // 2. Fetch category IDs
    const [cats] = await conn.query('SELECT id, name, slug FROM categories');
    const catMap = {};
    cats.forEach((c) => {
      catMap[c.slug] = c.id;
    });

    const getCat = (slug, fallbackSlug = 'brand-pc') => {
      return catMap[slug] || catMap[fallbackSlug] || 21;
    };

    // 3. Define Brand Desktop Products
    const desktopProducts = [
      // HP Desktops
      {
        name: 'HP Pro Tower 290 G9 Core i5 13th Gen Brand Desktop PC',
        slug: 'hp-pro-tower-290-g9-core-i5-13th-gen',
        sku: 'DESK-HP-290G9-I5',
        model: 'Pro Tower 290 G9',
        brand: 'hp',
        categorySlug: 'hp-desktop-pc',
        warranty: '3 Years Official Brand Warranty',
        purchase_cost: 62000,
        selling_price: 74500,
        discount_price: 72000,
        is_featured: 1,
        is_hot: 1,
        is_new: 1,
        image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=800&q=80',
        overview: 'HP Pro Tower 290 G9 PCI-Express Business Desktop powered by Intel Core i5-13400 (10 Cores, up to 4.6GHz), 8GB DDR4 RAM (Expandable up to 64GB), 512GB PCIe NVMe SSD, Intel UHD Graphics 730, and HP USB Keyboard & Mouse bundle.',
        key_features: ['Intel Core i5-13400 Processor (20MB Cache, 4.60 GHz)', '8GB DDR4 3200MHz RAM', '512GB PCIe M.2 NVMe SSD', 'HP 180W Active PFC Power Supply', 'Windows 11 Pro 64-bit Ready'],
        stock: { wh: 15, shop1: 8, shop2: 6 }
      },
      {
        name: 'HP ProDesk 400 G9 SFF Core i7 13th Gen Commercial Desktop',
        slug: 'hp-prodesk-400-g9-sff-core-i7-13th-gen',
        sku: 'DESK-HP-400G9-I7',
        model: 'ProDesk 400 G9 SFF',
        brand: 'hp',
        categorySlug: 'hp-desktop-pc',
        warranty: '3 Years Comprehensive Warranty',
        purchase_cost: 89000,
        selling_price: 106000,
        discount_price: 102500,
        is_featured: 1,
        is_hot: 0,
        is_new: 1,
        image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80',
        overview: 'Enterprise-grade HP ProDesk 400 G9 Small Form Factor desktop with Intel Core i7-13700 (16 Cores, 24 Threads), 16GB DDR4 3200MHz Memory, 512GB Gen4 NVMe SSD, HP Sure Start self-healing BIOS security, and versatile display outputs (HDMI, DisplayPort).',
        key_features: ['Intel Core i7-13700 (16 Cores, up to 5.20 GHz)', '16GB DDR4 RAM', '512GB M.2 PCIe Gen4 NVMe SSD', 'HP Wolf Pro Security Edition', 'Slim DVD-Writer & USB-C SuperSpeed Ports'],
        stock: { wh: 10, shop1: 5, shop2: 4 }
      },
      {
        name: 'HP Pavilion 24 All-in-One Core i5 13th Gen 23.8" FHD Touch Desktop PC',
        slug: 'hp-pavilion-24-all-in-one-core-i5-13th-gen',
        sku: 'AIO-HP-PAV-24-I5',
        model: 'Pavilion 24-ca2000',
        brand: 'hp',
        categorySlug: 'hp-aio',
        warranty: '2 Years Official Warranty',
        purchase_cost: 98000,
        selling_price: 118000,
        discount_price: 114000,
        is_featured: 1,
        is_hot: 1,
        is_new: 1,
        image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80',
        overview: 'Sleek and minimalist HP Pavilion 24 All-in-One PC equipped with 23.8" IPS Full HD Touchscreen, Intel Core i5-13400T, 16GB DDR4 RAM, 512GB NVMe SSD + 1TB HDD, Audio by B&O dual speakers, and pop-up privacy camera.',
        key_features: ['23.8" IPS FHD (1920 x 1080) Touchscreen Display', 'Intel Core i5-13400T 10-Core Processor', '16GB DDR4 3200MHz RAM + 512GB NVMe SSD', 'Bang & Olufsen Premium Audio', 'Wireless Keyboard and Mouse Combo included'],
        stock: { wh: 8, shop1: 4, shop2: 3 }
      },
      {
        name: 'HP OMEN 45L Gaming Desktop (Core i9 14900K, RTX 4080 Super 16GB, 64GB DDR5)',
        slug: 'hp-omen-45l-gaming-desktop-core-i9-rtx-4080-super',
        sku: 'DESK-HP-OMEN45L-4080',
        model: 'OMEN 45L GT22',
        brand: 'hp',
        categorySlug: 'hp-desktop-pc',
        warranty: '3 Years Full Replacement Warranty',
        purchase_cost: 385000,
        selling_price: 445000,
        discount_price: 435000,
        is_featured: 1,
        is_hot: 1,
        is_new: 1,
        image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
        overview: 'Ultimate flagship HP OMEN 45L Gaming PC engineered with the patented Cryo Chamber external liquid cooling system, Intel Core i9-14900K 24-Core processor, NVIDIA GeForce RTX 4080 Super 16GB GDDR6X, Kingston FURY 64GB DDR5 5200MHz RGB RAM, and 2TB WD Black Gen4 NVMe SSD.',
        key_features: ['Intel Core i9-14900K (24 Cores, 32 Threads, up to 6.0 GHz)', 'NVIDIA GeForce RTX 4080 Super 16GB GDDR6X', '64GB Kingston FURY DDR5 RGB RAM', '2TB WD_BLACK PCIe Gen4 NVMe SSD', 'OMEN Cryo Chamber 360mm Liquid Cooler & 1000W 80+ Gold PSU'],
        stock: { wh: 4, shop1: 2, shop2: 1 }
      },

      // Dell Desktops
      {
        name: 'Dell OptiPlex 7010 Tower Core i5 13th Gen Desktop PC',
        slug: 'dell-optiplex-7010-tower-core-i5-13th-gen',
        sku: 'DESK-DELL-7010-I5',
        model: 'OptiPlex 7010 MT',
        brand: 'dell',
        categorySlug: 'dell-desktop-pc',
        warranty: '3 Years ProSupport Onsite Warranty',
        purchase_cost: 65000,
        selling_price: 78500,
        discount_price: 76000,
        is_featured: 1,
        is_hot: 1,
        is_new: 0,
        image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80',
        overview: 'High-reliability Dell OptiPlex 7010 Mini Tower business PC. Features Intel Core i5-13500 (14 Cores, 20 Threads), 8GB DDR4 RAM, 512GB M.2 PCIe NVMe Class 35 SSD, Dell Trusted Device Security, and Dell KB216 Wired Keyboard & Mouse.',
        key_features: ['Intel Core i5-13500 (14 Cores, 24MB Cache, up to 4.80 GHz)', '8GB DDR4 3200MHz (Supports up to 64GB)', '512GB PCIe NVMe SSD', 'Dell Optimizer AI Intelligent Audio & Performance', 'TPM 2.0 Hardware Security'],
        stock: { wh: 14, shop1: 7, shop2: 5 }
      },
      {
        name: 'Dell Vostro 3020 Tower Core i7 13th Gen Business Desktop',
        slug: 'dell-vostro-3020-tower-core-i7-13th-gen',
        sku: 'DESK-DELL-3020-I7',
        model: 'Vostro 3020 Tower',
        brand: 'dell',
        categorySlug: 'dell-desktop-pc',
        warranty: '3 Years Official Dell Warranty',
        purchase_cost: 92000,
        selling_price: 109000,
        discount_price: 105000,
        is_featured: 0,
        is_hot: 1,
        is_new: 1,
        image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=800&q=80',
        overview: 'Empower your daily enterprise workloads with Dell Vostro 3020 Tower. Powered by Intel Core i7-13700, 16GB DDR4 Memory, 512GB SSD + 1TB 7200RPM HDD, Wi-Fi 6 + Bluetooth 5.2, and extensive front panel connectivity.',
        key_features: ['Intel Core i7-13700 (16 Cores, up to 5.20 GHz Turbo)', '16GB DDR4 3200MHz RAM', '512GB NVMe SSD + 1TB SATA HDD', 'Intel Wi-Fi 6 (6GHz) AX201 & Bluetooth 5.2', 'Windows 11 Home / Pro Compatible'],
        stock: { wh: 12, shop1: 6, shop2: 4 }
      },
      {
        name: 'Dell Inspiron 24 5420 All-in-One Core i7 13th Gen 23.8" FHD PC',
        slug: 'dell-inspiron-24-5420-aio-core-i7-13th-gen',
        sku: 'AIO-DELL-5420-I7',
        model: 'Inspiron 24 5420',
        brand: 'dell',
        categorySlug: 'dell-aio',
        warranty: '2 Years Premium Support Warranty',
        purchase_cost: 112000,
        selling_price: 132000,
        discount_price: 128000,
        is_featured: 1,
        is_hot: 0,
        is_new: 1,
        image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80',
        overview: 'Gorgeous modern design All-in-One PC from Dell. Features 23.8" FHD IPS Anti-Glare InfinityEdge display with ComfortView Plus, Intel Core i7-1355U, 16GB DDR4, 512GB Gen4 NVMe SSD, pop-up FHD camera with wide dynamic range, and stereo soundbar speakers.',
        key_features: ['23.8" FHD (1920 x 1080) InfinityEdge IPS Display', 'Intel Core i7-1355U (10 Cores, 12 Threads, 5.0 GHz)', '16GB DDR4 Dual-Channel RAM + 512GB SSD', 'MaxxAudio Pro Front-firing Stereo Soundbar', 'Dell Wireless Keyboard & Mouse included'],
        stock: { wh: 6, shop1: 3, shop2: 2 }
      },
      {
        name: 'Dell Alienware Aurora R16 Gaming Desktop (Core i9 14900KF, RTX 4090 24GB)',
        slug: 'dell-alienware-aurora-r16-core-i9-rtx-4090',
        sku: 'DESK-ALIEN-R16-4090',
        model: 'Alienware Aurora R16',
        brand: 'dell',
        categorySlug: 'dell-desktop-pc',
        warranty: '3 Years Premium Onsite Warranty',
        purchase_cost: 495000,
        selling_price: 580000,
        discount_price: 565000,
        is_featured: 1,
        is_hot: 1,
        is_new: 1,
        image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
        overview: 'The legend reimagined: Alienware Aurora R16 Legend 3 design delivers 40% smaller footprint and up to 20% quieter acoustic profile. Featuring Intel Core i9-14900KF, NVIDIA GeForce RTX 4090 24GB GDDR6X, 64GB DDR5 5600MHz XMP RAM, 2TB PCIe 4.0 NVMe SSD, and 1000W Platinum PSU with 240mm Alienware Liquid Cooling.',
        key_features: ['Intel Core i9-14900KF (24-Core, 6.0GHz Turbo)', 'NVIDIA GeForce RTX 4090 24GB GDDR6X', '64GB Dual-Channel DDR5 5600MHz XMP Memory', '2TB NVMe M.2 PCIe Gen 4 SSD', 'AlienFX Stadium Lighting & 1000W 80 Plus Platinum PSU'],
        stock: { wh: 3, shop1: 1, shop2: 1 }
      },

      // Lenovo Desktops
      {
        name: 'Lenovo ThinkCentre Neo 50s Gen 4 Core i5 13th Gen SFF PC',
        slug: 'lenovo-thinkcentre-neo-50s-gen4-core-i5',
        sku: 'DESK-LEN-NEO50S-I5',
        model: 'Neo 50s Gen 4',
        brand: 'lenovo',
        categorySlug: 'lenovo-desktop-pc',
        warranty: '3 Years Onsite Premier Support',
        purchase_cost: 59000,
        selling_price: 71500,
        discount_price: 69000,
        is_featured: 0,
        is_hot: 1,
        is_new: 1,
        image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80',
        overview: 'Space-saving 7.4L chassis Lenovo ThinkCentre Neo 50s Gen 4 SFF. Packed with Intel Core i5-13400, 8GB DDR4 3200MHz RAM, 512GB M.2 PCIe NVMe SSD, Intelligent Cooling Engine (ICE 5.0), and ThinkShield military-grade hardware security.',
        key_features: ['Intel Core i5-13400 (10 Cores, 16 Threads, up to 4.60 GHz)', '8GB DDR4 3200MHz RAM', '512GB M.2 2280 PCIe 4.0x4 NVMe SSD', 'ICE 5.0 Thermal Performance Engine', 'Lenovo Calliope Keyboard & Mouse included'],
        stock: { wh: 16, shop1: 8, shop2: 6 }
      },
      {
        name: 'Lenovo IdeaCentre AIO 3 24" Core i5 13th Gen All-in-One PC',
        slug: 'lenovo-ideacentre-aio-3-24-core-i5-13th-gen',
        sku: 'AIO-LEN-AIO3-24-I5',
        model: 'IdeaCentre AIO 3 24IRH9',
        brand: 'lenovo',
        categorySlug: 'lenovo-aio',
        warranty: '2 Years Comprehensive Warranty',
        purchase_cost: 84000,
        selling_price: 99500,
        discount_price: 96000,
        is_featured: 1,
        is_hot: 1,
        is_new: 1,
        image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80',
        overview: 'Contemporary family and executive All-in-One computer. 23.8" IPS FHD 100Hz display, Intel Core i5-13420H, 16GB DDR5 5200MHz RAM, 512GB Gen4 SSD, Harman Kardon certified stereo sound, and wireless peripheral kit.',
        key_features: ['23.8" FHD IPS (1920x1080) 100Hz 99% sRGB Display', 'Intel Core i5-13420H 8-Core Processor', '16GB DDR5 5200MHz RAM + 512GB SSD', 'Harman Kardon Audio System (2x 3W)', 'Integrated Cable Management Stand'],
        stock: { wh: 10, shop1: 5, shop2: 4 }
      },
      {
        name: 'Lenovo Legion Tower 7i Gen 8 Gaming Desktop (Core i7 14700KF, RTX 4070 Ti Super 16GB)',
        slug: 'lenovo-legion-tower-7i-gen8-core-i7-rtx-4070-ti-super',
        sku: 'DESK-LEN-LEGION-T7-4070TI',
        model: 'Legion Tower 7i 34IRX8',
        brand: 'lenovo',
        categorySlug: 'lenovo-desktop-pc',
        warranty: '3 Years Onsite Legion Ultimate Support',
        purchase_cost: 275000,
        selling_price: 325000,
        discount_price: 315000,
        is_featured: 1,
        is_hot: 1,
        is_new: 1,
        image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
        overview: 'Unleash elite esports gaming power with the Lenovo Legion Tower 7i. Featuring Intel Core i7-14700KF, NVIDIA GeForce RTX 4070 Ti Super 16GB, 32GB DDR5 5600MHz RGB RAM, 1TB Gen4 SSD, Legion Coldfront 4.0 360mm Liquid Cooling, and transparent tempered glass side panel with 6x ARGB fans.',
        key_features: ['Intel Core i7-14700KF (20 Cores, 28 Threads, up to 5.60 GHz)', 'NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X', '32GB DDR5 5600MHz Armor RAM', '1TB PCIe 4.0 NVMe M.2 SSD', '360mm AIO Liquid Cooler & 850W 90% Efficiency PSU'],
        stock: { wh: 5, shop1: 2, shop2: 2 }
      },

      // Apple Mac Desktops
      {
        name: 'Apple Mac Mini M4 Chip (16GB Unified Memory, 256GB SSD Storage)',
        slug: 'apple-mac-mini-m4-16gb-256gb',
        sku: 'MAC-MINI-M4-16-256',
        model: 'Mac mini M4 (Late 2024)',
        brand: 'apple',
        categorySlug: 'mac-mini',
        warranty: '1 Year International Apple Care Warranty',
        purchase_cost: 76000,
        selling_price: 88500,
        discount_price: 85000,
        is_featured: 1,
        is_hot: 1,
        is_new: 1,
        image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
        overview: 'The brand new redesigned ultra-compact 5x5 inch Apple Mac Mini powered by the trailblazing M4 chip (10-core CPU, 10-core GPU, 16-core Neural Engine), 16GB Unified RAM, 256GB ultrafast SSD, Thunderbolt 4 ports, and front-facing USB-C & headphone jack.',
        key_features: ['Apple M4 Chip with 10-Core CPU & 10-Core GPU', '16GB High-Bandwidth Unified Memory (120GB/s)', '256GB Ultra-Fast Solid State Drive', '3x Thunderbolt 4 + 2x USB-C + HDMI + Gigabit Ethernet', 'macOS Sequoia with Apple Intelligence'],
        stock: { wh: 18, shop1: 10, shop2: 8 }
      },
      {
        name: 'Apple Mac Studio M2 Max (32GB Unified Memory, 512GB SSD Storage)',
        slug: 'apple-mac-studio-m2-max-32gb-512gb',
        sku: 'MAC-STUDIO-M2MAX-32-512',
        model: 'Mac Studio MQH73',
        brand: 'apple',
        categorySlug: 'mac-studio',
        warranty: '1 Year International Apple Care Warranty',
        purchase_cost: 245000,
        selling_price: 285000,
        discount_price: 278000,
        is_featured: 1,
        is_hot: 1,
        is_new: 0,
        image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
        overview: 'Pro creative powerhouse in a compact desktop profile. Apple M2 Max chip with 12-core CPU, 30-core GPU, 16-core Neural Engine, 32GB Unified RAM with 400GB/s bandwidth, 512GB SSD, support for up to 5 external displays, and whisper-quiet dual blower thermal system.',
        key_features: ['Apple M2 Max Chip (12-Core CPU, 30-Core GPU)', '32GB Unified Memory (400GB/s Memory Bandwidth)', '512GB PCIe SSD Storage', '4x Thunderbolt 4, 10Gb Ethernet, SDXC card slot, HDMI', 'Supports up to 5 Simultaneous Studio / Pro Displays'],
        stock: { wh: 6, shop1: 3, shop2: 2 }
      },
      {
        name: 'Apple iMac 24" 4.5K Retina Display M3 Chip 8-Core GPU (8GB, 256GB SSD - Silver)',
        slug: 'apple-imac-24-4-5k-retina-m3-8gb-256gb',
        sku: 'IMAC-24-M3-8-256-SLV',
        model: 'iMac 24" M3',
        brand: 'apple',
        categorySlug: 'apple-imac',
        warranty: '1 Year International Apple Care Warranty',
        purchase_cost: 175000,
        selling_price: 205000,
        discount_price: 199000,
        is_featured: 1,
        is_hot: 1,
        is_new: 1,
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
        overview: 'Stunning 11.5mm thin All-in-One computer with 24-inch 4.5K Retina display (500 nits, P3 wide color, True Tone). Powered by Apple M3 chip, 1080p FaceTime HD camera, studio-quality three-mic array, six-speaker sound system with Spatial Audio, and color-matched Magic Keyboard & Mouse.',
        key_features: ['24-inch 4.5K Retina Display (4480 x 2520, 500 nits, P3)', 'Apple M3 Chip (8-Core CPU, 8-Core GPU)', '8GB Unified Memory + 256GB SSD', '1080p FaceTime HD Camera & Six-speaker Spatial Audio', 'Magic Keyboard and Magic Mouse included'],
        stock: { wh: 7, shop1: 4, shop2: 3 }
      },

      // ASUS Brand Desktops
      {
        name: 'ASUS ExpertCenter D7 Mini Tower Core i7 13th Gen Enterprise PC',
        slug: 'asus-expertcenter-d7-mini-tower-core-i7-13th-gen',
        sku: 'DESK-ASUS-D700-I7',
        model: 'ExpertCenter D700MD',
        brand: 'asus',
        categorySlug: 'asus-desktop-pc',
        warranty: '3 Years Official ASUS Warranty',
        purchase_cost: 88000,
        selling_price: 104000,
        discount_price: 99900,
        is_featured: 0,
        is_hot: 1,
        is_new: 1,
        image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=800&q=80',
        overview: 'ASUS ExpertCenter D7 Mini Tower is built to perform and endure. Featuring Intel Core i7-13700, 16GB DDR4 RAM, 512GB M.2 NVMe SSD, US Military-grade MIL-STD 810H durability certification, tool-less chassis design, and ASUS Business Manager security suite.',
        key_features: ['Intel Core i7-13700 (16 Cores, 24 Threads, up to 5.20 GHz)', '16GB DDR4 3200MHz RAM (4x DIMM Slots)', '512GB M.2 PCIe 4.0 NVMe SSD', 'MIL-STD 810H US Military Grade Durability', 'Tool-free chassis design for effortless maintenance'],
        stock: { wh: 10, shop1: 5, shop2: 4 }
      },
      {
        name: 'ASUS ROG Strix G16CHR Gaming Desktop (Core i7 14700F, RTX 4060 Ti 8GB)',
        slug: 'asus-rog-strix-g16chr-core-i7-rtx-4060-ti',
        sku: 'DESK-ASUS-ROG-G16-4060TI',
        model: 'ROG Strix G16CHR',
        brand: 'asus',
        categorySlug: 'asus-desktop-pc',
        warranty: '3 Years Official ASUS Replacement Warranty',
        purchase_cost: 185000,
        selling_price: 218000,
        discount_price: 212000,
        is_featured: 1,
        is_hot: 1,
        is_new: 1,
        image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
        overview: 'Dominate competitive games with the ASUS ROG Strix G16CHR. Equipped with Intel Core i7-14700F, NVIDIA GeForce RTX 4060 Ti 8GB GDDR6, 16GB DDR5 5600MHz RAM, 1TB Gen4 NVMe SSD, Aura Sync RGB chassis with integrated carrying strap, and Dolby Atmos audio.',
        key_features: ['Intel Core i7-14700F (20 Cores, 28 Threads, up to 5.40 GHz)', 'NVIDIA GeForce RTX 4060 Ti 8GB GDDR6', '16GB DDR5 5600MHz Memory (Expandable to 64GB)', '1TB PCIe 4.0 NVMe SSD', 'Aura Sync RGB Lighting, Headphone Hook & Carrying Handle'],
        stock: { wh: 8, shop1: 4, shop2: 3 }
      }
    ];

    let insertedCount = 0;
    let updatedCount = 0;

    for (const prod of desktopProducts) {
      const brandId = brandMap[prod.brand.toLowerCase()] || 1;
      const categoryId = getCat(prod.categorySlug);

      // Check if product already exists by SKU or slug
      const [existing] = await conn.query(
        'SELECT id FROM products WHERE sku = ? OR slug = ? LIMIT 1',
        [prod.sku, prod.slug]
      );

      let productId = null;

      if (existing.length > 0) {
        productId = existing[0].id;
        await conn.query(
          `UPDATE products
           SET name = ?, brand_id = ?, category_id = ?, model = ?, warranty_period = ?,
               purchase_cost = ?, avg_cost = ?, selling_price = ?, discount_price = ?,
               is_featured = ?, is_hot = ?, is_new = ?, status = 'published'
           WHERE id = ?`,
          [
            prod.name,
            brandId,
            categoryId,
            prod.model,
            prod.warranty,
            prod.purchase_cost,
            prod.purchase_cost,
            prod.selling_price,
            prod.discount_price,
            prod.is_featured,
            prod.is_hot,
            prod.is_new,
            productId
          ]
        );
        updatedCount++;
      } else {
        const [res] = await conn.query(
          `INSERT INTO products (
            name, slug, sku, model, brand_id, category_id, product_type,
            warranty_period, status, is_featured, is_new, is_hot, is_sale,
            purchase_cost, avg_cost, selling_price, discount_price, min_selling_price,
            rating_avg, rating_count, seo_score
          ) VALUES (?, ?, ?, ?, ?, ?, 'physical', ?, 'published', ?, ?, ?, 1, ?, ?, ?, ?, ?, 4.95, 28, 92)`,
          [
            prod.name,
            prod.slug,
            prod.sku,
            prod.model,
            brandId,
            categoryId,
            prod.warranty,
            prod.is_featured,
            prod.is_new,
            prod.is_hot,
            prod.purchase_cost,
            prod.purchase_cost,
            prod.selling_price,
            prod.discount_price,
            prod.purchase_cost * 1.05
          ]
        );
        productId = res.insertId;
        insertedCount++;
      }

      // Upsert Product Image
      const [existingImg] = await conn.query(
        'SELECT id FROM product_images WHERE product_id = ? AND is_primary = 1 LIMIT 1',
        [productId]
      );
      if (existingImg.length > 0) {
        await conn.query(
          'UPDATE product_images SET image_url = ?, alt_text = ? WHERE id = ?',
          [prod.image, prod.name, existingImg[0].id]
        );
      } else {
        await conn.query(
          'INSERT INTO product_images (product_id, image_url, alt_text, is_primary, order_index) VALUES (?, ?, ?, 1, 0)',
          [productId, prod.image, prod.name]
        );
      }

      // Upsert Product Description
      const [existingDesc] = await conn.query(
        'SELECT id FROM product_descriptions WHERE product_id = ? LIMIT 1',
        [productId]
      );
      if (existingDesc.length > 0) {
        await conn.query(
          `UPDATE product_descriptions
           SET overview = ?, key_features_json = ?, warranty_info = ?
           WHERE id = ?`,
          [prod.overview, JSON.stringify(prod.key_features), prod.warranty, existingDesc[0].id]
        );
      } else {
        await conn.query(
          `INSERT INTO product_descriptions (product_id, overview, key_features_json, warranty_info)
           VALUES (?, ?, ?, ?)`,
          [productId, prod.overview, JSON.stringify(prod.key_features), prod.warranty]
        );
      }

      // Upsert Inventory across Branches:
      // Branch 1 (WH-MAIN), Branch 2 (SHOP-1 Uttara), Branch 3 (SHOP-2 Dhanmondi)
      const branchAllocations = [
        { branchId: 1, qty: prod.stock.wh },
        { branchId: 2, qty: prod.stock.shop1 },
        { branchId: 3, qty: prod.stock.shop2 },
      ];

      for (const alloc of branchAllocations) {
        const [inv] = await conn.query(
          'SELECT id FROM inventory WHERE product_id = ? AND branch_id = ? LIMIT 1',
          [productId, alloc.branchId]
        );
        if (inv.length > 0) {
          await conn.query(
            'UPDATE inventory SET quantity = ? WHERE id = ?',
            [alloc.qty, inv[0].id]
          );
        } else {
          await conn.query(
            'INSERT INTO inventory (product_id, branch_id, quantity, reserved_qty, min_stock_level) VALUES (?, ?, ?, 0, 3)',
            [productId, alloc.branchId, alloc.qty]
          );
        }
      }

      console.log(`✓ Processed Desktop: ${prod.name} (ID: ${productId}, SKU: ${prod.sku})`);
    }

    console.log(`\n🎉 Finished! Inserted: ${insertedCount}, Updated: ${updatedCount} Brand Desktop PCs.`);

  } catch (err) {
    console.error('Error seeding brand desktop PCs:', err);
  } finally {
    await conn.end();
  }
}

seedBrandDesktops();
