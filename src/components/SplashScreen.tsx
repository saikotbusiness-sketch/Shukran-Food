import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { ShukranFoodLogo } from './ShukranFoodLogo';
import { AppConfig } from '../types';

interface SplashScreenProps {
  config: AppConfig;
  onFinish: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  config,
  onFinish,
  durationMs = 2400,
}) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const intervalTime = 30;
    const step = 100 / (durationMs / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          triggerExit();
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [durationMs]);

  const triggerExit = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onFinish();
    }, 400);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 select-none transition-opacity duration-400 ${
        isFadingOut ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 30%, #064e3b 0%, #042f2e 50%, #022c22 100%)',
      }}
    >
      {/* Ambient background glow and floating sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 left-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl" />
        <div className="absolute top-10 right-10 w-40 h-40 bg-teal-400/15 rounded-full blur-2xl" />
      </div>

      {/* Top Bar: Skip Button */}
      <div className="w-full max-w-md flex justify-end relative z-10">
        <button
          onClick={triggerExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-amber-200 border border-amber-300/30 text-xs font-bold transition-all backdrop-blur-md shadow-sm"
        >
          <span>সরাসরি প্রবেশ করুন</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Main Center Branding with Logo */}
      <div className="relative z-10 flex flex-col items-center my-auto">
        <ShukranFoodLogo variant="splash" showSubtitle={true} />

        {/* Feature Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-xs">
          <span className="bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 backdrop-blur-xs">
            <Sparkles size={11} className="text-amber-400" />
            <span>১০০% হালাল ও তাজা ফুড</span>
          </span>
          <span className="bg-emerald-400/15 border border-emerald-400/30 text-emerald-200 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 backdrop-blur-xs">
            <CheckCircle2 size={11} className="text-emerald-300" />
            <span>সারা বিশ্বে অ্যাকাউন্ট সুবিধা</span>
          </span>
        </div>
      </div>

      {/* Bottom Loading Progress and App Info */}
      <div className="w-full max-w-xs relative z-10 space-y-3 pb-4">
        {/* Progress Bar */}
        <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden p-0.5 border border-white/20 backdrop-blur-md">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 transition-all duration-75 shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-white/70 font-semibold px-1">
          <span className="flex items-center gap-1.5 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
            <span>লোড হচ্ছে... {Math.round(progress)}%</span>
          </span>
          <span>Shukran Food App</span>
        </div>

        <p className="text-center text-[10px] text-white/50 pt-1">
          {config.companyName || 'SHUKRAN FOOD TRADING LLC'}
        </p>
      </div>
    </div>
  );
};
