'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ShieldCheck, Search, CheckCircle2, Clock, Wrench, Truck, AlertCircle } from 'lucide-react';

export default function RmaTrackingPage() {
  const [rmaQuery, setRmaQuery] = useState('');
  const [searchedCase, setSearchedCase] = useState<any | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Sample submission form states
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [problem, setProblem] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRmaNumber, setNewRmaNumber] = useState<string | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    if (!rmaQuery.trim()) return;

    // Demo lookup
    if (rmaQuery.toUpperCase().includes('RMA') || rmaQuery.length > 3) {
      setSearchedCase({
        rma_number: rmaQuery.toUpperCase(),
        product_name: 'MSI GeForce RTX 5060 Gaming X 8GB GDDR6',
        serial_number: 'SN-MSI-5060-881923',
        status: 'diagnosis',
        technician_name: 'Engr. Tariqul Hasan',
        received_at: '2026-03-24',
        problem_description: 'Display output intermittent under heavy 3D benchmark load.',
        notes: 'Component under bench test. GPU core voltage steady; testing VRAM thermal pads.',
      });
    } else {
      setSearchedCase(null);
    }
  };

  const handleCreateRma = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const generatedRma = `RMA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setNewRmaNumber(generatedRma);
      setIsSubmitting(false);
    }, 600);
  };

  const steps = [
    { key: 'received', label: 'Received at Hub' },
    { key: 'inspection', label: 'Visual Inspection' },
    { key: 'diagnosis', label: 'Hardware Diagnosis' },
    { key: 'repair', label: 'Component Repair / Vendor' },
    { key: 'ready_for_customer', label: 'QC Passed & Ready' },
    { key: 'delivered', label: 'Returned to Customer' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-navy-950 dark:text-slate-100 font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full space-y-12">
        {/* Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-gradient-to-r dark:from-navy-900 dark:via-slate-900 dark:to-navy-900 border border-slate-200/80 dark:border-slate-800 text-center max-w-3xl mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-cyan-950 border border-sky-200 dark:border-brand-500/30 flex items-center justify-center mx-auto text-sky-600 dark:text-brand-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            CORENIX RMA & Service Center Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Track official warranty repairs, component diagnostics, and replacement status live from our Agargaon Central Service Hub.
          </p>

          {/* Tracking Input Form */}
          <form onSubmit={handleTrack} className="flex gap-2 max-w-lg mx-auto pt-2">
            <input
              type="text"
              value={rmaQuery}
              onChange={(e) => setRmaQuery(e.target.value)}
              placeholder="Enter RMA Number (e.g. RMA-2026-1042) or Phone"
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 dark:focus:border-brand-500 font-mono"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-brand-500 dark:hover:bg-brand-400 text-white dark:text-navy-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>Track</span>
            </button>
          </form>
        </div>

        {/* Search Results Display */}
        {hasSearched && searchedCase && (
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-8 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">RMA Tracking ID</span>
                <span className="text-xl font-black text-sky-600 dark:text-brand-400 font-mono">{searchedCase.rma_number}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Status</span>
                <span className="px-3 py-1 rounded-full bg-sky-50 dark:bg-cyan-950 text-sky-700 dark:text-cyan-300 border border-sky-200 dark:border-brand-500/40 text-xs font-bold uppercase tracking-wider">
                  {searchedCase.status}
                </span>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2">
              {steps.map((st, idx) => {
                const isPassed = idx <= 2;
                const isCurrent = idx === 2;
                return (
                  <div key={st.key} className="text-center space-y-2">
                    <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${
                      isCurrent
                        ? 'bg-sky-600 text-white dark:bg-brand-500 dark:text-navy-950 ring-4 ring-sky-500/20 dark:ring-brand-500/20'
                        : isPassed
                        ? 'bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-brand-400 border border-sky-200 dark:border-slate-700'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-800'
                    }`}>
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={`text-[11px] font-semibold block leading-tight ${
                      isCurrent ? 'text-sky-600 dark:text-brand-300 font-bold' : isPassed ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Hardware Information Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Product:</span>
                <span className="text-slate-900 dark:text-white font-bold">{searchedCase.product_name}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Serial Number:</span>
                <span className="text-slate-900 dark:text-white font-mono">{searchedCase.serial_number}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Assigned Technician:</span>
                <span className="text-slate-800 dark:text-white font-medium">{searchedCase.technician_name}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Reported Problem:</span>
                <span className="text-slate-700 dark:text-slate-300">{searchedCase.problem_description}</span>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block">Current Diagnostic Notes:</span>
                <p className="text-sky-700 dark:text-brand-300 font-medium mt-0.5">{searchedCase.notes}</p>
              </div>
            </div>
          </div>
        )}

        {hasSearched && !searchedCase && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 max-w-md mx-auto bg-white dark:bg-navy-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-xs">No RMA record found matching &quot;{rmaQuery}&quot;. Please verify the RMA ID from your service receipt.</p>
          </div>
        )}

        {/* Submit New Service Request Form */}
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-brand-400">Need Service?</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Submit New RMA Ticket</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You can drop off your product at Shop 1 (Uttara), Shop 2 (Dhanmondi), or courier it directly to our Agargaon RMA Hub.
            </p>
          </div>

          {newRmaNumber ? (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">RMA Ticket Created Successfully!</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Your tracking number is: <strong className="font-mono text-sky-600 dark:text-brand-400 text-sm">{newRmaNumber}</strong>
              </p>
              <button
                onClick={() => setNewRmaNumber(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs rounded-xl transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateRma} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 dark:focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 dark:focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Product Serial Number (Found on Box / Component) *</label>
                <input
                  type="text"
                  required
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="e.g. SN-MSI-5060-881923"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-sky-500 dark:focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Issue / Problem Description *</label>
                <textarea
                  required
                  rows={3}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Describe the exact fault, symptoms, and when it happens..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 dark:focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-brand-500 dark:hover:bg-brand-400 text-white dark:text-navy-950 font-bold text-xs shadow-lg shadow-sky-600/20 dark:shadow-cyan-500/20 transition-all hover:scale-102 disabled:opacity-50"
              >
                {isSubmitting ? 'Generating Ticket...' : 'Submit RMA Ticket & Reserve Hub Inspection'}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
