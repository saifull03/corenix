'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { AdminSidebarProvider } from '@/components/admin/AdminSidebarContext';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function verifyAdminAccess() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (!isMounted) return;

        if (data.authenticated && data.userType === 'staff' && data.user) {
          setIsStaff(true);
          setAuthChecking(false);
        } else {
          setIsStaff(false);
          setAuthChecking(false);
          router.replace('/account?mode=login&error=admin_access_required');
        }
      } catch (err) {
        if (!isMounted) return;
        setIsStaff(false);
        setAuthChecking(false);
        router.replace('/account?mode=login&error=admin_access_required');
      }
    }

    verifyAdminAccess();
    return () => {
      isMounted = false;
    };
  }, [router]);

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-2xl">
          <RefreshCw className="w-6 h-6 text-sky-400 animate-spin" />
          <p className="text-xs font-semibold text-slate-300">Verifying Admin Access Privileges...</p>
        </div>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-rose-950/40 border border-rose-900 max-w-sm text-center">
          <ShieldAlert className="w-8 h-8 text-rose-500" />
          <h2 className="text-sm font-bold text-rose-200">Access Restricted</h2>
          <p className="text-xs text-rose-300">
            This administration portal is strictly restricted to authorized CORENIX staff members. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminSidebarProvider>
      <div className="min-h-screen flex bg-slate-50 text-slate-800 dark:bg-navy-950 dark:text-slate-100 font-sans transition-colors duration-200">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
          <AdminHeader />
          <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminSidebarProvider>
  );
}
