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
  UserPlus,
  BookOpen,
  Download,
  Layers,
} from 'lucide-react';
import { OtherHousePurchase, PartnerHouse } from '@/lib/types';

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

  // Partner Houses Directory & Add New House States
  const [partnerHouses, setPartnerHouses] = useState<PartnerHouse[]>([]);
  const [loadingPartnerHouses, setLoadingPartnerHouses] = useState(false);
  const [isAddHouseModalOpen, setIsAddHouseModalOpen] = useState(false);
  const [isHouseDirectoryOpen, setIsHouseDirectoryOpen] = useState(false);
  const [newHouseName, setNewHouseName] = useState('');
  const [newHouseContact, setNewHouseContact] = useState('');
  const [newHousePhone, setNewHousePhone] = useState('');
  const [newHouseAddress, setNewHouseAddress] = useState('');
  const [newHouseNotes, setNewHouseNotes] = useState('');
  const [submittingNewHouse, setSubmittingNewHouse] = useState(false);
  const [newHouseError, setNewHouseError] = useState('');
  const [newHouseSuccess, setNewHouseSuccess] = useState('');

  // Shop Statement / House Ledger States
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [ledgerHouseFilter, setLedgerHouseFilter] = useState<string>('all');
  const [ledgerStartDate, setLedgerStartDate] = useState<string>('');
  const [ledgerEndDate, setLedgerEndDate] = useState<string>('');
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState<'all' | 'lend' | 'paid'>('all');
  const [ledgerBranchFilter, setLedgerBranchFilter] = useState<string>('all');
  const [ledgerData, setLedgerData] = useState<any>(null);
  const [loadingLedger, setLoadingLedger] = useState(false);

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
    fetchPartnerHouses();
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

  const fetchPartnerHouses = async () => {
    try {
      setLoadingPartnerHouses(true);
      const res = await fetch('/api/admin/partner-houses');
      const data = await res.json();
      if (data.success) {
        setPartnerHouses(data.houses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPartnerHouses(false);
    }
  };

  const handleCreatePartnerHouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewHouseError('');
    setNewHouseSuccess('');
    setSubmittingNewHouse(true);

    try {
      const res = await fetch('/api/admin/partner-houses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newHouseName,
          contact_person: newHouseContact,
          phone: newHousePhone,
          address: newHouseAddress,
          notes: newHouseNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setNewHouseError(data.error || 'Failed to save partner house');
        setSubmittingNewHouse(false);
        return;
      }

      setNewHouseSuccess('Partner House registered successfully!');
      fetchPartnerHouses();
      fetchOtherHousePurchases();

      // If user was creating a purchase, prefill the new house
      setHouseName(data.house.name);
      setHouseContact(data.house.contact_person || '');
      setHousePhone(data.house.phone || '');
      setHouseAddress(data.house.address || '');

      setTimeout(() => {
        setIsAddHouseModalOpen(false);
        setNewHouseName('');
        setNewHouseContact('');
        setNewHousePhone('');
        setNewHouseAddress('');
        setNewHouseNotes('');
        setNewHouseSuccess('');
      }, 900);
    } catch (err: any) {
      setNewHouseError(err.message || 'Error creating partner house');
    } finally {
      setSubmittingNewHouse(false);
    }
  };

  const handleDeletePartnerHouse = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from registered partner houses?`)) return;
    try {
      const res = await fetch(`/api/admin/partner-houses?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchPartnerHouses();
      } else {
        alert(data.error || 'Failed to delete partner house');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting partner house');
    }
  };

  const fetchLedgerReport = async (
    targetHouse = ledgerHouseFilter,
    targetStart = ledgerStartDate,
    targetEnd = ledgerEndDate,
    targetStatus = ledgerStatusFilter,
    targetBranch = ledgerBranchFilter
  ) => {
    try {
      setLoadingLedger(true);
      const params = new URLSearchParams();
      if (targetHouse && targetHouse !== 'all') params.set('house_name', targetHouse);
      if (targetStart) params.set('from_date', targetStart);
      if (targetEnd) params.set('to_date', targetEnd);
      if (targetStatus && targetStatus !== 'all') params.set('payment_status', targetStatus);
      if (targetBranch && targetBranch !== 'all') params.set('branch_id', targetBranch);

      const res = await fetch(`/api/admin/purchases/other-house/ledger?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLedgerData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLedger(false);
    }
  };

  const openLedgerForHouse = (houseName = 'all') => {
    setLedgerHouseFilter(houseName);
    setIsLedgerModalOpen(true);
    fetchLedgerReport(houseName, ledgerStartDate, ledgerEndDate, ledgerStatusFilter, ledgerBranchFilter);
  };

  const applyDatePreset = (preset: 'today' | 'this_week' | 'this_month' | 'last_30' | 'all') => {
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    let start = '';
    let end = formatDate(today);

    if (preset === 'today') {
      start = end;
    } else if (preset === 'this_week') {
      const d = new Date(today);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      start = formatDate(d);
    } else if (preset === 'this_month') {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      start = formatDate(d);
    } else if (preset === 'last_30') {
      const d = new Date(today);
      d.setDate(d.getDate() - 30);
      start = formatDate(d);
    } else if (preset === 'all') {
      start = '';
      end = '';
    }

    setLedgerStartDate(start);
    setLedgerEndDate(end);
    fetchLedgerReport(ledgerHouseFilter, start, end, ledgerStatusFilter, ledgerBranchFilter);
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

        {/* Action Buttons: ONLY 3 Specific Options */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Option 1: Add New House */}
          <button
            onClick={() => {
              setNewHouseError('');
              setNewHouseSuccess('');
              setIsAddHouseModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add New House (নতুন হাউস)</span>
          </button>

          {/* Option 2: Purchase Product According to House */}
          <button
            onClick={() => setIsOhModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-navy-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Store className="w-4 h-4 text-navy-950" />
            <span>+ Purchase from House (হাউস ক্রয়)</span>
          </button>

          {/* Option 3: Seeing Ledger to the House */}
          <button
            onClick={() => openLedgerForHouse('all')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>House Ledger & Statement (লেজার খতিয়ান)</span>
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
            fetchPartnerHouses();
          }}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-900 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 transition-colors text-xs flex items-center gap-1.5"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingDistributor || loadingOtherHouse || loadingPartnerHouses ? 'animate-spin' : ''}`} />
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
                Units brought from other shops / partner houses with exact serial numbers. Easily track products brought on lend, generate shop ledgers, and record when paid.
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

            {/* Partner Houses Card - Clickable for Directory & Ledgers */}
            <div
              onClick={() => setIsHouseDirectoryOpen(true)}
              className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-purple-500/60 transition-all group"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Partner Houses (সহযোগী দোকান)</span>
                <Building2 className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
                {partnerHouses.length > 0 ? partnerHouses.length : knownHouses.length} Registered Houses
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold group-hover:underline flex items-center gap-1">
                <span>Directory & statement ledgers</span>
                <ArrowRight className="w-3 h-3" />
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

              {/* Quick Statement Trigger */}
              <button
                onClick={() => openLedgerForHouse('all')}
                className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 text-teal-700 dark:text-teal-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Open Statement & Print Ledger"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Ledger</span>
              </button>
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

                          {/* Sourcing House Details (Clickable to open shop ledger) */}
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => openLedgerForHouse(oh.house_name)}
                              className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 hover:text-sky-600 dark:hover:text-cyan-400 text-left transition-colors group cursor-pointer"
                              title="Click to view full shop ledger statement"
                            >
                              <Store className="w-3.5 h-3.5 text-amber-500 shrink-0 group-hover:scale-110 transition-transform" />
                              <span className="underline decoration-dotted underline-offset-2">{oh.house_name}</span>
                            </button>
                            {oh.house_contact && (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
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

                              {/* View Shop Statement / Ledger */}
                              <button
                                onClick={() => openLedgerForHouse(oh.house_name)}
                                className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                                title="View Shop Ledger Statement"
                              >
                                <FileText className="w-3 h-3" />
                                <span>Ledger</span>
                              </button>

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-navy-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-navy-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    Procure from Other House (অন্য হাউস থেকে ক্রয়)
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Source hardware units from market partner shops on lend or paid with exact serial numbers.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOhModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateOtherHousePurchase} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto p-4 sm:p-5 space-y-3.5 flex-1 text-xs">
                {ohErrorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{ohErrorMsg}</span>
                  </div>
                )}
              {/* Sourcing House Information */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-amber-500" />
                    <span>Other House / Partner Vendor Details</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Select or type custom shop name</span>
                </div>

                {/* Registered Partner House Dropdown Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Select Registered Partner House (বা নিচে নাম লিখুন)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setNewHouseError('');
                        setNewHouseSuccess('');
                        setIsAddHouseModalOpen(true);
                      }}
                      className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>+ Add New House</span>
                    </button>
                  </div>
                  <select
                    value={partnerHouses.some(ph => ph.name === houseName) ? houseName : ''}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      if (!selectedName) return;
                      setHouseName(selectedName);
                      const match = partnerHouses.find((ph) => ph.name === selectedName);
                      if (match) {
                        if (match.contact_person) setHouseContact(match.contact_person);
                        if (match.phone) setHousePhone(match.phone);
                        if (match.address) setHouseAddress(match.address);
                      }
                    }}
                    className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Choose from Registered Houses / দোকানের তালিকা ({partnerHouses.length}) --</option>
                    {partnerHouses.map((ph) => {
                      const due = Number(ph.current_due || ph.total_lend_due || 0);
                      return (
                        <option key={ph.id} value={ph.name}>
                          {ph.name} {ph.phone ? `(${ph.phone})` : ''} {due > 0 ? `• Due: ৳${due.toLocaleString()}` : ''}
                        </option>
                      );
                    })}
                  </select>
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
            </div>

            {/* Sticky Footer */}
            <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 shrink-0 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsOhModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingOh}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center gap-1.5 text-xs"
                  >
                    {submittingOh ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Recording...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-navy-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full shadow-2xl relative flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-navy-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    Settle Other House Lend (হাওলাত / বাকি পরিশোধ)
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {settleModalItem.tracking_number}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSettleModalItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSettleLend} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto p-4 sm:p-5 space-y-3.5 flex-1 text-xs">
                {settleError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                    {settleError}
                  </div>
                )}

                {/* Settle Info Card - Compact 3-Column Layout */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Source Partner House</span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs">{settleModalItem.house_name}</span>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{settleModalItem.product_name}</p>
                    </div>
                    <span className="font-mono font-bold text-[11px] text-sky-600 dark:text-cyan-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20 shrink-0">
                      S/N: {settleModalItem.serial_number}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
                    <div className="p-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium block">Total Cost</span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs">৳{Number(settleModalItem.total_cost).toLocaleString()}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium block">Already Paid</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">৳{Number(settleModalItem.paid_amount || 0).toLocaleString()}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                      <span className="text-[10px] text-rose-500 dark:text-rose-400 font-bold block">Current Due</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400 text-xs">৳{Number(settleModalItem.due_amount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Amount to Settle & Quick Preset Chips */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      Payment Amount to Settle (৳) *
                    </label>
                    <span className="text-[10px] text-slate-400">Can be paid in full or partial installments</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                  />

                  {/* Preset Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setSettleAmount(settleModalItem.due_amount.toString())}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] border border-emerald-500/20 transition-colors"
                    >
                      Full Due: ৳{Number(settleModalItem.due_amount).toLocaleString()}
                    </button>
                    {Number(settleModalItem.due_amount) > 1000 && (
                      <button
                        type="button"
                        onClick={() => setSettleAmount(Math.round(Number(settleModalItem.due_amount) / 2).toString())}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[10px] border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        50% (৳{Math.round(Number(settleModalItem.due_amount) / 2).toLocaleString()})
                      </button>
                    )}
                    {Number(settleModalItem.due_amount) >= 5000 && (
                      <button
                        type="button"
                        onClick={() => setSettleAmount('5000')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[10px] border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        ৳5,000
                      </button>
                    )}
                    {Number(settleModalItem.due_amount) >= 1000 && (
                      <button
                        type="button"
                        onClick={() => setSettleAmount('1000')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[10px] border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        ৳1,000
                      </button>
                    )}
                  </div>
                </div>

                {/* Dynamic Live Balance Preview */}
                {(() => {
                  const paying = parseFloat(settleAmount) || 0;
                  const currentDue = Number(settleModalItem.due_amount);
                  const remainingAfter = Math.max(0, currentDue - paying);
                  const isPartial = paying > 0 && paying < currentDue;
                  const isOverpaid = paying > currentDue;

                  return (
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between text-[11px] ${
                      isPartial
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                        : isOverpaid
                        ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                        : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          isPartial ? 'bg-amber-500 text-navy-950' : 'bg-emerald-600 text-white'
                        }`}>
                          {isPartial ? 'Partial Installment' : 'Full Settlement'}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">Remaining Balance:</span>
                      </div>
                      <span className={`font-bold ${isPartial ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        ৳{remainingAfter.toLocaleString()}
                      </span>
                    </div>
                  );
                })()}

                {/* Payment Method & Trx Ref */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Payment Method *
                    </label>
                    <select
                      value={settleMethod}
                      onChange={(e) => setSettleMethod(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none"
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
                      Trx / Voucher Ref #
                    </label>
                    <input
                      type="text"
                      value={settleRef}
                      onChange={(e) => setSettleRef(e.target.value)}
                      placeholder="TRX-BK788910"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Date & Settled By */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Payment Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={settleDate}
                      onChange={(e) => setSettleDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Settled By (Staff / Manager) *
                    </label>
                    <input
                      type="text"
                      required
                      value={settleBy}
                      onChange={(e) => setSettleBy(e.target.value)}
                      placeholder="Manager / Cashier Name"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Settlement Notes / Remarks
                  </label>
                  <input
                    type="text"
                    value={settleNotes}
                    onChange={(e) => setSettleNotes(e.target.value)}
                    placeholder="e.g. 1st installment ৳5,000 paid / rest next week"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 shrink-0 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSettleModalItem(null)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSettle}
                  className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5 text-white text-xs ${
                    (parseFloat(settleAmount) || 0) < Number(settleModalItem.due_amount)
                      ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                  }`}
                >
                  {submittingSettle ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Recording...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {(parseFloat(settleAmount) || 0) < Number(settleModalItem.due_amount)
                          ? `Record Partial Payment (৳${(parseFloat(settleAmount) || 0).toLocaleString()})`
                          : `Full Settlement & Clear Lend (৳${(parseFloat(settleAmount) || 0).toLocaleString()})`}
                      </span>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-navy-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full shadow-2xl relative flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto overflow-hidden text-xs">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-navy-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-600 dark:text-cyan-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    Other House Procurement Voucher
                  </h3>
                  <span className="font-mono text-sky-600 dark:text-cyan-400 font-bold text-[11px]">
                    {viewVoucherItem.tracking_number}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewVoucherItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Voucher Body - Scrollable */}
            <div className="overflow-y-auto p-4 sm:p-5 space-y-3.5 flex-1">
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

              {/* PAYMENT & LEND AUDIT BOX */}
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

                  {viewVoucherItem.paid_at && (
                    <div className="flex justify-between border-t border-slate-200 dark:border-slate-800/80 pt-1.5">
                      <span className="text-slate-500 dark:text-slate-400">Paid Date & Time:</span>
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
            <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 shrink-0 flex items-center justify-end gap-2.5">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1.5 transition-colors text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Voucher</span>
              </button>
              <button
                onClick={() => setViewVoucherItem(null)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-colors text-xs"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-navy-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full shadow-2xl relative flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
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

      {/* ======================================================== */}
      {/* MODAL 5: ADD NEW PARTNER HOUSE                           */}
      {/* ======================================================== */}
      {isAddHouseModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-navy-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full shadow-2xl relative flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-navy-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    Add New Partner House (নতুন সহযোগী দোকান যোগ)
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Register market shop for instant lend sourcing & ledger tracking
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAddHouseModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreatePartnerHouse} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto p-4 sm:p-5 space-y-3.5 flex-1 text-xs">
                {newHouseError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                    {newHouseError}
                  </div>
                )}
                {newHouseSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300">
                    {newHouseSuccess}
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    House / Shop Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newHouseName}
                    onChange={(e) => setNewHouseName(e.target.value)}
                    placeholder="e.g. Star Tech Multiplan / Ryans IDB"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={newHouseContact}
                      onChange={(e) => setNewHouseContact(e.target.value)}
                      placeholder="e.g. Sujon Ahmed (Manager)"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={newHousePhone}
                      onChange={(e) => setNewHousePhone(e.target.value)}
                      placeholder="01711-XXXXXX"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Shop / Market Location (Address)
                  </label>
                  <input
                    type="text"
                    value={newHouseAddress}
                    onChange={(e) => setNewHouseAddress(e.target.value)}
                    placeholder="e.g. Level 4, Shop 420, Multiplan Center, Elephant Road, Dhaka"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Notes / Credit Agreement Terms
                  </label>
                  <textarea
                    rows={2}
                    value={newHouseNotes}
                    onChange={(e) => setNewHouseNotes(e.target.value)}
                    placeholder="e.g. 7-day lend clearance term. Accepts bKash Merchant and Cash."
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 shrink-0 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddHouseModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingNewHouse}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/20 disabled:opacity-50 flex items-center gap-1.5 text-xs"
                >
                  {submittingNewHouse ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Register Partner House</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: PARTNER HOUSES DIRECTORY & OVERVIEW              */}
      {/* ======================================================== */}
      {isHouseDirectoryOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-navy-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full shadow-2xl relative flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-navy-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    Partner Houses Directory (সহযোগী দোকান তালিকা)
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Manage market partners, view balances, and print shop statements
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setNewHouseError('');
                    setNewHouseSuccess('');
                    setIsAddHouseModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add New House</span>
                </button>
                <button
                  onClick={() => setIsHouseDirectoryOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-4 sm:p-5 space-y-3 flex-1 text-xs">
              {partnerHouses.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Store className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                  <p>No partner houses registered yet.</p>
                  <button
                    onClick={() => {
                      setNewHouseError('');
                      setNewHouseSuccess('');
                      setIsAddHouseModalOpen(true);
                    }}
                    className="mt-3 px-3.5 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
                  >
                    + Add Your First Partner House
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {partnerHouses.map((h) => (
                    <div
                      key={h.id || h.name}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-purple-400/50 transition-colors"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {h.name}
                          </h4>
                          {Number(h.total_lend_due || 0) > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-navy-950 shrink-0">
                              ৳{Number(h.total_lend_due).toLocaleString()} Due
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                              Cleared
                            </span>
                          )}
                        </div>

                        {h.contact_person && (
                          <span className="text-[11px] text-slate-600 dark:text-slate-400 block">
                            Contact: <strong>{h.contact_person}</strong> {h.phone ? `(${h.phone})` : ''}
                          </span>
                        )}
                        {h.address && (
                          <span className="text-[10px] text-slate-400 block line-clamp-1">
                            {h.address}
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {h.total_transactions || 0} items sourced • ৳{Number(h.total_purchase_amount || 0).toLocaleString()} Total
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setIsHouseDirectoryOpen(false);
                              openLedgerForHouse(h.name);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 font-bold text-[11px] flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Statement</span>
                          </button>
                          {h.id && (
                            <button
                              onClick={() => handleDeletePartnerHouse(h.id!, h.name)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                              title="Delete Partner House"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 shrink-0 flex items-center justify-end">
              <button
                onClick={() => setIsHouseDirectoryOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 7: SHOP STATEMENT & HOUSE LEDGER (PRINTABLE REPORT) */}
      {/* ======================================================== */}
      {isLedgerModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-navy-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full shadow-2xl relative flex flex-col max-h-[95vh] sm:max-h-[92vh] my-auto overflow-hidden">
            {/* Header (Screen Only) */}
            <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-navy-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    Shop Ledger & Lend Statement (দোকানভিত্তিক লেজার খতিয়ান)
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Filter by date range, inspect transaction debit/credit, and print official report
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report</span>
                </button>
                <button
                  onClick={() => setIsLedgerModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1 text-xs">
              {/* FILTERS BAR (Screen Only) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-3 print:hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  {/* House Select */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                      Select Partner House
                    </label>
                    <select
                      value={ledgerHouseFilter}
                      onChange={(e) => {
                        setLedgerHouseFilter(e.target.value);
                        fetchLedgerReport(e.target.value, ledgerStartDate, ledgerEndDate, ledgerStatusFilter, ledgerBranchFilter);
                      }}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none"
                    >
                      <option value="all">All Partner Houses (Overview)</option>
                      {partnerHouses.map((h) => (
                        <option key={h.id || h.name} value={h.name}>
                          {h.name}
                        </option>
                      ))}
                      {/* Fallback distinct houses */}
                      {knownHouses.filter((kh) => !partnerHouses.some((ph) => ph.name === kh.house_name)).map((kh) => (
                        <option key={kh.house_name} value={kh.house_name}>
                          {kh.house_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date From */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                      From Date (তারিখ থেকে)
                    </label>
                    <input
                      type="date"
                      value={ledgerStartDate}
                      onChange={(e) => {
                        setLedgerStartDate(e.target.value);
                        fetchLedgerReport(ledgerHouseFilter, e.target.value, ledgerEndDate, ledgerStatusFilter, ledgerBranchFilter);
                      }}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  {/* Date To */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                      To Date (তারিখ পর্যন্ত)
                    </label>
                    <input
                      type="date"
                      value={ledgerEndDate}
                      onChange={(e) => {
                        setLedgerEndDate(e.target.value);
                        fetchLedgerReport(ledgerHouseFilter, ledgerStartDate, e.target.value, ledgerStatusFilter, ledgerBranchFilter);
                      }}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                      Lend / Payment Status
                    </label>
                    <select
                      value={ledgerStatusFilter}
                      onChange={(e: any) => {
                        setLedgerStatusFilter(e.target.value);
                        fetchLedgerReport(ledgerHouseFilter, ledgerStartDate, ledgerEndDate, e.target.value, ledgerBranchFilter);
                      }}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="all">All Transactions</option>
                      <option value="lend">On Lend (Outstanding Due)</option>
                      <option value="paid">Fully Paid & Cleared</option>
                    </select>
                  </div>
                </div>

                {/* Quick Date Range Preset Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Date Presets:</span>
                  <button
                    type="button"
                    onClick={() => applyDatePreset('today')}
                    className="px-2 py-0.5 rounded-lg bg-white dark:bg-navy-900 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDatePreset('this_week')}
                    className="px-2 py-0.5 rounded-lg bg-white dark:bg-navy-900 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    This Week
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDatePreset('this_month')}
                    className="px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200 dark:border-teal-800 text-[10px] text-teal-700 dark:text-teal-300 font-semibold"
                  >
                    This Month
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDatePreset('last_30')}
                    className="px-2 py-0.5 rounded-lg bg-white dark:bg-navy-900 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    Last 30 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDatePreset('all')}
                    className="px-2 py-0.5 rounded-lg bg-white dark:bg-navy-900 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    All Time
                  </button>
                </div>
              </div>

              {/* PRINTABLE STATEMENT CONTAINER */}
              <div id="printable-statement" className="space-y-4 print:p-4 print:space-y-4">
                {/* Official Store Print Header (visible on print & top of document) */}
                <div className="p-4 rounded-2xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-sky-600 text-white font-black flex items-center justify-center text-xs">
                        C
                      </div>
                      <span className="font-black text-slate-900 dark:text-white text-base tracking-tight uppercase">
                        CORENIX ENTERPRISE COMPUTING
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Partner House Procurement & Lend Statement (দোকানভিত্তিক লেজার খতিয়ান)
                    </p>
                  </div>

                  <div className="text-right text-[11px] text-slate-500 dark:text-slate-400">
                    <div>
                      Statement Period:{' '}
                      <strong className="text-slate-900 dark:text-white">
                        {ledgerStartDate ? ledgerStartDate : 'Beginning'} — {ledgerEndDate ? ledgerEndDate : 'Present'}
                      </strong>
                    </div>
                    <div className="text-[10px] mt-0.5">
                      Generated: {new Date().toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Partner House Info Card (If single house selected) */}
                {ledgerData?.house && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Target Partner Shop / House
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {ledgerData.house.name}
                    </h4>
                    <div className="flex items-center gap-4 text-[11px] text-slate-600 dark:text-slate-400 flex-wrap">
                      {ledgerData.house.contact_person && (
                        <span>Contact: <strong>{ledgerData.house.contact_person}</strong></span>
                      )}
                      {ledgerData.house.phone && (
                        <span>Phone: <strong>{ledgerData.house.phone}</strong></span>
                      )}
                      {ledgerData.house.address && (
                        <span>Address: {ledgerData.house.address}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Financial Summary Metric Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">Total Sourced Items</span>
                    <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 block">
                      {ledgerData?.summary?.totalPurchasesCount || 0} Units
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">Total Purchase (Debit)</span>
                    <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 block">
                      ৳{Number(ledgerData?.summary?.totalCost || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-center">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">Total Paid (Credit)</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                      ৳{Number(ledgerData?.summary?.totalPaid || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center">
                    <span className="text-[10px] text-rose-500 dark:text-rose-400 block font-bold">Outstanding Due (Balance)</span>
                    <span className="text-base font-black text-rose-600 dark:text-rose-400 mt-0.5 block">
                      ৳{Number(ledgerData?.summary?.totalDue || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Ledger Itemized Table */}
                <div className="bg-white dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-navy-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Voucher #</th>
                          <th className="py-2.5 px-3">Partner House</th>
                          <th className="py-2.5 px-3">Hardware Item & S/N</th>
                          <th className="py-2.5 px-3 text-right">Cost (৳)</th>
                          <th className="py-2.5 px-3 text-right">Paid (৳)</th>
                          <th className="py-2.5 px-3 text-right">Due (৳)</th>
                          <th className="py-2.5 px-3">Status / Settlement Info</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {loadingLedger ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-slate-400">
                              <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1" />
                              <span>Loading ledger records...</span>
                            </td>
                          </tr>
                        ) : !ledgerData?.items || ledgerData.items.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-slate-400">
                              No transaction records found for the selected house and date range.
                            </td>
                          </tr>
                        ) : (
                          ledgerData.items.map((it: any) => (
                            <tr key={it.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-900/50">
                              <td className="py-2.5 px-3 whitespace-nowrap text-[11px] text-slate-600 dark:text-slate-400">
                                {new Date(it.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white text-[11px]">
                                {it.tracking_number}
                              </td>
                              <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                                {it.house_name}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-semibold text-slate-900 dark:text-white text-[11px]">
                                  {it.product_name}
                                </div>
                                <div className="font-mono text-[10px] text-sky-600 dark:text-cyan-400 font-bold">
                                  SN: {it.serial_number}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                ৳{Number(it.total_cost).toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                ৳{Number(it.paid_amount || 0).toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                                ৳{Number(it.due_amount).toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3">
                                {it.payment_status === 'paid' ? (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    PAID {it.paid_at ? `(${new Date(it.paid_at).toLocaleDateString()})` : ''}
                                  </span>
                                ) : it.payment_status === 'partially_paid' ? (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-100 text-sky-800 dark:bg-cyan-950 dark:text-cyan-300">
                                    PARTIAL (৳{Number(it.paid_amount).toLocaleString()} Paid)
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                    ON LEND (৳{Number(it.due_amount).toLocaleString()} Due)
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      {ledgerData?.items && ledgerData.items.length > 0 && (
                        <tfoot className="bg-slate-50 dark:bg-navy-900 border-t border-slate-200 dark:border-slate-800 font-bold">
                          <tr>
                            <td colSpan={4} className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                              Grand Total ({ledgerData.items.length} items):
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-900 dark:text-white font-black whitespace-nowrap">
                              ৳{Number(ledgerData.summary?.totalCost || 0).toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-black whitespace-nowrap">
                              ৳{Number(ledgerData.summary?.totalPaid || 0).toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right text-rose-600 dark:text-rose-400 font-black whitespace-nowrap">
                              ৳{Number(ledgerData.summary?.totalDue || 0).toLocaleString()}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>

                {/* Printable Signature Blocks */}
                <div className="pt-8 pb-4 grid grid-cols-3 gap-6 text-center text-[10px] text-slate-500 dark:text-slate-400">
                  <div>
                    <div className="border-t border-slate-300 dark:border-slate-700 pt-1 font-semibold">
                      Prepared By (Store Executive)
                    </div>
                  </div>
                  <div>
                    <div className="border-t border-slate-300 dark:border-slate-700 pt-1 font-semibold">
                      Checked & Approved (Accounts)
                    </div>
                  </div>
                  <div>
                    <div className="border-t border-slate-300 dark:border-slate-700 pt-1 font-semibold">
                      Partner House Seal & Signature
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 shrink-0 flex items-center justify-between gap-2.5 print:hidden">
              <span className="text-[11px] text-slate-400">
                Tip: Use Print Report button to save as PDF or print customer/partner copy.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLedgerModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Official Statement</span>
                </button>
              </div>
            </div>
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
