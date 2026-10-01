const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'corenix_db',
  });

  console.log('Connected to MySQL database: corenix_db');

  // Check if banners exist
  const [existing] = await conn.execute('SELECT COUNT(*) as count FROM banners');
  console.log('Existing banners count:', existing[0].count);

  if (existing[0].count === 0) {
    const bannersToInsert = [
      // 1. Hero Left Slide 1
      {
        title: 'Custom PC Builder Engine',
        subtitle: 'Zero Compatibility Errors',
        description: 'Verify component socket, TDP wattage, and form factor compatibility in real-time before you order.',
        image_url: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=1600&q=80',
        link_url: '/pc-builder',
        button_text: 'Build Your PC',
        cta2_text: 'Explore Parts',
        cta2_link: '/category/components',
        badge_text: 'Live Compatibility Check',
        text_color: 'white',
        position: 'hero',
        order_index: 1,
        is_active: 1,
      },
      // 2. Hero Left Slide 2
      {
        title: 'GeForce RTX 50 Series',
        subtitle: 'Next-Gen Blackwell Architecture',
        description: 'Experience DLSS 4 AI frame generation, extreme ray tracing, and ultra-fast GDDR7 memory speeds.',
        image_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1600&q=80',
        link_url: '/category/graphics-card',
        button_text: 'Shop GPUs',
        cta2_text: 'View Specs',
        cta2_link: '/category/graphics-card',
        badge_text: 'In Stock & Ready to Ship',
        text_color: 'white',
        position: 'hero',
        order_index: 2,
        is_active: 1,
      },
      // 3. Hero Left Slide 3
      {
        title: 'Enterprise Brand Desktops & Macs',
        subtitle: 'Official Manufacturer Warranty',
        description: 'Official HP ProDesk, Dell OptiPlex, Lenovo ThinkCentre, and Apple Mac Studio with multi-branch stock.',
        image_url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=1600&q=80',
        link_url: '/category/desktop',
        button_text: 'Explore Desktops',
        cta2_text: 'All-in-One PCs',
        cta2_link: '/category/all-in-one-pc',
        badge_text: 'Official HP • Dell • Lenovo • Apple',
        text_color: 'white',
        position: 'hero',
        order_index: 3,
        is_active: 1,
      },

      // 4. Hero Right Collage Card 1 (Top)
      {
        title: 'NVIDIA RTX 50 Series',
        subtitle: 'RTX 5090, 5080 & 5070 in Stock',
        description: 'Flagship NVIDIA Blackwell graphics cards with official distributor warranty.',
        image_url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
        link_url: '/category/graphics-card',
        button_text: 'Shop GPUs',
        cta2_text: '',
        cta2_link: '',
        badge_text: '🔥 HOT RELEASE',
        text_color: 'white',
        position: 'hero_collage',
        order_index: 1,
        is_active: 1,
      },
      // 5. Hero Right Collage Card 2 (Middle)
      {
        title: 'Pre-Built PC & Apple Mac',
        subtitle: 'HP, Dell, Lenovo & Mac Mini M4',
        description: 'Commercial brand towers, All-in-One PCs, and Apple Silicon workstations.',
        image_url: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80',
        link_url: '/category/desktop',
        button_text: 'Explore Desktop',
        cta2_text: '',
        cta2_link: '',
        badge_text: '⚡ BRAND COMPUTERS',
        text_color: 'white',
        position: 'hero_collage',
        order_index: 2,
        is_active: 1,
      },
      // 6. Hero Right Collage Card 3 (Bottom)
      {
        title: 'High-Refresh OLED Laptops',
        subtitle: 'ASUS ROG, Lenovo Legion & XPS',
        description: 'Enthusiast gaming and thin-and-light creator laptops.',
        image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
        link_url: '/category/laptops',
        button_text: 'View Laptops',
        cta2_text: '',
        cta2_link: '',
        badge_text: '💻 GAMING LAPTOPS',
        text_color: 'white',
        position: 'hero_collage',
        order_index: 3,
        is_active: 1,
      },
    ];

    for (const b of bannersToInsert) {
      await conn.execute(
        `INSERT INTO banners (
          title, subtitle, description, image_url, link_url,
          button_text, cta2_text, cta2_link, badge_text, text_color,
          position, order_index, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          b.title,
          b.subtitle,
          b.description,
          b.image_url,
          b.link_url,
          b.button_text,
          b.cta2_text || null,
          b.cta2_link || null,
          b.badge_text || null,
          b.text_color,
          b.position,
          b.order_index,
          b.is_active,
        ]
      );
      console.log(`+ Inserted ${b.position} banner: "${b.title}"`);
    }

    console.log('✅ Successfully seeded default hero sliders and collage pictures!');
  }

  await conn.end();
}

main().catch(console.error);
