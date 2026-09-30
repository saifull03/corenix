'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';

interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  image_url: string;
  link_url: string;
  button_text?: string;
  cta2_text?: string;
  cta2_link?: string;
  badge_text?: string;
  text_color?: string;
  position: string;
  order_index: number;
  is_active: boolean;
}

interface HeroSliderProps {
  initialBanners?: Banner[];
}

export default function HeroSlider({ initialBanners = [] }: HeroSliderProps) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const SLIDE_DURATION = 5500;

  // Fetch if no initial banners
  useEffect(() => {
    if (initialBanners.length === 0) {
      fetch('/api/admin/banners?position=hero&active=true')
        .then(r => r.json())
        .then(d => {
          if (d.success && d.banners.length > 0) setBanners(d.banners);
        })
        .catch(() => {});
    }
  }, [initialBanners.length]);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning || banners.length <= 1) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrent(index);
        setIsTransitioning(false);
      }, 400);
    },
    [isTransitioning, banners.length]
  );

  const next = useCallback(() => {
    goTo((current + 1) % banners.length);
  }, [current, banners.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + banners.length) % banners.length);
  }, [current, banners.length, goTo]);

  // Auto-advance timer
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    progressRef.current = setTimeout(next, SLIDE_DURATION);
    return () => {
      if (progressRef.current) clearTimeout(progressRef.current);
    };
  }, [current, isPaused, banners.length, next]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev]);

  // Touch/swipe support
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const delta = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) delta > 0 ? next() : prev();
    setTouchStart(null);
  };

  if (banners.length === 0) return null;

  const banner = banners[current];

  return (
    <div
      className="relative overflow-hidden w-full"
      style={{ minHeight: '480px' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Hero banner carousel"
    >
      {/* Slides */}
      {banners.map((b, i) => (
        <div
          key={b.id}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 2 : 1 }}
          aria-hidden={i !== current}
        >
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
            style={{
              backgroundImage: `url(${b.image_url})`,
              transition: 'transform 8s ease-out',
              transform: i === current ? 'scale(1)' : 'scale(1.05)',
            }}
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent dark:from-black/85 dark:via-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 flex items-center" style={{ minHeight: '480px' }}>
        <div
          className="max-w-2xl"
          style={{
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? 'translateY(12px)' : 'translateY(0)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}
        >
          {/* Badge */}
          {banner.badge_text && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold mb-5"
              style={{ backgroundColor: 'rgba(56, 189, 248, 0.2)', borderColor: 'rgba(56, 189, 248, 0.4)', color: '#BAE6FD' }}>
              <Sparkles className="w-3.5 h-3.5 text-sky-300" />
              <span>{banner.badge_text}</span>
            </div>
          )}

          {/* Title */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-4"
            style={{
              color: '#ffffff',
              textShadow: '0 2px 24px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.9)',
            }}
          >
            {banner.title}
          </h1>

          {/* Subtitle */}
          {banner.subtitle && (
            <div className="flex items-center gap-3 mb-3">
              <span
                className="inline-block w-1 h-6 rounded-full flex-shrink-0"
                style={{ background: 'linear-gradient(180deg, #38bdf8, #818cf8)', boxShadow: '0 0 8px rgba(56,189,248,0.6)' }}
              />
              <p
                className="font-bold text-base sm:text-lg"
                style={{
                  color: '#ffffff',
                  textShadow: '0 0 16px rgba(56,189,248,0.5), 0 1px 4px rgba(0,0,0,0.8)',
                  letterSpacing: '0.01em',
                }}
              >
                {banner.subtitle}
              </p>
            </div>
          )}

          {/* Description */}
          {banner.description && (
            <p
              className="text-sm sm:text-base leading-relaxed mb-6 max-w-xl"
              style={{
                color: 'rgba(255,255,255,0.92)',
                textShadow: '0 1px 6px rgba(0,0,0,0.8)',
              }}
            >
              {banner.description}
            </p>
          )}

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <Link
              href={banner.link_url}
              className="px-6 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-navy-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-sky-500/30 transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>{banner.button_text || 'Shop Now'}</span>
            </Link>

            {banner.cta2_text && banner.cta2_link && (
              <Link
                href={banner.cta2_link}
                className="px-6 py-3.5 rounded-2xl border border-white/30 text-white font-bold text-sm hover:bg-white/10 flex items-center gap-2 transition-all backdrop-blur-sm"
              >
                <span>{banner.cta2_text}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Nav Arrows (only if multiple banners) */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110 focus:outline-none"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110 focus:outline-none"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dot indicators + progress bar */}
      {banners.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="relative overflow-hidden transition-all duration-300 focus:outline-none"
              style={{
                height: '4px',
                width: i === current ? '32px' : '16px',
                borderRadius: '2px',
                backgroundColor: i === current ? '#38BDF8' : 'rgba(255,255,255,0.4)',
              }}
              aria-label={`Go to slide ${i + 1}`}
            >
              {i === current && !isPaused && (
                <span
                  className="absolute inset-y-0 left-0 bg-white/50 rounded"
                  style={{
                    animation: `slideProgress ${SLIDE_DURATION}ms linear forwards`,
                    width: '100%',
                  }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Slide counter */}
      {banners.length > 1 && (
        <div className="absolute top-5 right-6 z-20 text-white/70 text-xs font-mono font-semibold">
          {String(current + 1).padStart(2, '0')} / {String(banners.length).padStart(2, '0')}
        </div>
      )}

      {/* CSS for progress animation */}
      <style jsx>{`
        @keyframes slideProgress {
          from { transform: scaleX(0); transform-origin: left; }
          to   { transform: scaleX(1); transform-origin: left; }
        }
      `}</style>
    </div>
  );
}
