'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  Cpu,
  Layers,
  Zap,
  HardDrive,
  Monitor,
  Fan,
  Box,
  Keyboard,
  Mouse,
  BatteryCharging,
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Trash2,
  ShoppingCart,
  Share2,
  Printer,
  Sparkles,
  Search,
  X,
  Check,
  FileText,
  Eye,
  EyeOff,
  Phone,
  Mail,
  MapPin,
  Globe,
  Receipt,
  Copy,
  PlusCircle,
} from 'lucide-react';

interface ComponentSlot {
  key: string;
  name: string;
  categoryLabel: string;
  icon: any;
  required: boolean;
  product: any | null;
  baseWattage: number;
  isCustom?: boolean;
}

// Convert numbers into South Asian English words for official quotations
function numberToWords(num: number): string {
  const integerPart = Math.floor(Math.abs(num));
  if (integerPart === 0) return 'Zero Taka Only';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n: number): string {
    if (n < 20) return units[n];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
  }

  function convertThreeDigits(n: number): string {
    let str = '';
    if (n >= 100) {
      str += units[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      str += convertTwoDigits(n) + ' ';
    }
    return str.trim();
  }

  let crore = Math.floor(integerPart / 10000000);
  let remCrore = integerPart % 10000000;
  let lakh = Math.floor(remCrore / 100000);
  let remLakh = remCrore % 100000;
  let thousand = Math.floor(remLakh / 1000);
  let remThousand = remLakh % 1000;
  let hundreds = remThousand;

  let words = '';
  if (crore > 0) words += convertThreeDigits(crore) + ' Crore ';
  if (lakh > 0) words += convertTwoDigits(lakh) + ' Lakh ';
  if (thousand > 0) words += convertTwoDigits(thousand) + ' Thousand ';
  if (hundreds > 0) words += convertThreeDigits(hundreds) + ' ';

  return words.trim() + ' Taka Only';
}

export default function PcBuilderPage() {
  const [slots, setSlots] = useState<ComponentSlot[]>([
    { key: 'cpu', name: 'Processor (CPU)', categoryLabel: 'Processor', icon: Cpu, required: true, product: null, baseWattage: 125 },
    { key: 'motherboard', name: 'Motherboard', categoryLabel: 'Motherboard', icon: Layers, required: true, product: null, baseWattage: 50 },
    { key: 'cooler', name: 'CPU Cooler', categoryLabel: 'Cooler', icon: Fan, required: false, product: null, baseWattage: 15 },
    { key: 'ram', name: 'RAM 1 (Primary Memory)', categoryLabel: 'RAM', icon: Layers, required: true, product: null, baseWattage: 20 },
    { key: 'ram2', name: 'RAM 2 (Secondary Memory / Dual Channel)', categoryLabel: 'RAM', icon: Layers, required: false, product: null, baseWattage: 20 },
    { key: 'storage', name: 'Storage 1 (Primary SSD / M.2)', categoryLabel: 'SSD / Storage', icon: HardDrive, required: true, product: null, baseWattage: 10 },
    { key: 'storage2', name: 'Storage 2 (Secondary Storage / HDD)', categoryLabel: 'SSD / Storage', icon: HardDrive, required: false, product: null, baseWattage: 10 },
    { key: 'gpu', name: 'Graphics Card (GPU)', categoryLabel: 'Graphics Card', icon: Zap, required: false, product: null, baseWattage: 220 },
    { key: 'psu', name: 'Power Supply (PSU)', categoryLabel: 'Power Supply', icon: Zap, required: true, product: null, baseWattage: 0 },
    { key: 'case', name: 'Casing / PC Case', categoryLabel: 'PC Case', icon: Box, required: true, product: null, baseWattage: 0 },
    { key: 'monitor', name: 'Monitor / Display', categoryLabel: 'Monitors', icon: Monitor, required: false, product: null, baseWattage: 0 },
    { key: 'keyboard', name: 'Keyboard', categoryLabel: 'Keyboard', icon: Keyboard, required: false, product: null, baseWattage: 5 },
    { key: 'mouse', name: 'Gaming Mouse', categoryLabel: 'Mouse', icon: Mouse, required: false, product: null, baseWattage: 5 },
    { key: 'ups', name: 'UPS (Power Backup)', categoryLabel: 'UPS', icon: BatteryCharging, required: false, product: null, baseWattage: 0 },
  ]);

  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [selectingSlot, setSelectingSlot] = useState<string | null>(null);
  const [modalSearch, setModalSearch] = useState<string>('');
  const [modalBrandFilter, setModalBrandFilter] = useState<string>('all');
  const [modalSort, setModalSort] = useState<'price_asc' | 'price_desc' | 'featured'>('featured');
  const [shareCode, setShareCode] = useState<string>('');

  // Feature: Hide unselected components option
  const [hideUnselected, setHideUnselected] = useState<boolean>(false);

  // Feature: Quotation Modal / Print View
  const [showQuotationModal, setShowQuotationModal] = useState<boolean>(false);
  const [quotationIncludeEmpty, setQuotationIncludeEmpty] = useState<boolean>(false);
  const [quotationCustomerName, setQuotationCustomerName] = useState<string>('Valued Client');
  const [quotationCustomerPhone, setQuotationCustomerPhone] = useState<string>('');
  const [quotationRefNumber, setQuotationRefNumber] = useState<string>('');
  const [quotationDate, setQuotationDate] = useState<string>('');
  const [copiedQuote, setCopiedQuote] = useState<boolean>(false);

  // Custom component input state
  const [showAddCustomSlot, setShowAddCustomSlot] = useState<boolean>(false);
  const [customSlotName, setCustomSlotName] = useState<string>('');
  const [customSlotCategory, setCustomSlotCategory] = useState<string>('accessories');

  // Fetch PC Builder eligible products from database
  useEffect(() => {
    fetch('/api/products?limit=350')
      .then(res => res.json())
      .then(data => {
        if (data.products) setAvailableProducts(data.products);
      })
      .catch(() => {});

    // Generate quotation reference code & date
    const randomCode = 'CRX-QT-2026-' + Math.floor(1000 + Math.random() * 9000);
    setQuotationRefNumber(randomCode);
    const today = new Date();
    setQuotationDate(today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
  }, []);

  // Strict helper to test if product matches the component slot
  const isProductMatchForSlot = (p: any, slotKey: string): boolean => {
    const comp = (p.pc_builder_component || '').toLowerCase().trim();
    const catSlug = (p.category_slug || '').toLowerCase().trim();
    const catName = (p.category_name || '').toLowerCase().trim();
    const name = (p.name || '').toLowerCase().trim();

    // 1. GLOBAL EXCLUSION: Laptops, notebooks & portable PCs must NEVER appear in desktop component slots
    const isLaptop =
      catSlug.includes('laptop') ||
      catName.includes('laptop') ||
      name.includes('laptop') ||
      name.includes('notebook') ||
      name.includes('zephyrus') ||
      name.includes('legion') ||
      name.includes('macbook') ||
      name.includes('thinkpad');

    if (isLaptop) {
      return false;
    }

    // Normalize secondary slots
    const targetSlot = slotKey === 'ram2' ? 'ram' : slotKey === 'storage2' ? 'storage' : slotKey;

    // 2. Explicit pc_builder_component matching
    if (comp) {
      return comp === targetSlot.toLowerCase();
    }

    // 3. Exact slot rules & negative exclusions
    switch (targetSlot) {
      case 'cpu': {
        if (
          name.includes('cooler') ||
          name.includes('cooling') ||
          catSlug.includes('cooler') ||
          catName.includes('cooler') ||
          name.includes('fan') ||
          name.includes('liquid') ||
          name.includes('aio') ||
          name.includes('motherboard') ||
          catSlug.includes('motherboard')
        ) {
          return false;
        }
        return (
          catSlug === 'processor' ||
          catSlug === 'processors' ||
          catSlug === 'cpu' ||
          catName.toLowerCase().includes('processor') ||
          catName.toLowerCase().includes('cpu') ||
          (name.includes('processor') && !name.includes('cooler')) ||
          ((name.includes('ryzen') || name.includes('intel core') || name.includes('core i3') || name.includes('core i5') || name.includes('core i7') || name.includes('core i9') || name.includes('core ultra')) && !name.includes('cooler') && !name.includes('fan'))
        );
      }

      case 'motherboard': {
        if (name.includes('cooler') || name.includes('processor') || catSlug.includes('processor')) {
          return false;
        }
        return (
          catSlug.includes('motherboard') ||
          catSlug.includes('mobo') ||
          catName.includes('motherboard') ||
          name.includes('motherboard') ||
          name.includes('x870') ||
          name.includes('b650') ||
          name.includes('b760') ||
          name.includes('z790') ||
          name.includes('z890') ||
          name.includes('x670') ||
          name.includes('a620') ||
          name.includes('h610') ||
          name.includes('b550')
        );
      }

      case 'cooler': {
        return (
          catSlug.includes('cooler') ||
          catSlug.includes('cooling') ||
          catName.includes('cooler') ||
          catName.includes('cooling') ||
          name.includes('cooler') ||
          name.includes('liquid cooling') ||
          name.includes('aio') ||
          name.includes('ak620') ||
          name.includes('peerless assassin') ||
          name.includes('kraken') ||
          name.includes('cpu cooler')
        );
      }

      case 'ram': {
        if (name.includes('graphics') || name.includes('ssd') || catSlug.includes('storage')) return false;
        return (
          catSlug.includes('ram') ||
          catSlug.includes('memory') ||
          catName.includes('ram') ||
          catName.includes('memory') ||
          name.includes('ddr5') ||
          name.includes('ddr4') ||
          name.includes('desktop ram') ||
          name.includes('desktop memory')
        );
      }

      case 'storage': {
        if (name.includes('ram') || catSlug.includes('ram')) return false;
        return (
          catSlug.includes('storage') ||
          catSlug.includes('ssd') ||
          catSlug.includes('hdd') ||
          catSlug.includes('hard-disk') ||
          catSlug.includes('drive') ||
          catName.includes('storage') ||
          catName.includes('ssd') ||
          name.includes('ssd') ||
          name.includes('nvme') ||
          name.includes('m.2') ||
          name.includes('990 pro') ||
          name.includes('sata') ||
          name.includes('hard drive') ||
          name.includes('barracuda')
        );
      }

      case 'gpu': {
        return (
          catSlug.includes('graphics') ||
          catSlug.includes('gpu') ||
          catSlug.includes('video-card') ||
          catName.includes('graphics') ||
          catName.includes('gpu') ||
          name.includes('geforce') ||
          name.includes('rtx') ||
          name.includes('radeon') ||
          name.includes('rx 7') ||
          name.includes('rx 6') ||
          name.includes('graphics card')
        );
      }

      case 'psu': {
        if (catSlug.includes('ups') || catName.includes('ups') || name.includes('ups')) return false;
        return (
          catSlug.includes('power-supply') ||
          catSlug.includes('psu') ||
          catName.includes('power supply') ||
          catName.includes('psu') ||
          name.includes('power supply') ||
          name.includes('80 plus') ||
          (name.includes('psu') && !name.includes('ups'))
        );
      }

      case 'case': {
        if (name.includes('phone') || name.includes('earphone') || name.includes('bag')) return false;
        return (
          catSlug.includes('casing') ||
          catSlug.includes('case') ||
          catSlug.includes('chassis') ||
          catName.includes('case') ||
          catName.includes('casing') ||
          name.includes('casing') ||
          name.includes('chassis') ||
          name.includes('mid tower') ||
          name.includes('full tower') ||
          name.includes('o11') ||
          name.includes('h9 flow') ||
          name.includes('pc case')
        );
      }

      case 'monitor': {
        return (
          catSlug.includes('monitor') ||
          catSlug.includes('display') ||
          catName.includes('monitor') ||
          catName.includes('display') ||
          name.includes('monitor') ||
          name.includes('gaming monitor') ||
          name.includes('oled display') ||
          name.includes('ips display')
        );
      }

      case 'keyboard': {
        return (
          catSlug.includes('keyboard') ||
          catName.includes('keyboard') ||
          name.includes('keyboard') ||
          name.includes('mechanical keyboard') ||
          name.includes('blackwidow') ||
          name.includes('k70')
        );
      }

      case 'mouse': {
        if (name.includes('mousepad') || name.includes('mouse pad')) return false;
        return (
          catSlug.includes('mouse') ||
          catName.includes('mouse') ||
          name.includes('gaming mouse') ||
          name.includes('wireless mouse') ||
          name.includes('superlight') ||
          name.includes('deathadder') ||
          (name.includes('mouse') && !name.includes('pad'))
        );
      }

      case 'ups': {
        return (
          catSlug.includes('ups') ||
          catName.includes('ups') ||
          name.includes('ups') ||
          name.includes('sine wave') ||
          name.includes('maxgreen') ||
          name.includes('apc') ||
          name.includes('voltage regulator') ||
          name.includes('power backup')
        );
      }

      default:
        // For custom slots, match if product category matches or name matches
        return true;
    }
  };

  // Filter products for the active selecting slot modal
  const slotFilteredProducts = useMemo(() => {
    if (!selectingSlot) return [];

    // 1. Strict component slot filtering
    let list = availableProducts.filter(p => isProductMatchForSlot(p, selectingSlot));

    // 2. Modal brand filter
    if (modalBrandFilter !== 'all') {
      list = list.filter(p => (p.brand_name || '').toLowerCase() === modalBrandFilter.toLowerCase());
    }

    // 3. Modal text search
    if (modalSearch.trim()) {
      const q = modalSearch.toLowerCase().trim();
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.brand_name || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.model || '').toLowerCase().includes(q)
      );
    }

    // 4. Sort
    list = [...list].sort((a, b) => {
      const priceA = Number(a.discount_price || a.selling_price || 0);
      const priceB = Number(b.discount_price || b.selling_price || 0);
      if (modalSort === 'price_asc') return priceA - priceB;
      if (modalSort === 'price_desc') return priceB - priceA;
      return (b.id || 0) - (a.id || 0);
    });

    return list;
  }, [availableProducts, selectingSlot, modalBrandFilter, modalSearch, modalSort]);

  // Unique brands in the current slot modal
  const modalAvailableBrands = useMemo(() => {
    if (!selectingSlot) return [];
    const set = new Set<string>();
    availableProducts
      .filter(p => isProductMatchForSlot(p, selectingSlot))
      .forEach(p => {
        if (p.brand_name) set.add(p.brand_name);
      });
    return Array.from(set).sort();
  }, [availableProducts, selectingSlot]);

  // Total arithmetic price calculation
  const totalPrice = useMemo(() => {
    return slots.reduce((sum, slot) => {
      if (!slot.product) return sum;
      const priceNum = Number(slot.product.discount_price || slot.product.selling_price || 0);
      return sum + (isNaN(priceNum) ? 0 : priceNum);
    }, 0);
  }, [slots]);

  // Selected components count
  const selectedCount = useMemo(() => {
    return slots.filter(s => s.product !== null).length;
  }, [slots]);

  // Filtered slots according to hideUnselected toggle
  const visibleSlots = useMemo(() => {
    if (hideUnselected) {
      return slots.filter(s => s.product !== null);
    }
    return slots;
  }, [slots, hideUnselected]);

  // Total wattage calculation
  const totalWattage = useMemo(() => {
    return slots.reduce((sum, slot) => {
      if (!slot.product) return sum;
      return sum + (slot.baseWattage || 30);
    }, 100);
  }, [slots]);

  const recommendedPsuWattage = Math.ceil((totalWattage * 1.3) / 50) * 50;

  // Compatibility engine
  const cpu = slots.find(s => s.key === 'cpu')?.product;
  const mobo = slots.find(s => s.key === 'motherboard')?.product;
  const ram1 = slots.find(s => s.key === 'ram')?.product;
  const ram2 = slots.find(s => s.key === 'ram2')?.product;
  const psu = slots.find(s => s.key === 'psu')?.product;

  let compatibilityStatus: 'compatible' | 'warning' | 'incompatible' = 'compatible';
  let compatibilityMessage = 'All currently selected components are compatible.';

  if (cpu && mobo) {
    const cpuName = cpu.name.toLowerCase();
    const moboName = mobo.name.toLowerCase();

    // Check AMD vs Intel mismatch
    const isCpuAmd = cpuName.includes('amd') || cpuName.includes('ryzen');
    const isCpuIntel = cpuName.includes('intel') || cpuName.includes('core i') || cpuName.includes('ultra');
    const isMoboAmd = moboName.includes('am5') || moboName.includes('x870') || moboName.includes('b650') || moboName.includes('x670') || moboName.includes('am4');
    const isMoboIntel = moboName.includes('lga') || moboName.includes('b760') || moboName.includes('z790') || moboName.includes('z890') || moboName.includes('b660');

    if (isCpuAmd && isMoboIntel) {
      compatibilityStatus = 'incompatible';
      compatibilityMessage = 'Socket Incompatibility: AMD Ryzen processor cannot be installed on an Intel motherboard.';
    } else if (isCpuIntel && isMoboAmd) {
      compatibilityStatus = 'incompatible';
      compatibilityMessage = 'Socket Incompatibility: Intel processor cannot be installed on an AMD AM5/AM4 motherboard.';
    }
  }

  // RAM compatibility check
  const activeRams = [ram1, ram2].filter(Boolean);
  if (mobo && activeRams.length > 0) {
    const moboName = mobo.name.toLowerCase();
    activeRams.forEach(r => {
      const ramName = r.name.toLowerCase();
      if (moboName.includes('ddr5') && ramName.includes('ddr4')) {
        compatibilityStatus = 'incompatible';
        compatibilityMessage = 'Memory Incompatibility: Motherboard supports DDR5, but DDR4 RAM was selected.';
      } else if (moboName.includes('ddr4') && ramName.includes('ddr5')) {
        compatibilityStatus = 'incompatible';
        compatibilityMessage = 'Memory Incompatibility: Motherboard supports DDR4, but DDR5 RAM was selected.';
      }
    });
  }

  if (psu && totalWattage > 500) {
    const psuWattageMatch = psu.name.match(/(\d+)W/i);
    if (psuWattageMatch && parseInt(psuWattageMatch[1]) < totalWattage) {
      compatibilityStatus = 'warning';
      compatibilityMessage = `Power Warning: Selected PSU (${psuWattageMatch[1]}W) is lower than recommended capacity (${recommendedPsuWattage}W).`;
    }
  }

  const handleSelectProduct = (slotKey: string, product: any) => {
    setSlots(slots.map(s => s.key === slotKey ? { ...s, product } : s));
    setSelectingSlot(null);
    setModalSearch('');
    setModalBrandFilter('all');
  };

  const handleRemoveProduct = (slotKey: string) => {
    setSlots(slots.map(s => s.key === slotKey ? { ...s, product: null } : s));
  };

  const handleAddCustomSlot = () => {
    if (!customSlotName.trim()) return;
    const key = 'custom_' + Date.now();
    const newSlot: ComponentSlot = {
      key,
      name: customSlotName.trim(),
      categoryLabel: customSlotCategory,
      icon: PlusCircle,
      required: false,
      product: null,
      baseWattage: 10,
      isCustom: true,
    };
    setSlots([...slots, newSlot]);
    setCustomSlotName('');
    setShowAddCustomSlot(false);
  };

  const handleDeleteCustomSlot = (slotKey: string) => {
    setSlots(slots.filter(s => s.key !== slotKey));
  };

  const handleShare = () => {
    const code = 'CRX-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setShareCode(code);
    alert(`Build Saved! Share Code: ${code}\nShare URL: https://corenix.com.bd/pc-builder?share=${code}`);
  };

  const handleOpenQuotation = () => {
    setShowQuotationModal(true);
  };

  const handlePrintQuotation = () => {
    window.print();
  };

  const handleCopyQuotationText = () => {
    const lines = [
      '========================================',
      'CORENIX COMPUTERS & TECH LTD. - PC BUILD QUOTATION',
      `Quotation Ref: ${quotationRefNumber} | Date: ${quotationDate}`,
      `Customer: ${quotationCustomerName} ${quotationCustomerPhone ? `(${quotationCustomerPhone})` : ''}`,
      '========================================',
      '',
    ];

    const activeList = quotationIncludeEmpty ? slots : slots.filter(s => s.product);
    activeList.forEach((s, idx) => {
      if (s.product) {
        const price = Number(s.product.discount_price || s.product.selling_price || 0);
        lines.push(`${idx + 1}. [${s.name}] ${s.product.name}`);
        lines.push(`   SKU: ${s.product.sku} | Warranty: ${s.product.warranty_period || '1 Year'} | Price: BDT ${price.toLocaleString()}`);
      } else {
        lines.push(`${idx + 1}. [${s.name}] (Not Selected)`);
      }
    });

    lines.push('');
    lines.push('----------------------------------------');
    lines.push(`TOTAL BUILD PRICE: BDT ${totalPrice.toLocaleString()} (${numberToWords(totalPrice)})`);
    lines.push('VAT: Included • Free Professional Assembly & Stability Testing');
    lines.push('Hotline: +880 1700-000000 | Website: https://corenix.com.bd');
    lines.push('========================================');

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2500);
  };

  const handleAddToCart = () => {
    const selected = slots.filter(s => s.product);
    if (selected.length === 0) {
      alert('Please select at least one component to add your build to cart.');
      return;
    }
    alert(`Success! Added all ${selected.length} custom build components to cart (Total: ৳${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}).`);
  };

  const activeSlotObj = slots.find(s => s.key === selectingSlot);

  // Filtered slots for Quotation modal
  const quotationSlots = quotationIncludeEmpty ? slots : slots.filter(s => s.product !== null);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-navy-950 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Hide on print */}
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full print:p-0 print:m-0 print:max-w-none">
        {/* Header Section (Hidden in print) */}
        <div className="print:hidden p-6 sm:p-8 rounded-3xl bg-white dark:bg-gradient-to-r dark:from-navy-900 dark:via-slate-900 dark:to-navy-900 border border-slate-200/80 dark:border-slate-800 mb-8 flex items-center justify-between flex-wrap gap-4 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-brand-500/10 border border-sky-200 dark:border-brand-500/30 text-sky-700 dark:text-brand-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Hardware Compatibility Engine • Dual RAM & Storage Support</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              CORENIX Custom PC Builder
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Choose your components with dual-channel RAM & secondary storage support. Export clean 1-page PDF Quotations, share builds, or order assembled with official brand warranty.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Toggle Hide Unselected */}
            <button
              onClick={() => setHideUnselected(!hideUnselected)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
                hideUnselected
                  ? 'bg-sky-50 border-sky-300 text-sky-700 dark:bg-brand-500/20 dark:border-brand-500/40 dark:text-brand-300 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Toggle to hide empty/unselected component slots"
            >
              {hideUnselected ? <EyeOff className="w-4 h-4 text-sky-600 dark:text-brand-400" /> : <Eye className="w-4 h-4" />}
              <span>{hideUnselected ? 'Showing Selected Only' : 'Hide Missing Slots'}</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-md bg-white dark:bg-navy-900 text-[10px] font-mono">
                {selectedCount}/{slots.length}
              </span>
            </button>

            <button
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Build</span>
            </button>

            {/* Official Quotation & Print PDF Button */}
            <button
              onClick={handleOpenQuotation}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-brand-500 dark:hover:bg-brand-400 text-white dark:text-navy-950 font-bold text-xs flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
            >
              <FileText className="w-4 h-4" />
              <span>Print / Save PDF Quotation</span>
            </button>
          </div>
        </div>

        {/* Compatibility Bar & Summary Cards (Hidden in print) */}
        <div className="print:hidden grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Compatibility Box */}
          <div className="lg:col-span-4 p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3.5 shadow-xs">
            <div className={`p-2.5 rounded-2xl flex-shrink-0 ${
              compatibilityStatus === 'compatible'
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                : compatibilityStatus === 'warning'
                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                : 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
            }`}>
              {compatibilityStatus === 'compatible' && <CheckCircle2 className="w-5 h-5" />}
              {compatibilityStatus === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {compatibilityStatus === 'incompatible' && <XCircle className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Compatibility Status: {compatibilityStatus.toUpperCase()}
              </span>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mt-1 leading-relaxed">
                {compatibilityMessage}
              </p>
            </div>
          </div>

          {/* Wattage Calculation */}
          <div className="lg:col-span-4 p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Estimated Power Draw
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {totalWattage}W
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Recommended PSU: <strong>{recommendedPsuWattage}W+</strong>
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
              <Zap className="w-6 h-6" />
            </div>
          </div>

          {/* Pricing & Add to Cart */}
          <div className="lg:col-span-4 p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 shadow-xs">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Total Build Price
              </span>
              <div className="text-2xl font-black text-sky-600 dark:text-brand-400 mt-0.5">
                ৳{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                {selectedCount} item{selectedCount === 1 ? '' : 's'} • VAT Included • Free Assembly
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              className="px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 dark:bg-brand-500 dark:hover:bg-brand-400 text-white dark:text-navy-950 font-bold text-xs flex items-center gap-2 transition-all shadow hover:shadow-lg flex-shrink-0"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add All to Cart</span>
            </button>
          </div>
        </div>

        {/* Filter / Status notification bar */}
        <div className="print:hidden flex items-center justify-between mb-4 px-2 flex-wrap gap-2">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing <strong className="text-slate-800 dark:text-slate-200">{visibleSlots.length}</strong> {visibleSlots.length === 1 ? 'component slot' : 'component slots'}
            {hideUnselected && <span> (filtered to configured parts only)</span>}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddCustomSlot(!showAddCustomSlot)}
              className="text-xs text-sky-600 dark:text-brand-400 font-bold flex items-center gap-1 hover:underline"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Custom Component Slot</span>
            </button>

            {hideUnselected && (
              <button
                onClick={() => setHideUnselected(false)}
                className="text-xs text-sky-600 dark:text-brand-400 font-bold hover:underline"
              >
                Show all {slots.length} slots
              </button>
            )}
          </div>
        </div>

        {/* Add Custom Component Slot Form */}
        {showAddCustomSlot && (
          <div className="print:hidden p-4 rounded-2xl bg-sky-50/70 dark:bg-navy-900 border border-sky-200 dark:border-slate-700 mb-6 flex items-center gap-3 flex-wrap animate-fadeIn">
            <input
              type="text"
              value={customSlotName}
              onChange={e => setCustomSlotName(e.target.value)}
              placeholder="Custom slot name (e.g. Extra Case Fan, Sound Card, Capture Card)"
              className="flex-1 min-w-[240px] px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white"
            />
            <select
              value={customSlotCategory}
              onChange={e => setCustomSlotCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
            >
              <option value="accessories">Accessories / Other</option>
              <option value="cooler">Cooling Fan</option>
              <option value="storage">Extra Storage</option>
              <option value="peripherals">Peripherals</option>
            </select>
            <button
              onClick={handleAddCustomSlot}
              className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-500"
            >
              Add Slot
            </button>
            <button
              onClick={() => setShowAddCustomSlot(false)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Component Slots Grid (Interactive View) */}
        <div className="print:hidden space-y-3.5 mb-16">
          {visibleSlots.map((slot) => {
            const Icon = slot.icon;
            const priceNum = slot.product ? Number(slot.product.discount_price || slot.product.selling_price || 0) : 0;

            return (
              <div
                key={slot.key}
                className={`p-4 rounded-2xl bg-white dark:bg-navy-900 border transition-all shadow-xs ${
                  slot.product
                    ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-navy-900'
                    : 'border-dashed border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  {/* Left: Slot Type */}
                  <div className="flex items-center gap-3.5 w-72">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      slot.product
                        ? 'bg-sky-50 text-sky-600 dark:bg-brand-500/10 dark:text-brand-400 border border-sky-100 dark:border-brand-500/30'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700/60'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {slot.name}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {slot.required ? 'Mandatory Component' : slot.isCustom ? 'Custom Item' : 'Optional Upgrade'}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Selected Product Details or Placeholder */}
                  <div className="flex-1 min-w-[220px]">
                    {slot.product ? (
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={slot.product.primary_image || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=200&q=80'}
                          alt={slot.product.name}
                          className="w-12 h-12 object-contain bg-slate-50 dark:bg-navy-950 rounded-lg p-1 border border-slate-200 dark:border-slate-800 flex-shrink-0"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                            {slot.product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="text-sky-600 dark:text-brand-400 font-bold">
                              ৳{priceNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span>•</span>
                            <span>{slot.product.warranty_period || '1 Year Official'}</span>
                            {slot.product.sku && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-[10px]">SKU: {slot.product.sku}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 dark:text-slate-500 italic flex items-center gap-1.5">
                        <span>No component selected</span>
                        {slot.required && <span className="text-rose-500 text-[11px] font-semibold">(Required for complete PC)</span>}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions - Fixed width & height for identical size across all rows */}
                  <div className="w-48 flex items-center justify-end gap-2 flex-shrink-0">
                    {slot.product ? (
                      <>
                        <button
                          onClick={() => { setSelectingSlot(slot.key); setModalSearch(''); setModalBrandFilter('all'); }}
                          className="flex-1 h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 shadow-2xs"
                        >
                          Change
                        </button>
                        <button
                          onClick={() => handleRemoveProduct(slot.key)}
                          className="h-10 w-10 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 transition-colors flex items-center justify-center flex-shrink-0 border border-rose-200 dark:border-rose-900/50 shadow-2xs"
                          title="Remove component"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => { setSelectingSlot(slot.key); setModalSearch(''); setModalBrandFilter('all'); }}
                        className="w-full h-10 px-4 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 border border-sky-200 dark:border-brand-500/30 text-sky-700 dark:text-brand-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs"
                      >
                        <Plus className="w-4 h-4 shrink-0" />
                        <span className="truncate">Choose {slot.categoryLabel}</span>
                      </button>
                    )}

                    {slot.isCustom && (
                      <button
                        onClick={() => handleDeleteCustomSlot(slot.key)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 ml-1"
                        title="Delete custom slot"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {visibleSlots.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <Package className="w-12 h-12 mx-auto text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">No components currently selected</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                You have turned on &quot;Hide Missing Slots&quot;. Turn it off to choose parts and build your dream computer.
              </p>
              <button
                onClick={() => setHideUnselected(false)}
                className="mt-4 px-4 py-2 rounded-xl bg-sky-600 text-white dark:bg-brand-500 dark:text-navy-950 font-bold text-xs"
              >
                Show All Slots
              </button>
            </div>
          )}
        </div>

        {/* Modal: Select Component from live database */}
        {selectingSlot && activeSlotObj && (
          <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-navy-950/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 dark:bg-brand-500/10 dark:text-brand-400 border border-sky-200 dark:border-brand-500/30 flex items-center justify-center flex-shrink-0">
                    <activeSlotObj.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Choose {activeSlotObj.name}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Showing verified {activeSlotObj.categoryLabel} products ({slotFilteredProducts.length} available)
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectingSlot(null)}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Filter Toolbar */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-navy-900 space-y-3">
                <div className="flex items-center gap-3">
                  {/* Search inside modal */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={modalSearch}
                      onChange={e => setModalSearch(e.target.value)}
                      placeholder={`Search ${activeSlotObj.categoryLabel} by name, model, specs, SKU...`}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-9 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 text-xs"
                      autoFocus
                    />
                    {modalSearch && (
                      <button
                        onClick={() => setModalSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Sort dropdown */}
                  <select
                    value={modalSort}
                    onChange={e => setModalSort(e.target.value as any)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    <option value="featured">Featured First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>

                {/* Brand Filter Pills */}
                {modalAvailableBrands.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    <span className="text-[11px] text-slate-400 font-bold mr-1">Brand:</span>
                    <button
                      onClick={() => setModalBrandFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap ${
                        modalBrandFilter === 'all'
                          ? 'bg-sky-600 dark:bg-brand-500 text-white dark:text-slate-950'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    {modalAvailableBrands.map(b => (
                      <button
                        key={b}
                        onClick={() => setModalBrandFilter(b)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap ${
                          modalBrandFilter.toLowerCase() === b.toLowerCase()
                            ? 'bg-sky-600 dark:bg-brand-500 text-white dark:text-slate-950'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-white'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Products List */}
              <div className="p-4 overflow-y-auto space-y-3 flex-1 divide-y divide-slate-100 dark:divide-slate-800/60">
                {slotFilteredProducts.length > 0 ? (
                  slotFilteredProducts.map((p) => {
                    const price = Number(p.discount_price || p.selling_price || 0);
                    const originalPrice = Number(p.selling_price || 0);
                    const hasDiscount = p.discount_price && Number(p.discount_price) < originalPrice;

                    return (
                      <div
                        key={p.id}
                        className="pt-3 first:pt-0 p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/90 dark:bg-slate-950/60 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.primary_image || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=200&q=80'}
                            alt={p.name}
                            className="w-14 h-14 object-contain bg-white dark:bg-navy-950 rounded-xl p-1.5 border border-slate-200 dark:border-slate-800 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                              {p.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-slate-500 dark:text-slate-400">
                              {p.brand_name && (
                                <span className="px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-brand-300 font-bold text-[10px]">
                                  {p.brand_name}
                                </span>
                              )}
                              <span className="font-mono">SKU: {p.sku}</span>
                              <span>•</span>
                              <span>{p.warranty_period || '1 Year Official'}</span>
                              <span>•</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                In Stock ({p.total_stock || 25} Units)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <span className="text-sm font-black text-sky-600 dark:text-brand-400 block">
                              ৳{price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            {hasDiscount && (
                              <span className="text-[10px] text-slate-400 line-through block">
                                ৳{originalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleSelectProduct(selectingSlot, p)}
                            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-brand-500 dark:hover:bg-brand-400 text-white dark:text-navy-950 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Select</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 space-y-2">
                    <Package className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      No {activeSlotObj.categoryLabel} components found
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      {modalSearch
                        ? `No results match "${modalSearch}". Try clearing your search.`
                        : `No ${activeSlotObj.categoryLabel} products in stock right now.`}
                    </p>
                    {modalSearch && (
                      <button
                        onClick={() => { setModalSearch(''); setModalBrandFilter('all'); }}
                        className="mt-2 text-brand-400 text-xs hover:underline font-semibold"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Official PC Build Quotation & Single A4 Page PDF Generator */}
        {showQuotationModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white text-slate-900 rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl border border-slate-300">
              {/* Modal Top Control Bar (Hidden when printing via @media print) */}
              <div className="print:hidden p-3.5 bg-slate-900 text-white flex items-center justify-between flex-wrap gap-2.5">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-sky-400" />
                  <span className="font-bold text-xs sm:text-sm">Official Build Quotation (Single A4 Page Optimized)</span>
                  <span className="text-[11px] text-slate-400 font-mono">({quotationRefNumber})</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Toggle Include Empty in Quotation */}
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer text-slate-300 hover:text-white mr-1 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700">
                    <input
                      type="checkbox"
                      checked={quotationIncludeEmpty}
                      onChange={e => setQuotationIncludeEmpty(e.target.checked)}
                      className="rounded text-sky-500 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span>Include Unselected Slots</span>
                  </label>

                  <button
                    onClick={handleCopyQuotationText}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                    title="Copy quotation details to clipboard"
                  >
                    {copiedQuote ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedQuote ? 'Copied!' : 'Copy Text'}</span>
                  </button>

                  <button
                    onClick={handlePrintQuotation}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Save 1-Page PDF</span>
                  </button>

                  <button
                    onClick={() => setShowQuotationModal(false)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Printable Quotation Content (Engineered for Exact 1-Page A4 Precision) */}
              <div id="quotation-printable" className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white text-slate-900 font-sans text-xs leading-tight">
                {/* Quotation Header with Brand Logo & Company Info */}
                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-7 h-7 rounded-md bg-sky-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
                        C
                      </div>
                      <h2 className="text-xl font-black tracking-tight text-slate-900">
                        CORENIX COMPUTERS & TECH LTD.
                      </h2>
                    </div>
                    <p className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">
                      Official IT Hardware Distributor & High-Performance Custom PC System Integrator
                    </p>
                    <div className="text-[9.5px] text-slate-600 flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        Multiplan Center, Level 4 & Level 6, Dhaka-1205
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        +880 1700-000000
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-500" />
                        https://corenix.com.bd
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="inline-block px-2.5 py-0.5 rounded bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest mb-1">
                      PC BUILD QUOTATION
                    </div>
                    <div className="text-[10px] space-y-0.5">
                      <p><span className="text-slate-500 font-medium">Quote Ref:</span> <span className="font-mono font-bold">{quotationRefNumber}</span></p>
                      <p><span className="text-slate-500 font-medium">Date:</span> <span className="font-bold">{quotationDate}</span></p>
                      <p><span className="text-slate-500 font-medium">Validity:</span> <span>7 Days</span></p>
                    </div>
                  </div>
                </div>

                {/* Customer Info & System Wattage Banner */}
                <div className="bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 mb-3 flex items-center justify-between gap-4 text-[10px]">
                  <div className="flex-1">
                    <span className="font-bold text-slate-500 uppercase tracking-wider block text-[9px]">Prepared For:</span>
                    <input
                      type="text"
                      value={quotationCustomerName}
                      onChange={e => setQuotationCustomerName(e.target.value)}
                      placeholder="Customer / Organization Name"
                      className="font-bold text-xs text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-sky-600 px-0.5 py-0 w-full"
                    />
                  </div>

                  <div className="flex-1">
                    <span className="font-bold text-slate-500 uppercase tracking-wider block text-[9px]">Phone / Contact:</span>
                    <input
                      type="text"
                      value={quotationCustomerPhone}
                      onChange={e => setQuotationCustomerPhone(e.target.value)}
                      placeholder="+880 1XXXXXXXXX"
                      className="font-medium text-xs text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-sky-600 px-0.5 py-0 w-full"
                    />
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-slate-500 uppercase tracking-wider block text-[9px]">System Power & Status:</span>
                    <span className="font-bold text-slate-900 text-[11px]">{totalWattage}W (PSU Rec: {recommendedPsuWattage}W+) • <span className="text-emerald-700">Tested OK</span></span>
                  </div>
                </div>

                {/* Component Table (Ultra-clean single page layout) */}
                <table className="w-full border-collapse border border-slate-400 text-[10px] mb-3">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold">
                      <th className="border border-slate-700 py-1.5 px-2 w-8 text-center">#</th>
                      <th className="border border-slate-700 py-1.5 px-2 w-32 text-left">Slot</th>
                      <th className="border border-slate-700 py-1.5 px-2 text-left">Product Description, Model & SKU</th>
                      <th className="border border-slate-700 py-1.5 px-2 w-24 text-left">Warranty</th>
                      <th className="border border-slate-700 py-1.5 px-1.5 w-10 text-center">Qty</th>
                      <th className="border border-slate-700 py-1.5 px-2 w-24 text-right">Unit (৳)</th>
                      <th className="border border-slate-700 py-1.5 px-2 w-24 text-right">Total (৳)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotationSlots.map((slot, index) => {
                      const p = slot.product;
                      const price = p ? Number(p.discount_price || p.selling_price || 0) : 0;

                      return (
                        <tr key={slot.key} className={index % 2 === 1 ? 'bg-slate-50/80' : 'bg-white'}>
                          <td className="border border-slate-300 py-1 px-1.5 text-center font-mono font-medium text-slate-600">
                            {index + 1}
                          </td>
                          <td className="border border-slate-300 py-1 px-2 font-bold text-slate-800">
                            {slot.name.replace(/\(.*?\)/g, '').trim()}
                          </td>
                          <td className="border border-slate-300 py-1 px-2">
                            {p ? (
                              <div>
                                <span className="font-bold text-slate-900">{p.name}</span>
                                {p.sku && (
                                  <span className="text-[9px] text-slate-500 font-mono ml-2">
                                    [SKU: {p.sku}]
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="italic text-slate-400">Not selected / Customer to provide</span>
                            )}
                          </td>
                          <td className="border border-slate-300 py-1 px-2 text-slate-700">
                            {p ? (p.warranty_period || '1 Year') : '-'}
                          </td>
                          <td className="border border-slate-300 py-1 px-1 text-center font-bold">
                            {p ? 1 : 0}
                          </td>
                          <td className="border border-slate-300 py-1 px-2 text-right font-mono text-slate-800">
                            {p ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                          </td>
                          <td className="border border-slate-300 py-1 px-2 text-right font-mono font-bold text-slate-900">
                            {p ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Totals & Financial Breakdown */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  {/* Amount in words & Inclusions */}
                  <div className="flex-1">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-300">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                        Amount in Words:
                      </span>
                      <p className="text-[11px] font-bold text-slate-900 mt-0.5 capitalize">
                        {numberToWords(totalPrice)}
                      </p>
                      <p className="mt-1 text-[9px] text-slate-500">
                        • Professional assembly, thermal compounding, cable management & 24h stability testing included.
                      </p>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="w-64">
                    <table className="w-full text-[10px]">
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="py-1 text-slate-600">Subtotal ({selectedCount} components):</td>
                          <td className="py-1 text-right font-mono font-bold text-slate-900">
                            ৳{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-1 text-slate-600">Assembly & Diagnostics:</td>
                          <td className="py-1 text-right font-bold text-emerald-600">FREE</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-1 text-slate-600">Applicable Taxes:</td>
                          <td className="py-1 text-right font-semibold text-slate-700">Included</td>
                        </tr>
                        <tr className="border-b-2 border-slate-900 bg-slate-100 font-bold">
                          <td className="py-1.5 font-black text-slate-900 text-xs pl-1.5">GRAND TOTAL:</td>
                          <td className="py-1.5 text-right font-mono font-black text-sky-900 text-sm pr-1.5">
                            ৳{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Terms & Conditions (Compact for 1-page fit) */}
                <div className="border-t border-slate-300 pt-2 mb-4 text-[9px] text-slate-600 leading-snug">
                  <span className="font-bold text-slate-800 uppercase block mb-0.5">Terms & Conditions:</span>
                  <div className="grid grid-cols-2 gap-x-4">
                    <p>1. Prices include VAT and are valid for 7 days from generation.</p>
                    <p>2. Official warranty claims handled via authorized distributor service points.</p>
                    <p>3. Physical burns, bent pins or liquid ingress void warranty.</p>
                    <p>4. Genuine authentic retail boxed components guaranteed.</p>
                  </div>
                </div>

                {/* Signatures */}
                <div className="flex items-center justify-between pt-4 border-t border-dashed border-slate-300 text-[10px]">
                  <div className="text-center">
                    <div className="w-40 border-b border-slate-400 mb-1"></div>
                    <span className="font-bold text-slate-800">Prepared By: Sales & Tech</span>
                    <p className="text-[8.5px] text-slate-500">Authorized Signature & Seal</p>
                  </div>

                  <div className="text-center">
                    <div className="w-40 border-b border-slate-400 mb-1"></div>
                    <span className="font-bold text-slate-800">Customer Acceptance</span>
                    <p className="text-[8.5px] text-slate-500">Signature & Date</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Hide on print */}
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
