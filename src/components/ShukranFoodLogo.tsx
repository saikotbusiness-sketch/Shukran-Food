import React from 'react';

interface ShukranFoodLogoProps {
  variant?: 'header' | 'splash' | 'auth' | 'invoice' | 'icon';
  className?: string;
  showSubtitle?: boolean;
  isDark?: boolean;
}

export const ShukranFoodLogo: React.FC<ShukranFoodLogoProps> = ({
  variant = 'header',
  className = '',
  showSubtitle = true,
  isDark = false,
}) => {
  if (variant === 'icon') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-700 via-emerald-600 to-amber-500 p-0.5 shadow-md flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-6 h-6 text-amber-400 fill-current" xmlns="http://www.w3.org/2000/svg">
              {/* Cloche / Bowl & Steam Leaf */}
              <path d="M50 20 C48 20 46 18 46 15 C46 12 50 8 50 8 C50 8 54 12 54 15 C54 18 52 20 50 20 Z" fill="#f59e0b" />
              <path d="M22 55 C22 36 34 26 50 26 C66 26 78 36 78 55 Z" fill="#10b981" opacity="0.9" />
              <rect x="18" y="56" width="64" height="6" rx="3" fill="#f59e0b" />
              <path d="M30 68 C35 78 65 78 70 68" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" fill="none" />
              {/* Little fork & spoon */}
              <circle cx="43" cy="44" r="3" fill="#ffffff" />
              <circle cx="57" cy="44" r="3" fill="#ffffff" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'splash') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {/* Animated Glowing Ring & Emblem */}
        <div className="relative mb-5 group">
          <div className="absolute -inset-3 bg-gradient-to-r from-amber-400 via-emerald-500 to-teal-400 rounded-full blur-xl opacity-75 animate-pulse"></div>
          
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-slate-900 via-teal-950 to-emerald-900 border-2 border-amber-400/80 p-3 shadow-2xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
            <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fde047" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>

              {/* Cloche Dome */}
              <path d="M50 16 C47 16 45 13 45 10 C45 7 50 3 50 3 C50 3 55 7 55 10 C55 13 53 16 50 16 Z" fill="url(#goldGrad)" />
              <path d="M20 54 C20 34 33 22 50 22 C67 22 80 34 80 54 Z" fill="url(#emeraldGrad)" />
              
              {/* Cloche Plate Rim */}
              <rect x="15" y="55" width="70" height="7" rx="3.5" fill="url(#goldGrad)" />

              {/* Steam aroma & fork/spoon details */}
              <path d="M40 36 Q42 30 40 25" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
              <path d="M50 34 Q52 28 50 24" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9" />
              <path d="M60 36 Q62 30 60 25" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />

              {/* Serving Bowl Base */}
              <path d="M25 66 C32 82 68 82 75 66" stroke="url(#goldGrad)" strokeWidth="5" strokeLinecap="round" fill="none" />
              <circle cx="50" cy="74" r="3" fill="#fde047" />
            </svg>
          </div>
        </div>

        {/* Brand Typography */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2 drop-shadow-md">
            <span>Shukran</span>
            <span className="text-amber-400 font-extrabold">Food</span>
          </h1>

          <div className="flex items-center justify-center gap-2 text-sm font-bold text-amber-300/90 tracking-wide">
            <span className="w-4 h-0.5 bg-amber-400/50 rounded-full"></span>
            <span className="font-semibold text-base text-amber-200">শুক্রান ফুড</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span className="text-emerald-300 font-medium text-xs">شكراً فود</span>
            <span className="w-4 h-0.5 bg-amber-400/50 rounded-full"></span>
          </div>

          {showSubtitle && (
            <p className="text-xs sm:text-sm text-emerald-100/80 font-medium max-w-xs mx-auto pt-1">
              Fresh Wholesale & Food Supplies • তাজা ও পাইকারি খাদ্য সরবরাহ
            </p>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'auth') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-800 via-emerald-700 to-amber-500 p-0.5 shadow-lg mb-2">
          <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 16 C47 16 45 13 45 10 C45 7 50 3 50 3 C50 3 55 7 55 10 C55 13 53 16 50 16 Z" fill="#f59e0b" />
              <path d="M20 54 C20 34 33 22 50 22 C67 22 80 34 80 54 Z" fill="#10b981" />
              <rect x="15" y="55" width="70" height="7" rx="3.5" fill="#f59e0b" />
              <path d="M26 66 C33 80 67 80 74 66" stroke="#f59e0b" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center justify-center gap-1.5">
          <span>Shukran</span>
          <span className="text-amber-500 font-extrabold">Food</span>
        </h2>
        <p className="text-xs font-bold text-teal-800 flex items-center justify-center gap-1.5 mt-0.5">
          <span>শুক্রান ফুড</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-medium">Global Login & Register</span>
        </p>
      </div>
    );
  }

  if (variant === 'invoice') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <div className="w-12 h-12 rounded-xl bg-teal-800 p-1 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 100 100" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 16 C47 16 45 13 45 10 C45 7 50 3 50 3 C50 3 55 7 55 10 C55 13 53 16 50 16 Z" fill="#f59e0b" />
            <path d="M20 54 C20 34 33 22 50 22 C67 22 80 34 80 54 Z" fill="#34d399" />
            <rect x="15" y="55" width="70" height="7" rx="3.5" fill="#f59e0b" />
            <path d="M26 66 C33 80 67 80 74 66" stroke="#f59e0b" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-1.5 font-black text-lg text-slate-900 leading-none">
            <span>SHUKRAN</span>
            <span className="text-amber-600">FOOD</span>
          </div>
          <p className="text-[10px] font-bold text-teal-800 uppercase tracking-wider mt-0.5">
            শুক্রান ফুড • WHOLESALE SUPPLIES
          </p>
        </div>
      </div>
    );
  }

  // Default: variant === 'header'
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-900 to-emerald-700 border border-amber-400/60 p-1 flex items-center justify-center shrink-0 shadow-xs">
        <svg viewBox="0 0 100 100" className="w-5 h-5 text-amber-300" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 16 C47 16 45 13 45 10 C45 7 50 3 50 3 C50 3 55 7 55 10 C55 13 53 16 50 16 Z" fill="#f59e0b" />
          <path d="M20 54 C20 34 33 22 50 22 C67 22 80 34 80 54 Z" fill="#34d399" />
          <rect x="15" y="55" width="70" height="7" rx="3.5" fill="#f59e0b" />
          <path d="M26 66 C33 80 67 80 74 66" stroke="#f59e0b" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        </svg>
      </div>

      <div className="flex flex-col text-left leading-none">
        <div className="flex items-center gap-1">
          <span className="font-extrabold text-base tracking-tight text-white drop-shadow-xs">Shukran</span>
          <span className="font-black text-base text-amber-300 drop-shadow-xs">Food</span>
        </div>
        <span className="text-[9.5px] font-bold text-amber-200/90 tracking-wide mt-0.5">
          শুক্রান ফুড
        </span>
      </div>
    </div>
  );
};
