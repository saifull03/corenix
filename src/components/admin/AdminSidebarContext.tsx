'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminSidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;
}

const AdminSidebarContext = createContext<AdminSidebarContextType>({
  isCollapsed: false,
  setIsCollapsed: () => {},
  isMobileOpen: false,
  setIsMobileOpen: () => {},
  toggleSidebar: () => {},
});

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Load saved desktop sidebar state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('corenix_admin_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch (e) {}
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(prev => !prev);
    } else {
      setIsCollapsed(prev => {
        const next = !prev;
        try {
          localStorage.setItem('corenix_admin_sidebar_collapsed', String(next));
        } catch (e) {}
        return next;
      });
    }
  };

  return (
    <AdminSidebarContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        isMobileOpen,
        setIsMobileOpen,
        toggleSidebar,
      }}
    >
      {children}
    </AdminSidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  return useContext(AdminSidebarContext);
}
