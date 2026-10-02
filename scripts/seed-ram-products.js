const mysql = require('mysql2/promise');

async function seedRamProducts() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'corenix_db',
  });

  console.log('Connected to MySQL corenix_db.');

  // Fetch or create categories
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
      `INSERT INTO brands (name, slug, country, logo, is_active) VALUES (?, ?, ?, ?, 1)`,
      [name, slug, country, `/images/brands/${slug}.svg`]
    );
    return res.insertId;
  }

  const catRam = await getOrCreateCategory('RAM (Desktop Memory)', 'ram', 'components');

  const brandCorsair = await getOrCreateBrand('Corsair', 'corsair', 'USA');
  const brandGskill = await getOrCreateBrand('G.SKILL', 'g-skill', 'Taiwan');
  const brandKingston = await getOrCreateBrand('Kingston', 'kingston', 'USA');

  const ramProducts = [
    {
      name: 'Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30 AMD EXPO & Intel XMP Gaming RAM',
      slug: 'corsair-vengeance-rgb-32gb-ddr5-6000mhz-ram',
      sku: 'RAM-COR-VENG-32G-D5',
      model: 'CMH32GX5M2B6000Z30K',
      brand_id: brandCorsair,
      category_id: catRam,
      warranty: 'Lifetime Official Warranty',
      cost: 11000,
      price: 14500,
      discount_price: 13200,
      pc_component: 'ram',
      image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Corsair Dominator Titanium RGB 64GB (2x32GB) DDR5 6400MHz CL32 High-Performance Desktop RAM',
      slug: 'corsair-dominator-titanium-64gb-ddr5-6400mhz-ram',
      sku: 'RAM-COR-DOM-64G-D5',
      model: 'CMP64GX5M2B6400C32',
      brand_id: brandCorsair,
      category_id: catRam,
      warranty: 'Lifetime Official Warranty',
      cost: 25000,
      price: 32500,
      discount_price: 29800,
      pc_component: 'ram',
      image: 'https://images.unsplash.com/photo-1541140532154-b024d705b909?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'G.SKILL Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz CL32 Gaming Desktop RAM',
      slug: 'gskill-trident-z5-rgb-32gb-ddr5-6400mhz-ram',
      sku: 'RAM-GSK-TZ5-32G-D5',
      model: 'F5-6400J3239G16GX2-TZ5RK',
      brand_id: brandGskill,
      category_id: catRam,
      warranty: 'Lifetime Official Warranty',
      cost: 11500,
      price: 15200,
      discount_price: 13900,
      pc_component: 'ram',
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'G.SKILL Ripjaws S5 32GB (2x16GB) DDR5 6000MHz CL36 Low-Profile Desktop RAM',
      slug: 'gskill-ripjaws-s5-32gb-ddr5-6000mhz-ram',
      sku: 'RAM-GSK-RIPS5-32G-D5',
      model: 'F5-6000J3636F16GX2-RS5K',
      brand_id: brandGskill,
      category_id: catRam,
      warranty: 'Lifetime Official Warranty',
      cost: 9500,
      price: 12800,
      discount_price: 11500,
      pc_component: 'ram',
      image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Kingston FURY Beast RGB 16GB (1x16GB) DDR5 5600MHz CL40 Desktop RAM',
      slug: 'kingston-fury-beast-rgb-16gb-ddr5-5600mhz-ram',
      sku: 'RAM-KNG-BST-16G-D5',
      model: 'KF556C40BBA-16',
      brand_id: brandKingston,
      category_id: catRam,
      warranty: 'Lifetime Official Warranty',
      cost: 4900,
      price: 6800,
      discount_price: 5999,
      pc_component: 'ram',
      image: 'https://images.unsplash.com/photo-1541140532154-b024d705b909?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Kingston FURY Beast 16GB (1x16GB) DDR4 3200MHz CL16 Desktop RAM',
      slug: 'kingston-fury-beast-16gb-ddr4-3200mhz-ram',
      sku: 'RAM-KNG-BST-16G-D4',
      model: 'KF432C16BB/16',
      brand_id: brandKingston,
      category_id: catRam,
      warranty: 'Lifetime Official Warranty',
      cost: 3200,
      price: 4500,
      discount_price: 3950,
      pc_component: 'ram',
      image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz CL16 Gaming Desktop RAM',
      slug: 'corsair-vengeance-lpx-16gb-ddr4-3200mhz-ram',
      sku: 'RAM-COR-LPX-16G-D4',
      model: 'CMK16GX4M2E3200C16',
      brand_id: brandCorsair,
      category_id: catRam,
      warranty: 'Lifetime Official Warranty',
      cost: 3700,
      price: 5200,
      discount_price: 4600,
      pc_component: 'ram',
      image: 'https://images.unsplash.com/photo-1541140532154-b024d705b909?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'G.SKILL Trident Z RGB 16GB (2x8GB) DDR4 3600MHz CL18 Gaming Desktop RAM',
      slug: 'gskill-trident-z-rgb-16gb-ddr4-3600mhz-ram',
      sku: 'RAM-GSK-TZ4-16G-D4',
      model: 'F4-3600C18D-16GTZR',
      brand_id: brandGskill,
      category_id: catRam,
      warranty: 'Lifetime Official Warranty',
      cost: 4900,
      price: 6900,
      discount_price: 6100,
      pc_component: 'ram',
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Corsair Vengeance RGB PRO SL 32GB (2x16GB) DDR4 3600MHz CL18 Gaming RAM',
      slug: 'corsair-vengeance-rgb-pro-sl-32gb-ddr4-3600mhz-ram',
      sku: 'RAM-COR-PROSL-32G-D4',
      model: 'CMH32GX4M2D3600C18',
      brand_id: brandCorsair,
      category_id: catRam,
      warranty: 'Lifetime Official Warranty',
      cost: 7600,
      price: 10500,
      discount_price: 9200,
      pc_component: 'ram',
      image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Kingston FURY Renegade RGB 32GB (2x16GB) DDR5 7200MHz CL38 Ultra-Fast Gaming RAM',
      slug: 'kingston-fury-renegade-rgb-32gb-ddr5-7200mhz-ram',
      sku: 'RAM-KNG-REN-32G-D5',
      model: 'KF572C38RSAK2-32',
      brand_id: brandKingston,
      category_id: catRam,
      warranty: 'Lifetime Official Warranty',
      cost: 14000,
      price: 18900,
      discount_price: 17200,
      pc_component: 'ram',
      image: 'https://images.unsplash.com/photo-1541140532154-b024d705b909?auto=format&fit=crop&w=800&q=80',
    }
  ];

  console.log(`Inserting ${ramProducts.length} high-performance RAM products...`);

  for (const p of ramProducts) {
    const discountAmount = p.price - p.discount_price;
    const discountPercent = Math.round((discountAmount / p.price) * 100);

    await connection.query(
      `INSERT INTO products (
        name, slug, sku, model, brand_id, category_id, warranty_period,
        purchase_cost, avg_cost, selling_price, discount_price, min_selling_price,
        discount_amount, discount_percent, is_featured, is_new, is_pc_builder, pc_builder_component, seo_score, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 1, ?, 98, 'published')
      ON DUPLICATE KEY UPDATE
        category_id = VALUES(category_id),
        pc_builder_component = VALUES(pc_builder_component),
        is_pc_builder = 1,
        status = 'published',
        selling_price = VALUES(selling_price),
        discount_price = VALUES(discount_price),
        warranty_period = VALUES(warranty_period)`,
      [
        p.name, p.slug, p.sku, p.model, p.brand_id, p.category_id, p.warranty,
        p.cost, p.cost, p.price, p.discount_price, p.cost + 400,
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
        `INSERT INTO inventory (product_id, branch_id, quantity) VALUES (?, 1, 20), (?, 2, 15), (?, 3, 10)
         ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)`,
        [pid, pid, pid]
      );
    }
  }

  // Ensure RAM products have is_pc_builder and pc_builder_component set
  await connection.query(`
    UPDATE products p
    JOIN categories c ON p.category_id = c.id
    SET p.pc_builder_component = 'ram', p.is_pc_builder = 1, p.status = 'published'
    WHERE c.slug IN ('ram', 'ram-desktop-memory', 'memory')
       OR p.name LIKE '%RAM%' OR p.name LIKE '%DDR5%' OR p.name LIKE '%DDR4%'
  `);

  console.log('RAM products successfully seeded and ready in PC Builder!');
  await connection.end();
}

seedRamProducts().catch(err => {
  console.error('Error seeding RAM products:', err);
  process.exit(1);
});
