import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { HeroBanner, AppConfig } from '../types';

interface HeroBannerCarouselProps {
  banners: HeroBanner[];
  config: AppConfig;
  onSelectCategory: (catName: string) => void;
  isDarkMode?: boolean;
}

export const HeroBannerCarousel: React.FC<HeroBannerCarouselProps> = ({
  banners = [],
  config,
  onSelectCategory,
  isDarkMode = false,
}) => {
  const activeBanners = banners.filter((b) => b.active);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // If no banners active, fallback to single default
  const displayList = activeBanners.length > 0 ? activeBanners : [
    {
      id: 'default-fallback',
      badge: 'WHOLESALE PRICES',
      title: 'Stay Refreshed With Top Beverages',
      subtitle: `Free delivery on bulk carton orders over ${config.freeDeliveryThreshold.toFixed(3)} ${config.currency}`,
      buttonText: 'Shop Drinks',
      targetCategory: 'Drinks & Water',
      imgUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=1200&auto=format&fit=crop&q=80',
      active: true,
      aspectRatio: '16:7' as const,
    }
  ];

  // 30 Seconds Auto-Rotation (As strictly requested by user: "একটার পর একটা একটা ৩০ সেকেন্ড পর পর যেন চেঞ্জ হয়")
  useEffect(() => {
    if (displayList.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayList.length);
    }, 30000); // 30 seconds

    return () => clearInterval(timer);
  }, [displayList.length, isPaused]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      // Swiped left -> next
      setCurrentIndex((prev) => (prev + 1) % displayList.length);
    } else if (diff < -40) {
      // Swiped right -> prev
      setCurrentIndex((prev) => (prev - 1 + displayList.length) % displayList.length);
    }
    touchStartX.current = null;
  };

  const currentBanner = displayList[currentIndex] || displayList[0];

  return (
    <div 
      className="px-3 pt-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="rounded-2xl relative overflow-hidden shadow-md flex items-center min-h-[145px] sm:min-h-[160px] transition-all duration-300 group"
        style={{
          aspectRatio: currentBanner.aspectRatio === '16:7' ? '16/7' : currentBanner.aspectRatio === '16:9' ? '16/9' : '21/9',
          background: currentBanner.bgColor || `linear-gradient(135deg, ${config.customColor} 0%, #042f2e 100%)`,
        }}
      >
        {/* Background Image with Object Cover */}
        {currentBanner.imgUrl && (
          <img
            src={currentBanner.imgUrl}
            alt={currentBanner.title}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            loading="lazy"
          />
        )}

        {/* Dynamic Dark Gradient Overlay for Maximum Text Contrast */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.65) 55%, rgba(0,0,0,0.2) 100%)',
          }}
        />

        {/* Banner Content (Headline, Subtitle, Badge, CTA) */}
        <div className="relative z-10 p-3.5 sm:p-4 max-w-[70%] space-y-1 text-white select-none">
          <span className="inline-block bg-white/20 text-white font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs shadow-xs">
            {currentBanner.badge || 'WHOLESALE PRICES'}
          </span>

          <h3 className="font-black text-sm sm:text-base leading-tight drop-shadow-sm line-clamp-2">
            {currentBanner.title}
          </h3>

          <p className="text-[10.5px] sm:text-[11px] text-white/90 leading-tight line-clamp-2 drop-shadow-xs">
            {currentBanner.subtitle || `Free delivery on bulk carton orders over ${config.freeDeliveryThreshold.toFixed(3)} ${config.currency}`}
          </p>

          <div className="pt-1">
            <button
              onClick={() => {
                if (currentBanner.targetCategory) {
                  onSelectCategory(currentBanner.targetCategory);
                }
              }}
              className="font-black px-3 py-1.5 rounded-xl text-xs shadow-md active:scale-95 transition-all hover:brightness-110"
              style={{
                backgroundColor: currentBanner.buttonBgColor || '#fbbf24',
                color: currentBanner.buttonTextColor || '#042f2e',
              }}
            >
              {currentBanner.buttonText || 'Shop Drinks'}
            </button>
          </div>
        </div>

        {/* Left / Right Arrow Controls (Visible on hover or mobile tap) */}
        {displayList.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => (prev - 1 + displayList.length) % displayList.length);
              }}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-opacity opacity-75 group-hover:opacity-100 z-20"
              aria-label="Previous slide"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => (prev + 1) % displayList.length);
              }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-opacity opacity-75 group-hover:opacity-100 z-20"
              aria-label="Next slide"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Indicator Dots & 30s Countdown Dot */}
        {displayList.length > 1 && (
          <div className="absolute bottom-2 right-3 z-20 flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
            {displayList.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`transition-all rounded-full ${
                  currentIndex === i ? 'w-4 h-1.5 bg-amber-400' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
