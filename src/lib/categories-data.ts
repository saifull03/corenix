export interface ChildCategory {
  name: string;
  slug: string;
}

export interface SubCategory {
  name: string;
  slug: string;
  children?: ChildCategory[];
}

export interface TopCategory {
  name: string;
  slug: string;
  isMultiColumn?: boolean;
  columns?: SubCategory[][];
  items?: SubCategory[];
}

export const MEGA_CATEGORIES: TopCategory[] = [
  // 1. Desktop
  {
    name: 'Desktop',
    slug: 'desktop',
    items: [
      {
        name: 'Gaming PC',
        slug: 'gaming-pc',
        children: [
          { name: 'Intel Gaming PC', slug: 'intel-gaming-pc' },
          { name: 'AMD Ryzen Gaming PC', slug: 'amd-gaming-pc' },
          { name: 'Custom Water-Cooled PC', slug: 'water-cooled-pc' },
          { name: 'Esports Tournament PC', slug: 'esports-gaming-pc' },
        ],
      },
      {
        name: 'Brand PC',
        slug: 'brand-pc',
        children: [
          { name: 'HP Desktop PC', slug: 'hp-desktop-pc' },
          { name: 'Dell OptiPlex & Inspiron', slug: 'dell-desktop-pc' },
          { name: 'Lenovo IdeaCentre', slug: 'lenovo-desktop-pc' },
          { name: 'ASUS ROG Desktop', slug: 'asus-desktop-pc' },
        ],
      },
      {
        name: 'All-in-One PC',
        slug: 'all-in-one-pc',
        children: [
          { name: 'HP All-in-One', slug: 'hp-aio' },
          { name: 'Dell Inspiron AIO', slug: 'dell-aio' },
          { name: 'Lenovo IdeaCentre AIO', slug: 'lenovo-aio' },
          { name: 'Apple iMac 24"', slug: 'apple-imac' },
        ],
      },
      {
        name: 'Apple Mac',
        slug: 'apple-mac',
        children: [
          { name: 'Mac Mini M2 / M4', slug: 'mac-mini' },
          { name: 'Mac Studio', slug: 'mac-studio' },
          { name: 'Mac Pro Workstation', slug: 'mac-pro' },
          { name: 'iMac Retina', slug: 'imac-retina' },
        ],
      },
      {
        name: 'Mini PC',
        slug: 'mini-pc',
        children: [
          { name: 'ASUS NUC Mini PC', slug: 'asus-nuc' },
          { name: 'Intel NUC Mini PC', slug: 'intel-nuc' },
          { name: 'Minisforum AMD PC', slug: 'minisforum-mini-pc' },
        ],
      },
    ],
  },

  // 2. Laptop
  {
    name: 'Laptop',
    slug: 'laptops',
    items: [
      {
        name: 'Gaming Laptop',
        slug: 'gaming-laptop',
        children: [
          { name: 'ASUS ROG & TUF Gaming', slug: 'asus-gaming-laptops' },
          { name: 'Lenovo Legion & LOQ', slug: 'lenovo-legion-laptops' },
          { name: 'MSI Gaming Series', slug: 'msi-gaming-laptops' },
          { name: 'Acer Predator & Nitro', slug: 'acer-gaming-laptops' },
          { name: 'HP Omen & Victus', slug: 'hp-gaming-laptops' },
        ],
      },
      {
        name: 'Ultrabook & Business',
        slug: 'ultrabook',
        children: [
          { name: 'ASUS Zenbook OLED', slug: 'asus-zenbook' },
          { name: 'Lenovo ThinkPad & ThinkBook', slug: 'lenovo-thinkpad' },
          { name: 'Dell XPS & Latitude', slug: 'dell-xps' },
          { name: 'HP Envy & Spectre', slug: 'hp-envy' },
        ],
      },
      {
        name: 'MacBook',
        slug: 'macbook',
        children: [
          { name: 'MacBook Air M2 / M3', slug: 'macbook-air' },
          { name: 'MacBook Pro 14" & 16"', slug: 'macbook-pro' },
        ],
      },
      {
        name: 'Budget Laptop',
        slug: 'budget-laptop',
        children: [
          { name: 'Core i3 / Ryzen 3 Laptops', slug: 'i3-ryzen3-laptops' },
          { name: 'Core i5 / Ryzen 5 Laptops', slug: 'i5-ryzen5-laptops' },
          { name: 'Student & Everyday Laptops', slug: 'student-laptops' },
        ],
      },
    ],
  },

  // 3. Components (Matches Screenshot 2 Exactly)
  {
    name: 'Components',
    slug: 'components',
    items: [
      { name: 'Smart Screen', slug: 'smart-screen' },
      {
        name: 'Processor',
        slug: 'processor',
        children: [
          { name: 'Intel Core i9', slug: 'intel-core-i9' },
          { name: 'Intel Core i7', slug: 'intel-core-i7' },
          { name: 'Intel Core i5', slug: 'intel-core-i5' },
          { name: 'Intel Core i3', slug: 'intel-core-i3' },
          { name: 'Intel Core Ultra', slug: 'intel-core-ultra' },
          { name: 'AMD Ryzen 9', slug: 'amd-ryzen-9' },
          { name: 'AMD Ryzen 7', slug: 'amd-ryzen-7' },
          { name: 'AMD Ryzen 5', slug: 'amd-ryzen-5' },
          { name: 'AMD Ryzen Threadripper', slug: 'amd-threadripper' },
        ],
      },
      {
        name: 'CPU Cooler',
        slug: 'cpu-cooler',
        children: [
          { name: 'Liquid Cooler (AIO)', slug: 'liquid-cooler' },
          { name: 'Air Cooler', slug: 'air-cooler' },
          { name: 'Custom Loop Accessories', slug: 'custom-loop' },
          { name: 'Cooler Fan / Heatsink', slug: 'cooler-fan' },
        ],
      },
      {
        name: 'Motherboard',
        slug: 'motherboard',
        children: [
          { name: 'Intel Motherboard (Z890 / Z790 / B760)', slug: 'intel-motherboard' },
          { name: 'AMD Motherboard (X870 / X670 / B650)', slug: 'amd-motherboard' },
          { name: 'Mini-ITX Motherboard', slug: 'mini-itx-motherboard' },
          { name: 'Workstation Motherboard', slug: 'workstation-motherboard' },
        ],
      },
      {
        name: 'Graphics Card',
        slug: 'graphics-card',
        children: [
          { name: 'NVIDIA GeForce RTX 50 Series', slug: 'rtx-50-series' },
          { name: 'NVIDIA GeForce RTX 40 Series', slug: 'rtx-40-series' },
          { name: 'AMD Radeon RX Series', slug: 'radeon-rx-series' },
          { name: 'Intel Arc Graphics', slug: 'intel-arc-series' },
          { name: 'NVIDIA RTX Ada / Quadro', slug: 'quadro-workstation' },
        ],
      },
      {
        name: 'RAM (Desktop)',
        slug: 'ram',
        children: [
          { name: 'DDR5 Desktop RAM', slug: 'ddr5-desktop-ram' },
          { name: 'DDR4 Desktop RAM', slug: 'ddr4-desktop-ram' },
          { name: 'RGB Gaming Memory Kit', slug: 'rgb-gaming-ram' },
          { name: 'High-Frequency 6000MHz+', slug: 'high-freq-ram' },
        ],
      },
      {
        name: 'RAM (Laptop)',
        slug: 'laptop-ram',
        children: [
          { name: 'DDR5 Laptop SO-DIMM', slug: 'ddr5-laptop-ram' },
          { name: 'DDR4 Laptop SO-DIMM', slug: 'ddr4-laptop-ram' },
        ],
      },
      {
        name: 'Power Supply',
        slug: 'power-supply',
        children: [
          { name: '80 PLUS Bronze', slug: 'bronze-psu' },
          { name: '80 PLUS Gold Certified', slug: 'gold-psu' },
          { name: '80 PLUS Platinum / Titanium', slug: 'platinum-psu' },
          { name: 'ATX 3.0 / PCIe 5.0 Ready', slug: 'atx-3-psu' },
          { name: 'SFX Compact Power Supply', slug: 'sfx-psu' },
        ],
      },
      {
        name: 'Hard Disk Drive',
        slug: 'hard-disk-drive',
        children: [
          { name: '3.5" Desktop Internal HDD', slug: 'desktop-hdd' },
          { name: 'Surveillance HDD (SkyHawk/Purple)', slug: 'surveillance-hdd' },
          { name: 'NAS Hard Drive (IronWolf/Red)', slug: 'nas-hdd' },
        ],
      },
      {
        name: 'Portable HDD',
        slug: 'portable-hdd',
        children: [
          { name: '1TB External HDD', slug: '1tb-portable-hdd' },
          { name: '2TB External HDD', slug: '2tb-portable-hdd' },
          { name: '4TB & 5TB External HDD', slug: '4tb-portable-hdd' },
          { name: 'Shockproof Rugged HDD', slug: 'rugged-hdd' },
        ],
      },
      {
        name: 'SSD',
        slug: 'storage',
        children: [
          { name: 'M.2 NVMe PCIe Gen 4 SSD', slug: 'm2-gen4-ssd' },
          { name: 'M.2 NVMe PCIe Gen 5 SSD', slug: 'm2-gen5-ssd' },
          { name: 'SATA III 2.5" SSD', slug: 'sata-ssd' },
          { name: 'M.2 Heatsink SSD', slug: 'heatsink-ssd' },
        ],
      },
      {
        name: 'Casing',
        slug: 'pc-case',
        children: [
          { name: 'Mid Tower Casing', slug: 'mid-tower-casing' },
          { name: 'Panoramic / Fish Tank Glass Casing', slug: 'fish-tank-casing' },
          { name: 'Full Tower Casing', slug: 'full-tower-casing' },
          { name: 'Mini-ITX Small Form Factor', slug: 'itx-casing' },
        ],
      },
      {
        name: 'Casing Fan',
        slug: 'casing-fan',
        children: [
          { name: '120mm ARGB Casing Fan', slug: '120mm-fan' },
          { name: '140mm High Airflow Fan', slug: '140mm-fan' },
          { name: 'Reverse Blade Fan Kit', slug: 'reverse-blade-fan' },
          { name: 'Fan Hub & Controller', slug: 'fan-hub' },
        ],
      },
      { name: 'Portable SSD', slug: 'portable-ssd' },
    ],
  },

  // 4. Accessories (Matches Screenshot 1 Exactly - Multi-column)
  {
    name: 'Accessories',
    slug: 'accessories',
    isMultiColumn: true,
    columns: [
      // Column 1 (Left column in Screenshot 1)
      [
        { name: 'Power Station', slug: 'power-station' },
        {
          name: 'Mobile Accessories',
          slug: 'mobile-accessories',
          children: [
            { name: 'Fast Charger & GaN Adapter', slug: 'gan-charger' },
            { name: 'Type-C & Lightning Cables', slug: 'mobile-cables' },
            { name: 'Car Charger & Phone Mount', slug: 'car-charger-mount' },
            { name: 'Wireless Charging Pad', slug: 'wireless-charger' },
          ],
        },
        { name: 'Bluetooth Headphone', slug: 'bluetooth-headphone' },
        {
          name: 'Bluetooth Speaker',
          slug: 'bluetooth-speaker',
          children: [
            { name: 'Portable Bluetooth Speaker', slug: 'portable-speaker' },
            { name: 'RGB Party Speaker', slug: 'party-speaker' },
            { name: 'Soundbar for Desktop & TV', slug: 'soundbar' },
          ],
        },
        { name: 'CCTV Camera Housing', slug: 'cctv-camera-housing' },
        { name: 'Ceiling Mount', slug: 'ceiling-mount' },
        {
          name: 'Combo',
          slug: 'combo',
          children: [
            { name: 'Keyboard & Mouse Combo', slug: 'kb-mouse-combo' },
            { name: 'Wireless Office Combo', slug: 'wireless-combo' },
            { name: 'RGB Gaming Combo Set', slug: 'gaming-combo' },
          ],
        },
        {
          name: 'Converter & Cable',
          slug: 'converter-cable',
          children: [
            { name: 'HDMI to VGA / Type-C Cable', slug: 'hdmi-cable' },
            { name: 'DisplayPort 1.4 / 2.1 Cable', slug: 'displayport-cable' },
            { name: 'Multiport Type-C Hub & Dock', slug: 'type-c-hub' },
            { name: 'Audio Jack Splitter & Aux Cable', slug: 'audio-cables' },
          ],
        },
        {
          name: 'Corrector Frame',
          slug: 'corrector-frame',
          children: [
            { name: 'Intel LGA1700 Anti-Bending Frame', slug: 'lga1700-frame' },
            { name: 'AMD AM5 Contact Frame', slug: 'am5-frame' },
          ],
        },
        {
          name: 'GPU Mounting Kit',
          slug: 'gpu-mounting-kit',
          children: [
            { name: 'Vertical GPU Mount Bracket', slug: 'vertical-gpu-bracket' },
            { name: 'PCIe 4.0 / 5.0 Riser Cable', slug: 'pcie-riser-cable' },
          ],
        },
        {
          name: 'Graphics Card Holder',
          slug: 'graphics-card-holder',
          children: [
            { name: 'ARGB GPU Anti-Sag Bracket', slug: 'argb-gpu-holder' },
            { name: 'Aluminum Pillar Support Stand', slug: 'pillar-gpu-stand' },
          ],
        },
        { name: 'HDD-SSD Enclosure', slug: 'hdd-ssd-enclosure' },
        {
          name: 'Headphone',
          slug: 'headphone',
          children: [
            { name: '7.1 Surround Gaming Headset', slug: 'gaming-headset' },
            { name: 'Wireless Low-Latency Headset', slug: 'wireless-headset' },
            { name: 'Studio Monitoring Headphones', slug: 'studio-headphones' },
            { name: 'Type-C Earphones', slug: 'type-c-earphones' },
          ],
        },
        {
          name: 'Headphone Stand',
          slug: 'headphone-stand',
          children: [
            { name: 'RGB Headset Stand with USB Hub', slug: 'rgb-headset-stand' },
            { name: 'Aluminum Desk Hanger', slug: 'aluminum-headset-stand' },
          ],
        },
      ],

      // Column 2 (Right column in Screenshot 1)
      [
        {
          name: 'Microphone Stand',
          slug: 'microphone-stand',
          children: [
            { name: 'Desk Boom Arm Stand', slug: 'mic-boom-arm' },
            { name: 'Heavy-Duty Desktop Base', slug: 'mic-desktop-stand' },
            { name: 'Shock Mount & Pop Filter', slug: 'mic-shock-mount' },
          ],
        },
        {
          name: 'Monitor Accessories',
          slug: 'monitor-accessories',
          children: [
            { name: 'Screen Light Bar / Desk Lamp', slug: 'screen-light-bar' },
            { name: 'Cable Management Clips', slug: 'cable-management' },
            { name: 'Display Cleaning Kit', slug: 'screen-cleaner' },
          ],
        },
        {
          name: 'Monitor Stand',
          slug: 'monitor-stand',
          children: [
            { name: 'Single Gas Spring Monitor Arm', slug: 'single-monitor-arm' },
            { name: 'Dual Monitor Heavy Duty Arm', slug: 'dual-monitor-arm' },
            { name: 'Triple Monitor Mount', slug: 'triple-monitor-mount' },
            { name: 'Laptop & Monitor Desk Mount', slug: 'laptop-monitor-mount' },
          ],
        },
        { name: 'Mounting Kit', slug: 'mounting-kit' },
        {
          name: 'Mouse',
          slug: 'mouse',
          children: [
            { name: 'Wireless Gaming Mouse', slug: 'wireless-gaming-mouse' },
            { name: 'Ultra-Lightweight Honeycomb Mouse', slug: 'ultralight-mouse' },
            { name: 'Ergonomic Vertical Mouse', slug: 'ergonomic-mouse' },
            { name: 'Office Silent Mouse', slug: 'office-silent-mouse' },
          ],
        },
        {
          name: 'Mouse Pad',
          slug: 'mouse-pad',
          children: [
            { name: 'Speed Type Esports Mouse Pad', slug: 'speed-mouse-pad' },
            { name: 'Control Type Micro-Weave Pad', slug: 'control-mouse-pad' },
            { name: 'Extended XXL Desk Mat (900x400)', slug: 'xxl-desk-mat' },
            { name: 'RGB Glowing Edge Mouse Pad', slug: 'rgb-mouse-pad' },
          ],
        },
        {
          name: 'Pen Drive',
          slug: 'pen-drive',
          children: [
            { name: 'USB 3.2 High-Speed Flash Drive', slug: 'usb3-flash-drive' },
            { name: 'Type-C & Type-A Dual OTG Drive', slug: 'dual-otg-drive' },
            { name: 'Encrypted Metal USB Drive', slug: 'encrypted-usb-drive' },
          ],
        },
        { name: 'Power Strip', slug: 'power-strip' },
        {
          name: 'Speaker & Home Theater',
          slug: 'speaker-home-theater',
          children: [
            { name: '2.0 Stereo Studio Monitors', slug: 'studio-monitors-speaker' },
            { name: '2.1 Subwoofer Gaming Speakers', slug: '2-1-speaker-system' },
            { name: 'Dolby Atmos Home Theater Soundbar', slug: 'dolby-soundbar' },
          ],
        },
        { name: 'Thermal Pad', slug: 'thermal-pad' },
        {
          name: 'Thermal Paste',
          slug: 'thermal-paste',
          children: [
            { name: 'Thermalright TF8 / TF9', slug: 'thermalright-paste' },
            { name: 'Arctic MX-4 / MX-6', slug: 'arctic-thermal-paste' },
            { name: 'Thermal Grizzly Kryonaut / Conductonaut', slug: 'kryonaut-paste' },
            { name: 'Liquid Metal Compound', slug: 'liquid-metal-paste' },
          ],
        },
        { name: 'Wall Mount', slug: 'wall-mount' },
        {
          name: 'Webcam',
          slug: 'webcam',
          children: [
            { name: '1080p 60FPS Streaming Webcam', slug: '1080p-webcam' },
            { name: '4K UHD HDR Web Camera', slug: '4k-webcam' },
            { name: 'Webcam with Ring Light & Privacy Shutter', slug: 'ringlight-webcam' },
          ],
        },
        { name: 'Wrist Rest', slug: 'wrist-rest' },
      ],
    ],
  },

  // 5. Monitor
  {
    name: 'Monitor',
    slug: 'monitors',
    items: [
      {
        name: 'Gaming Monitor',
        slug: 'gaming-monitor',
        children: [
          { name: '144Hz - 180Hz High Refresh', slug: '180hz-gaming-monitor' },
          { name: '240Hz - 360Hz Esports Display', slug: '240hz-gaming-monitor' },
          { name: 'Curved 1500R / 1000R Gaming', slug: 'curved-gaming-monitor' },
          { name: 'Fast IPS & OLED Gaming Panel', slug: 'fast-ips-oled-monitor' },
        ],
      },
      {
        name: '4K & Professional Monitor',
        slug: 'pro-monitor',
        children: [
          { name: '4K UHD / 5K Color Accurate IPS', slug: '4k-pro-monitor' },
          { name: 'Ultrawide 21:9 & 32:9 Display', slug: 'ultrawide-monitor' },
          { name: 'Type-C PD Docking Monitor', slug: 'type-c-dock-monitor' },
          { name: 'Graphic Design & Video Editing Screen', slug: 'creator-monitor' },
        ],
      },
      {
        name: 'Office & Everyday Monitor',
        slug: 'office-monitor',
        children: [
          { name: '21.5" - 24" Budget Monitor', slug: '24-inch-monitor' },
          { name: '27" Frameless FHD Monitor', slug: '27-inch-monitor' },
          { name: 'Eye-Care & Low Blue Light Display', slug: 'eye-care-monitor' },
        ],
      },
      {
        name: 'Portable Monitor',
        slug: 'portable-monitor',
        children: [
          { name: '15.6" Type-C Portable Display', slug: '15-inch-portable-monitor' },
          { name: 'Touchscreen Portable Monitor', slug: 'touch-portable-monitor' },
        ],
      },
    ],
  },

  // 6. Networking
  {
    name: 'Networking',
    slug: 'networking',
    items: [
      {
        name: 'Router',
        slug: 'router',
        children: [
          { name: 'Wi-Fi 7 Next-Gen Router', slug: 'wifi7-router' },
          { name: 'Wi-Fi 6 High Performance Router', slug: 'wifi6-router' },
          { name: 'Mesh Wi-Fi Whole Home System', slug: 'mesh-wifi' },
          { name: 'Gaming Tri-Band Router', slug: 'gaming-router' },
        ],
      },
      {
        name: 'Switch',
        slug: 'network-switch',
        children: [
          { name: '5/8/16 Port Gigabit Switch', slug: 'gigabit-switch' },
          { name: 'PoE Switch for IP Cameras', slug: 'poe-switch' },
          { name: 'Smart Managed Rack Switch', slug: 'managed-switch' },
        ],
      },
      {
        name: 'Access Point',
        slug: 'access-point',
        children: [
          { name: 'Ceiling Mount Enterprise AP', slug: 'ceiling-ap' },
          { name: 'Outdoor Long-Range Wireless AP', slug: 'outdoor-ap' },
        ],
      },
      {
        name: 'Network Adapter',
        slug: 'network-adapter',
        children: [
          { name: 'USB Wi-Fi Dongle', slug: 'usb-wifi-dongle' },
          { name: 'PCIe Wi-Fi 6E/7 Card with Bluetooth', slug: 'pcie-wifi-card' },
        ],
      },
      {
        name: 'Network Cable & Accessories',
        slug: 'network-cables',
        children: [
          { name: 'Cat 6 & Cat 7 Patch Cord', slug: 'cat6-cat7-cables' },
          { name: 'RJ45 Connectors & Keystone Jacks', slug: 'rj45-connectors' },
        ],
      },
    ],
  },

  // 7. Office Equipments
  {
    name: 'Office Equipments',
    slug: 'office-equipments',
    items: [
      {
        name: 'Printer',
        slug: 'printer',
        children: [
          { name: 'All-in-One Ink Tank Printer', slug: 'ink-tank-printer' },
          { name: 'Monochrome Laser Printer', slug: 'laser-printer' },
          { name: 'Color Laser Multi-Function', slug: 'color-laser-printer' },
        ],
      },
      { name: 'Photocopier', slug: 'photocopier' },
      { name: 'Scanner', slug: 'scanner' },
      {
        name: 'Projector',
        slug: 'projector',
        children: [
          { name: '4K Home Cinema Projector', slug: '4k-projector' },
          { name: 'Business & Classroom Laser Projector', slug: 'business-projector' },
          { name: 'Portable Mini LED Projector', slug: 'mini-projector' },
        ],
      },
      { name: 'Paper Shredder', slug: 'paper-shredder' },
      { name: 'Barcode Scanner', slug: 'barcode-scanner' },
    ],
  },

  // 8. UPS
  {
    name: 'UPS',
    slug: 'ups',
    items: [
      {
        name: 'Offline UPS',
        slug: 'offline-ups',
        children: [
          { name: '650VA - 850VA Backup UPS', slug: '650va-ups' },
          { name: '1200VA - 2000VA Dual Battery UPS', slug: '1200va-ups' },
        ],
      },
      {
        name: 'Online UPS',
        slug: 'online-ups',
        children: [
          { name: '1 KVA - 3 KVA Pure Sine Wave', slug: '1kva-online-ups' },
          { name: '6 KVA - 10 KVA Enterprise Online UPS', slug: '6kva-online-ups' },
        ],
      },
      { name: 'Mini UPS for Wi-Fi Router', slug: 'mini-ups-router' },
      { name: 'UPS Battery Replacement', slug: 'ups-battery' },
    ],
  },

  // 9. Security
  {
    name: 'Security',
    slug: 'security',
    items: [
      {
        name: 'CC Camera',
        slug: 'cc-camera',
        children: [
          { name: 'IP Dome Camera (ColorVu / Full HD)', slug: 'ip-dome-camera' },
          { name: 'Outdoor Waterproof Bullet Camera', slug: 'bullet-camera' },
          { name: 'PTZ 360° Smart Auto-Tracking Camera', slug: 'ptz-camera' },
        ],
      },
      {
        name: 'NVR & DVR',
        slug: 'nvr-dvr',
        children: [
          { name: '4/8 Channel PoE NVR', slug: '8-channel-nvr' },
          { name: '16/32 Channel Enterprise NVR', slug: '16-channel-nvr' },
          { name: 'Hybrid HD DVR', slug: 'hd-dvr' },
        ],
      },
      { name: 'Access Control & Attendance Machine', slug: 'access-control' },
      { name: 'Smart Digital Door Lock', slug: 'smart-door-lock' },
    ],
  },

  // 10. Camera
  {
    name: 'Camera',
    slug: 'camera',
    items: [
      {
        name: 'Mirrorless Camera',
        slug: 'mirrorless-camera',
        children: [
          { name: 'Sony Alpha Full-Frame Series', slug: 'sony-mirrorless' },
          { name: 'Canon EOS R Series', slug: 'canon-eos-r' },
          { name: 'Fujifilm X-Series', slug: 'fujifilm-camera' },
        ],
      },
      { name: 'DSLR Camera', slug: 'dslr-camera' },
      {
        name: 'Action Camera',
        slug: 'action-camera',
        children: [
          { name: 'GoPro HERO Series', slug: 'gopro-hero' },
          { name: 'DJI Osmo Action', slug: 'dji-osmo-action' },
          { name: 'Insta360 360° Cam', slug: 'insta360' },
        ],
      },
      { name: 'Camera Lens & Flash', slug: 'camera-lens' },
      { name: 'Tripod & Camera Gimbal', slug: 'tripod-gimbal' },
    ],
  },

  // 11. Gadget
  {
    name: 'Gadget',
    slug: 'gadget',
    items: [
      {
        name: 'Smart Watch',
        slug: 'smart-watch',
        children: [
          { name: 'Apple Watch Series', slug: 'apple-watch' },
          { name: 'Samsung Galaxy Watch', slug: 'galaxy-watch' },
          { name: 'AMOLED Calling Smartwatch', slug: 'calling-smartwatch' },
        ],
      },
      {
        name: 'Earbuds / TWS',
        slug: 'earbuds-tws',
        children: [
          { name: 'Active Noise Cancelling TWS', slug: 'anc-earbuds' },
          { name: 'Gaming Ultra Low-Latency TWS', slug: 'gaming-earbuds' },
          { name: 'Sports Waterproof Earbuds', slug: 'sports-earbuds' },
        ],
      },
      {
        name: 'Power Bank',
        slug: 'power-bank',
        children: [
          { name: '20,000mAh 65W Fast Charging Bank', slug: '65w-power-bank' },
          { name: 'MagSafe Wireless Power Bank', slug: 'magsafe-power-bank' },
        ],
      },
      { name: 'Smartphone Gimbal & Stabilizer', slug: 'smartphone-gimbal' },
    ],
  },

  // 12. AI Workstation
  {
    name: 'AI Workstation',
    slug: 'ai-workstation',
    items: [
      {
        name: 'Deep Learning & LLM Server',
        slug: 'deep-learning-pc',
        children: [
          { name: 'Dual / Quad RTX 4090 / 5090 System', slug: 'multi-gpu-ai-pc' },
          { name: 'AMD Threadripper Pro AI Tower', slug: 'threadripper-ai' },
        ],
      },
      {
        name: 'Rendering & 3D CAD Workstation',
        slug: 'rendering-cad-pc',
        children: [
          { name: 'Blender & Unreal Engine 5 PC', slug: 'ue5-blender-pc' },
          { name: 'AutoCAD / Revit Architecture Station', slug: 'autocad-workstation' },
        ],
      },
      { name: 'NVIDIA RTX Ada Professional Systems', slug: 'rtx-ada-workstation' },
    ],
  },

  // 13. Gaming
  {
    name: 'Gaming',
    slug: 'gaming',
    items: [
      {
        name: 'Gaming Console',
        slug: 'gaming-console',
        children: [
          { name: 'PlayStation 5 Slim / Pro', slug: 'ps5-console' },
          { name: 'Xbox Series X & Series S', slug: 'xbox-series-x' },
          { name: 'Nintendo Switch OLED', slug: 'nintendo-switch' },
        ],
      },
      {
        name: 'Gaming Chair',
        slug: 'gaming-chair',
        children: [
          { name: 'Ergonomic Breathable Mesh Chair', slug: 'mesh-gaming-chair' },
          { name: 'PU Leather Racing Bucket Chair', slug: 'leather-gaming-chair' },
        ],
      },
      {
        name: 'Gaming Desk',
        slug: 'gaming-desk',
        children: [
          { name: 'Electric Height-Adjustable Desk', slug: 'standing-gaming-desk' },
          { name: 'Carbon Fiber RGB Desk', slug: 'carbon-fiber-desk' },
        ],
      },
      {
        name: 'Gamepad & Controller',
        slug: 'gamepad-controller',
        children: [
          { name: 'Xbox Wireless Controller', slug: 'xbox-controller' },
          { name: 'PS5 DualSense Wireless Controller', slug: 'ps5-dualsense' },
          { name: 'Wireless Hall Effect PC Gamepad', slug: 'pc-gamepad' },
        ],
      },
      { name: 'Racing Wheel & Pedals', slug: 'racing-wheel' },
      { name: 'VR Headset (Meta Quest 3)', slug: 'vr-headset' },
    ],
  },

  // 14. Software
  {
    name: 'Software',
    slug: 'software',
    items: [
      {
        name: 'Operating System',
        slug: 'operating-system',
        children: [
          { name: 'Microsoft Windows 11 Home', slug: 'windows-11-home' },
          { name: 'Microsoft Windows 11 Pro', slug: 'windows-11-pro' },
        ],
      },
      {
        name: 'Office Applications',
        slug: 'office-software',
        children: [
          { name: 'Microsoft 365 Personal / Family', slug: 'microsoft-365' },
          { name: 'Office 2024 Home & Business Lifetime', slug: 'office-2024' },
        ],
      },
      {
        name: 'Antivirus & Internet Security',
        slug: 'antivirus-security',
        children: [
          { name: 'Kaspersky Total Security', slug: 'kaspersky-security' },
          { name: 'Bitdefender Total Security', slug: 'bitdefender' },
          { name: 'ESET NOD32 Internet Security', slug: 'eset-nod32' },
        ],
      },
    ],
  },

  // 15. Server & Accessories
  {
    name: 'Server & Accessories',
    slug: 'server-accessories',
    items: [
      {
        name: 'Rackmount Server',
        slug: 'rackmount-server',
        children: [
          { name: 'Dell PowerEdge 1U / 2U Server', slug: 'dell-poweredge' },
          { name: 'HPE ProLiant Rack Server', slug: 'hpe-proliant' },
        ],
      },
      { name: 'Tower Server for SMB', slug: 'tower-server' },
      {
        name: 'Server Memory',
        slug: 'server-memory',
        children: [
          { name: 'DDR5 ECC Registered RDIMM', slug: 'ddr5-ecc-ram' },
          { name: 'DDR4 ECC Server RAM', slug: 'ddr4-ecc-ram' },
        ],
      },
      {
        name: 'Server Storage',
        slug: 'server-storage',
        children: [
          { name: 'SAS 12Gbps Enterprise HDD', slug: 'sas-enterprise-hdd' },
          { name: 'U.2 / U.3 Enterprise NVMe SSD', slug: 'enterprise-nvme-ssd' },
        ],
      },
      { name: 'Server Rack Cabinet & PDU', slug: 'server-rack-cabinet' },
      { name: 'KVM Switch Console', slug: 'kvm-switch' },
    ],
  },
];
