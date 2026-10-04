import React, { useState, useEffect } from 'react';
import { 
  Menu, Search, ShoppingCart, Bell, ArrowLeft, 
  SlidersHorizontal, Sparkles, RefreshCw, Sun, Moon,
  X, Megaphone 
} from 'lucide-react';
import { AppConfig, AppNotification } from '../types';
import { ShukranFoodLogo } from './ShukranFoodLogo';

interface HeaderProps {
  config: AppConfig;
  cartCount: number;
  currentScreen: string;
  currentTab?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenMenu: () => void;
  onOpenCart: () => void;
  onGoHome: () => void;
  onOpenAdmin: () => void;
  onOpenFilters?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  notifications?: AppNotification[];
  onSelectCategory?: (category: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  cartCount,
  currentScreen,
  currentTab = 'home',
  searchQuery,
  onSearchChange,
  onOpenMenu,
  onOpenCart,
  onGoHome,
  onOpenAdmin,
  onOpenFilters,
  onRefresh,
  isRefreshing = false,
  isDarkMode = false,
  onToggleTheme,
  notifications,
  onSelectCategory,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [topOfferIndex, setTopOfferIndex] = useState(0);
  const [isTopOfferDismissed, setIsTopOfferDismissed] = useState(false);

  // Active notifications list
  const notifList = notifications || config.notifications || [];
  const activeList = notifList.filter((n) => n.active);
  const topBarOffers = activeList.filter((n) => n.showInTopBar);

  // Auto cycle top bar offers every 7 seconds if multiple
  useEffect(() => {
    if (topBarOffers.length <= 1) return;
    const timer = setInterval(() => {
      setTopOfferIndex((prev) => (prev + 1) % topBarOffers.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [topBarOffers.length]);

  const canGoBack = currentScreen !== 'home' || currentTab !== 'home' || Boolean(searchQuery);

  return (
    <header
      className="sticky top-0 z-30 shadow-md text-white transition-colors duration-200"
      style={{ backgroundColor: config.customColor }}
    >
      {/* 1. TOP OFFER / NOTIFICATION TICKER BAR */}
      {topBarOffers.length > 0 && !isTopOfferDismissed && (
        <div className="bg-amber-400 text-teal-950 px-3 py-1 text-xs font-semibold flex items-center justify-between shadow-inner transition-all select-none">
          <div 
            onClick={() => {
              const currentOffer = topBarOffers[topOfferIndex] || topBarOffers[0];
              if (currentOffer?.targetCategory && onSelectCategory) {
                onSelectCategory(currentOffer.targetCategory);
              }
            }}
            className="flex items-center gap-1.5 flex-1 overflow-hidden cursor-pointer"
          >
            <span className="bg-teal-950 text-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Megaphone size={10} />
              <span>{(topBarOffers[topOfferIndex] || topBarOffers[0])?.topBarBadge || 'OFFER'}</span>
            </span>
            <span className="truncate text-[11px] font-bold">
              {(topBarOffers[topOfferIndex] || topBarOffers[0])?.title}:{' '}
              <span className="font-normal opacity-90">
                {(topBarOffers[topOfferIndex] || topBarOffers[0])?.desc}
              </span>
            </span>
            {(topBarOffers[topOfferIndex] || topBarOffers[0])?.targetCategory && (
              <span className="text-[10px] font-extrabold underline shrink-0 hidden sm:inline ml-1">
                Shop Now &rarr;
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {topBarOffers.length > 1 && (
              <div className="flex gap-1 items-center">
                {topBarOffers.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTopOfferIndex(i);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      topOfferIndex === i ? 'bg-teal-950 w-3' : 'bg-teal-950/40'
                    }`}
                    aria-label={`Offer ${i + 1}`}
                  />
                ))}
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsTopOfferDismissed(true);
              }}
              className="p-0.5 hover:bg-black/10 rounded text-teal-950/70 hover:text-teal-950"
              title="Dismiss notification"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Top Main Navigation Row */}
      <div className="max-w-md mx-auto px-3.5 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Universal Back button or Drawer Menu */}
          {canGoBack ? (
            <button
              onClick={onGoHome}
              aria-label="Back to home"
              className="p-1.5 rounded-full hover:bg-black/15 active:scale-95 transition-all text-white flex items-center gap-1"
              title="Return to home feed"
            >
              <ArrowLeft size={22} />
              <span className="text-xs font-bold hidden sm:inline">Back</span>
            </button>
          ) : (
            <button
              onClick={onOpenMenu}
              aria-label="Open navigation menu"
              className="p-1.5 rounded-full hover:bg-black/15 active:scale-95 transition-all text-white"
            >
              <Menu size={22} />
            </button>
          )}

          <div
            onClick={onGoHome}
            className="cursor-pointer flex items-center gap-1.5 select-none"
          >
            {config.logoUrl ? (
              <img src={config.logoUrl} alt={config.name} className="h-7 max-w-[120px] object-contain" />
            ) : (
              <ShukranFoodLogo variant="header" />
            )}
          </div>
        </div>

        {/* Right Action Icons: Refresh, Theme Toggle, Notification, Cart */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              aria-label="Refresh Store Catalog"
              className="p-2 rounded-full hover:bg-black/15 active:scale-95 transition-all text-white"
              title="Refresh storefront catalog and data"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          )}

          {/* Theme Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              aria-label="Toggle Dark / Light Theme"
              className="p-2 rounded-full hover:bg-black/15 active:scale-95 transition-all text-white"
              title={isDarkMode ? 'Switch to Clean White Mode' : 'Switch to Obsidian Dark Mode'}
            >
              {isDarkMode ? <Sun size={19} className="text-amber-300" /> : <Moon size={19} />}
            </button>
          )}

          {/* Notifications Bell with Dynamic Counter */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
              className="p-2 rounded-full hover:bg-black/15 active:scale-95 transition-all text-white relative"
              title="View Offers & Notifications"
            >
              <Bell size={19} />
              {activeList.length > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-amber-400 text-teal-950 font-black text-[9.5px] rounded-full flex items-center justify-center ring-2 ring-teal-800 shadow-sm">
                  {activeList.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 top-11 w-80 max-w-[92vw] bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 text-slate-800 z-50 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Bell size={14} className="text-teal-700" />
                    <h4 className="font-bold text-xs text-slate-900">Wholesale Offers & Notices</h4>
                  </div>
                  <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    {activeList.length} Available
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
                  {activeList.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 italic">
                      No active offers right now. Check back soon!
                    </div>
                  ) : (
                    activeList.map((n) => (
                      <div 
                        key={n.id}
                        onClick={() => {
                          if (n.targetCategory && onSelectCategory) {
                            onSelectCategory(n.targetCategory);
                            setShowNotifications(false);
                          }
                        }}
                        className={`p-2.5 bg-slate-50 hover:bg-teal-50/70 border border-slate-200/80 rounded-xl transition-all cursor-pointer group ${
                          n.targetCategory ? 'hover:border-teal-300' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                            {n.tag || '🏷️ OFFER'}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">{n.time}</span>
                        </div>
                        <p className="font-bold text-xs text-slate-800 group-hover:text-teal-900 leading-snug">
                          {n.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          {n.desc}
                        </p>
                        {n.targetCategory && (
                          <div className="mt-1.5 flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-teal-700 font-bold">
                            <span>Category: {n.targetCategory}</span>
                            <span className="group-hover:translate-x-0.5 transition-transform">Tap to Shop &rarr;</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2 text-xs">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onOpenAdmin();
                    }}
                    className="text-[11px] text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
                  >
                    <span>Manage in Admin &rarr;</span>
                  </button>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold px-2 py-0.5 rounded hover:bg-slate-100"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cart Icon with Live Badge Counter */}
          <button
            onClick={onOpenCart}
            aria-label="View Cart"
            className="p-2 rounded-full hover:bg-black/15 active:scale-95 transition-all text-white relative"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-amber-400 text-teal-950 font-black text-[10px] rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Integrated Search Bar inside Header matching the Tamween video layout */}
      {currentScreen === 'home' && (
        <div className="max-w-md mx-auto px-3.5 pb-2.5">
          <div className="relative flex items-center bg-white rounded-xl shadow-inner overflow-hidden">
            <Search className="absolute left-3 text-slate-400 pointer-events-none" size={17} />
            <input
              type="text"
              placeholder="Search here... (e.g. Kinza, Oman Chips, Loyal)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full py-2 pl-9 pr-10 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            {onOpenFilters && (
              <button
                onClick={onOpenFilters}
                aria-label="Filter products"
                className="p-2 text-slate-400 hover:text-slate-700 active:scale-95 transition-colors"
              >
                <SlidersHorizontal size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
