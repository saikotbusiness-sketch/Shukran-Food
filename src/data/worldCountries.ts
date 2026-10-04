export interface WorldCountry {
  code: string;
  name: string;
  bengaliName: string;
  dial: string;
  flag: string;
  formatPlaceholder?: string;
}

export const WORLD_COUNTRIES: WorldCountry[] = [
  { code: 'BD', name: 'Bangladesh', bengaliName: 'বাংলাদেশ', dial: '+880', flag: '🇧🇩', formatPlaceholder: '01712-345678' },
  { code: 'OM', name: 'Oman', bengaliName: 'ওমান', dial: '+968', flag: '🇴🇲', formatPlaceholder: '9170 7438' },
  { code: 'SA', name: 'Saudi Arabia', bengaliName: 'সৌদি আরব', dial: '+966', flag: '🇸🇦', formatPlaceholder: '50 123 4567' },
  { code: 'AE', name: 'United Arab Emirates', bengaliName: 'সংযুক্ত আরব আমিরাত', dial: '+971', flag: '🇦🇪', formatPlaceholder: '50 123 4567' },
  { code: 'QA', name: 'Qatar', bengaliName: 'কাতার', dial: '+974', flag: '🇶🇦', formatPlaceholder: '3312 3456' },
  { code: 'KW', name: 'Kuwait', bengaliName: 'কুয়েত', dial: '+965', flag: '🇰🇼', formatPlaceholder: '9123 4567' },
  { code: 'BH', name: 'Bahrain', bengaliName: 'বাহরাইন', dial: '+973', flag: '🇧🇭', formatPlaceholder: '3612 3456' },
  { code: 'IN', name: 'India', bengaliName: 'ভারত', dial: '+91', flag: '🇮🇳', formatPlaceholder: '98765 43210' },
  { code: 'PK', name: 'Pakistan', bengaliName: 'পাকিস্তান', dial: '+92', flag: '🇵🇰', formatPlaceholder: '300 1234567' },
  { code: 'US', name: 'United States', bengaliName: 'যুক্তরাষ্ট্র (USA)', dial: '+1', flag: '🇺🇸', formatPlaceholder: '(555) 012-3456' },
  { code: 'CA', name: 'Canada', bengaliName: 'কানাডা', dial: '+1', flag: '🇨🇦', formatPlaceholder: '(555) 012-3456' },
  { code: 'GB', name: 'United Kingdom', bengaliName: 'যুক্তরাজ্য (UK)', dial: '+44', flag: '🇬🇧', formatPlaceholder: '7911 123456' },
  { code: 'MY', name: 'Malaysia', bengaliName: 'মালয়েশিয়া', dial: '+60', flag: '🇲🇾', formatPlaceholder: '12-345 6789' },
  { code: 'SG', name: 'Singapore', bengaliName: 'সিঙ্গাপুর', dial: '+65', flag: '🇸🇬', formatPlaceholder: '8123 4567' },
  { code: 'AU', name: 'Australia', bengaliName: 'অস্ট্রেলিয়া', dial: '+61', flag: '🇦🇺', formatPlaceholder: '412 345 678' },
  { code: 'DE', name: 'Germany', bengaliName: 'জার্মানি', dial: '+49', flag: '🇩🇪', formatPlaceholder: '151 12345678' },
  { code: 'FR', name: 'France', bengaliName: 'ফ্রান্স', dial: '+33', flag: '🇫🇷', formatPlaceholder: '6 12 34 56 78' },
  { code: 'IT', name: 'Italy', bengaliName: 'ইতালি', dial: '+39', flag: '🇮🇹', formatPlaceholder: '312 345 6789' },
  { code: 'TR', name: 'Turkey', bengaliName: 'তুরস্ক', dial: '+90', flag: '🇹🇷', formatPlaceholder: '532 123 4567' },
  { code: 'EG', name: 'Egypt', bengaliName: 'মিশর', dial: '+20', flag: '🇪🇬', formatPlaceholder: '100 123 4567' },
  { code: 'JO', name: 'Jordan', bengaliName: 'জর্ডান', dial: '+962', flag: '🇯🇴', formatPlaceholder: '7 9012 3456' },
  { code: 'LB', name: 'Lebanon', bengaliName: 'লেবানন', dial: '+961', flag: '🇱🇧', formatPlaceholder: '70 123 456' },
  { code: 'JP', name: 'Japan', bengaliName: 'জাপান', dial: '+81', flag: '🇯🇵', formatPlaceholder: '90-1234-5678' },
  { code: 'KR', name: 'South Korea', bengaliName: 'দক্ষিণ কোরিয়া', dial: '+82', flag: '🇰🇷', formatPlaceholder: '10-1234-5678' },
  { code: 'ID', name: 'Indonesia', bengaliName: 'ইন্দোনেশিয়া', dial: '+62', flag: '🇮🇩', formatPlaceholder: '812-3456-7890' },
  { code: 'PH', name: 'Philippines', bengaliName: 'ফিলিপাইন', dial: '+63', flag: '🇵🇭', formatPlaceholder: '917 123 4567' },
  { code: 'TH', name: 'Thailand', bengaliName: 'থাইল্যান্ড', dial: '+66', flag: '🇹🇭', formatPlaceholder: '81 234 5678' },
  { code: 'NP', name: 'Nepal', bengaliName: 'নেপাল', dial: '+977', flag: '🇳🇵', formatPlaceholder: '984-1234567' },
  { code: 'LK', name: 'Sri Lanka', bengaliName: 'শ্রীলঙ্কা', dial: '+94', flag: '🇱🇰', formatPlaceholder: '71 234 5678' },
  { code: 'ZA', name: 'South Africa', bengaliName: 'দক্ষিণ আফ্রিকা', dial: '+27', flag: '🇿🇦', formatPlaceholder: '71 123 4567' },
  { code: 'NG', name: 'Nigeria', bengaliName: 'নাইজেরিয়া', dial: '+234', flag: '🇳🇬', formatPlaceholder: '802 123 4567' },
  { code: 'KE', name: 'Kenya', bengaliName: 'কেনিয়া', dial: '+254', flag: '🇰🇪', formatPlaceholder: '712 345678' },
  { code: 'ES', name: 'Spain', bengaliName: 'স্পেন', dial: '+34', flag: '🇪🇸', formatPlaceholder: '612 34 56 78' },
  { code: 'NL', name: 'Netherlands', bengaliName: 'নেদারল্যান্ডস', dial: '+31', flag: '🇳🇱', formatPlaceholder: '6 12345678' },
  { code: 'SE', name: 'Sweden', bengaliName: 'সুইডেন', dial: '+46', flag: '🇸🇪', formatPlaceholder: '70 123 45 67' },
  { code: 'CH', name: 'Switzerland', bengaliName: 'সুইজারল্যান্ড', dial: '+41', flag: '🇨🇭', formatPlaceholder: '78 123 45 67' },
  { code: 'BR', name: 'Brazil', bengaliName: 'ব্রাজিল', dial: '+55', flag: '🇧🇷', formatPlaceholder: '(11) 91234-5678' },
  { code: 'RU', name: 'Russia', bengaliName: 'রাশিয়া', dial: '+7', flag: '🇷🇺', formatPlaceholder: '912 345-67-89' },
  { code: 'NZ', name: 'New Zealand', bengaliName: 'নিউজিল্যান্ড', dial: '+64', flag: '🇳🇿', formatPlaceholder: '21 123 4567' },
  { code: 'IE', name: 'Ireland', bengaliName: 'আয়ারল্যান্ড', dial: '+353', flag: '🇮🇪', formatPlaceholder: '83 123 4567' },
];

export const DEFAULT_COUNTRY = WORLD_COUNTRIES[0]; // Bangladesh or Oman readily available
