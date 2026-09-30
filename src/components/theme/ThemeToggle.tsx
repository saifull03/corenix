'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/60 ${className}`}></div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center relative group ${
        isDark
          ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700/60 shadow-sm'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 shadow-sm'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform group-hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform group-hover:-rotate-12 text-slate-700" />
      )}
    </button>
  );
}
