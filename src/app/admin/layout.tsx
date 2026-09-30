'use client';

import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { AdminSidebarProvider } from '@/components/admin/AdminSidebarContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
