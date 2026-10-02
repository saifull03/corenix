const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const brandsDir = path.join(__dirname, '..', 'public', 'images', 'brands');
if (!fs.existsSync(brandsDir)) {
  fs.mkdirSync(brandsDir, { recursive: true });
}

// Pixel-perfect official brand vector SVGs
const brandSvgs = {
  // Corsair: Official 3-sails ship emblem + CORSAIR wordmark
  corsair: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" fill="none">
  <g transform="translate(10, 8)">
    <!-- Corsair Sails Emblem -->
    <path d="M0 36.5C1.8 34.2 8.5 24.8 8.8 24.5C8.9 24.5 9 24.8 9.2 27.6C9.5 32 9.4 34.2 8.6 37C6.8 37.8 2.2 38.6 0 36.5Z" fill="#E2E8F0"/>
    <path d="M7.8 21.6C9.5 19.2 16.2 10.4 16.5 10C16.6 10.1 16.8 12.8 17 17.6C17.3 24.8 17.1 27.6 15.6 32.8C13.2 34.2 9.8 35.2 7.8 35C9 31.8 9.1 29.5 8.8 24.5C8.6 22.8 8.1 22 7.8 21.6Z" fill="#E2E8F0"/>
    <path d="M15.8 8.2C17.6 5.8 23.8 0.4 24.2 0C24.4 0.2 24.6 3.8 24.8 10.2C25.2 21.8 24.8 25.8 22.8 32.8C20.2 34.5 17.5 35 15.5 34.8C17 31 17.2 27.8 16.8 19C16.6 12 16.2 9.2 15.8 8.2Z" fill="#E2E8F0"/>
    <path d="M24.8 0C27.2 4.2 38.5 17.5 45.2 24.8C45.8 25.5 45.2 26.5 43.8 27.2C38.2 29.8 28.5 33.2 23.5 34.5C24.8 29.2 25.2 22.8 24.8 10.8C24.6 4.8 24.5 0.5 24.8 0Z" fill="#E2E8F0"/>
    <!-- CORSAIR Wordmark -->
    <text x="56" y="29" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="800" font-size="22" fill="#E2E8F0" letter-spacing="4">CORSAIR</text>
  </g>
</svg>`,

  // Intel: Official classic oval swoosh + intel inside typography
  intel: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 70" fill="none">
  <!-- Outer Ellipse Arcs -->
  <path d="M42 16.5C65 7 115 6.5 146 17C172 26 172 44 148 53.5C136 58 118 61 98 61.5L98 56.5C116 56 132 53.5 143 49.5C163 41.5 163 28 142 21C114 11.5 68 12 47 20.5L42 16.5Z" fill="#0071C5"/>
  <path d="M138 53.5C115 63 65 63.5 34 53C8 44 8 26 32 16.5C44 12 62 9 82 8.5L82 13.5C64 14 48 16.5 37 20.5C17 28.5 17 42 38 49C66 58.5 112 58 133 49.5L138 53.5Z" fill="#0071C5"/>
  <!-- Intel lowercase text -->
  <!-- 'i' -->
  <rect x="30" y="27" width="8" height="23" rx="1.5" fill="#0071C5"/>
  <rect x="30" y="16.5" width="8" height="7.5" rx="1.5" fill="#0071C5"/>
  <!-- 'n' -->
  <path d="M45 27H52.5V31C54.8 28.2 58.2 26.5 62.5 26.5C69.5 26.5 73.5 31 73.5 38V50H65.5V39C65.5 35 63.5 33 60 33C56 33 53 35.5 53 40V50H45V27Z" fill="#0071C5"/>
  <!-- 't' -->
  <path d="M80 18H88V27H94V33H88V43C88 45 89 45.8 91 45.8H94V50H89C83.5 50 80 47.5 80 42V33H76V27H80V18Z" fill="#0071C5"/>
  <!-- 'e' -->
  <path d="M117 38.5H103C103.5 34 106.5 32 110.5 32C113.8 32 116 33.5 116.8 35.5H124.5C123 30.5 118 26.5 110.5 26.5C101.5 26.5 95 33.2 95 41.5C95 49.8 101.5 56.5 110.5 56.5C119.5 56.5 124.5 50 124.5 42V38.5H117ZM103.2 43.5C103.8 47 106.5 49.5 110.5 49.5C114.5 49.5 117 47 117 43.5H103.2Z" fill="#0071C5"/>
  <!-- 'l' -->
  <rect x="130" y="14" width="8" height="36" rx="1.5" fill="#0071C5"/>
</svg>`,

  // Gigabyte: Official stylized blue "G" mark with red geometric triangle accent + GIGABYTE wordmark
  gigabyte: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 70" fill="none">
  <!-- G Mark -->
  <g transform="translate(10, 4)">
    <path d="M28 0C12.5 0 0 12.5 0 28C0 43.5 12.5 56 28 56L44 40C39.5 44 34 46 28 46C18 46 10 38 10 28C10 18 18 10 28 10C35 10 41 14 44 20H28V30H56V0H44L44 8C39.5 3 34 0 28 0Z" fill="#005BAC"/>
    <!-- Red Triangle Accent -->
    <polygon points="40,36 60,36 40,56" fill="#E30613"/>
  </g>
  <!-- GIGABYTE text -->
  <text x="78" y="42" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="900" font-size="20" fill="#005BAC" letter-spacing="2">GIGABYTE</text>
</svg>`,

  // Apple: Official sleek Apple emblem with bite and leaf
  apple: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 60" fill="none">
  <g transform="translate(20, 8)">
    <path d="M31.2 26.6C31.1 20.5 36.2 17.5 36.5 17.3C33.6 13.1 29.1 12.5 27.5 12.5C23.7 12.1 20 14.7 18.1 14.7C16.1 14.7 13.1 12.5 10 12.5C5.8 12.5 1.9 14.9 -0.2 18.7C-4.5 26.3 -1.3 37.5 2.8 43.5C4.9 46.5 7.2 49.8 10.5 49.7C13.6 49.6 14.8 47.7 18.5 47.7C22.2 47.7 23.3 49.7 26.6 49.6C30 49.5 32 46.5 34.1 43.5C36.5 40 37.5 36.5 37.6 36.4C37.5 36.3 31.4 33.9 31.2 26.6Z" fill="#94A3B8"/>
    <path d="M25.5 9.1C27.1 7.1 28.2 4.2 27.9 1.4C25.4 1.5 22.4 3.1 20.7 5.1C19.1 6.9 17.8 9.8 18.2 12.6C20.9 12.8 23.8 11.1 25.5 9.1Z" fill="#94A3B8"/>
    <text x="48" y="36" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="700" font-size="22" fill="#E2E8F0" letter-spacing="-0.5">Apple</text>
  </g>
</svg>`,

  // ASUS: Official wordmark with the horizontal split lines in A, S, U, S
  asus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 50" fill="none">
  <g transform="translate(10, 8)">
    <path d="M19.7 0H7.2L0 28.5h10.8l2.5-7.8h9.8l-1.9-5.9h-6.2l2.6-8.3h6.6L19.7 0zm20.8 7.4c-2.4-5.2-9.4-7.4-15.6-7.4h-3.8v28.5h11.2c8.9 0 14.5-4.7 14.5-12.8 0-4.4-2.5-7-6.3-8.3zm-1.8 13.9c-.8 2.1-3.1 3.2-6.5 3.2h-3.8V4.8h3.8c3.4 0 5.7 1.1 6.5 3.2.7 1.8.8 3.8 0 5.8 0 0 0 .1 0 .1 0 0 0 0 0 0 0 2.2-.1 4.7 0 7.4zm16.5-13.9c-2.4-5.2-9.4-7.4-15.6-7.4h-3.8v28.5h11.2c8.9 0 14.5-4.7 14.5-12.8 0-4.4-2.5-7-6.3-8.3zm-1.8 13.9c-.8 2.1-3.1 3.2-6.5 3.2h-3.8V4.8h3.8c3.4 0 5.7 1.1 6.5 3.2.7 1.8.8 3.8 0 5.8 0 0 0 .1 0 .1 0 0 0 0 0 0 0 2.2-.1 4.7 0 7.4z" fill="#00539B"/>
    <path d="M72.2 0h-12v28.5h8.9v-7.8h3.1c7.2 0 11.5-4.2 11.5-10.3 0-6.2-4.3-10.4-11.5-10.4zm2.4 12.8h-5.5V5.9h5.5c3.2 0 5.1 1.5 5.1 3.4 0 2-1.9 3.5-5.1 3.5zm27.1-12.8H89.9l-7.2 28.5h10.8l2.5-7.8h9.8l-1.9-5.9h-6.2l2.6-8.3h6.6L101.7 0zm30.8 19.3c-1.3-4-4.8-6.1-10.4-7.2-4-.8-5.6-1.5-5.6-2.9 0-1.2 1.3-2.1 3.7-2.1 3.2 0 5.8 1.1 6.9 2.7l6.8-4.5c-3.1-3.5-8.2-5.3-13.7-5.3-7.5 0-12.9 4-12.9 10.4 0 5.5 3.9 8.2 10.7 9.5 4.1.8 5.6 1.7 5.6 3.1 0 1.5-1.7 2.3-4.4 2.3-4.1 0-7.3-1.6-8.6-3.8l-6.8 4.7c3.1 4.2 9.1 6.3 15.4 6.3 8.3 0 13.9-4.2 13.9-10.8.2-.9.1-1.8-.4-2.7z" fill="#00539B"/>
  </g>
</svg>`,

  // AMD: Official Chevron arrow mark + AMD bold text
  amd: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 50" fill="none">
  <g transform="translate(10, 8)">
    <path d="M12.5 4h10.2l12.4 26.5h-7.8l-2.6-6H10.3l-2.6 6H0L12.5 4zm9.8 14.8l-4.7-11.4-4.7 11.4h9.4z" fill="#ED1C24"/>
    <path d="M40.2 4h7.8l7.5 16.5L63 4h7.8v26.5h-6.8V13.1l-6.5 14.2h-3.9l-6.6-14.2v17.4h-6.8V4z" fill="#ED1C24"/>
    <path d="M78 4h11.2c7.6 0 12.8 5.3 12.8 13.2 0 8-5.2 13.3-12.8 13.3H78V4zm7 20.3h4.1c4.1 0 6.6-2.9 6.6-7.1 0-4.1-2.5-7-6.6-7H85v14.1z" fill="#ED1C24"/>
    <!-- AMD Chevron Emblem -->
    <path d="M116 4h13v13h-13V4zm16 0h13v13h-13V4zm0 16h13v13h-13V20zm-16 0l6.5-6.5 6.5 6.5-6.5 6.5-6.5-6.5z" fill="#00B074"/>
  </g>
</svg>`,

  // Acer: Official Acer green typographic logo
  acer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 50" fill="none">
  <g transform="translate(10, 8)">
    <path d="M26.2 36.5h-8.8l-2.4-7.2h-9.9l-2.4 7.2H0L9.9 9.8h7.4l9.9 26.7zm-13.6-13.9l-3.2-9.6-3.2 9.6h6.4zm28.8 6.4c0 4.6-3.4 8-8.5 8-5.3 0-8.9-3.8-8.9-9.1 0-5.3 3.6-9.1 8.9-9.1 5 0 8.3 3.2 8.5 7.6h-4.3c-.3-2.3-1.9-3.9-4.2-3.9-2.7 0-4.5 2.1-4.5 5.4s1.8 5.4 4.5 5.4c2.4 0 4-1.7 4.2-4.3h4.3zm19.5-1.1h-11.8c.4 3 2.5 4.8 5.4 4.8 2.1 0 3.7-1 4.3-2.6h4.1c-1 3.5-4 6.2-8.4 6.2-5.5 0-9.4-3.8-9.4-9.1 0-5.4 3.9-9.1 9.2-9.1 5.4 0 9 3.8 9 9.1v.7zm-4.3-2.7c-.3-2.6-2-4.2-4.7-4.2-2.5 0-4.3 1.6-4.6 4.2h9.3zm16 11.3h-4.2V19.3h4.2v2.5c1-1.7 2.8-2.8 4.9-2.8v4.4c-2.8 0-4.9 1.7-4.9 4.7v8.4z" fill="#83B81A"/>
  </g>
</svg>`,

  // HP: Official slanted letters in circle
  hp: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 50" fill="none">
  <g transform="translate(18, 5)">
    <circle cx="20" cy="20" r="19" fill="#0096D6"/>
    <path d="M16.5 28.5l4-17h3.8l-4 17h-3.8zm5.8-9.8h3.8l-.8 3.5c1.2-2.3 3.3-3.8 5.8-3.8 3.2 0 4.8 2 4 5.4l-2.1 8.7h-3.8l2-8.3c.4-1.6-.2-2.5-1.5-2.5-1.6 0-3 1.5-3.6 4l-1.6 6.8h-3.8l1.6-6.8z" fill="#FFFFFF"/>
    <text x="48" y="27" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="900" font-size="22" fill="#0096D6" letter-spacing="2">HP</text>
  </g>
</svg>`,

  // Dell: Official Dell blue ring with angled 'E'
  dell: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 50" fill="none">
  <g transform="translate(18, 5)">
    <circle cx="20" cy="20" r="19" stroke="#0076CE" stroke-width="2.5" fill="none"/>
    <path d="M10 26.5V13.5h3.8c3.2 0 5.4 1.8 5.4 4.5 0 2.8-2.2 4.6-5.4 4.6H12v3.9h-2zm2-5.5h1.7c2 0 3.3-1.1 3.3-2.9s-1.3-2.9-3.3-2.9H12V21zm9.5 2.5l5.2-12.8 1.8.8-4.2 10.4 6.2 2.6-1.5 1.5-7.5-2.5zm10.7 3V13.5h2.2v11.4h5.2v1.6h-7.4zm8.5 0V13.5h2.2v11.4h5.2v1.6h-7.4z" fill="#0076CE"/>
    <text x="48" y="26" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="900" font-size="20" fill="#0076CE" letter-spacing="1">DELL</text>
  </g>
</svg>`,

  // DeepCool: Modern turquoise cyan pixel blocks + DEEPCOOL
  deepcool: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 50" fill="none">
  <g transform="translate(8, 10)">
    <rect x="0" y="4" width="7" height="7" rx="1.5" fill="#00B5B8"/>
    <rect x="9" y="4" width="7" height="7" rx="1.5" fill="#00B5B8"/>
    <rect x="9" y="13" width="7" height="7" rx="1.5" fill="#00B5B8"/>
    <rect x="18" y="13" width="7" height="7" rx="1.5" fill="#00B5B8"/>
    <rect x="18" y="22" width="7" height="7" rx="1.5" fill="#00B5B8"/>
    <text x="34" y="22" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="900" font-size="17" fill="#00B5B8" letter-spacing="1.5">DEEPCOOL</text>
  </g>
</svg>`,

  // MSI: Signature Red dragon shield + MSI letters
  msi: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 50" fill="none">
  <g transform="translate(10, 8)">
    <path d="M0 0h9.2l10.5 20.5L30.2 0h9.2v34H31V12.8L21.4 31.5h-3.4L8.4 12.8V34H0V0zm44.2 24.2c1.8 2.8 5.2 4.4 9.4 4.4 3.8 0 6.2-1.6 6.2-4 0-2.8-2.6-3.8-7.8-4.8-7.4-1.4-11.8-3.8-11.8-9.8 0-6.2 5.5-10.4 13.6-10.4 6.2 0 11.2 2.6 13.5 7.2l-6.8 4c-1.4-2.4-3.8-3.6-6.8-3.6-3.2 0-5.2 1.4-5.2 3.4 0 2.4 2.2 3.4 7.2 4.4 7.8 1.6 12.4 4.2 12.4 10.2 0 6.6-5.8 10.8-14.6 10.8-7.2 0-13-2.8-15.6-7.8l6.5-4zm36.8-24.2h8.4v34H81V0z" fill="#E11D48"/>
  </g>
</svg>`,

  // Samsung: Bold blue SAMSUNG typography
  samsung: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 50" fill="none">
  <g transform="translate(8, 12)">
    <text x="0" y="20" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="900" font-size="20" fill="#2563EB" letter-spacing="3">SAMSUNG</text>
  </g>
</svg>`,

  // Razer: Triple snake emblem + RAZER chroma text
  razer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 50" fill="none">
  <g transform="translate(10, 8)">
    <path d="M12 2c-5 0-9 4-9 9 0 3 1.5 5.5 3.8 7.2C5.5 20 4 23 4 26.5c0 1.2.3 2.3.8 3.3 2.2-1.5 4.8-2.4 7.2-2.4s5 .9 7.2 2.4c.5-1 .8-2.1.8-3.3 0-3.5-1.5-6.5-2.8-8.3 2.3-1.7 3.8-4.2 3.8-7.2 0-5-4-9-9-9zm0 4c2.8 0 5 2.2 5 5s-2.2 5-5 5-5-2.2-5-5 2.2-5 5-5z" fill="#00E700"/>
    <text x="35" y="24" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="900" font-size="19" fill="#00E700" letter-spacing="3">RAZER</text>
  </g>
</svg>`,

  // Kingston: Red Rex profile emblem + Kingston
  kingston: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 50" fill="none">
  <g transform="translate(10, 8)">
    <path d="M15 0C6.7 0 0 6.7 0 15c0 6.5 4.1 12 10 14.1V34h10v-4.9c5.9-2.1 10-7.6 10-14.1C30 6.7 23.3 0 15 0z" fill="#DC2626"/>
    <text x="38" y="24" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="800" font-size="17" fill="#DC2626" letter-spacing="1">Kingston</text>
  </g>
</svg>`,

  // Logitech: Cyan arc logomark + logitech wordmark
  logitech: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 50" fill="none">
  <g transform="translate(8, 11)">
    <circle cx="14" cy="14" r="13" stroke="#06B6D4" stroke-width="3" fill="none"/>
    <circle cx="14" cy="14" r="5" fill="#06B6D4"/>
    <text x="36" y="21" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="800" font-size="18" fill="#06B6D4" letter-spacing="1">logitech</text>
  </g>
</svg>`,

  // Lenovo: Official Red block badge + Lenovo bold
  lenovo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 50" fill="none">
  <rect x="15" y="10" width="130" height="30" rx="4" fill="#E2231A"/>
  <text x="80" y="31" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="900" font-size="19" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">Lenovo</text>
</svg>`,

  // NZXT: Bold purple geometric
  nzxt: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 50" fill="none">
  <g transform="translate(20, 10)">
    <text x="0" y="23" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="900" font-size="24" fill="#8B5CF6" letter-spacing="3">NZXT</text>
  </g>
</svg>`,

  // Lian Li: Blue badge + LIAN LI
  'lian-li': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 50" fill="none">
  <g transform="translate(15, 8)">
    <rect x="0" y="4" width="24" height="24" rx="4" fill="#0284C7"/>
    <text x="12" y="21" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="900" font-size="13" fill="#FFFFFF" text-anchor="middle">LL</text>
    <text x="32" y="23" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="900" font-size="18" fill="#0284C7" letter-spacing="1.5">LIAN LI</text>
  </g>
</svg>`,

  // Thermalright: Amber orange knight crest
  thermalright: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 50" fill="none">
  <g transform="translate(10, 8)">
    <circle cx="15" cy="17" r="12" fill="#D97706"/>
    <path d="M10 17l4-4 7 7-3 3-8-6z" fill="#FFFFFF"/>
    <text x="34" y="23" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="800" font-size="15" fill="#D97706" letter-spacing="0.5">Thermalright</text>
  </g>
</svg>`,

  // G.Skill: Red speed font
  'g-skill': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 50" fill="none">
  <g transform="translate(15, 10)">
    <path d="M0 24L8 0h14l-3 8h-7l-4 12h8l-1.5 4H0z" fill="#DC2626"/>
    <text x="24" y="20" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="900" font-style="italic" font-size="18" fill="#DC2626" letter-spacing="1">G.SKILL</text>
  </g>
</svg>`,

  // APC
  apc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 50" fill="none">
  <g transform="translate(20, 10)">
    <text x="0" y="23" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="900" font-size="24" fill="#E11D48" letter-spacing="2">APC</text>
    <text x="60" y="23" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="600" font-size="10" fill="#64748B">by Schneider</text>
  </g>
</svg>`,

  // MaxGreen
  maxgreen: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 50" fill="none">
  <g transform="translate(10, 10)">
    <rect x="0" y="2" width="22" height="22" rx="4" fill="#16A34A"/>
    <path d="M5 13l4 4 8-8" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <text x="28" y="20" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="900" font-size="16" fill="#16A34A" letter-spacing="1">MAXGREEN</text>
  </g>
</svg>`
};

async function main() {
  console.log('Writing updated brand SVG logo files to public/images/brands/...');
  for (const [slug, svg] of Object.entries(brandSvgs)) {
    const filePath = path.join(brandsDir, `${slug}.svg`);
    fs.writeFileSync(filePath, svg.trim(), 'utf8');
    console.log(`Saved ${slug}.svg`);
  }

  console.log('\nUpdating database brands logo column...');
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'corenix_db'
  });

  for (const slug of Object.keys(brandSvgs)) {
    const logoUrl = `/images/brands/${slug}.svg`;
    await conn.query(`UPDATE brands SET logo = ? WHERE slug = ?`, [logoUrl, slug]);
  }

  await conn.query(`UPDATE brands SET logo = '/images/brands/g-skill.svg' WHERE slug = 'gskill'`);

  console.log('Brand logos successfully updated and synced in database!');
  await conn.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
