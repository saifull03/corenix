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
          { name: 'Intel', slug: 'intel' },
          { name: 'AMD', slug: 'amd' },
          { name: 'ASUS ROG', slug: 'asus' },
          { name: 'MSI', slug: 'msi' },
          { name: 'Gigabyte AORUS', slug: 'gigabyte' },
          { name: 'Corsair', slug: 'corsair' },
          { name: 'NZXT', slug: 'nzxt' },
          { name: 'Lenovo Legion', slug: 'lenovo' },
          { name: 'HP OMEN', slug: 'hp' },
        ],
      },
      {
        name: 'Brand PC',
        slug: 'brand-pc',
        children: [
          { name: 'HP', slug: 'hp' },
          { name: 'Dell', slug: 'dell' },
          { name: 'Lenovo', slug: 'lenovo' },
          { name: 'ASUS', slug: 'asus' },
          { name: 'Acer', slug: 'acer' },
          { name: 'Apple', slug: 'apple' },
        ],
      },
      {
        name: 'All-in-One PC',
        slug: 'all-in-one-pc',
        children: [
          { name: 'HP', slug: 'hp' },
          { name: 'Dell', slug: 'dell' },
          { name: 'Lenovo', slug: 'lenovo' },
          { name: 'Apple', slug: 'apple' },
          { name: 'ASUS', slug: 'asus' },
          { name: 'Acer', slug: 'acer' },
        ],
      },
      {
        name: 'Apple Mac',
        slug: 'apple-mac',
        children: [
          { name: 'Mac Mini', slug: 'mac-mini' },
          { name: 'Mac Studio', slug: 'mac-studio' },
          { name: 'Mac Pro', slug: 'mac-pro' },
          { name: 'iMac', slug: 'apple-imac' },
        ],
      },
      {
        name: 'Mini PC',
        slug: 'mini-pc',
        children: [
          { name: 'ASUS', slug: 'asus' },
          { name: 'Intel NUC', slug: 'intel' },
          { name: 'Minisforum', slug: 'minisforum' },
          { name: 'MSI', slug: 'msi' },
          { name: 'Beelink', slug: 'beelink' },
          { name: 'GMKtec', slug: 'gmktec' },
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
          { name: 'ASUS', slug: 'asus' },
          { name: 'Lenovo', slug: 'lenovo' },
          { name: 'MSI', slug: 'msi' },
          { name: 'Acer', slug: 'acer' },
          { name: 'HP', slug: 'hp' },
          { name: 'Dell Alienware', slug: 'dell' },
          { name: 'Gigabyte', slug: 'gigabyte' },
          { name: 'Razer', slug: 'razer' },
        ],
      },
      {
        name: 'Ultrabook & Business',
        slug: 'ultrabook',
        children: [
          { name: 'ASUS', slug: 'asus' },
          { name: 'Lenovo ThinkPad', slug: 'lenovo' },
          { name: 'Dell XPS', slug: 'dell' },
          { name: 'HP Envy', slug: 'hp' },
          { name: 'Apple MacBook', slug: 'apple' },
          { name: 'Microsoft Surface', slug: 'microsoft' },
          { name: 'Acer Swift', slug: 'acer' },
          { name: 'MSI Prestige', slug: 'msi' },
          { name: 'Huawei MateBook', slug: 'huawei' },
        ],
      },
      {
        name: 'MacBook',
        slug: 'macbook',
        children: [
          { name: 'MacBook Air M2', slug: 'macbook-air' },
          { name: 'MacBook Air M3', slug: 'macbook-air' },
          { name: 'MacBook Pro 14"', slug: 'macbook-pro' },
          { name: 'MacBook Pro 16"', slug: 'macbook-pro' },
        ],
      },
      {
        name: 'Budget Laptop',
        slug: 'budget-laptop',
        children: [
          { name: 'Lenovo', slug: 'lenovo' },
          { name: 'HP', slug: 'hp' },
          { name: 'ASUS', slug: 'asus' },
          { name: 'Dell', slug: 'dell' },
          { name: 'Acer', slug: 'acer' },
          { name: 'Chuwi', slug: 'chuwi' },
          { name: 'Avita', slug: 'avita' },
          { name: 'Walton', slug: 'walton' },
        ],
      },
    ],
  },

  // 3. Components (Matches Screenshot 2 Exactly with ONLY Brands on Right Side)
  {
    name: 'Components',
    slug: 'components',
    items: [
      {
        name: 'Smart Screen',
        slug: 'smart-screen',
        children: [
          { name: 'ASUS', slug: 'asus' },
          { name: 'Samsung', slug: 'samsung' },
          { name: 'LG', slug: 'lg' },
          { name: 'Dell', slug: 'dell' },
          { name: 'ViewSonic', slug: 'viewsonic' },
          { name: 'Xiaomi', slug: 'xiaomi' },
        ],
      },
      {
        name: 'Processor',
        slug: 'processor',
        children: [
          { name: 'Intel', slug: 'intel' },
          { name: 'AMD', slug: 'amd' },
        ],
      },
      {
        name: 'CPU Cooler',
        slug: 'cpu-cooler',
        children: [
          { name: 'DeepCool', slug: 'deepcool' },
          { name: 'Cooler Master', slug: 'cooler-master' },
          { name: 'Corsair', slug: 'corsair' },
          { name: 'NZXT', slug: 'nzxt' },
          { name: 'Thermalright', slug: 'thermalright' },
          { name: 'Lian Li', slug: 'lian-li' },
          { name: 'Noctua', slug: 'noctua' },
          { name: 'Antec', slug: 'antec' },
          { name: 'Gamdias', slug: 'gamdias' },
          { name: 'Montech', slug: 'montech' },
          { name: 'Thermaltake', slug: 'thermaltake' },
          { name: 'Valkyrie', slug: 'valkyrie' },
        ],
      },
      {
        name: 'Motherboard',
        slug: 'motherboard',
        children: [
          { name: 'ASUS', slug: 'asus' },
          { name: 'Gigabyte', slug: 'gigabyte' },
          { name: 'MSI', slug: 'msi' },
          { name: 'ASRock', slug: 'asrock' },
          { name: 'Biostar', slug: 'biostar' },
          { name: 'Colorful', slug: 'colorful' },
          { name: 'NZXT', slug: 'nzxt' },
          { name: 'Maxsun', slug: 'maxsun' },
        ],
      },
      {
        name: 'Graphics Card',
        slug: 'graphics-card',
        children: [
          { name: 'ASUS', slug: 'asus' },
          { name: 'Gigabyte', slug: 'gigabyte' },
          { name: 'MSI', slug: 'msi' },
          { name: 'ZOTAC', slug: 'zotac' },
          { name: 'Colorful', slug: 'colorful' },
          { name: 'Sapphire', slug: 'sapphire' },
          { name: 'PowerColor', slug: 'powercolor' },
          { name: 'Galax', slug: 'galax' },
          { name: 'INNO3D', slug: 'inno3d' },
          { name: 'Intel', slug: 'intel' },
          { name: 'PNY', slug: 'pny' },
          { name: 'Sparkle', slug: 'sparkle' },
          { name: 'Peladn', slug: 'peladn' },
        ],
      },
      {
        name: 'RAM (Desktop)',
        slug: 'ram',
        children: [
          { name: 'Hiksemi', slug: 'hiksemi' },
          { name: 'Apacer', slug: 'apacer' },
          { name: 'KingSpec', slug: 'kingspec' },
          { name: 'AITC', slug: 'aitc' },
          { name: 'KLEVV', slug: 'klevv' },
          { name: 'Lexar', slug: 'lexar' },
          { name: 'Neo Forza', slug: 'neo-forza' },
          { name: 'OCPC', slug: 'ocpc' },
          { name: 'Kingston', slug: 'kingston' },
          { name: 'Colorful', slug: 'colorful' },
          { name: 'Corsair', slug: 'corsair' },
          { name: 'Samsung', slug: 'samsung' },
          { name: 'Gigabyte', slug: 'gigabyte' },
          { name: 'Addlink', slug: 'addlink' },
          { name: 'Team', slug: 'team' },
          { name: 'Redragon', slug: 'redragon' },
          { name: 'GSkill', slug: 'gskill' },
          { name: 'OLOY', slug: 'oloy' },
          { name: 'PNY', slug: 'pny' },
          { name: 'ANACOMDA', slug: 'anacomda' },
          { name: 'TwinMOS', slug: 'twinmos' },
          { name: 'Patriot', slug: 'patriot' },
          { name: 'Transcend', slug: 'transcend' },
          { name: 'ADATA', slug: 'adata' },
        ],
      },
      {
        name: 'RAM (Laptop)',
        slug: 'laptop-ram',
        children: [
          { name: 'Corsair', slug: 'corsair' },
          { name: 'Kingston', slug: 'kingston' },
          { name: 'Crucial', slug: 'crucial' },
          { name: 'Samsung', slug: 'samsung' },
          { name: 'Team', slug: 'team' },
          { name: 'Transcend', slug: 'transcend' },
          { name: 'Apacer', slug: 'apacer' },
          { name: 'TwinMOS', slug: 'twinmos' },
          { name: 'Hiksemi', slug: 'hiksemi' },
          { name: 'Lexar', slug: 'lexar' },
          { name: 'AITC', slug: 'aitc' },
          { name: 'KingSpec', slug: 'kingspec' },
          { name: 'ADATA', slug: 'adata' },
          { name: 'Silicon Power', slug: 'silicon-power' },
        ],
      },
      {
        name: 'Power Supply',
        slug: 'power-supply',
        children: [
          { name: 'Corsair', slug: 'corsair' },
          { name: 'DeepCool', slug: 'deepcool' },
          { name: 'Cooler Master', slug: 'cooler-master' },
          { name: 'Antec', slug: 'antec' },
          { name: 'Thermaltake', slug: 'thermaltake' },
          { name: 'Seasonic', slug: 'seasonic' },
          { name: 'ASUS', slug: 'asus' },
          { name: 'MSI', slug: 'msi' },
          { name: '1stPlayer', slug: '1stplayer' },
          { name: 'Gigabyte', slug: 'gigabyte' },
          { name: 'Gamdias', slug: 'gamdias' },
          { name: 'Montech', slug: 'montech' },
          { name: 'Gamemax', slug: 'gamemax' },
          { name: 'SilverStone', slug: 'silverstone' },
          { name: 'FSP', slug: 'fsp' },
        ],
      },
      {
        name: 'Hard Disk Drive',
        slug: 'hard-disk-drive',
        children: [
          { name: 'Seagate', slug: 'seagate' },
          { name: 'Western Digital (WD)', slug: 'western-digital' },
          { name: 'Toshiba', slug: 'toshiba' },
        ],
      },
      {
        name: 'Portable HDD',
        slug: 'portable-hdd',
        children: [
          { name: 'Transcend', slug: 'transcend' },
          { name: 'Western Digital (WD)', slug: 'western-digital' },
          { name: 'Seagate', slug: 'seagate' },
          { name: 'Toshiba', slug: 'toshiba' },
          { name: 'ADATA', slug: 'adata' },
          { name: 'Silicon Power', slug: 'silicon-power' },
        ],
      },
      {
        name: 'SSD',
        slug: 'storage',
        children: [
          { name: 'Samsung', slug: 'samsung' },
          { name: 'Western Digital (WD)', slug: 'western-digital' },
          { name: 'Kingston', slug: 'kingston' },
          { name: 'Corsair', slug: 'corsair' },
          { name: 'Crucial', slug: 'crucial' },
          { name: 'Transcend', slug: 'transcend' },
          { name: 'Team', slug: 'team' },
          { name: 'Hiksemi', slug: 'hiksemi' },
          { name: 'Lexar', slug: 'lexar' },
          { name: 'TwinMOS', slug: 'twinmos' },
          { name: 'HP', slug: 'hp' },
          { name: 'Colorful', slug: 'colorful' },
          { name: 'Netac', slug: 'netac' },
          { name: 'Patriot', slug: 'patriot' },
          { name: 'Silicon Power', slug: 'silicon-power' },
          { name: 'Gigabyte', slug: 'gigabyte' },
          { name: 'MSI', slug: 'msi' },
          { name: 'ADATA', slug: 'adata' },
          { name: 'PNY', slug: 'pny' },
        ],
      },
      {
        name: 'Casing',
        slug: 'pc-case',
        children: [
          { name: 'Antec', slug: 'antec' },
          { name: 'Lian Li', slug: 'lian-li' },
          { name: 'NZXT', slug: 'nzxt' },
          { name: 'Corsair', slug: 'corsair' },
          { name: 'DeepCool', slug: 'deepcool' },
          { name: 'Montech', slug: 'montech' },
          { name: 'Cooler Master', slug: 'cooler-master' },
          { name: 'Gamdias', slug: 'gamdias' },
          { name: 'Thermaltake', slug: 'thermaltake' },
          { name: 'MaxGreen', slug: 'maxgreen' },
          { name: 'Value-Top', slug: 'value-top' },
          { name: 'DarkFlash', slug: 'darkflash' },
          { name: '1stPlayer', slug: '1stplayer' },
          { name: 'OCPC', slug: 'ocpc' },
          { name: 'Revenger', slug: 'revenger' },
        ],
      },
      {
        name: 'Casing Fan',
        slug: 'casing-fan',
        children: [
          { name: 'Lian Li', slug: 'lian-li' },
          { name: 'Corsair', slug: 'corsair' },
          { name: 'DeepCool', slug: 'deepcool' },
          { name: 'Cooler Master', slug: 'cooler-master' },
          { name: 'NZXT', slug: 'nzxt' },
          { name: 'Antec', slug: 'antec' },
          { name: 'Thermalright', slug: 'thermalright' },
          { name: 'Montech', slug: 'montech' },
          { name: 'Gamdias', slug: 'gamdias' },
          { name: 'DarkFlash', slug: 'darkflash' },
          { name: 'Noctua', slug: 'noctua' },
          { name: 'Thermaltake', slug: 'thermaltake' },
        ],
      },
      {
        name: 'Portable SSD',
        slug: 'portable-ssd',
        children: [
          { name: 'Samsung', slug: 'samsung' },
          { name: 'Western Digital (WD)', slug: 'western-digital' },
          { name: 'SanDisk', slug: 'sandisk' },
          { name: 'Transcend', slug: 'transcend' },
          { name: 'Kingston', slug: 'kingston' },
          { name: 'Lexar', slug: 'lexar' },
          { name: 'Hiksemi', slug: 'hiksemi' },
          { name: 'Crucial', slug: 'crucial' },
          { name: 'HP', slug: 'hp' },
        ],
      },
      {
        name: 'Combo Offer',
        slug: 'combo-offer',
        children: [
          { name: 'Intel', slug: 'intel' },
          { name: 'AMD', slug: 'amd' },
          { name: 'ASUS', slug: 'asus' },
          { name: 'Gigabyte', slug: 'gigabyte' },
          { name: 'MSI', slug: 'msi' },
        ],
      },
    ],
  },

  // 4. Accessories
  {
    name: 'Accessories',
    slug: 'accessories',
    isMultiColumn: true,
    columns: [
      // Column 1
      [
        {
          name: 'Power Station',
          slug: 'power-station',
          children: [
            { name: 'EcoFlow', slug: 'ecoflow' },
            { name: 'Anker', slug: 'anker' },
            { name: 'Bluetti', slug: 'bluetti' },
            { name: 'Jackery', slug: 'jackery' },
          ],
        },
        {
          name: 'Mobile Accessories',
          slug: 'mobile-accessories',
          children: [
            { name: 'Anker', slug: 'anker' },
            { name: 'Baseus', slug: 'baseus' },
            { name: 'Joyroom', slug: 'joyroom' },
            { name: 'Ugreen', slug: 'ugreen' },
            { name: 'Xiaomi', slug: 'xiaomi' },
            { name: 'Remax', slug: 'remax' },
            { name: 'Hoco', slug: 'hoco' },
          ],
        },
        {
          name: 'Bluetooth Headphone',
          slug: 'bluetooth-headphone',
          children: [
            { name: 'Sony', slug: 'sony' },
            { name: 'JBL', slug: 'jbl' },
            { name: 'Bose', slug: 'bose' },
            { name: 'Anker Soundcore', slug: 'anker' },
            { name: 'Edifier', slug: 'edifier' },
            { name: 'Havit', slug: 'havit' },
          ],
        },
        {
          name: 'Bluetooth Speaker',
          slug: 'bluetooth-speaker',
          children: [
            { name: 'JBL', slug: 'jbl' },
            { name: 'Sony', slug: 'sony' },
            { name: 'Edifier', slug: 'edifier' },
            { name: 'Anker Soundcore', slug: 'anker' },
            { name: 'Microlab', slug: 'microlab' },
            { name: 'Fantech', slug: 'fantech' },
            { name: 'Havit', slug: 'havit' },
            { name: 'Bose', slug: 'bose' },
          ],
        },
        {
          name: 'Combo',
          slug: 'combo',
          children: [
            { name: 'Logitech', slug: 'logitech' },
            { name: 'A4Tech', slug: 'a4tech' },
            { name: 'Rapoo', slug: 'rapoo' },
            { name: 'Fantech', slug: 'fantech' },
            { name: 'Redragon', slug: 'redragon' },
            { name: 'Havit', slug: 'havit' },
          ],
        },
        {
          name: 'Converter & Cable',
          slug: 'converter-cable',
          children: [
            { name: 'Ugreen', slug: 'ugreen' },
            { name: 'Baseus', slug: 'baseus' },
            { name: 'Vention', slug: 'vention' },
            { name: 'Anker', slug: 'anker' },
          ],
        },
        {
          name: 'Graphics Card Holder',
          slug: 'graphics-card-holder',
          children: [
            { name: 'DeepCool', slug: 'deepcool' },
            { name: 'Cooler Master', slug: 'cooler-master' },
            { name: 'Lian Li', slug: 'lian-li' },
            { name: 'Antec', slug: 'antec' },
            { name: 'Jonsbo', slug: 'jonsbo' },
          ],
        },
        {
          name: 'Headphone',
          slug: 'headphone',
          children: [
            { name: 'Razer', slug: 'razer' },
            { name: 'HyperX', slug: 'hyperx' },
            { name: 'Logitech', slug: 'logitech' },
            { name: 'Corsair', slug: 'corsair' },
            { name: 'JBL', slug: 'jbl' },
            { name: 'Sony', slug: 'sony' },
            { name: 'Fantech', slug: 'fantech' },
            { name: 'Redragon', slug: 'redragon' },
            { name: 'Havit', slug: 'havit' },
            { name: 'Edifier', slug: 'edifier' },
            { name: 'SteelSeries', slug: 'steelseries' },
          ],
        },
      ],

      // Column 2
      [
        {
          name: 'Monitor Stand',
          slug: 'monitor-stand',
          children: [
            { name: 'North Bayou (NB)', slug: 'north-bayou' },
            { name: 'Brateck', slug: 'brateck' },
            { name: 'Kaloc', slug: 'kaloc' },
          ],
        },
        {
          name: 'Mouse',
          slug: 'mouse',
          children: [
            { name: 'Logitech', slug: 'logitech' },
            { name: 'Razer', slug: 'razer' },
            { name: 'Corsair', slug: 'corsair' },
            { name: 'Fantech', slug: 'fantech' },
            { name: 'Redragon', slug: 'redragon' },
            { name: 'Keychron', slug: 'keychron' },
            { name: 'A4Tech', slug: 'a4tech' },
            { name: 'SteelSeries', slug: 'steelseries' },
            { name: 'Rapoo', slug: 'rapoo' },
            { name: 'Havit', slug: 'havit' },
            { name: 'Glorious', slug: 'glorious' },
            { name: 'Dareu', slug: 'dareu' },
          ],
        },
        {
          name: 'Mouse Pad',
          slug: 'mouse-pad',
          children: [
            { name: 'Razer', slug: 'razer' },
            { name: 'SteelSeries', slug: 'steelseries' },
            { name: 'Fantech', slug: 'fantech' },
            { name: 'Redragon', slug: 'redragon' },
            { name: 'Havit', slug: 'havit' },
            { name: 'Corsair', slug: 'corsair' },
            { name: 'Logitech', slug: 'logitech' },
          ],
        },
        {
          name: 'Pen Drive',
          slug: 'pen-drive',
          children: [
            { name: 'SanDisk', slug: 'sandisk' },
            { name: 'Transcend', slug: 'transcend' },
            { name: 'Kingston', slug: 'kingston' },
            { name: 'HP', slug: 'hp' },
            { name: 'Lexar', slug: 'lexar' },
            { name: 'Apacer', slug: 'apacer' },
            { name: 'Team', slug: 'team' },
            { name: 'Netac', slug: 'netac' },
          ],
        },
        {
          name: 'Speaker & Home Theater',
          slug: 'speaker-home-theater',
          children: [
            { name: 'Edifier', slug: 'edifier' },
            { name: 'Microlab', slug: 'microlab' },
            { name: 'Creative', slug: 'creative' },
            { name: 'Logitech', slug: 'logitech' },
            { name: 'JBL', slug: 'jbl' },
            { name: 'Sony', slug: 'sony' },
            { name: 'Fantech', slug: 'fantech' },
            { name: 'Havit', slug: 'havit' },
          ],
        },
        {
          name: 'Thermal Paste',
          slug: 'thermal-paste',
          children: [
            { name: 'Thermalright', slug: 'thermalright' },
            { name: 'Arctic', slug: 'arctic' },
            { name: 'Thermal Grizzly', slug: 'thermal-grizzly' },
            { name: 'Cooler Master', slug: 'cooler-master' },
            { name: 'Noctua', slug: 'noctua' },
            { name: 'DeepCool', slug: 'deepcool' },
            { name: 'Corsair', slug: 'corsair' },
          ],
        },
        {
          name: 'Webcam',
          slug: 'webcam',
          children: [
            { name: 'Logitech', slug: 'logitech' },
            { name: 'Razer', slug: 'razer' },
            { name: 'Rapoo', slug: 'rapoo' },
            { name: 'A4Tech', slug: 'a4tech' },
            { name: 'Hikvision', slug: 'hikvision' },
            { name: 'Havit', slug: 'havit' },
            { name: 'Redragon', slug: 'redragon' },
          ],
        },
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
          { name: 'ASUS', slug: 'asus' },
          { name: 'Samsung', slug: 'samsung' },
          { name: 'LG', slug: 'lg' },
          { name: 'MSI', slug: 'msi' },
          { name: 'Gigabyte', slug: 'gigabyte' },
          { name: 'Acer', slug: 'acer' },
          { name: 'ViewSonic', slug: 'viewsonic' },
          { name: 'BenQ', slug: 'benq' },
          { name: 'AOC', slug: 'aoc' },
          { name: 'KTC', slug: 'ktc' },
          { name: 'Dahua', slug: 'dahua' },
        ],
      },
      {
        name: '4K & Professional Monitor',
        slug: 'pro-monitor',
        children: [
          { name: 'Dell', slug: 'dell' },
          { name: 'ASUS ProArt', slug: 'asus' },
          { name: 'LG UltraFine', slug: 'lg' },
          { name: 'BenQ', slug: 'benq' },
          { name: 'ViewSonic', slug: 'viewsonic' },
          { name: 'Samsung', slug: 'samsung' },
          { name: 'Apple Studio', slug: 'apple' },
          { name: 'MSI', slug: 'msi' },
        ],
      },
      {
        name: 'Office & Everyday Monitor',
        slug: 'office-monitor',
        children: [
          { name: 'HP', slug: 'hp' },
          { name: 'Dell', slug: 'dell' },
          { name: 'Samsung', slug: 'samsung' },
          { name: 'LG', slug: 'lg' },
          { name: 'Acer', slug: 'acer' },
          { name: 'ViewSonic', slug: 'viewsonic' },
          { name: 'Xiaomi', slug: 'xiaomi' },
          { name: 'Dahua', slug: 'dahua' },
          { name: 'Philips', slug: 'philips' },
          { name: 'Walton', slug: 'walton' },
        ],
      },
      {
        name: 'Portable Monitor',
        slug: 'portable-monitor',
        children: [
          { name: 'ASUS ZenScreen', slug: 'asus' },
          { name: 'ViewSonic', slug: 'viewsonic' },
          { name: 'MSI', slug: 'msi' },
          { name: 'ARZOPA', slug: 'arzopa' },
          { name: 'Uperfect', slug: 'uperfect' },
          { name: 'KTC', slug: 'ktc' },
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
          { name: 'TP-Link', slug: 'tp-link' },
          { name: 'D-Link', slug: 'd-link' },
          { name: 'Netgear', slug: 'netgear' },
          { name: 'ASUS', slug: 'asus' },
          { name: 'Tenda', slug: 'tenda' },
          { name: 'Mercusys', slug: 'mercusys' },
          { name: 'MikroTik', slug: 'mikrotik' },
          { name: 'Ruijie Reyee', slug: 'ruijie' },
          { name: 'Cisco', slug: 'cisco' },
          { name: 'Totolink', slug: 'totolink' },
          { name: 'Huawei', slug: 'huawei' },
          { name: 'Xiaomi', slug: 'xiaomi' },
        ],
      },
      {
        name: 'Switch',
        slug: 'network-switch',
        children: [
          { name: 'TP-Link', slug: 'tp-link' },
          { name: 'Cisco', slug: 'cisco' },
          { name: 'D-Link', slug: 'd-link' },
          { name: 'MikroTik', slug: 'mikrotik' },
          { name: 'Ruijie', slug: 'ruijie' },
          { name: 'Tenda', slug: 'tenda' },
          { name: 'Netgear', slug: 'netgear' },
        ],
      },
      {
        name: 'Access Point',
        slug: 'access-point',
        children: [
          { name: 'Ubiquiti UniFi', slug: 'ubiquiti' },
          { name: 'TP-Link Omada', slug: 'tp-link' },
          { name: 'Ruijie Reyee', slug: 'ruijie' },
          { name: 'MikroTik', slug: 'mikrotik' },
          { name: 'Cisco', slug: 'cisco' },
          { name: 'Grandstream', slug: 'grandstream' },
        ],
      },
      {
        name: 'Network Adapter',
        slug: 'network-adapter',
        children: [
          { name: 'TP-Link', slug: 'tp-link' },
          { name: 'D-Link', slug: 'd-link' },
          { name: 'Tenda', slug: 'tenda' },
          { name: 'Mercusys', slug: 'mercusys' },
          { name: 'Totolink', slug: 'totolink' },
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
          { name: 'HP', slug: 'hp' },
          { name: 'Canon', slug: 'canon' },
          { name: 'Epson', slug: 'epson' },
          { name: 'Brother', slug: 'brother' },
          { name: 'Pantum', slug: 'pantum' },
        ],
      },
      {
        name: 'Photocopier',
        slug: 'photocopier',
        children: [
          { name: 'Toshiba', slug: 'toshiba' },
          { name: 'Canon', slug: 'canon' },
          { name: 'Sharp', slug: 'sharp' },
          { name: 'Ricoh', slug: 'ricoh' },
        ],
      },
      {
        name: 'Scanner',
        slug: 'scanner',
        children: [
          { name: 'Canon', slug: 'canon' },
          { name: 'HP', slug: 'hp' },
          { name: 'Epson', slug: 'epson' },
          { name: 'Plustek', slug: 'plustek' },
        ],
      },
      {
        name: 'Projector',
        slug: 'projector',
        children: [
          { name: 'Epson', slug: 'epson' },
          { name: 'BenQ', slug: 'benq' },
          { name: 'ViewSonic', slug: 'viewsonic' },
          { name: 'Optoma', slug: 'optoma' },
          { name: 'Sony', slug: 'sony' },
          { name: 'Wanbo', slug: 'wanbo' },
          { name: 'XGIMI', slug: 'xgimi' },
        ],
      },
      {
        name: 'Barcode Scanner',
        slug: 'barcode-scanner',
        children: [
          { name: 'Zebra', slug: 'zebra' },
          { name: 'Honeywell', slug: 'honeywell' },
          { name: 'Netum', slug: 'netum' },
          { name: 'Sunmi', slug: 'sunmi' },
        ],
      },
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
          { name: 'Apollo', slug: 'apollo' },
          { name: 'MaxGreen', slug: 'maxgreen' },
          { name: 'Power Guard', slug: 'power-guard' },
          { name: 'Prolink', slug: 'prolink' },
          { name: 'Santak', slug: 'santak' },
          { name: 'Kstar', slug: 'kstar' },
          { name: 'Enerpac', slug: 'enerpac' },
        ],
      },
      {
        name: 'Online UPS',
        slug: 'online-ups',
        children: [
          { name: 'APC by Schneider', slug: 'apc' },
          { name: 'MaxGreen', slug: 'maxgreen' },
          { name: 'Santak', slug: 'santak' },
          { name: 'Prolink', slug: 'prolink' },
          { name: 'Kstar', slug: 'kstar' },
          { name: 'Apollo', slug: 'apollo' },
        ],
      },
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
          { name: 'Hikvision', slug: 'hikvision' },
          { name: 'Dahua', slug: 'dahua' },
          { name: 'Ezviz', slug: 'ezviz' },
          { name: 'Imou', slug: 'imou' },
          { name: 'Uniview', slug: 'uniview' },
          { name: 'TP-Link Tapo', slug: 'tp-link' },
          { name: 'CP PLUS', slug: 'cp-plus' },
          { name: 'Jovision', slug: 'jovision' },
        ],
      },
      {
        name: 'NVR & DVR',
        slug: 'nvr-dvr',
        children: [
          { name: 'Hikvision', slug: 'hikvision' },
          { name: 'Dahua', slug: 'dahua' },
          { name: 'Uniview', slug: 'uniview' },
          { name: 'Ezviz', slug: 'ezviz' },
          { name: 'Jovision', slug: 'jovision' },
        ],
      },
      {
        name: 'Access Control & Attendance Machine',
        slug: 'access-control',
        children: [
          { name: 'ZKTeco', slug: 'zkteco' },
          { name: 'Hikvision', slug: 'hikvision' },
          { name: 'Dahua', slug: 'dahua' },
          { name: 'Realand', slug: 'realand' },
        ],
      },
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
          { name: 'Sony', slug: 'sony' },
          { name: 'Canon', slug: 'canon' },
          { name: 'Nikon', slug: 'nikon' },
          { name: 'Fujifilm', slug: 'fujifilm' },
          { name: 'Panasonic', slug: 'panasonic' },
        ],
      },
      {
        name: 'DSLR Camera',
        slug: 'dslr-camera',
        children: [
          { name: 'Canon', slug: 'canon' },
          { name: 'Nikon', slug: 'nikon' },
        ],
      },
      {
        name: 'Action Camera',
        slug: 'action-camera',
        children: [
          { name: 'GoPro', slug: 'gopro' },
          { name: 'DJI', slug: 'dji' },
          { name: 'Insta360', slug: 'insta360' },
          { name: 'SJCAM', slug: 'sjcam' },
        ],
      },
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
          { name: 'Apple', slug: 'apple' },
          { name: 'Samsung', slug: 'samsung' },
          { name: 'Xiaomi', slug: 'xiaomi' },
          { name: 'Amazfit', slug: 'amazfit' },
          { name: 'Huawei', slug: 'huawei' },
          { name: 'Kieslect', slug: 'kieslect' },
          { name: 'Haylou', slug: 'haylou' },
          { name: 'Fastrack', slug: 'fastrack' },
          { name: 'Joyroom', slug: 'joyroom' },
          { name: 'Colmi', slug: 'colmi' },
        ],
      },
      {
        name: 'Earbuds / TWS',
        slug: 'earbuds-tws',
        children: [
          { name: 'Apple AirPods', slug: 'apple' },
          { name: 'Samsung Galaxy Buds', slug: 'samsung' },
          { name: 'Sony', slug: 'sony' },
          { name: 'JBL', slug: 'jbl' },
          { name: 'Anker Soundcore', slug: 'anker' },
          { name: 'Xiaomi', slug: 'xiaomi' },
          { name: 'Realme', slug: 'realme' },
          { name: 'QCY', slug: 'qcy' },
          { name: 'SoundPEATS', slug: 'soundpeats' },
          { name: 'Haylou', slug: 'haylou' },
          { name: 'Baseus', slug: 'baseus' },
        ],
      },
      {
        name: 'Power Bank',
        slug: 'power-bank',
        children: [
          { name: 'Anker', slug: 'anker' },
          { name: 'Baseus', slug: 'baseus' },
          { name: 'Joyroom', slug: 'joyroom' },
          { name: 'Xiaomi', slug: 'xiaomi' },
          { name: 'Remax', slug: 'remax' },
          { name: 'Hoco', slug: 'hoco' },
          { name: 'Ugreen', slug: 'ugreen' },
        ],
      },
      {
        name: 'Smartphone Gimbal & Stabilizer',
        slug: 'smartphone-gimbal',
        children: [
          { name: 'DJI OM Series', slug: 'dji' },
          { name: 'Zhiyun Smooth', slug: 'zhiyun' },
          { name: 'Hohem iSteady', slug: 'hohem' },
          { name: 'FeiyuTech', slug: 'feiyutech' },
        ],
      },
    ],
  },

  // 12. AI Workstation
  {
    name: 'AI Workstation',
    slug: 'ai-workstation',
    items: [
      {
        name: 'Deep Learning Server',
        slug: 'deep-learning-pc',
        children: [
          { name: 'NVIDIA DGX', slug: 'nvidia' },
          { name: 'Supermicro', slug: 'supermicro' },
          { name: 'ASUS ESC Server', slug: 'asus' },
          { name: 'Dell PowerEdge', slug: 'dell' },
          { name: 'HP ProLiant', slug: 'hp' },
          { name: 'Gigabyte Server', slug: 'gigabyte' },
        ],
      },
      {
        name: 'Multi-GPU Rig',
        slug: 'multi-gpu-rig',
        children: [
          { name: 'NVIDIA RTX 6000 Ada', slug: 'nvidia' },
          { name: 'NVIDIA RTX 4090 / 5090', slug: 'nvidia' },
          { name: 'AMD Radeon Pro', slug: 'amd' },
          { name: 'Intel Gaudi', slug: 'intel' },
        ],
      },
    ],
  },
];
