import React, { useState, useEffect } from 'react';
import { 
  X, Lock, Mail, Phone, Eye, EyeOff, Check, Sparkles, 
  Bell, ArrowRight, ShieldCheck, AlertCircle, Search, 
  ChevronDown, CheckCircle2, User, Globe
} from 'lucide-react';
import { CustomerProfile, CustomerAddress, AppConfig } from '../types';
import { WORLD_COUNTRIES, WorldCountry, DEFAULT_COUNTRY } from '../data/worldCountries';
import { ShukranFoodLogo } from './ShukranFoodLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onLoginSuccess: (profile: CustomerProfile) => void;
  initialMessage?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  config,
  onLoginSuccess,
  initialMessage,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp');
  const [otpChannel, setOtpChannel] = useState<'email' | 'phone'>('email');

  // Fields
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<WorldCountry>(() => {
    return WORLD_COUNTRIES.find((c) => c.code === 'BD') || WORLD_COUNTRIES[0];
  });
  const [countrySearch, setCountrySearch] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [addressNote, setAddressNote] = useState('');
  const [customerType, setCustomerType] = useState('Personal / Retail Buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(initialMessage || '');

  // OTP flow state
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']); // 6 digits
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [showInboxSimulation, setShowInboxSimulation] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  // Direct Google Account Chooser State
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');

  // Resend Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOtpSent && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpSent, resendTimer]);

  useEffect(() => {
    if (initialMessage) {
      setErrorMessage(initialMessage);
    }
  }, [initialMessage]);

  if (!isOpen) return null;

  // Filter countries for country code picker
  const filteredCountries = WORLD_COUNTRIES.filter((c) => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.bengaliName.includes(countrySearch) ||
    c.dial.includes(countrySearch) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Send 6-Digit OTP (Email or Phone)
  const handleSendOtp = () => {
    if (otpChannel === 'email' && !email.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার সঠিক জিমেইল বা ইমেইল ঠিকানা দিন!');
      return;
    }
    if (otpChannel === 'phone' && !phone.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার সঠিক মোবাইল নাম্বার দিন!');
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setIsOtpSent(true);
    setResendTimer(30);
    setShowInboxSimulation(true);
    setErrorMessage('');
  };

  // Verify 6-digit OTP
  const handleVerifyOtp = (codeOverride?: string) => {
    const entered = codeOverride || otpDigits.join('');
    if (entered === generatedOtp || entered.length === 6) {
      const userProfile: CustomerProfile = {
        id: `cust-${Date.now().toString().slice(-5)}`,
        name: name || (otpChannel === 'email' ? email.split('@')[0] : `User ${phone.slice(-4)}`),
        phone: otpChannel === 'phone' ? `${selectedCountry.dial} ${phone}` : `${selectedCountry.dial} ${phone || '1712345678'}`,
        email: otpChannel === 'email' ? email : `${phone.replace(/\D/g, '')}@shukranfood.com`,
        customerType: customerType || 'Wholesale Buyer',
        addresses: [
          {
            id: 'addr-primary',
            title: 'Primary Delivery Location',
            country: selectedCountry.name,
            region: selectedCountry.bengaliName,
            city: city || selectedCountry.name,
            locationLink: '',
            closeAtNoon: false,
            note: addressNote || 'Main delivery address',
          }
        ],
        ordersCount: 0,
        totalSpent: 0,
        joinedDate: new Date().toISOString().slice(0, 10).replace(/-/g, '/'),
      };
      
      onLoginSuccess(userProfile);
      onClose();
    } else {
      setErrorMessage(`ভুল ওটিপি কোড! অনুগ্রহ করে ৬-সংখ্যার কোডটি প্রবেশ করুন: ${generatedOtp}`);
    }
  };

  // 1-Click Direct Google Sign-In
  const handleDirectGoogleLogin = (chosenEmail?: string, chosenName?: string) => {
    const finalEmail = chosenEmail || googleCustomEmail || 'saikotbusiness@gmail.com';
    const finalName = chosenName || finalEmail.split('@')[0];

    const googleProfile: CustomerProfile = {
      id: `cust-google-${Date.now().toString().slice(-4)}`,
      name: finalName,
      email: finalEmail,
      phone: `${selectedCountry.dial} ${phone || '1712345678'}`,
      customerType: 'Verified Google Account',
      addresses: [
        {
          id: 'addr-google',
          title: 'Registered Store/Home Location',
          country: selectedCountry.name,
          region: selectedCountry.bengaliName,
          city: city || 'Main Store',
          locationLink: '',
          closeAtNoon: false,
          note: 'Google Verified Account Delivery Point',
        }
      ],
      ordersCount: 0,
      totalSpent: 0,
      joinedDate: new Date().toISOString().slice(0, 10).replace(/-/g, '/'),
    };

    onLoginSuccess(googleProfile);
    setShowGoogleChooser(false);
    onClose();
  };

  // Password Login / Register Submit
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'register' && password !== confirmPassword) {
      setErrorMessage('পাসওয়ার্ড দুটি মেলেনি! অনুগ্রহ করে আবার চেক করুন।');
      return;
    }

    const userProfile: CustomerProfile = {
      id: `cust-${Date.now().toString().slice(-4)}`,
      name: name || 'Shukran Valued Buyer',
      phone: `${selectedCountry.dial} ${phone || '1712345678'}`,
      email: email || 'user@shukranfood.com',
      customerType: customerType || 'Retail & Wholesale',
      addresses: [
        {
          id: `addr-${Date.now()}`,
          title: name ? `${name} Address` : 'Store Location',
          country: selectedCountry.name,
          region: selectedCountry.bengaliName,
          city: city || 'Main Area',
          locationLink: '',
          closeAtNoon: false,
          note: addressNote || 'Storefront / Delivery point',
        }
      ],
      ordersCount: 0,
      totalSpent: 0,
      joinedDate: new Date().toISOString().slice(0, 10).replace(/-/g, '/'),
    };

    onLoginSuccess(userProfile);
    onClose();
  };

  // Guest Mode
  const handleGuestMode = () => {
    const guestProfile: CustomerProfile = {
      id: `cust-guest-${Date.now().toString().slice(-4)}`,
      name: 'গেস্ট ইউজার (Guest Mode)',
      phone: '',
      email: '',
      customerType: 'Guest Visitor',
      addresses: [],
      ordersCount: 0,
      totalSpent: 0,
      joinedDate: new Date().toISOString().slice(0, 10).replace(/-/g, '/'),
    };
    onLoginSuccess(guestProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">

      {/* ================= SIMULATED GMAIL / SMS LIVE OTP NOTIFICATION ================= */}
      {showInboxSimulation && (
        <div 
          onClick={() => {
            setOtpDigits(generatedOtp.split(''));
            handleVerifyOtp(generatedOtp);
            setShowInboxSimulation(false);
          }}
          className="fixed top-4 left-1/2 -translate-x-1/2 w-88 max-w-[94vw] bg-slate-900 border-2 border-amber-400 text-white p-3.5 rounded-2xl shadow-2xl z-70 flex items-center gap-3 cursor-pointer animate-in slide-in-from-top duration-300 hover:scale-102 transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center shrink-0 text-white shadow-md">
            {otpChannel === 'email' ? <Mail size={20} /> : <Bell size={20} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-extrabold text-xs text-amber-300">
                {otpChannel === 'email' ? '📬 Gmail Inbox • Shukran Food' : '💬 SMS Notification • Shukran Food'}
              </p>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
                এখনই এসেছে
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-0.5">
              আপনার ওটিপি কোড: <strong className="text-amber-400 text-sm font-mono tracking-widest">{generatedOtp}</strong>
            </p>
            <p className="text-[10.5px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
              <span>👉 ট্যাপ করলেই স্বয়ংক্রিয়ভাবে বসে লগইন হবে</span>
            </p>
          </div>
        </div>
      )}

      {/* ================= GOOGLE 1-CLICK ACCOUNT CHOOSER MODAL ================= */}
      {showGoogleChooser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <h3 className="font-extrabold text-sm text-slate-800">Google অ্যাকাউন্ট নির্বাচন করুন</h3>
              </div>
              <button 
                onClick={() => setShowGoogleChooser(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Shukran Food (শুক্রান ফুড)-এ সরাসরি ১-ক্লিকে লগইন করার জন্য আপনার জিমেইল অ্যাকাউন্টটি বেছে নিন:
            </p>

            {/* Quick pre-filled accounts for convenience */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDirectGoogleLogin('saikotbusiness@gmail.com', 'Md Saikot Ahmmad')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  S
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-slate-900 group-hover:text-teal-700">Md Saikot Ahmmad</p>
                  <p className="text-[11px] text-slate-500 truncate">saikotbusiness@gmail.com</p>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                  Active
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDirectGoogleLogin('buyer@shukranfood.com', 'Shukran Wholesale Partner')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  W
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-slate-900 group-hover:text-teal-700">Shukran Partner</p>
                  <p className="text-[11px] text-slate-500 truncate">buyer@shukranfood.com</p>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">
                  Buyer
                </span>
              </button>
            </div>

            {/* Or custom Google account input */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block text-[11px] font-bold text-slate-600">অথবা অন্য যেকোনো জিমেইল দিয়ে সরাসরি সাইন ইন:</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={googleCustomEmail}
                  onChange={(e) => setGoogleCustomEmail(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-xl p-2 text-xs outline-none focus:border-teal-600"
                />
                <button
                  type="button"
                  onClick={() => handleDirectGoogleLogin()}
                  className="px-3 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  সাইন ইন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAIN AUTH MODAL CARD ================= */}
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* Header with Shukran Food Logo */}
        <div className="p-4 pt-5 pb-3 text-center border-b border-slate-100 relative bg-gradient-to-b from-teal-50/50 to-white">
          <button 
            onClick={onClose}
            className="absolute right-3.5 top-3.5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>

          <ShukranFoodLogo variant="auth" />
        </div>

        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-start gap-1.5 animate-in slide-in-from-top">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1-Click Direct Google Login Button */}
        <div className="p-4 pb-2">
          <button
            type="button"
            onClick={() => setShowGoogleChooser(true)}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-teal-500 rounded-2xl text-xs font-extrabold text-slate-800 shadow-sm flex items-center justify-center gap-2.5 transition-all active:scale-98"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Continue with Google (১-ক্লিকে জিমেইল দিয়ে সাইন ইন)</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 px-4 py-1">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            অথবা ওটিপি / পাসওয়ার্ড
          </span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        {/* Login Method Tabs */}
        <div className="flex border-b border-slate-100 text-xs font-bold px-4">
          <button
            onClick={() => setLoginMethod('otp')}
            className={`flex-1 py-2.5 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              loginMethod === 'otp'
                ? 'border-teal-700 text-teal-800 bg-teal-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles size={14} className="text-amber-500" />
            <span>ওটিপি দিয়ে (OTP Verification)</span>
          </button>
          <button
            onClick={() => setLoginMethod('password')}
            className={`flex-1 py-2.5 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              loginMethod === 'password'
                ? 'border-teal-700 text-teal-800 bg-teal-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock size={13} />
            <span>পাসওয়ার্ড দিয়ে (Password)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 overflow-y-auto flex-1 text-xs">
          
          {/* ================= METHOD 1: OTP AUTH (EMAIL & PHONE WORLDWIDE) ================= */}
          {loginMethod === 'otp' ? (
            <div className="space-y-4">
              
              {/* Channel Selector: Email vs Phone */}
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setOtpChannel('email');
                    setIsOtpSent(false);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 ${
                    otpChannel === 'email' ? 'bg-white shadow-xs text-teal-900 font-extrabold' : 'text-slate-500'
                  }`}
                >
                  <Mail size={13} />
                  <span>জিমেইল / ইমেইল</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtpChannel('phone');
                    setIsOtpSent(false);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 ${
                    otpChannel === 'phone' ? 'bg-white shadow-xs text-teal-900 font-extrabold' : 'text-slate-500'
                  }`}
                >
                  <Phone size={13} />
                  <span>মোবাইল নাম্বার (সব দেশ)</span>
                </button>
              </div>

              {!isOtpSent ? (
                <div className="space-y-3">
                  
                  {/* EMAIL CHANNEL */}
                  {otpChannel === 'email' ? (
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">
                        আপনার জিমেইল বা ইমেইল ঠিকানা *
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          placeholder="e.g. saikotbusiness@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                      </div>
                      <p className="text-[10.5px] text-slate-400 mt-1">
                        যেকোনো দেশ থেকে জিমেইল দিয়ে অ্যাকাউন্ট খোলা ও ওটিপি গ্রহণ সম্ভব।
                      </p>
                    </div>
                  ) : (
                    /* PHONE CHANNEL: WORLD COUNTRY SELECTOR */
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">
                        দেশ ও মোবাইল নাম্বার নির্বাচন করুন *
                      </label>

                      {/* Country Picker Trigger */}
                      <div className="relative mb-2">
                        <button
                          type="button"
                          onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                          className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-xs font-bold text-slate-800 transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-base">{selectedCountry.flag}</span>
                            <span>{selectedCountry.bengaliName} ({selectedCountry.name})</span>
                            <span className="font-mono text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                              {selectedCountry.dial}
                            </span>
                          </div>
                          <ChevronDown size={15} className="text-slate-400 shrink-0 ml-1" />
                        </button>

                        {/* Country Dropdown Panel with Search */}
                        {isCountryDropdownOpen && (
                          <div className="absolute top-11 left-0 right-0 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 max-h-56 overflow-y-auto space-y-1 animate-in zoom-in-95">
                            <div className="relative mb-1">
                              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="text"
                                placeholder="দেশ খুঁজুন (Search country)..."
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                                className="w-full bg-slate-50 pl-8 pr-2 py-1.5 rounded-lg text-xs outline-none focus:ring-1 focus:ring-teal-500"
                              />
                            </div>

                            {filteredCountries.map((c) => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => {
                                  setSelectedCountry(c);
                                  setIsCountryDropdownOpen(false);
                                  setCountrySearch('');
                                }}
                                className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left text-xs transition-colors ${
                                  selectedCountry.code === c.code ? 'bg-teal-50 text-teal-900 font-bold' : 'hover:bg-slate-50'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span>{c.flag}</span>
                                  <span>{c.bengaliName} ({c.name})</span>
                                </span>
                                <span className="font-mono text-slate-500 font-bold">{c.dial}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Phone Input with Prefix */}
                      <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-white focus-within:ring-2 focus-within:ring-teal-500">
                        <span className="bg-slate-50 border-r border-slate-200 px-2.5 py-2 text-xs font-mono font-bold text-teal-800 flex items-center gap-1">
                          <span>{selectedCountry.flag}</span>
                          <span>{selectedCountry.dial}</span>
                        </span>
                        <input
                          type="tel"
                          placeholder={selectedCountry.formatPlaceholder || '1712-345678'}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="flex-1 p-2 font-mono text-xs outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5"
                  >
                    <span>৬-সংখ্যার ওটিপি কোড পাঠান (Send OTP)</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                /* OTP CODE VERIFICATION SECTION */
                <div className="space-y-3 animate-in fade-in">
                  <div className="text-center p-2 rounded-xl bg-teal-50/70 border border-teal-100">
                    <p className="text-slate-600 font-medium text-xs">
                      ৬-সংখ্যার ওটিপি কোড পাঠানো হয়েছে:
                    </p>
                    <p className="font-mono font-bold text-teal-900 text-sm mt-0.5">
                      {otpChannel === 'email' ? email : `${selectedCountry.dial} ${phone}`}
                    </p>
                  </div>

                  {/* 6 Digit Input Boxes */}
                  <div className="flex justify-center gap-1.5 my-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-box-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const val = e.target.value;
                          const next = [...otpDigits];
                          next[idx] = val;
                          setOtpDigits(next);
                          if (val && idx < 5) {
                            const nextInput = document.getElementById(`otp-box-${idx + 1}`);
                            nextInput?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
                            const prevInput = document.getElementById(`otp-box-${idx - 1}`);
                            prevInput?.focus();
                          }
                        }}
                        className="w-10 h-11 text-center text-lg font-black font-mono border-2 border-slate-200 rounded-xl focus:border-teal-600 outline-none bg-slate-50/50"
                      />
                    ))}
                  </div>

                  {/* 1-Tap Auto Fill & Verify Shortcut */}
                  <button
                    type="button"
                    onClick={() => {
                      setOtpDigits(generatedOtp.split(''));
                      handleVerifyOtp(generatedOtp);
                    }}
                    className="w-full py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl text-amber-900 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sparkles size={13} className="text-amber-600" />
                    <span>কোডটি স্বয়ংক্রিয়ভাবে বসান ({generatedOtp})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVerifyOtp()}
                    className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-98"
                  >
                    যাচাই ও প্রবেশ করুন (Verify & Login)
                  </button>

                  <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsOtpSent(false)}
                      className="text-slate-500 hover:underline"
                    >
                      ← নাম্বার/ইমেইল পরিবর্তন
                    </button>

                    <button
                      type="button"
                      disabled={resendTimer > 0}
                      onClick={handleSendOtp}
                      className={`font-bold ${
                        resendTimer > 0 ? 'text-slate-400' : 'text-teal-700 hover:underline'
                      }`}
                    >
                      {resendTimer > 0 ? `পুনরায় পাঠান (${resendTimer}s)` : 'আবার ওটিপি পাঠান'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ================= METHOD 2: PASSWORD AUTH ================= */
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">আপনার পূর্ণ নাম *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Md Saikot Ahmmad"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">ইমেইল ঠিকানা (ঐচ্ছিক)</label>
                    <input
                      type="email"
                      placeholder="buyer@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                    />
                  </div>
                </>
              )}

              {/* Country & Phone */}
              <div>
                <label className="block text-slate-600 font-bold mb-1">দেশ ও মোবাইল নাম্বার *</label>
                <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-white focus-within:ring-2 focus-within:ring-teal-500">
                  <select
                    value={selectedCountry.code}
                    onChange={(e) => {
                      const c = WORLD_COUNTRIES.find((x) => x.code === e.target.value);
                      if (c) setSelectedCountry(c);
                    }}
                    className="bg-slate-50 border-r border-slate-200 px-2 py-2 text-xs font-mono font-bold text-slate-800 outline-none"
                  >
                    {WORLD_COUNTRIES.slice(0, 15).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.dial}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    required
                    placeholder="1712-345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 p-2 font-mono text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">পাসওয়ার্ড *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2 pr-8 font-mono text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-slate-600 font-bold mb-1">পাসওয়ার্ড নিশ্চিত করুন *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2 font-mono text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-98"
                >
                  {authMode === 'login' ? 'লগইন করুন' : 'অ্যাকাউন্ট তৈরি করুন'}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  {authMode === 'login' ? 'নতুন রেজিস্ট্রেশন' : 'আগের লগইন'}
                </button>
              </div>
            </form>
          )}

          {/* Guest Mode option */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-center space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              — অথবা গেস্ট মোড —
            </span>
            <button
              type="button"
              onClick={handleGuestMode}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <User size={13} />
              <span>গেস্ট মোডে ব্রাউজ করুন (Guest Mode)</span>
            </button>
            <p className="text-[10px] text-amber-700 font-medium">
              * গেস্ট হিসেবে সব পণ্য দেখতে পারবেন। অর্ডার করতে হলে জিমেইল বা মোবাইল দিয়ে লগইন করতে হবে।
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
