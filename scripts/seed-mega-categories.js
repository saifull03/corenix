const mysql = require('mysql2/promise');

async function seedMegaCategories() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'corenix_db',
  });

  console.log('Connected to MySQL database corenix_db.');

  // Import categories data
  const { MEGA_CATEGORIES } = require('../src/lib/categories-data.ts');

  // Helper to insert or get category ID
  async function upsertCategory(name, slug, parentId = null) {
    const [existing] = await connection.query('SELECT id FROM categories WHERE slug = ?', [slug]);
    const h1 = `${name} Price in Bangladesh`;
    const shortDesc = `Explore authentic ${name} products at CORENIX with official manufacturer warranty, express delivery, and showroom pickup.`;
    const metaTitle = `${name} Price in Bangladesh | Official CORENIX Store`;
    const metaDesc = `Buy ${name} in Bangladesh at the lowest official price with manufacturer warranty. Browse specs, reviews & shop online or in-store at CORENIX.`;

    if (existing.length > 0) {
      if (parentId) {
        await connection.query('UPDATE categories SET parent_id = ? WHERE id = ?', [parentId, existing[0].id]);
      }
      return existing[0].id;
    }

    const [res] = await connection.query(
      `INSERT INTO categories (parent_id, name, slug, h1, short_desc, meta_title, meta_desc, focus_keyword, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [parentId, name, slug, h1, shortDesc, metaTitle, metaDesc, name.toLowerCase()]
    );
    return res.insertId;
  }

  // Iterate categories
  for (const top of MEGA_CATEGORIES) {
    console.log(`Processing top category: ${top.name} (${top.slug})`);
    const topId = await upsertCategory(top.name, top.slug, null);

    const subItems = top.columns ? top.columns.flat() : top.items || [];
    for (const sub of subItems) {
      const subId = await upsertCategory(sub.name, sub.slug, topId);

      if (sub.children && sub.children.length > 0) {
        for (const child of sub.children) {
          await upsertCategory(child.name, child.slug, subId);
        }
      }
    }
  }

  console.log('All mega categories successfully seeded into database!');
  await connection.end();
}

seedMegaCategories().catch((err) => {
  console.error('Error seeding categories:', err);
  process.exit(1);
});
