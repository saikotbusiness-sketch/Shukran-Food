import React, { useState } from 'react';
import { 
  User, LogIn, LogOut, Info, Phone, MapPin, 
  Settings, X, Globe, ShieldCheck, ChevronRight,
  Sun, Moon, Sparkles
} from 'lucide-react';
import { AppConfig, CustomerProfile } from '../types';
import { ShukranFoodLogo } from './ShukranFoodLogo';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  user: CustomerProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAdmin: () => void;
  onOpenAddresses: () => void;
  onSelectLanguage: (lang: 'en' | 'ar' | 'ur') => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onShowSplash?: () => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  config,
  user,
  onOpenAuth,
  onLogout,
  onOpenAdmin,
  onOpenAddresses,
  onSelectLanguage,
  isDarkMode = false,
  onToggleTheme,
}) => {
  const [showLangModal, setShowLangModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        
        {/* Top Header Profile Box matching video */}
        <div 
          className="p-5 text-white flex flex-col justify-between"
          style={{ backgroundColor: config.customColor }}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-14 h-14 rounded-full bg-white/20 p-1 flex items-center justify-center border-2 border-white/40 shadow-inner">
              <User size={30} className="text-white" />
            </div>

            {/* Language Selector Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLangModal(true)}
                className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-full text-xs font-semibold text-white transition-colors"
              >
                <Globe size={13} />
                <span>
                  {config.language === 'en' ? 'ENG' : config.language === 'ar' ? 'العربية' : 'اردو'}
                </span>
              </button>

              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-white/20 text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div>
            {user && user.name ? (
              <div>
                <h3 className="font-bold text-base tracking-wide leading-tight">{user.name}</h3>
                <p className="text-xs text-white/80 mt-0.5">{user.phone || user.email}</p>
                <span className="inline-block mt-1 text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-medium">
                  {user.customerType || 'Supermarket Buyer'}
                </span>
              </div>
            ) : (
              <div>
                <h3 className="font-bold text-base tracking-wide">Please Sign In to continue</h3>
                <p className="text-xs text-white/75 mt-0.5">Access wholesale prices & save orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items List matching video */}
        <div className="flex-1 py-3 px-2 overflow-y-auto space-y-1 text-sm font-medium text-slate-700">
          
          {/* Sign In or Logout */}
          {user ? (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-rose-600"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                  <LogOut size={18} />
                </div>
                <span>Logout</span>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: config.customColor }}
                >
                  <LogIn size={18} />
                </div>
                <span className="font-semibold text-slate-900">Sign In / Register</span>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          )}

          {/* Delivery Address */}
          <button
            onClick={() => {
              onClose();
              onOpenAddresses();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <MapPin size={18} />
              </div>
              <span>Delivery Addresses</span>
            </div>
            <ChevronRight size={16} className="text-slate-300" />
          </button>

          {/* About Us */}
          <button
            onClick={() => setShowAboutModal(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                <Info size={18} />
              </div>
              <span>About Us</span>
            </div>
            <ChevronRight size={16} className="text-slate-300" />
          </button>

          {/* Contact Us */}
          <button
            onClick={() => setShowContactModal(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Phone size={18} />
              </div>
              <span>Contact Us</span>
            </div>
            <ChevronRight size={16} className="text-slate-300" />
          </button>

          <div className="pt-2 border-t border-slate-100 mt-2 space-y-1.5">
            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={() => {
                  onToggleTheme();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    {isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-slate-800 block text-xs">
                      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {isDarkMode ? 'Switch to Clean White' : 'Switch to Obsidian Dark'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {isDarkMode ? 'DARK' : 'LIGHT'}
                </span>
              </button>
            )}

            {/* View Splash Screen */}
            {onShowSplash && (
              <button
                onClick={() => {
                  onClose();
                  onShowSplash();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                    <Sparkles size={18} className="text-amber-500" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-slate-800 block text-xs">
                      স্প্ল্যাশ স্ক্রিন দেখুন (View Intro Splash)
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Shukran Food লোগো ও অ্যানিমেশন
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </button>
            )}

            {/* Developer / Admin Mode Trigger */}
            <button
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50/60 hover:bg-amber-100/60 transition-colors border border-amber-200/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck size={18} />
                </div>
                <div className="text-left">
                  <span className="font-bold text-amber-900 block text-xs">Developer / Admin Mode</span>
                  <span className="text-[10px] text-amber-700 block">Manage Products, Colors, PIN</span>
                </div>
              </div>
              <Settings size={16} className="text-amber-600" />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 flex flex-col items-center text-center text-xs text-slate-400 bg-slate-50 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Shukran Food (শুক্রান ফুড)</span>
          </div>
          <p className="text-[10px] text-slate-400">Fresh Wholesale & Food Supplies</p>
        </div>
      </div>

      {/* Language Modal */}
      {showLangModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-2xl">
            <h3 className="font-bold text-sm text-slate-800 mb-3 text-center">Select Language / اختر اللغة</h3>
            <div className="space-y-2">
              {[
                { code: 'en' as const, label: 'English', sub: 'Default' },
                { code: 'ar' as const, label: 'العربية', sub: 'Arabic' },
                { code: 'ur' as const, label: 'اردو', sub: 'Urdu' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onSelectLanguage(lang.code);
                    setShowLangModal(false);
                  }}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all ${
                    config.language === lang.code
                      ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-500/20'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{lang.label}</span>
                  <span className="text-[10px] text-slate-400">{lang.sub}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowLangModal(false)}
              className="mt-4 w-full py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* About Us Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl text-slate-800 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-sm text-slate-900">About {config.name}</h3>
              <button onClick={() => setShowAboutModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <p className="leading-relaxed text-slate-600 mb-2">
              <strong>{config.companyName}</strong> is Oman's premier B2B wholesale platform supplying supermarkets, grocery stores, restaurants, and catering services with authentic FMCG food, beverage, and cleaning essentials.
            </p>
            <div className="bg-slate-50 p-2.5 rounded-xl space-y-1 text-[11px] text-slate-600 border border-slate-100 my-2">
              <p><strong>CR Number:</strong> {config.crNumber}</p>
              <p><strong>VATIN:</strong> {config.vatin}</p>
              <p><strong>Headquarters:</strong> {config.companyDetails}</p>
            </div>
            <button
              onClick={() => setShowAboutModal(false)}
              className="mt-3 w-full py-2 bg-teal-700 text-white font-semibold rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Contact Us Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl text-slate-800 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-sm text-slate-900">Contact Wholesale Support</h3>
              <button onClick={() => setShowContactModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
                <Phone size={18} className="text-teal-700" />
                <div>
                  <p className="text-[10px] text-slate-400">Direct Phone / Hotline</p>
                  <p className="font-bold text-slate-800 text-xs">{config.whatsappNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-emerald-50 rounded-xl">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">W</div>
                <div>
                  <p className="text-[10px] text-emerald-600 font-medium">WhatsApp Direct Dispatch</p>
                  <p className="font-bold text-emerald-900 text-xs">{config.whatsappNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
                <MapPin size={18} className="text-teal-700" />
                <div>
                  <p className="text-[10px] text-slate-400">Central Warehouse</p>
                  <p className="text-slate-700 text-[11px] leading-tight">{config.companyDetails}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={`https://wa.me/${config.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-center font-bold text-xs shadow-xs"
              >
                Chat on WhatsApp
              </a>
              <button
                onClick={() => setShowContactModal(false)}
                className="px-4 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
