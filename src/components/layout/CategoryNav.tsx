'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { MEGA_CATEGORIES, SubCategory } from '@/lib/categories-data';

export default function CategoryNav() {
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);
  const [activeSubSlug, setActiveSubSlug] = useState<string | null>(null);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  const handleCategoryHover = (slug: string) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setActiveCategorySlug(slug);
    // Initially null: only show flyout when cursor is placed on a specific item with children
    setActiveSubSlug(null);
  };

  const handleMouseLeaveNav = () => {
    leaveTimerRef.current = setTimeout(() => {
      setActiveCategorySlug(null);
      setActiveSubSlug(null);
    }, 180);
  };

  const handleSubHover = (sub: SubCategory) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    if (sub.children && sub.children.length > 0) {
      setActiveSubSlug(sub.slug);
    } else {
      setActiveSubSlug(null);
    }
  };

  const closeAll = () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    setActiveCategorySlug(null);
    setActiveSubSlug(null);
  };

  const activeCategory = MEGA_CATEGORIES.find((c) => c.slug === activeCategorySlug);
  const allCurrentSubs = activeCategory
    ? activeCategory.columns
      ? activeCategory.columns.flat()
      : activeCategory.items || []
    : [];
  const activeSub = allCurrentSubs.find((s) => s.slug === activeSubSlug);

  return (
    <nav
      className="relative z-40 bg-white dark:bg-navy-950 border-t border-b border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hidden lg:block select-none"
      onMouseLeave={handleMouseLeaveNav}
    >
      <div className="max-w-[1440px] mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Top-Level Categories Horizontal Strip */}
          <ul className="flex items-center gap-1 xl:gap-2.5 overflow-visible py-1">
            {MEGA_CATEGORIES.map((cat, idx) => {
              const isActive = activeCategorySlug === cat.slug;
              const isRightSide = idx >= MEGA_CATEGORIES.length - 3;

              return (
                <li
                  key={cat.slug}
                  className="relative group flex-shrink-0"
                  onMouseEnter={() => handleCategoryHover(cat.slug)}
                >
                  <Link
                    href={`/category/${cat.slug}`}
                    onClick={closeAll}
                    className={`inline-flex items-center px-2 py-2 text-[13px] font-semibold tracking-tight transition-colors duration-150 ${
                      isActive
                        ? 'text-red-600 dark:text-red-400 font-bold'
                        : 'text-slate-800 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400'
                    }`}
                  >
                    <span>{cat.name}</span>
                  </Link>

                  {/* Active Indicator Underline */}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-red-600 dark:bg-red-500 rounded-full" />
                  )}

                  {/* Dropdown Menu attached directly beneath this category */}
                  {isActive && (
                    <div
                      className={`absolute top-full z-50 pt-1 pointer-events-auto ${
                        isRightSide ? 'right-0' : 'left-0'
                      }`}
                      onMouseEnter={() => {
                        if (leaveTimerRef.current) {
                          clearTimeout(leaveTimerRef.current);
                          leaveTimerRef.current = null;
                        }
                      }}
                    >
                      <div
                        className={`bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-b-xl shadow-2xl flex relative overflow-visible ${
                          isRightSide ? 'flex-row-reverse divide-x-reverse' : 'flex-row'
                        } divide-x divide-slate-100 dark:divide-slate-800`}
                      >
                        {/* ========================================================= */}
                        {/* Case 1: Multi-Column Menu (e.g. Accessories - 2 Columns)  */}
                        {/* ========================================================= */}
                        {cat.isMultiColumn && cat.columns ? (
                          <>
                            {cat.columns.map((col, colIdx) => (
                              <div key={colIdx} className="w-[230px] p-2 flex flex-col gap-0.5">
                                {col.map((item) => {
                                  const isCurrentSub = activeSubSlug === item.slug;
                                  const hasChildren = item.children && item.children.length > 0;
                                  return (
                                    <div
                                      key={item.slug}
                                      onMouseEnter={() => handleSubHover(item)}
                                    >
                                      <Link
                                        href={`/category/${item.slug}`}
                                        onClick={closeAll}
                                        className={`flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] transition-colors leading-tight ${
                                          isCurrentSub
                                            ? 'bg-slate-100/90 dark:bg-slate-800/90 text-red-600 dark:text-red-400 font-semibold'
                                            : 'text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        }`}
                                      >
                                        <span className="truncate pr-2">{item.name}</span>
                                        {hasChildren && (
                                          <svg
                                            className={`w-2.5 h-2.5 flex-shrink-0 transition-transform ${
                                              isCurrentSub
                                                ? 'text-red-600 fill-red-600'
                                                : 'text-slate-400 fill-slate-400'
                                            }`}
                                            viewBox="0 0 6 10"
                                          >
                                            <polygon points="0,0 6,5 0,10" />
                                          </svg>
                                        )}
                                      </Link>
                                    </div>
                                  );
                                })}
                              </div>
                            ))}

                            {/* Level-3 Submenu for Accessories (Whole list displayed, NO box scroll) */}
                            {activeSub && activeSub.children && activeSub.children.length > 0 && (
                              <div className="w-[245px] p-2.5 bg-slate-50/90 dark:bg-navy-950/80 flex flex-col gap-1 rounded-br-xl">
                                <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/60 dark:border-slate-800/80 mb-1 flex items-center justify-between">
                                  <span className="truncate max-w-[160px]">{activeSub.name}</span>
                                  <Link
                                    href={`/category/${activeSub.slug}`}
                                    onClick={closeAll}
                                    className="text-[11px] text-red-600 hover:underline lowercase font-medium"
                                  >
                                    all
                                  </Link>
                                </div>
                                {/* Whole list displayed openly without box scroll */}
                                <div className="space-y-0.5">
                                  {activeSub.children.map((child) => (
                                    <Link
                                      key={child.slug}
                                      href={`/category/${child.slug}`}
                                      onClick={closeAll}
                                      className="block px-3 py-1.5 rounded-md text-[12.5px] text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                                    >
                                      {child.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          /* ========================================================= */
                          /* Case 2: Single Column Menu (e.g. Components, Desktop, etc) */
                          /* ========================================================= */
                          <>
                            {/* Main Subcategories List (Whole list displayed, NO box scroll) */}
                            <div className="w-[230px] p-2 flex flex-col gap-0.5">
                              {cat.items?.map((item) => {
                                const isCurrentSub = activeSubSlug === item.slug;
                                const hasChildren = item.children && item.children.length > 0;
                                return (
                                  <div
                                    key={item.slug}
                                    onMouseEnter={() => handleSubHover(item)}
                                  >
                                    <Link
                                      href={`/category/${item.slug}`}
                                      onClick={closeAll}
                                      className={`flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] transition-colors leading-tight ${
                                        isCurrentSub
                                          ? 'bg-slate-100/90 dark:bg-slate-800/90 text-red-600 dark:text-red-400 font-semibold'
                                          : 'text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                      }`}
                                    >
                                      <span className="truncate pr-2">{item.name}</span>
                                      {hasChildren && (
                                        <svg
                                          className={`w-2.5 h-2.5 flex-shrink-0 transition-transform ${
                                            isCurrentSub
                                              ? 'text-red-600 fill-red-600'
                                              : 'text-slate-400 fill-slate-400'
                                          }`}
                                          viewBox="0 0 6 10"
                                        >
                                          <polygon points="0,0 6,5 0,10" />
                                        </svg>
                                      )}
                                    </Link>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Level-3 Submenu (Whole list displayed openly, NO box scroll) */}
                            {activeSub && activeSub.children && activeSub.children.length > 0 && (
                              <div className="w-[245px] p-2.5 bg-slate-50/90 dark:bg-navy-950/80 flex flex-col gap-1 rounded-br-xl">
                                <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/60 dark:border-slate-800/80 mb-1 flex items-center justify-between">
                                  <span className="truncate max-w-[160px]">{activeSub.name}</span>
                                  <Link
                                    href={`/category/${activeSub.slug}`}
                                    onClick={closeAll}
                                    className="text-[11px] text-red-600 hover:underline lowercase font-medium"
                                  >
                                    all
                                  </Link>
                                </div>
                                {/* Whole list displayed openly without box scroll */}
                                <div className="space-y-0.5">
                                  {activeSub.children.map((child) => (
                                    <Link
                                      key={child.slug}
                                      href={`/category/${child.slug}`}
                                      onClick={closeAll}
                                      className="block px-3 py-1.5 rounded-md text-[12.5px] text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                                    >
                                      {child.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Quick link highlight: Offers on the right */}
          <Link
            href="/offers"
            className="flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 border border-amber-200/80 dark:border-amber-800/80 whitespace-nowrap transition-colors flex-shrink-0 ml-3"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>OFFERS</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
