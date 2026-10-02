// Using global fetch in Node 18+

// Copy EXACT isProductMatchForSlot from src/app/pc-builder/page.tsx
const isProductMatchForSlot = (p, slotKey) => {
  const comp = (p.pc_builder_component || '').toLowerCase().trim();
  const catSlug = (p.category_slug || '').toLowerCase().trim();
  const catName = (p.category_name || '').toLowerCase().trim();
  const name = (p.name || '').toLowerCase().trim();

  // 0. Primary Gate: If PC builder customizer is explicitly disabled or not a component, exclude
  if (p.is_pc_builder === 0 || p.is_pc_builder === false || p.is_pc_builder === '0' || (!p.is_pc_builder && !p.pc_builder_component)) {
    return false;
  }

  // 1. GLOBAL EXCLUSION: Complete pre-built systems, laptops, or non-DIY categories must NEVER leak
  const isLaptop =
    catSlug.includes('laptop') ||
    catName.toLowerCase().includes('laptop') ||
    name.includes('laptop') ||
    name.includes('notebook') ||
    name.includes('macbook');

  if (isLaptop) return false;

  // Complete pre-built desktops or non-DIY systems
  const isCompletePrebuiltPC =
    catSlug.includes('desktop-pc') ||
    catSlug.includes('brand-pc') ||
    catSlug.includes('all-in-one') ||
    catName.toLowerCase().includes('desktop pc') ||
    catName.toLowerCase().includes('brand pc') ||
    catName.toLowerCase().includes('all-in-one') ||
    catSlug.includes('mac-') ||
    catSlug.includes('apple-') ||
    catSlug.includes('imac') ||
    catSlug.includes('server') ||
    catName.toLowerCase().includes('server') ||
    catSlug.includes('software') ||
    name.includes('desktop pc') ||
    name.includes('brand desktop') ||
    name.includes('commercial desktop') ||
    name.includes('prodesk') ||
    name.includes('elitedesk') ||
    name.includes('thinkcentre') ||
    name.includes('optiplex') ||
    name.includes('vostro') ||
    name.includes('omen 45l') ||
    name.includes('expertcenter') ||
    name.includes('alienware aurora') ||
    name.includes('ideacentre') ||
    name.includes('legion tower') ||
    name.includes('mini tower') ||
    name.includes('sff pc') ||
    name.includes('gaming desktop') ||
    name.includes('all-in-one') ||
    name.includes('mac mini') ||
    name.includes('mac studio') ||
    name.includes('imac');

  if (isCompletePrebuiltPC) {
    return false;
  }

  // Normalize secondary slots
  const targetSlot = slotKey === 'ram2' ? 'ram' : slotKey === 'storage2' ? 'storage' : slotKey;

  // Strict slot-to-category whitelist
  switch (targetSlot) {
    case 'cpu': {
      if (catSlug.includes('cooler') || catName.toLowerCase().includes('cooler') || name.includes('cooler') || name.includes('motherboard') || catSlug.includes('motherboard')) return false;
      return (
        comp === 'cpu' ||
        catSlug.includes('processor') ||
        catSlug.includes('cpu') ||
        catName.toLowerCase().includes('processor') ||
        catName.toLowerCase().includes('cpu')
      );
    }

    case 'motherboard': {
      if (catSlug.includes('processor') || catName.includes('processor') || catSlug.includes('cooler') || catSlug.includes('ram')) return false;
      return (
        comp === 'motherboard' ||
        catSlug.includes('motherboard') ||
        catSlug.includes('mobo') ||
        catName.includes('motherboard')
      );
    }

    case 'cooler': {
      return (
        comp === 'cooler' ||
        catSlug.includes('cooler') ||
        catSlug.includes('cooling') ||
        catSlug.includes('aio') ||
        catName.includes('cooler')
      );
    }

    case 'ram': {
      if (catSlug.includes('motherboard') || catName.includes('motherboard') || catSlug.includes('case') || catSlug.includes('gpu') || catSlug.includes('graphics') || catSlug.includes('laptop') || catSlug.includes('server')) return false;
      return (
        comp === 'ram' ||
        catSlug.includes('ram') ||
        catSlug.includes('memory') ||
        catName.includes('ram') ||
        catName.includes('memory') ||
        name.includes('ddr5') ||
        name.includes('ddr4') ||
        name.includes('desktop ram')
      );
    }

    case 'storage': {
      if (catSlug.includes('ram') || catName.includes('ram') || catSlug.includes('motherboard') || catSlug.includes('gpu')) return false;
      return (
        comp === 'storage' ||
        catSlug.includes('storage') ||
        catSlug.includes('ssd') ||
        catSlug.includes('hdd') ||
        catSlug.includes('nvme') ||
        catSlug.includes('m2') ||
        catName.includes('storage') ||
        catName.includes('ssd') ||
        catName.includes('hard drive')
      );
    }

    case 'gpu': {
      return (
        comp === 'gpu' ||
        catSlug.includes('graphics') ||
        catSlug.includes('gpu') ||
        catSlug.includes('video-card') ||
        catName.includes('graphics card') ||
        catName.includes('geforce') ||
        catName.includes('radeon')
      );
    }

    case 'psu': {
      if (catSlug.includes('ups') || catName.includes('ups') || name.includes('ups')) return false;
      return (
        comp === 'psu' ||
        catSlug.includes('power-supply') ||
        catSlug.includes('psu') ||
        catName.includes('power supply')
      );
    }

    case 'case': {
      return (
        comp === 'case' ||
        catSlug.includes('casing') ||
        catSlug.includes('pc-case') ||
        catSlug.includes('case') ||
        catSlug.includes('chassis') ||
        catName.includes('casing') ||
        catName.includes('pc case')
      );
    }

    case 'monitor': {
      return (
        comp === 'monitor' ||
        catSlug.includes('monitor') ||
        catSlug.includes('display') ||
        catName.includes('monitor')
      );
    }

    case 'keyboard': {
      return (
        comp === 'keyboard' ||
        catSlug.includes('keyboard') ||
        catName.includes('keyboard')
      );
    }

    case 'mouse': {
      if (name.includes('mousepad') || name.includes('mouse pad')) return false;
      return (
        comp === 'mouse' ||
        catSlug.includes('gaming-mouse') ||
        catSlug.includes('mouse') ||
        catSlug.includes('mice') ||
        catName.includes('mouse')
      );
    }

    case 'ups': {
      return (
        comp === 'ups' ||
        catSlug.includes('ups') ||
        catName.includes('ups')
      );
    }

    default:
      return comp === targetSlot;
  }
};

async function test() {
  const res = await fetch('http://localhost:3000/api/products?limit=350');
  const data = await res.json();
  const products = data.products || [];

  console.log(`Fetched ${products.length} products from API.`);

  ['cpu', 'motherboard', 'cooler', 'ram', 'ram2', 'storage', 'gpu', 'psu', 'case', 'monitor', 'keyboard', 'mouse', 'ups'].forEach(slot => {
    const matched = products.filter(p => isProductMatchForSlot(p, slot));
    console.log(`Slot [${slot}] => ${matched.length} matched products`);
    if (slot === 'ram') {
      matched.forEach(m => console.log('   RAM: ', m.name));
    }
  });
}

test().catch(console.error);
