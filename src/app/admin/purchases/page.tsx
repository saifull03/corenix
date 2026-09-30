'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Truck,
  Store,
  Building2,
  Plus,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  RefreshCw,
  Search,
  Copy,
  Check,
  CreditCard,
  Printer,
  ArrowRight,
  Filter,
  Eye,
  Calendar,
  ShieldCheck,
  Tag,
  Phone,
  MapPin,
} from 'lucide-react';
import { OtherHousePurchase } from '@/lib/types';

function PurchasesContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'other-house' ? 'other-house' : 'all';

  const [activeTab, setActiveTab] = useState<'all' | 'other-house' | 'distributor'>(initialTab);

  // Distributor PO states
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loadingDistributor, setLoadingDistributor] = useState(true);
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [poSearch, setPoSearch] = useState('');

  // PO form states
  const [supplierId, setSupplierId] = useState<number>(1);
  const [poBranchId, setPoBranchId] = useState<number>(1);
  const [totalAmount, setTotalAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [transportCost, setTransportCost] = useState('0');
  const [poNotes, setPoNotes] = useState('');
  const [submittingPo, setSubmittingPo] = useState(false);
  const [poErrorMsg, setPoErrorMsg] = useState('');

  // Other House Purchases states
  const [otherHousePurchases, setOtherHousePurchases] = useState<OtherHousePurchase[]>([]);
  const [otherHouseMetrics, setOtherHouseMetrics] = useState({
    total_count: 0,
    total_value: 0,
    total_lend_due: 0,
    lend_count: 0,
    paid_count: 0,
    total_paid: 0,
  });
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [knownHouses, setKnownHouses] = useState<any[]>([]);
  const [loadingOtherHouse, setLoadingOtherHouse] = useState(true);
  const [ohSearch, setOhSearch] = useState('');
  const [ohPaymentFilter, setOhPaymentFilter] = useState<'all' | 'lend' | 'paid'>('all');
  const [ohBranchFilter, setOhBranchFilter] = useState<string>('all');
  const [copiedSerial, setCopiedSerial] = useState<string | null>(null);

  // Other House Create Modal states
  const [isOhModalOpen, setIsOhModalOpen] = useState(false);
  const [submittingOh, setSubmittingOh] = useState(false);
  const [ohErrorMsg, setOhErrorMsg] = useState('');

  // Form fields for Other House Purchase
  const [houseName, setHouseName] = useState('');
  const [houseContact, setHouseContact] = useState('');
  const [housePhone, setHousePhone] = useState('');
  const [houseAddress, setHouseAddress] = useState('');
  const [branchId, setBranchId] = useState<number>(1);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [productName, setProductName] = useState('');
  const [productBrand, setProductBrand] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productModel, setProductModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [warrantyPeriod, setWarrantyPeriod] = useState('1 Year Official Warranty');
  const [isLend, setIsLend] = useState(true); // default true: brought on lend
  const [ohPaidAmount, setOhPaidAmount] = useState('');
  const [ohPaymentMethod, setOhPaymentMethod] = useState('Cash');
  const [ohPaymentReference, setOhPaymentReference] = useState('');
  const [ohPaidByName, setOhPaidByName] = useState('Admin');
  const [ohPaymentNotes, setOhPaymentNotes] = useState('');
  const [ohGeneralNotes, setOhGeneralNotes] = useState('');
  const [addToInventory, setAddToInventory] = useState(true);

  // Lend Settlement Modal states
  const [settleModalItem, setSettleModalItem] = useState<OtherHousePurchase | null>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleMethod, setSettleMethod] = useState('Cash');
  const [settleRef, setSettleRef] = useState('');
  const [settleDate, setSettleDate] = useState('');
  const [settleBy, setSettleBy] = useState('Admin');
  const [settleNotes, setSettleNotes] = useState('');
  const [submittingSettle, setSubmittingSettle] = useState(false);
  const [settleError, setSettleError] = useState('');

  // Inspection / Voucher Modal state
  const [viewVoucherItem, setViewVoucherItem] = useState<OtherHousePurchase | null>(null);

  // Popular / Suggestion Houses in Bangladesh Computer Market
  const popularHouses = [
    { name: 'Star Tech & Engineering (Multiplan)', contact: 'Sabbir Hossain', phone: '01712-345678', address: 'Level 4, Multiplan Center, Elephant Road' },
    { name: 'Ryans Computers Ltd (IDB Bhaban)', contact: 'Tanvir Alam', phone: '01819-876543', address: 'Ground Floor, BCS Computer City, Agargaon' },
    { name: 'UCC (Uttara Showroom Partner)', contact: 'Kamrul Hasan', phone: '01911-223344', address: 'Sector 3, Commercial Area, Uttara' },
    { name: 'Techland BD (Multiplan Level 5)', contact: 'Arif Chowdhury', phone: '01700-112233', address: 'Shop 508, Multiplan Center, Dhaka' },
    { name: 'Skyland Computer Center', contact: 'Zubair Ahmed', phone: '01855-998877', address: 'Shop 310, Alpana Plaza, Elephant Road' },
  ];

  useEffect(() => {
    fetchDistributorPOs();
    fetchOtherHousePurchases();
    // Default settle date to current ISO string formatted for datetime-local
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setSettleDate(now.toISOString().slice(0, 16));
  }, []);

  const fetchDistributorPOs = async () => {
    try {
      setLoadingDistributor(true);
      const res = await fetch('/api/admin/purchases');
      const data = await res.json();
      if (data.success) {
        setPurchaseOrders(data.purchaseOrders || []);
        setSuppliers(data.suppliers || []);
        setBranches(data.branches || []);
        if (data.suppliers.length > 0) setSupplierId(data.suppliers[0].id);
        if (data.branches.length > 0) {
          setPoBranchId(data.branches[0].id);
          setBranchId(data.branches[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDistributor(false);
    }
  };

  const fetchOtherHousePurchases = async () => {
    try {
      setLoadingOtherHouse(true);
      const res = await fetch('/api/admin/purchases/other-house');
      const data = await res.json();
      if (data.success) {
        setOtherHousePurchases(data.purchases || []);
        setOtherHouseMetrics(data.metrics || {
          total_count: 0,
          total_value: 0,
          total_lend_due: 0,
          lend_count: 0,
          paid_count: 0,
          total_paid: 0,
        });
        setCatalogProducts(data.products || []);
        setKnownHouses(data.knownHouses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOtherHouse(false);
    }
  };

  // Handle Distributor PO creation
  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    setPoErrorMsg('');
    setSubmittingPo(true);

    try {
      const res = await fetch('/api/admin/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          branchId: poBranchId,
          totalAmount: parseFloat(totalAmount),
          paidAmount: parseFloat(paidAmount || '0'),
          transportCost: parseFloat(transportCost || '0'),
          notes: poNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPoErrorMsg(data.error || 'Failed to create PO');
        setSubmittingPo(false);
        return;
      }

      setTotalAmount('');
      setPaidAmount('');
      setPoNotes('');
      setIsPoModalOpen(false);
      fetchDistributorPOs();
    } catch (err) {
      setPoErrorMsg('Failed to create purchase order');
    } finally {
      setSubmittingPo(false);
    }
  };

  const handlePoStatusUpdate = async (id: number, status: string) => {
    try {
      await fetch('/api/admin/purchases', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchDistributorPOs();
    } catch (err) {
      console.error(err);
    }
  };

  // Product autofill helper when catalog product is chosen
  const handleCatalogProductSelect = (productIdStr: string) => {
    const pId = Number(productIdStr);
    if (!pId) {
      setSelectedProductId(null);
      return;
    }
    const found = catalogProducts.find((p) => p.id === pId);
    if (found) {
      setSelectedProductId(found.id);
      setProductName(found.name);
      setProductBrand(found.brand_name || '');
      setProductCategory(found.category_name || '');
      setUnitCost(found.purchase_cost?.toString() || '');
      setSellingPrice(found.selling_price?.toString() || '');
      if (found.warranty_period) setWarrantyPeriod(found.warranty_period);
    }
  };

  // Quick house suggestion selection
  const handleSelectSuggestedHouse = (h: { name: string; contact?: string; phone?: string; address?: string }) => {
    setHouseName(h.name);
    if (h.contact) setHouseContact(h.contact);
    if (h.phone) setHousePhone(h.phone);
    if (h.address) setHouseAddress(h.address);
  };

  // Create Other House Purchase (with Serial Number & Lend option)
  const handleCreateOtherHousePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setOhErrorMsg('');
    setSubmittingOh(true);

    if (!houseName.trim()) {
      setOhErrorMsg('Please specify the Other House / Vendor Name.');
      setSubmittingOh(false);
      return;
    }
    if (!productName.trim()) {
      setOhErrorMsg('Please provide product details / name.');
      setSubmittingOh(false);
      return;
    }
    if (!serialNumber.trim()) {
      setOhErrorMsg('Serial number is required to track hardware units from other houses.');
      setSubmittingOh(false);
      return;
    }
    if (!unitCost || Number(unitCost) <= 0) {
      setOhErrorMsg('Please specify a valid purchase unit cost.');
      setSubmittingOh(false);
      return;
    }

    const calculatedTotal = Number(unitCost) * (quantity || 1);

    try {
      const res = await fetch('/api/admin/purchases/other-house', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          houseName,
          houseContact,
          housePhone,
          houseAddress,
          branchId,
          productId: selectedProductId,
          productName,
          productBrand,
          productCategory,
          productModel,
          serialNumber,
          quantity: Number(quantity) || 1,
          unitCost: parseFloat(unitCost),
          totalCost: calculatedTotal,
          sellingPrice: sellingPrice ? parseFloat(sellingPrice) : 0,
          warrantyPeriod,
          isLend, // Brought in lend
          paidAmount: isLend ? parseFloat(ohPaidAmount || '0') : calculatedTotal,
          paymentMethod: isLend ? (ohPaidAmount ? ohPaymentMethod : null) : ohPaymentMethod,
          paymentReference: ohPaymentReference,
          paidByName: ohPaidByName,
          paymentNotes: ohPaymentNotes,
          notes: ohGeneralNotes,
          addToInventory,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setOhErrorMsg(data.error || 'Failed to record Other House Purchase');
        setSubmittingOh(false);
        return;
      }

      // Reset form
      setHouseName('');
      setHouseContact('');
      setHousePhone('');
      setHouseAddress('');
      setSelectedProductId(null);
      setProductName('');
      setProductBrand('');
      setProductCategory('');
      setProductModel('');
      setSerialNumber('');
      setQuantity(1);
      setUnitCost('');
      setSellingPrice('');
      setOhPaidAmount('');
      setOhPaymentReference('');
      setOhGeneralNotes('');
      setIsLend(true);
      setIsOhModalOpen(false);

      fetchOtherHousePurchases();
    } catch (err: any) {
      setOhErrorMsg(err.message || 'Error communicating with server.');
    } finally {
      setSubmittingOh(false);
    }
  };

  // Open Lend Settlement Modal
  const openSettleModal = (item: OtherHousePurchase) => {
    setSettleModalItem(item);
    setSettleAmount(item.due_amount.toString());
    setSettleMethod('Cash');
    setSettleRef('');
    setSettleNotes('');
    setSettleBy('Admin');
    setSettleError('');

    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setSettleDate(now.toISOString().slice(0, 16));
  };

  // Submit Lend Settlement (Mark as Paid / Partial)
  const handleSettleLend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleModalItem) return;
    setSettleError('');
    setSubmittingSettle(true);

    const amt = parseFloat(settleAmount);
    if (!amt || amt <= 0) {
      setSettleError('Payment amount must be greater than 0.');
      setSubmittingSettle(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/purchases/other-house', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: settleModalItem.id,
          action: 'settle_payment',
          paymentAmount: amt,
          paymentMethod: settleMethod,
          paymentReference: settleRef,
          paidAtDate: settleDate,
          paidByName: settleBy,
          paymentNotes: settleNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setSettleError(data.error || 'Failed to settle lend payment');
        setSubmittingSettle(false);
        return;
      }

      setSettleModalItem(null);
      fetchOtherHousePurchases();
    } catch (err: any) {
      setSettleError(err.message || 'Server error while settling payment.');
    } finally {
      setSubmittingSettle(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSerial(text);
    setTimeout(() => setCopiedSerial(null), 2500);
  };

  // Filter Other House purchases
  const filteredOtherHouse = otherHousePurchases.filter((p) => {
    const q = ohSearch.toLowerCase();
    const matchesSearch =
      p.tracking_number.toLowerCase().includes(q) ||
      p.house_name.toLowerCase().includes(q) ||
      p.product_name.toLowerCase().includes(q) ||
      p.serial_number.toLowerCase().includes(q) ||
      (p.house_contact && p.house_contact.toLowerCase().includes(q)) ||
      (p.house_phone && p.house_phone.toLowerCase().includes(q));

    const matchesStatus =
      ohPaymentFilter === 'all' ||
      (ohPaymentFilter === 'lend' && (p.payment_status === 'lend' || p.payment_status === 'partially_paid')) ||
      (ohPaymentFilter === 'paid' && p.payment_status === 'paid');

    const matchesBranch =
      ohBranchFilter === 'all' || p.branch_id.toString() === ohBranchFilter;

    return matchesSearch && matchesStatus && matchesBranch;
  });

  // Filter POs
  const filteredPOs = purchaseOrders.filter((po) => {
    const q = poSearch.toLowerCase();
    return (
      po.po_number?.toLowerCase().includes(q) ||
      po.supplier_name?.toLowerCase().includes(q) ||
      po.branch_name?.toLowerCase().includes(q)
    );
  });

  const totalDistributorSpent = purchaseOrders.reduce((sum, po) => sum + Number(po.total_amount || 0), 0);
  const totalDistributorDue = purchaseOrders.reduce(
    (sum, po) => sum + (Number(po.total_amount || 0) - Number(po.paid_amount || 0)),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-cyan-400">
              Procurement & Supply Chain
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              {otherHouseMetrics.lend_count} Items on Lend
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
            <Truck className="w-6 h-6 text-sky-600 dark:text-cyan-400" />
            <span>Purchases & Hardware Sourcing</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Procure stock from corporate brand distributors or instantly source hardware from other market houses (সহযোগী হাউস / অন্য দোকান) on lend or direct payment.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsOhModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-navy-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Store className="w-4 h-4 text-navy-950" />
            <span>+ Other House Purchase (অন্য হাউস)</span>
          </button>

          <button
            onClick={() => setIsPoModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-sky-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Distributor PO</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'all'
                ? 'border-sky-600 text-sky-600 dark:border-cyan-400 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>All Procurement</span>
          </button>

          <button
            onClick={() => setActiveTab('other-house')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'other-house'
                ? 'border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Other House Purchases & Lend (অন্য হাউস)</span>
            {otherHouseMetrics.lend_count > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-navy-950 font-black">
                {otherHouseMetrics.lend_count}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('distributor')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'distributor'
                ? 'border-sky-600 text-sky-600 dark:border-cyan-400 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Official Distributor POs</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold">
              {purchaseOrders.length}
            </span>
          </button>
        </div>

        <button
          onClick={() => {
            fetchDistributorPOs();
            fetchOtherHousePurchases();
          }}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-900 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 transition-colors text-xs flex items-center gap-1.5"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingDistributor || loadingOtherHouse ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: OTHER HOUSE PURCHASES & LEND SECTION          */}
      {/* ======================================================== */}
      {(activeTab === 'all' || activeTab === 'other-house') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-500" />
                <span>Other House Procurement & Serial Lend Tracking</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Units brought from other shops / partner houses with exact serial numbers. Easily track products brought on lend and record when paid.
              </p>
            </div>
            {activeTab === 'all' && (
              <button
                onClick={() => setActiveTab('other-house')}
                className="text-xs font-bold text-sky-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>View Full Other House View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Metric Cards for Other House */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Total Other House Sourced</span>
                <Store className="w-4 h-4 text-sky-500" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                {otherHouseMetrics.total_count} Units
              </span>
              <span className="text-[10px] text-sky-600 dark:text-cyan-400 font-semibold">
                ৳{Number(otherHouseMetrics.total_value).toLocaleString()} Total hardware cost
              </span>
            </div>

            {/* CRITICAL: Active On Lend Metric */}
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 shadow-xs">
              <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-semibold">
                <span>Currently On Lend (ধার / বাকি)</span>
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1 block">
                ৳{Number(otherHouseMetrics.total_lend_due).toLocaleString()}
              </span>
              <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold">
                {otherHouseMetrics.lend_count} items awaiting payment settlement
              </span>
            </div>

            {/* CRITICAL: Paid & Cleared Metric */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 shadow-xs">
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                <span>Paid & Cleared (পরিশোধিত)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 block">
                ৳{Number(otherHouseMetrics.total_paid).toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold">
                {otherHouseMetrics.paid_count} items with logged payment timestamps
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Partner Houses</span>
                <Building2 className="w-4 h-4 text-purple-500" />
              </div>
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
                {knownHouses.length > 0 ? knownHouses.length : '5+'} Sourcing Houses
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                Multiplan, IDB, Uttara networks
              </span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={ohSearch}
                onChange={(e) => setOhSearch(e.target.value)}
                placeholder="Search Product, Serial Number (SN), House Name, Phone..."
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 pl-10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              {/* Payment Filter */}
              <div className="flex items-center bg-slate-100 dark:bg-navy-950 rounded-xl p-1 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setOhPaymentFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    ohPaymentFilter === 'all'
                      ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All ({otherHousePurchases.length})
                </button>
                <button
                  onClick={() => setOhPaymentFilter('lend')}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                    ohPaymentFilter === 'lend'
                      ? 'bg-amber-500 text-navy-950 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>On Lend</span>
                  <span className="text-[10px] opacity-80">({otherHouseMetrics.lend_count})</span>
                </button>
                <button
                  onClick={() => setOhPaymentFilter('paid')}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                    ohPaymentFilter === 'paid'
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>Paid</span>
                  <span className="text-[10px] opacity-80">({otherHouseMetrics.paid_count})</span>
                </button>
              </div>

              {/* Branch Filter */}
              <select
                value={ohBranchFilter}
                onChange={(e) => setOhBranchFilter(e.target.value)}
                className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="all">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id.toString()}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Other House Table */}
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-navy-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Tracking #</th>
                    <th className="py-3.5 px-4">Source Other House</th>
                    <th className="py-3.5 px-4">Product Details</th>
                    <th className="py-3.5 px-4">Serial Number (SN)</th>
                    <th className="py-3.5 px-4">Cost / Price</th>
                    <th className="py-3.5 px-4">Payment & Lend Status</th>
                    <th className="py-3.5 px-4">Paid Timestamp (When Paid)</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredOtherHouse.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                        No other house purchases found matching your filters. Click &quot;+ Other House Purchase&quot; to log a new purchase with serial number and lend tracking.
                      </td>
                    </tr>
                  ) : (
                    filteredOtherHouse.map((oh) => {
                      const isDue = oh.payment_status === 'lend' || oh.payment_status === 'partially_paid';
                      return (
                        <tr
                          key={oh.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-navy-800/50 transition-colors"
                        >
                          {/* Tracking & Date */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-900 dark:text-white block">
                              {oh.tracking_number}
                            </span>
                            <span className="text-[10px] text-slate-400 block whitespace-nowrap">
                              {new Date(oh.created_at).toLocaleDateString()}
                            </span>
                            {oh.branch_name && (
                              <span className="text-[10px] text-sky-600 dark:text-cyan-400 font-semibold block">
                                {oh.branch_code || oh.branch_name}
                              </span>
                            )}
                          </td>

                          {/* Sourcing House Details */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <Store className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span>{oh.house_name}</span>
                            </div>
                            {oh.house_contact && (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                                Contact: {oh.house_contact} {oh.house_phone ? `(${oh.house_phone})` : ''}
                              </span>
                            )}
                            {oh.house_address && (
                              <span className="text-[10px] text-slate-400 truncate block max-w-xs" title={oh.house_address}>
                                {oh.house_address}
                              </span>
                            )}
                          </td>

                          {/* Product Details */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <span className="font-bold text-slate-900 dark:text-white block line-clamp-2">
                              {oh.product_name}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              {oh.product_brand && <span className="text-sky-600 dark:text-cyan-400 font-semibold">{oh.product_brand}</span>}
                              {oh.product_category && <span>• {oh.product_category}</span>}
                              {oh.quantity > 1 && <span className="font-bold text-amber-500">Qty: {oh.quantity}</span>}
                            </div>
                          </td>

                          {/* SERIAL NUMBER */}
                          <td className="py-3.5 px-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-cyan-300 font-mono text-[11px] font-bold">
                              <span>{oh.serial_number}</span>
                              <button
                                onClick={() => copyToClipboard(oh.serial_number)}
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                                title="Copy Serial"
                              >
                                {copiedSerial === oh.serial_number ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {oh.warranty_period || '1 Year Official Warranty'}
                            </span>
                          </td>

                          {/* Cost & Price */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-black text-slate-900 dark:text-white">
                              ৳{Number(oh.total_cost).toLocaleString()}
                            </div>
                            {Number(oh.selling_price) > 0 && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">
                                Retail: ৳{Number(oh.selling_price).toLocaleString()}
                              </span>
                            )}
                          </td>

                          {/* LEND AND PAYMENT STATUS */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {oh.payment_status === 'paid' ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                  <span>Paid / Cleared</span>
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                                  Paid ৳{Number(oh.paid_amount).toLocaleString()}
                                </span>
                              </div>
                            ) : oh.payment_status === 'partially_paid' ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 dark:bg-cyan-950 dark:text-cyan-300 border border-sky-300 dark:border-cyan-800">
                                  <Clock className="w-3 h-3" />
                                  <span>Partially Paid</span>
                                </span>
                                <div className="text-[10px] block">
                                  <span className="text-emerald-600 font-semibold">Paid: ৳{Number(oh.paid_amount).toLocaleString()}</span>
                                  <span className="text-rose-600 font-bold block">Due: ৳{Number(oh.due_amount).toLocaleString()}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                                  <span>On Lend (ধার / বাকি)</span>
                                </span>
                                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block">
                                  ৳{Number(oh.due_amount).toLocaleString()} Due
                                </span>
                              </div>
                            )}
                          </td>

                          {/* CRITICAL REQUIREMENT: "BUT SHOULD BE SHOWN WHEN ITS PAID" */}
                          <td className="py-3.5 px-4 max-w-xs">
                            {oh.paid_at ? (
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1 text-slate-900 dark:text-emerald-400 font-semibold text-[11px]">
                                  <Calendar className="w-3 h-3 text-emerald-500 shrink-0" />
                                  <span>
                                    {new Date(oh.paid_at).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true,
                                    })}
                                  </span>
                                </div>
                                {oh.payment_method && (
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                                    Via: <strong className="text-slate-700 dark:text-slate-300">{oh.payment_method}</strong>
                                    {oh.payment_reference ? ` (${oh.payment_reference})` : ''}
                                  </span>
                                )}
                                {oh.paid_by_name && (
                                  <span className="text-[10px] text-slate-400 block">
                                    By: {oh.paid_by_name}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold italic flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                                <span>Unsettled Lend</span>
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Settle Lend Button if due */}
                              {isDue && (
                                <button
                                  onClick={() => openSettleModal(oh)}
                                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-navy-950 text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                                  title="Record Payment / Clear Lend"
                                >
                                  <CreditCard className="w-3 h-3" />
                                  <span>Settle Lend</span>
                                </button>
                              )}

                              <button
                                onClick={() => setViewVoucherItem(oh)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-navy-950 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 transition-colors"
                                title="View Voucher / Full Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: OFFICIAL DISTRIBUTOR PURCHASE ORDERS          */}
      {/* ======================================================== */}
      {(activeTab === 'all' || activeTab === 'distributor') && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-600 dark:text-cyan-400" />
                <span>Authorized Distributor Purchase Orders</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official bulk hardware shipments from global distributor partners (Smart Technologies, Global Brand, UCC, etc.)
              </p>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Total Distributor POs</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                {purchaseOrders.length}
              </span>
              <span className="text-[10px] text-sky-600 dark:text-cyan-400 font-semibold">Distributor supply pipeline</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Distributor Invoiced</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                ৳{totalDistributorSpent.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Total PO invoiced</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Vendor Payables Due</span>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
                ৳{totalDistributorDue.toLocaleString()}
              </span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">Outstanding distributor credit</span>
            </div>
          </div>

          {/* PO Search */}
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs flex items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={poSearch}
                onChange={(e) => setPoSearch(e.target.value)}
                placeholder="Search PO #, Distributor Supplier, Branch..."
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 pl-10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* PO Table */}
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-navy-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">PO Number</th>
                    <th className="py-3.5 px-4">Supplier Partner</th>
                    <th className="py-3.5 px-4">Receiving Location</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Total Cost</th>
                    <th className="py-3.5 px-4">Paid / Due</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredPOs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                        No distributor purchase orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredPOs.map((po) => {
                      const due = Number(po.total_amount) - Number(po.paid_amount || 0);
                      return (
                        <tr key={po.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-800/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                            {po.po_number}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 dark:text-white block">{po.supplier_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{po.supplier_code}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{po.branch_name}</span>
                            <span className="text-[10px] text-sky-600 dark:text-cyan-400 block font-mono">{po.branch_code}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                po.status === 'received'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : po.status === 'ordered'
                                  ? 'bg-sky-50 text-sky-700 dark:bg-cyan-950 dark:text-cyan-300 border border-sky-200 dark:border-cyan-800'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              {po.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                            ৳{Number(po.total_amount).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold block">
                              Paid: ৳{Number(po.paid_amount || 0).toLocaleString()}
                            </span>
                            {due > 0 && (
                              <span className="text-rose-600 dark:text-rose-400 text-[10px] font-bold block">
                                Due: ৳{due.toLocaleString()}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {new Date(po.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {po.status !== 'received' && (
                              <button
                                onClick={() => handlePoStatusUpdate(po.id, 'received')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold transition-colors"
                              >
                                Mark Received
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: NEW OTHER HOUSE PURCHASE (WITH LEND & SERIAL)   */}
      {/* ======================================================== */}
      {isOhModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Procure from Other House (অন্য হাউস থেকে ক্রয়)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Source hardware units from market partner shops on lend or paid with exact serial numbers.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOhModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {ohErrorMsg && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{ohErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateOtherHousePurchase} className="space-y-4 mt-4 text-xs">
              {/* Sourcing House Information */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-amber-500" />
                    <span>Other House / Partner Vendor Details</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Select or type custom shop name</span>
                </div>

                {/* Quick suggestions pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-semibold">Quick Pick:</span>
                  {popularHouses.slice(0, 3).map((h, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSuggestedHouse(h)}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 text-[10px] text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      {h.name.split('(')[0]}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      House / Shop Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={houseName}
                      onChange={(e) => setHouseName(e.target.value)}
                      placeholder="e.g. Star Tech Multiplan / Ryans IDB"
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Contact Person & Phone
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={houseContact}
                        onChange={(e) => setHouseContact(e.target.value)}
                        placeholder="Contact person"
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        value={housePhone}
                        onChange={(e) => setHousePhone(e.target.value)}
                        placeholder="Phone (017...)"
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Shop / Market Location (Address)
                    </label>
                    <input
                      type="text"
                      value={houseAddress}
                      onChange={(e) => setHouseAddress(e.target.value)}
                      placeholder="e.g. Multiplan Center Level 4, Elephant Road"
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Receiving Branch *
                    </label>
                    <select
                      value={branchId}
                      onChange={(e) => setBranchId(Number(e.target.value))}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Product Details & Serial Number */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-sky-500" />
                  <span>Product Details & Serial Number</span>
                </span>

                {/* Optional catalog product selector */}
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Link to Catalog Product (Optional Autofill)
                  </label>
                  <select
                    value={selectedProductId || ''}
                    onChange={(e) => handleCatalogProductSelect(e.target.value)}
                    className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="">-- Manual Custom Product Entry --</option>
                    {catalogProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) - ৳{p.purchase_cost}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g. MSI GeForce RTX 4070 Ti SUPER 16G Ventus"
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Brand / Category
                    </label>
                    <input
                      type="text"
                      value={productBrand}
                      onChange={(e) => setProductBrand(e.target.value)}
                      placeholder="e.g. MSI / GPU"
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* CRITICAL: SERIAL NUMBER INPUT */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <label className="block font-bold text-amber-900 dark:text-amber-300 mb-1 flex items-center justify-between">
                    <span>Hardware Serial Number (S/N) *</span>
                    <span className="text-[10px] font-normal text-amber-700 dark:text-amber-400">
                      Crucial for warranty & house tracking
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. SN-MSI-4070-881923 (or comma separated if multiple)"
                    className="w-full bg-white dark:bg-navy-900 border border-amber-400 dark:border-amber-600 rounded-xl px-3 py-2 text-slate-900 dark:text-cyan-300 font-mono text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Unit Purchase Cost (৳) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={unitCost}
                      onChange={(e) => setUnitCost(e.target.value)}
                      placeholder="105000"
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Expected Selling (৳)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      placeholder="115000"
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Warranty Period
                    </label>
                    <input
                      type="text"
                      value={warrantyPeriod}
                      onChange={(e) => setWarrantyPeriod(e.target.value)}
                      placeholder="e.g. 3 Years"
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="addToInventoryCheckbox"
                    checked={addToInventory}
                    onChange={(e) => setAddToInventory(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="addToInventoryCheckbox" className="text-slate-700 dark:text-slate-300 text-xs">
                    Auto-increment stock count for receiving branch inventory
                  </label>
                </div>
              </div>

              {/* CRITICAL: LEND VS DIRECT PAYMENT SELECTION */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 text-xs">
                    <CreditCard className="w-4 h-4 text-amber-500" />
                    <span>Lend & Payment Settlement Terms</span>
                  </span>
                  <span className="text-[10px] text-amber-800 dark:text-amber-400 font-semibold">
                    Total Sourcing Cost: ৳{(Number(unitCost || 0) * (quantity || 1)).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => setIsLend(true)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      isLend
                        ? 'bg-amber-100 dark:bg-amber-900/40 border-amber-500 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20'
                        : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="lendOption"
                      checked={isLend}
                      onChange={() => setIsLend(true)}
                      className="mt-0.5 text-amber-500"
                    />
                    <div>
                      <span className="font-bold block text-xs">Brought in Lend (ধার / বাকিতে আনা)</span>
                      <p className="text-[10px] mt-0.5 opacity-80">
                        Item is sourced without immediate payment. Settle whenever paid; exact payment time, method, and transaction ID will be shown.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setIsLend(false)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      !isLend
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="lendOption"
                      checked={!isLend}
                      onChange={() => setIsLend(false)}
                      className="mt-0.5 text-emerald-500"
                    />
                    <div>
                      <span className="font-bold block text-xs">Paid Immediately (নগদ পরিশোধিত)</span>
                      <p className="text-[10px] mt-0.5 opacity-80">
                        Paid on the spot to other house. Immediate paid timestamp and method recorded.
                      </p>
                    </div>
                  </label>
                </div>

                {/* If Paid Immediately */}
                {!isLend && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-amber-200/50 dark:border-amber-900/40">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Payment Method *
                      </label>
                      <select
                        value={ohPaymentMethod}
                        onChange={(e) => setOhPaymentMethod(e.target.value)}
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="Cash">Cash (নগদ)</option>
                        <option value="bKash Merchant">bKash Merchant</option>
                        <option value="Nagad">Nagad</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Trx ID / Voucher Ref
                      </label>
                      <input
                        type="text"
                        value={ohPaymentReference}
                        onChange={(e) => setOhPaymentReference(e.target.value)}
                        placeholder="TRX-102948"
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Settled By
                      </label>
                      <input
                        type="text"
                        value={ohPaidByName}
                        onChange={(e) => setOhPaidByName(e.target.value)}
                        placeholder="Admin / Staff Name"
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* If Lend with optional partial deposit */}
                {isLend && (
                  <div className="pt-1">
                    <label className="block font-semibold text-amber-900 dark:text-amber-300 mb-1">
                      Optional Advance Paid Deposit (৳) (Leave 0 if 100% on lend)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={ohPaidAmount}
                      onChange={(e) => setOhPaidAmount(e.target.value)}
                      placeholder="0"
                      className="w-full sm:w-1/2 bg-white dark:bg-navy-900 border border-amber-300 dark:border-amber-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Procurement Notes / Customer Order Link
                </label>
                <textarea
                  rows={2}
                  value={ohGeneralNotes}
                  onChange={(e) => setOhGeneralNotes(e.target.value)}
                  placeholder="e.g. Sourced for customer Walk-in request at Shop 1 Uttara. Settle in 3 days."
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOhModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOh}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingOh ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Recording...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm Other House Purchase</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: SETTLE LEND PAYMENT ("MARK AS PAID")             */}
      {/* ======================================================== */}
      {settleModalItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Settle Other House Lend (হাওলাত / বাকি পরিশোধ)
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {settleModalItem.tracking_number}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSettleModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {settleError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                {settleError}
              </div>
            )}

            {/* Settle Info Card */}
            <div className="my-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Other House:</span>
                <span className="font-bold text-slate-900 dark:text-white">{settleModalItem.house_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Product:</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right line-clamp-1 max-w-xs">
                  {settleModalItem.product_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Serial Number:</span>
                <span className="font-mono font-bold text-sky-600 dark:text-cyan-400">{settleModalItem.serial_number}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2 font-bold text-sm">
                <span className="text-slate-700 dark:text-slate-300">Remaining Due to Settle:</span>
                <span className="text-rose-600 dark:text-rose-400">৳{Number(settleModalItem.due_amount).toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleSettleLend} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Amount to Settle (৳) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={settleMethod}
                    onChange={(e) => setSettleMethod(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Cash">Cash (নগদ)</option>
                    <option value="bKash Merchant">bKash Merchant</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              {/* CRITICAL: PAYMENT DATE / TIMESTAMP PICKER */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={settleDate}
                    onChange={(e) => setSettleDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Transaction / Voucher Ref #
                  </label>
                  <input
                    type="text"
                    value={settleRef}
                    onChange={(e) => setSettleRef(e.target.value)}
                    placeholder="TRX-BK788910"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Settled By (Staff / Manager Name) *
                </label>
                <input
                  type="text"
                  required
                  value={settleBy}
                  onChange={(e) => setSettleBy(e.target.value)}
                  placeholder="Manager / Cashier Name"
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Settlement Notes / Remarks
                </label>
                <textarea
                  rows={2}
                  value={settleNotes}
                  onChange={(e) => setSettleNotes(e.target.value)}
                  placeholder="Money receipt #, hand-to-hand settlement, etc."
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSettleModalItem(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSettle}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingSettle ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Recording Payment...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark as Paid & Clear Lend</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: VIEW VOUCHER & COMPLETE AUDIT DETAILS           */}
      {/* ======================================================== */}
      {viewVoucherItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl relative text-xs">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-600 dark:text-cyan-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Other House Procurement Voucher
                  </h3>
                  <span className="font-mono text-sky-600 dark:text-cyan-400 font-bold">
                    {viewVoucherItem.tracking_number}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewVoucherItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Voucher Body */}
            <div className="space-y-4 my-4">
              {/* Other House details */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Source Partner House</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm block">{viewVoucherItem.house_name}</span>
                {viewVoucherItem.house_contact && (
                  <span className="text-slate-500 dark:text-slate-400 block">
                    Contact: {viewVoucherItem.house_contact} ({viewVoucherItem.house_phone || 'N/A'})
                  </span>
                )}
                {viewVoucherItem.house_address && (
                  <span className="text-slate-400 block text-[11px]">{viewVoucherItem.house_address}</span>
                )}
              </div>

              {/* Product & Serial Number */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Hardware Details</span>
                <div className="font-bold text-slate-900 dark:text-white">{viewVoucherItem.product_name}</div>
                <div className="flex justify-between items-center py-1 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Hardware Serial (S/N):</span>
                  <span className="font-mono font-bold text-cyan-500 bg-navy-900 px-2 py-0.5 rounded-md border border-slate-700">
                    {viewVoucherItem.serial_number}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Warranty:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{viewVoucherItem.warranty_period || '1 Year Official'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Total Purchase Cost:</span>
                  <span className="font-black text-slate-900 dark:text-white">৳{Number(viewVoucherItem.total_cost).toLocaleString()}</span>
                </div>
              </div>

              {/* PAYMENT & LEND AUDIT BOX (SHOWING EXACT PAID TIMESTAMP) */}
              <div
                className={`p-3.5 rounded-2xl border ${
                  viewVoucherItem.payment_status === 'paid'
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Lend & Payment Audit
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      viewVoucherItem.payment_status === 'paid'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 text-navy-950'
                    }`}
                  >
                    {viewVoucherItem.payment_status === 'paid' ? 'PAID / CLEARED' : 'ON LEND (DUE)'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Paid Amount:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      ৳{Number(viewVoucherItem.paid_amount).toLocaleString()}
                    </span>
                  </div>

                  {Number(viewVoucherItem.due_amount) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Outstanding Due:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        ৳{Number(viewVoucherItem.due_amount).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* CRITICAL: PAID TIMESTAMP */}
                  {viewVoucherItem.paid_at && (
                    <div className="flex justify-between border-t border-slate-200 dark:border-slate-800/80 pt-1.5">
                      <span className="text-slate-500 dark:text-slate-400">Paid Exact Date & Time:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {new Date(viewVoucherItem.paid_at).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                  )}

                  {viewVoucherItem.payment_method && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Payment Channel:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {viewVoucherItem.payment_method}
                        {viewVoucherItem.payment_reference ? ` (${viewVoucherItem.payment_reference})` : ''}
                      </span>
                    </div>
                  )}

                  {viewVoucherItem.paid_by_name && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Settled By Staff:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{viewVoucherItem.paid_by_name}</span>
                    </div>
                  )}

                  {viewVoucherItem.payment_notes && (
                    <div className="mt-2 p-2 rounded-xl bg-white/60 dark:bg-navy-900/60 text-[10px] text-slate-600 dark:text-slate-300 font-mono whitespace-pre-line border border-slate-200 dark:border-slate-800">
                      {viewVoucherItem.payment_notes}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Voucher</span>
              </button>
              <button
                onClick={() => setViewVoucherItem(null)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: DISTRIBUTOR PO MODAL                            */}
      {/* ======================================================== */}
      {isPoModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                <span>Issue Supplier Purchase Order</span>
              </h3>
              <button
                onClick={() => setIsPoModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {poErrorMsg && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                {poErrorMsg}
              </div>
            )}

            <form onSubmit={handleCreatePO} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier / Distributor Partner *
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id} className="dark:bg-navy-900">
                      {s.name} ({s.code}) - {s.payment_terms}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Receiving Destination Facility *
                </label>
                <select
                  value={poBranchId}
                  onChange={(e) => setPoBranchId(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} className="dark:bg-navy-900">
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Total Order Value (৳) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="150000"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Paid Amount (৳)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder="50000"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Procurement Notes / Batch Details
                </label>
                <textarea
                  rows={2}
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  placeholder="e.g. 10x RTX 5060 GPUs, 20x DDR5 32GB Kits"
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPoModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPo}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-xs disabled:opacity-50"
                >
                  {submittingPo ? 'Generating...' : 'Issue PO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPurchasesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading Purchases & Sourcing Module...</span>
        </div>
      }
    >
      <PurchasesContent />
    </Suspense>
  );
}
