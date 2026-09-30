const mysql = require('mysql2/promise');

async function run() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'corenix_db',
  });

  console.log('Connected.');

  // Add extra banner columns if they don't exist
  const addCols = [
    `ALTER TABLE \`banners\` ADD COLUMN \`description\` TEXT NULL AFTER \`subtitle\``,
    `ALTER TABLE \`banners\` ADD COLUMN \`text_color\` VARCHAR(20) DEFAULT 'white' AFTER \`description\``,
    `ALTER TABLE \`banners\` ADD COLUMN \`cta2_text\` VARCHAR(50) NULL AFTER \`button_text\``,
    `ALTER TABLE \`banners\` ADD COLUMN \`cta2_link\` VARCHAR(255) NULL AFTER \`cta2_text\``,
    `ALTER TABLE \`banners\` ADD COLUMN \`badge_text\` VARCHAR(80) NULL AFTER \`cta2_link\``,
    `ALTER TABLE \`banners\` ADD COLUMN \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP AFTER \`is_active\``,
    `ALTER TABLE \`banners\` ADD COLUMN \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER \`created_at\``,
  ];

  for (const sql of addCols) {
    try {
      await c.query(sql);
      console.log('OK:', sql.substring(0, 70));
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Skip (exists):', sql.match(/ADD COLUMN `(\w+)`/)?.[1]);
      } else {
        console.warn('Warn:', e.message);
      }
    }
  }

  // Enrich existing seed rows
  await c.query(`
    UPDATE \`banners\` SET
      description = 'Experience high-octane gaming with NVIDIA RTX 50 Series, Intel 14th Gen CPUs, and DLSS 4 AI enhancement.',
      badge_text = 'RTX 50 Series Available Now',
      cta2_text = 'Browse All Hardware',
      cta2_link = '/products'
    WHERE id = 1 AND (description IS NULL OR description = '')
  `);

  await c.query(`
    UPDATE \`banners\` SET
      description = 'Verify component socket, TDP wattage, and form factor compatibility in real-time before you order.',
      badge_text = 'Zero Compatibility Errors',
      cta2_text = 'Learn More',
      cta2_link = '/products'
    WHERE id = 2 AND (description IS NULL OR description = '')
  `);

  await c.query(`
    UPDATE \`banners\` SET
      description = 'Esports-grade 240Hz and 4K OLED displays from MSI, ASUS, and Samsung with HDMI 2.1 and G-Sync.',
      badge_text = 'From ৳24,500',
      cta2_text = 'All Monitors',
      cta2_link = '/category/monitors'
    WHERE id = 3 AND (description IS NULL OR description = '')
  `);

  console.log('Migration complete!');
  await c.end();
}

run().catch(e => { console.error(e); process.exit(1); });
