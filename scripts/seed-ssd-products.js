const mysql = require('mysql2/promise');

async function seedSsdProducts() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'corenix_db',
  });

  console.log('Connected to MySQL corenix_db for SSD Seeding.');

  // Helper: Get or Create Category
  async function getOrCreateCategory(name, slug, parentSlug = 'components') {
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
        `Buy high performance ${name} with official warranty and express delivery in BD.`,
        name.toLowerCase()
      ]
    );
    return res.insertId;
  }

  // Helper: Get or Create Brand
  async function getOrCreateBrand(name, slug, country = 'Global') {
    const [existing] = await connection.query(`SELECT id FROM brands WHERE slug = ?`, [slug]);
    if (existing.length > 0) return existing[0].id;

    const [res] = await connection.query(
      `INSERT INTO brands (name, slug, country, logo, is_active) VALUES (?, ?, ?, ?, 1)`,
      [name, slug, country, `/images/brands/${slug}.svg`]
    );
    return res.insertId;
  }

  // Categories
  const catSsd = await getOrCreateCategory('Solid State Drive (SSD)', 'ssd', 'components');
  const catM2Gen4 = await getOrCreateCategory('M.2 NVMe PCIe Gen 4 SSD', 'm2-gen4-ssd', 'ssd');
  const catM2Gen5 = await getOrCreateCategory('M.2 NVMe PCIe Gen 5 SSD', 'm2-gen5-ssd', 'ssd');
  const catSataSsd = await getOrCreateCategory('2.5" SATA III Internal SSD', 'sata-ssd', 'ssd');

  // Brands
  const brandSamsung = await getOrCreateBrand('Samsung', 'samsung', 'South Korea');
  const brandWD = await getOrCreateBrand('Western Digital', 'western-digital', 'USA');
  const brandCrucial = await getOrCreateBrand('Crucial', 'crucial', 'USA');
  const brandKingston = await getOrCreateBrand('Kingston', 'kingston', 'USA');
  const brandCorsair = await getOrCreateBrand('Corsair', 'corsair', 'USA');

  const ssdProducts = [
    {
      name: 'Samsung 990 PRO 2TB PCIe 4.0 M.2 NVMe Internal SSD with Heatsink',
      slug: 'samsung-990-pro-2tb-pcie-4-nvme-ssd-heatsink',
      sku: 'SSD-SAM-990P-2TB-HS',
      model: 'MZ-V9P2T0CW',
      brand_id: brandSamsung,
      category_id: catM2Gen4,
      warranty: '5 Years Official Replacement Warranty',
      cost: 18500,
      price: 24500,
      discount_price: 22800,
      image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80',
      overview: 'Experience the ultimate performance of PCIe 4.0 with the Samsung 990 PRO with Heatsink. Delivering blisteringly fast read speeds up to 7,450 MB/s and write speeds up to 6,900 MB/s, it features a smart thermal control heatsink ideal for intensive gaming, 4K/8K video editing, and heavy creative workstations.',
      key_features: [
        'Sequential Read: Up to 7,450 MB/s',
        'Sequential Write: Up to 6,900 MB/s',
        'PCIe 4.0 NVMe 2.0 Interface & M.2 (2280) Form Factor',
        'Built-in Slim Aluminum Thermal Heatsink',
        'Samsung In-House Pascal Controller & 2GB LPDDR4 DRAM Cache',
        'Up to 1200 TBW Endurance Rating',
        'Full Support for Samsung Magician Software Optimization'
      ],
      specs: [
        { label: 'Storage Capacity', value: '2TB' },
        { label: 'Form Factor', value: 'M.2 2280' },
        { label: 'Interface', value: 'PCIe Gen 4.0 x4, NVMe 2.0' },
        { label: 'Max Sequential Read', value: '7,450 MB/s' },
        { label: 'Max Sequential Write', value: '6,900 MB/s' },
        { label: 'Random Read (4KB, QD32)', value: '1,400,000 IOPS' },
        { label: 'Random Write (4KB, QD32)', value: '1,550,000 IOPS' },
        { label: 'DRAM Cache', value: '2GB LPDDR4' },
        { label: 'Endurance (TBW)', value: '1,200 TBW' },
        { label: 'Heatsink', value: 'Included (Direct Contact Fin Heatsink)' }
      ]
    },
    {
      name: 'Samsung 990 PRO 1TB PCIe 4.0 M.2 NVMe High-Speed SSD',
      slug: 'samsung-990-pro-1tb-pcie-4-nvme-ssd',
      sku: 'SSD-SAM-990P-1TB',
      model: 'MZ-V9P1T0B',
      brand_id: brandSamsung,
      category_id: catM2Gen4,
      warranty: '5 Years Official Replacement Warranty',
      cost: 11000,
      price: 14800,
      discount_price: 13500,
      image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80',
      overview: 'Reach maximum read speeds near the theoretical limits of PCIe 4.0 with the Samsung 990 PRO 1TB. Engineered for high-end gaming and 3D rendering workloads, equipped with Samsung in-house Pascal controller and nickel-coated thermal controller design.',
      key_features: [
        'Sequential Read: Up to 7,450 MB/s',
        'Sequential Write: Up to 6,900 MB/s',
        '1GB LPDDR4 Low Power DRAM Cache',
        'PCIe Gen 4.0 x4 NVMe 2.0 standard',
        'Nickel-coated controller with smart thermal regulation',
        '600 TBW Endurance with 5-year official warranty'
      ],
      specs: [
        { label: 'Storage Capacity', value: '1TB' },
        { label: 'Form Factor', value: 'M.2 2280' },
        { label: 'Interface', value: 'PCIe Gen 4.0 x4, NVMe 2.0' },
        { label: 'Max Sequential Read', value: '7,450 MB/s' },
        { label: 'Max Sequential Write', value: '6,900 MB/s' },
        { label: 'DRAM Cache', value: '1GB LPDDR4' },
        { label: 'Endurance (TBW)', value: '600 TBW' }
      ]
    },
    {
      name: 'Western Digital WD_BLACK SN850X 2TB NVMe M.2 Gaming SSD',
      slug: 'wd-black-sn850x-2tb-nvme-m2-gaming-ssd',
      sku: 'SSD-WD-SN850X-2TB',
      model: 'WDS200T2X0E',
      brand_id: brandWD,
      category_id: catM2Gen4,
      warranty: '5 Years Official Replacement Warranty',
      cost: 17500,
      price: 23500,
      discount_price: 21900,
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      overview: 'Crush load times and slash throttling, lagging, and model pop-ins with the WD_BLACK SN850X NVMe SSD. Featuring incredible speeds up to 7,300 MB/s and Game Mode 2.0 for PC to supercharge game assets streaming.',
      key_features: [
        'Insane speeds up to 7,300 MB/s read and 6,600 MB/s write',
        'Game Mode 2.0 with predictive loading for fast game asset streaming',
        'Custom WD Triple-core controller with BiCS5 112-layer 3D TLC NAND',
        'Extremely low latency for ultra-responsive gameplay',
        '1,200 TBW endurance with 5-year limited warranty'
      ],
      specs: [
        { label: 'Storage Capacity', value: '2TB' },
        { label: 'Form Factor', value: 'M.2 2280' },
        { label: 'Interface', value: 'PCIe Gen4 x4 NVMe 1.4' },
        { label: 'Max Sequential Read', value: '7,300 MB/s' },
        { label: 'Max Sequential Write', value: '6,600 MB/s' },
        { label: 'DRAM Cache', value: '2GB DDR4' },
        { label: 'Endurance (TBW)', value: '1,200 TBW' }
      ]
    },
    {
      name: 'Western Digital WD_BLACK SN850X 1TB NVMe M.2 Gaming SSD',
      slug: 'wd-black-sn850x-1tb-nvme-m2-gaming-ssd',
      sku: 'SSD-WD-SN850X-1TB',
      model: 'WDS100T2X0E',
      brand_id: brandWD,
      category_id: catM2Gen4,
      warranty: '5 Years Official Replacement Warranty',
      cost: 10500,
      price: 14200,
      discount_price: 12900,
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      overview: 'The WD_BLACK SN850X 1TB delivers top-tier performance for gaming enthusiasts looking to maximize PC and PlayStation 5 responsiveness. Read speeds up to 7,300 MB/s make game loading practically instantaneous.',
      key_features: [
        'Blistering read speeds up to 7,300 MB/s',
        'Sequential write up to 6,300 MB/s',
        'Dedicated WD Game Mode 2.0 support in WD Dashboard',
        'High endurance 600 TBW rating'
      ],
      specs: [
        { label: 'Storage Capacity', value: '1TB' },
        { label: 'Form Factor', value: 'M.2 2280' },
        { label: 'Interface', value: 'PCIe Gen4 x4' },
        { label: 'Max Sequential Read', value: '7,300 MB/s' },
        { label: 'Max Sequential Write', value: '6,300 MB/s' },
        { label: 'Endurance (TBW)', value: '600 TBW' }
      ]
    },
    {
      name: 'Crucial T700 1TB PCIe Gen5 NVMe M.2 SSD with Premium Heatsink',
      slug: 'crucial-t700-1tb-pcie-gen5-nvme-ssd-heatsink',
      sku: 'SSD-CRU-T700-1TB-HS',
      model: 'CT1000T700SSD5',
      brand_id: brandCrucial,
      category_id: catM2Gen5,
      warranty: '5 Years Official Replacement Warranty',
      cost: 19000,
      price: 25500,
      discount_price: 23900,
      image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
      overview: 'Feel the unprecedented power of PCIe 5.0 with the Crucial T700 Gen5 NVMe SSD. Reaching jaw-dropping sequential read speeds up to 11,700 MB/s and write speeds up to 9,500 MB/s with Micron 232-layer TLC NAND and custom aluminum-copper heatsink.',
      key_features: [
        'Next-Gen PCIe 5.0 x4 NVMe 2.0 Speed',
        'Read Speeds up to 11,700 MB/s (Nearly 2x faster than Gen4)',
        'Write Speeds up to 9,500 MB/s',
        'Premium Aluminum & Nickel-Plated Copper Thermal Heatsink',
        'Micron 232-Layer 3D TLC NAND Flash',
        'DirectStorage enabled for instantaneous game asset rendering'
      ],
      specs: [
        { label: 'Storage Capacity', value: '1TB' },
        { label: 'Form Factor', value: 'M.2 2280' },
        { label: 'Interface', value: 'PCIe Gen 5.0 x4, NVMe 2.0' },
        { label: 'Max Sequential Read', value: '11,700 MB/s' },
        { label: 'Max Sequential Write', value: '9,500 MB/s' },
        { label: 'NAND Flash', value: 'Micron 232-layer 3D TLC' },
        { label: 'Controller', value: 'Phison PS5026-E26' },
        { label: 'Endurance (TBW)', value: '600 TBW' },
        { label: 'Heatsink', value: 'Dual-side Aluminum & Copper Extruded Heatsink' }
      ]
    },
    {
      name: 'Kingston KC3000 2TB PCIe 4.0 NVMe M.2 High-Performance SSD',
      slug: 'kingston-kc3000-2tb-pcie-4-nvme-m2-ssd',
      sku: 'SSD-KNG-KC3000-2TB',
      model: 'SKC3000D/2048G',
      brand_id: brandKingston,
      category_id: catM2Gen4,
      warranty: '5 Years Official Replacement Warranty',
      cost: 16000,
      price: 21500,
      discount_price: 19800,
      image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80',
      overview: 'The Kingston KC3000 PCIe 4.0 NVMe M.2 SSD delivers flagship-tier speeds using the latest Gen 4x4 NVMe controller and 3D TLC NAND. Designed for heavy workloads such as 3D rendering and 4K+ content creation.',
      key_features: [
        'Sequential Read up to 7,000 MB/s, Write up to 7,000 MB/s',
        'Phison E18 Controller with 3D TLC NAND',
        'Low-profile Graphene Aluminum Heat Spreader for efficient thermal dispersal',
        'Exceptional 1,600 TBW endurance rating for heavy duty workloads'
      ],
      specs: [
        { label: 'Storage Capacity', value: '2TB' },
        { label: 'Form Factor', value: 'M.2 2280' },
        { label: 'Interface', value: 'PCIe 4.0 NVMe' },
        { label: 'Max Sequential Read', value: '7,000 MB/s' },
        { label: 'Max Sequential Write', value: '7,000 MB/s' },
        { label: 'Controller', value: 'Phison E18' },
        { label: 'Endurance (TBW)', value: '1,600 TBW' }
      ]
    },
    {
      name: 'Kingston NV2 1TB PCIe 4.0 NVMe M.2 Budget Performance SSD',
      slug: 'kingston-nv2-1tb-pcie-4-nvme-m2-ssd',
      sku: 'SSD-KNG-NV2-1TB',
      model: 'SNV2S/1000G',
      brand_id: brandKingston,
      category_id: catM2Gen4,
      warranty: '3 Years Official Replacement Warranty',
      cost: 5800,
      price: 7800,
      discount_price: 6900,
      image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80',
      overview: 'Kingston NV2 1TB is a substantial next-gen storage solution powered by a Gen 4x4 NVMe controller. Delivering read speeds up to 3,500 MB/s, it provides fast data transfers and snappy app loading at an unbeatable price point.',
      key_features: [
        'Gen 4x4 NVMe PCIe Performance (Read: 3,500 MB/s, Write: 2,100 MB/s)',
        'Compact M.2 2280 design ideal for slim laptops and small-form-factor builds',
        'Lower power consumption and cooler operation',
        '320 TBW endurance rating'
      ],
      specs: [
        { label: 'Storage Capacity', value: '1TB' },
        { label: 'Form Factor', value: 'M.2 2280' },
        { label: 'Interface', value: 'PCIe 4.0 x4 NVMe' },
        { label: 'Max Sequential Read', value: '3,500 MB/s' },
        { label: 'Max Sequential Write', value: '2,100 MB/s' },
        { label: 'Endurance (TBW)', value: '320 TBW' }
      ]
    },
    {
      name: 'Corsair MP600 PRO LPX 1TB PCIe Gen4 x4 M.2 NVMe SSD (PS5 & PC Compatible)',
      slug: 'corsair-mp600-pro-lpx-1tb-pcie-gen4-nvme-ssd',
      sku: 'SSD-COR-MP600P-1TB',
      model: 'CSSD-F1000GBMP600PLP',
      brand_id: brandCorsair,
      category_id: catM2Gen4,
      warranty: '5 Years Official Replacement Warranty',
      cost: 10800,
      price: 14500,
      discount_price: 13200,
      image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=800&q=80',
      overview: 'The Corsair MP600 PRO LPX delivers extreme storage performance tailored for PS5 expansion and high-end desktop gaming PCs. Features an ultra-compact low-profile aluminum heatsink ensuring peak thermal efficiency.',
      key_features: [
        'Sequential Read up to 7,100 MB/s, Write up to 5,800 MB/s',
        'Pre-installed low-profile aluminum heat spreader fits PS5 and tight PC builds',
        'High-density 3D TLC NAND delivers long-term durability',
        '700 TBW endurance rating with 5-year warranty'
      ],
      specs: [
        { label: 'Storage Capacity', value: '1TB' },
        { label: 'Form Factor', value: 'M.2 2280' },
        { label: 'Interface', value: 'PCIe Gen 4.0 x4' },
        { label: 'Max Sequential Read', value: '7,100 MB/s' },
        { label: 'Max Sequential Write', value: '5,800 MB/s' },
        { label: 'Heatsink', value: 'Low-profile Black Aluminum Heatsink' },
        { label: 'Endurance (TBW)', value: '700 TBW' }
      ]
    },
    {
      name: 'Samsung 870 EVO 1TB 2.5 Inch SATA III Internal SSD',
      slug: 'samsung-870-evo-1tb-2-5-inch-sata-iii-internal-ssd',
      sku: 'SSD-SAM-870E-1TB',
      model: 'MZ-77E1T0BW',
      brand_id: brandSamsung,
      category_id: catSataSsd,
      warranty: '5 Years Official Replacement Warranty',
      cost: 9200,
      price: 12500,
      discount_price: 11400,
      image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80',
      overview: 'The indisputable world-favorite SATA SSD: the Samsung 870 EVO combines rock-solid reliability with maximum SATA interface limits of 560 MB/s read and 530 MB/s write. Ideal for secondary storage in custom PC builds.',
      key_features: [
        'Sequential Read: 560 MB/s, Sequential Write: 530 MB/s',
        'Intelligent TurboWrite with enlarged variable buffer',
        'Samsung MKX Controller with 1GB LPDDR4 DRAM Cache',
        '600 TBW endurance rating with 5-year official warranty'
      ],
      specs: [
        { label: 'Storage Capacity', value: '1TB' },
        { label: 'Form Factor', value: '2.5 Inch SATA' },
        { label: 'Interface', value: 'SATA 6 Gb/s (SATA III)' },
        { label: 'Max Sequential Read', value: '560 MB/s' },
        { label: 'Max Sequential Write', value: '530 MB/s' },
        { label: 'DRAM Cache', value: '1GB LPDDR4' },
        { label: 'Endurance (TBW)', value: '600 TBW' }
      ]
    },
    {
      name: 'Crucial BX500 500GB 2.5 Inch 3D NAND SATA III Internal SSD',
      slug: 'crucial-bx500-500gb-2-5-inch-sata-iii-internal-ssd',
      sku: 'SSD-CRU-BX500-500G',
      model: 'CT500BX500SSD1',
      brand_id: brandCrucial,
      category_id: catSataSsd,
      warranty: '3 Years Official Replacement Warranty',
      cost: 3400,
      price: 4800,
      discount_price: 4200,
      image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
      overview: 'Boot up faster, load files quicker, and improve overall system responsiveness for all your computing needs with the Crucial BX500 500GB SATA SSD.',
      key_features: [
        'Sequential Read: 540 MB/s, Sequential Write: 500 MB/s',
        'Micron 3D NAND technology',
        'Multistep Data Integrity Algorithm and Thermal Monitoring',
        'Standard 2.5-inch 7mm form factor'
      ],
      specs: [
        { label: 'Storage Capacity', value: '500GB' },
        { label: 'Form Factor', value: '2.5 Inch SATA 7mm' },
        { label: 'Interface', value: 'SATA 6.0 Gb/s' },
        { label: 'Max Sequential Read', value: '540 MB/s' },
        { label: 'Max Sequential Write', value: '500 MB/s' },
        { label: 'Endurance (TBW)', value: '120 TBW' }
      ]
    }
  ];

  console.log(`Inserting ${ssdProducts.length} high-performance SSD products with full details...`);

  // Fetch branches for inventory
  const [branches] = await connection.query(`SELECT id FROM branches`);
  const branchIds = branches.map(b => b.id);

  for (const p of ssdProducts) {
    const discountAmount = p.price - p.discount_price;
    const discountPercent = Math.round((discountAmount / p.price) * 100);

    // 1. Insert product
    await connection.query(
      `INSERT INTO products (
        name, slug, sku, model, brand_id, category_id, warranty_period,
        purchase_cost, avg_cost, selling_price, discount_price, min_selling_price,
        discount_amount, discount_percent, is_featured, is_new, is_pc_builder,
        pc_builder_component, seo_score, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 1, 'storage', 98, 'published')
      ON DUPLICATE KEY UPDATE
        category_id = VALUES(category_id),
        pc_builder_component = 'storage',
        is_pc_builder = 1,
        status = 'published',
        selling_price = VALUES(selling_price),
        discount_price = VALUES(discount_price),
        warranty_period = VALUES(warranty_period),
        model = VALUES(model)`,
      [
        p.name, p.slug, p.sku, p.model, p.brand_id, p.category_id, p.warranty,
        p.cost, p.cost, p.price, p.discount_price, p.cost + 500,
        discountAmount, discountPercent
      ]
    );

    const [row] = await connection.query(`SELECT id FROM products WHERE slug = ?`, [p.slug]);
    if (row.length > 0) {
      const pid = row[0].id;

      // 2. Primary Product Image
      await connection.query(
        `INSERT IGNORE INTO product_images (product_id, image_url, alt_text, is_primary) VALUES (?, ?, ?, 1)`,
        [pid, p.image, p.name]
      );

      // 3. Product Overview & Features
      await connection.query(
        `INSERT INTO product_descriptions (product_id, overview, key_features_json, what_in_box, warranty_info)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           overview = VALUES(overview),
           key_features_json = VALUES(key_features_json),
           what_in_box = VALUES(what_in_box),
           warranty_info = VALUES(warranty_info)`,
        [
          pid,
          p.overview,
          JSON.stringify(p.key_features),
          '1x SSD Drive, Quick Installation Guide, Warranty Documentation',
          p.warranty
        ]
      );

      // 4. Product Specifications
      await connection.query(`DELETE FROM product_specifications WHERE product_id = ?`, [pid]);
      for (const s of p.specs) {
        const code = s.label.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 48);
        const [existingAttr] = await connection.query(`SELECT id FROM attributes WHERE code = ?`, [code]);
        let attrId = null;
        if (existingAttr.length > 0) {
          attrId = existingAttr[0].id;
        } else {
          const [resAttr] = await connection.query(
            `INSERT INTO attributes (name, code, input_type) VALUES (?, ?, 'text')`,
            [s.label, code]
          );
          attrId = resAttr.insertId;
        }

        await connection.query(
          `INSERT INTO product_specifications (product_id, attribute_id, attribute_value, custom_label)
           VALUES (?, ?, ?, ?)`,
          [pid, attrId, s.value, s.label]
        );
      }

      // 5. Product SEO & Meta
      await connection.query(
        `INSERT INTO product_seo (product_id, meta_title, meta_desc, focus_keyword, canonical_url, og_title, og_desc)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           meta_title = VALUES(meta_title),
           meta_desc = VALUES(meta_desc),
           focus_keyword = VALUES(focus_keyword)`,
        [
          pid,
          `${p.name} Price in Bangladesh | CORENIX`,
          `Buy authentic ${p.name} with ${p.warranty} at the best price from CORENIX Bangladesh. Fast shipping and official warranty.`,
          `${p.name.toLowerCase()} price in bd`,
          `https://corenix.com.bd/product/${p.slug}`,
          p.name,
          p.overview
        ]
      );

      // 6. Branch Inventory Stocking
      for (const bId of branchIds) {
        await connection.query(
          `INSERT INTO inventory (product_id, branch_id, quantity, reserved_qty)
           VALUES (?, ?, 25, 0)
           ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)`,
          [pid, bId]
        );
      }
    }
  }

  // Final confirmation query
  const [totalCount] = await connection.query(`
    SELECT COUNT(*) as count FROM products WHERE pc_builder_component = 'storage' AND status = 'published'
  `);

  console.log(`SSD products successfully seeded! Total storage components available: ${totalCount[0].count}`);
  await connection.end();
}

seedSsdProducts().catch(err => {
  console.error('Error seeding SSD products:', err);
  process.exit(1);
});
