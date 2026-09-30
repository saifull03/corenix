import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { MapPin, Phone, Mail, Clock, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Showroom Branches & Service Hubs | CORENIX Bangladesh',
  description: 'Visit CORENIX physical showroom stores in Uttara (Shop 1), Dhanmondi (Shop 2), and our central RMA Service Hub in Agargaon.',
};

export default function StoresPage() {
  const locations = [
    {
      name: 'Shop 1: Uttara Flagship Showroom',
      type: 'Retail Showroom & Live PC Builder Lab',
      badge: 'Flagship Store',
      address: 'Plot 12, Sector 3, Uttara Model Town, Dhaka-1230',
      phone: '+880 1700-000002',
      email: 'uttara@corenix.com.bd',
      hours: 'Saturday - Thursday: 10:00 AM - 9:00 PM (Friday Closed)',
      services: ['Instant In-Store Pickup', 'Custom PC Assembly on Desk', 'Credit Card 0% EMI POS', 'Hardware Diagnostics']
    },
    {
      name: 'Shop 2: Dhanmondi Branch',
      type: 'Retail Showroom & Display Wall',
      badge: 'South Branch',
      address: 'House 48, Road 27 (Old), Dhanmondi, Dhaka-1209',
      phone: '+880 1700-000003',
      email: 'dhanmondi@corenix.com.bd',
      hours: 'Saturday - Thursday: 10:00 AM - 9:00 PM (Tuesday Closed)',
      services: ['Instant In-Store Pickup', 'Gaming Laptop Lounge', 'Monitor Side-by-Side Comparison', 'Card / bKash POS']
    },
    {
      name: 'Central Distribution Warehouse',
      type: 'Enterprise Inventory & Bulk Logistics Hub',
      badge: 'Central Hub',
      address: 'Plot 42, Tejgaon Industrial Area, Dhaka-1208',
      phone: '+880 1700-000001',
      email: 'warehouse@corenix.com.bd',
      hours: 'Sunday - Thursday: 9:00 AM - 6:00 PM',
      services: ['Supplier Procurement Receiving', 'Inter-Branch Stock Dispatch', 'Nationwide Courier Sorting', 'Corporate Quotation Deliveries']
    },
    {
      name: 'CORENIX RMA & Warranty Service Hub',
      type: 'Component SMD Diagnostics & Certified Repair',
      badge: 'Dedicated Service Hub',
      address: 'Level 4, IT Plaza, Agargaon, Dhaka-1207',
      phone: '+880 1700-000004',
      email: 'rma@corenix.com.bd',
      hours: 'Saturday - Thursday: 10:00 AM - 7:00 PM',
      services: ['Official Manufacturer Warranty Claims', 'SMD Level Micro-Soldering', 'GPU & Motherboard Bench Tests', 'Vendor RMA Escalations']
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Physical Store Network
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            CORENIX Showrooms & Service Hubs
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Experience premium hardware in person. Pick up online orders with zero shipping fee, consult our PC building engineers, or drop off hardware for official warranty diagnostics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {locations.map((loc, i) => (
            <div key={i} className="p-6 sm:p-8 rounded-3xl bg-navy-900 border border-slate-800 space-y-5 hover:border-brand-500/50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-brand-500/30 text-xs font-bold">
                  {loc.badge}
                </span>
                <span className="text-xs text-slate-400">{loc.type}</span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">{loc.name}</h3>
                <p className="text-xs text-slate-300 mt-2 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                  <span>{loc.address}</span>
                </p>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-800 pt-4 text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-brand-400" />
                  <span>Hotline: <strong className="text-white">{loc.phone}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-brand-400" />
                  <span>{loc.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-brand-400" />
                  <span>{loc.hours}</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400 block mb-2">
                  Branch Services:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                  {loc.services.map((srv, si) => (
                    <div key={si} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
                      <span>{srv}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
