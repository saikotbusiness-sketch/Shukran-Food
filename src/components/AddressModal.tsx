import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Navigation, Check, X, Compass, Plus, CheckCircle2 } from 'lucide-react';
import { CustomerAddress, AppConfig } from '../types';
import { OMAN_REGIONS, MUSCAT_CITIES, COUNTRIES } from '../data/initialData';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSaveAddress: (address: CustomerAddress) => void;
  initialAddress?: CustomerAddress | null;
  savedAddresses?: CustomerAddress[];
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveAddress,
  initialAddress,
  savedAddresses = [],
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'form'>(
    savedAddresses.length > 0 ? 'list' : 'form'
  );
  const [title, setTitle] = useState(initialAddress?.title || 'Main Supermarket');
  const [country, setCountry] = useState(initialAddress?.country || 'Oman');
  const [region, setRegion] = useState(initialAddress?.region || 'Muscat');
  const [city, setCity] = useState(initialAddress?.city || 'Azaiba');
  const [locationLink, setLocationLink] = useState(
    initialAddress?.locationLink || 'https://maps.google.com/?q=23.5880,58.3829'
  );
  const [closeAtNoon, setCloseAtNoon] = useState(initialAddress?.closeAtNoon ?? true);
  const [note, setNote] = useState(initialAddress?.note || 'Beside Al Maha Petrol Station, Near main grocery market');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapCoords, setMapCoords] = useState({ lat: 23.5880, lng: 58.3829 });
  const [mapSearch, setMapSearch] = useState('Muscat, Oman');

  // Synchronize when initialAddress changes or modal opens
  useEffect(() => {
    if (initialAddress) {
      setTitle(initialAddress.title || '');
      setCountry(initialAddress.country || 'Oman');
      setRegion(initialAddress.region || 'Muscat');
      setCity(initialAddress.city || 'Azaiba');
      setLocationLink(initialAddress.locationLink || 'https://maps.google.com/?q=23.5880,58.3829');
      setCloseAtNoon(initialAddress.closeAtNoon ?? true);
      setNote(initialAddress.note || '');
    }
    if (savedAddresses.length > 1) {
      setViewMode('list');
    } else {
      setViewMode('form');
    }
  }, [initialAddress, isOpen, savedAddresses.length]);

  if (!isOpen) return null;

  const handlePickAddress = () => {
    setLocationLink(`https://maps.google.com/?q=${mapCoords.lat.toFixed(4)},${mapCoords.lng.toFixed(4)}`);
    setShowMapPicker(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddress: CustomerAddress = {
      id: initialAddress?.id || `addr-${Date.now()}`,
      title: title.trim() || 'My Supermarket',
      country,
      region,
      city,
      locationLink,
      closeAtNoon,
      note,
    };
    onSaveAddress(newAddress);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div 
          className="p-4 text-white flex items-center justify-between"
          style={{ backgroundColor: config.customColor }}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20 text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <h3 className="font-bold text-sm">
              {viewMode === 'list' ? 'Select Delivery Address' : 'Add / Edit Address'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* View Mode 1: Saved Addresses List */}
        {viewMode === 'list' && savedAddresses.length > 0 ? (
          <div className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
            <div className="flex justify-between items-center pb-1">
              <span className="font-bold text-slate-700">Choose from your saved addresses:</span>
              <button
                type="button"
                onClick={() => setViewMode('form')}
                className="text-teal-700 font-bold flex items-center gap-1 hover:underline"
              >
                <Plus size={14} />
                <span>Add New</span>
              </button>
            </div>

            <div className="space-y-2">
              {savedAddresses.map((addr) => {
                const isSelected = initialAddress?.id === addr.id || (initialAddress?.title === addr.title && initialAddress?.city === addr.city);
                return (
                  <div
                    key={addr.id}
                    onClick={() => {
                      onSaveAddress(addr);
                      onClose();
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-teal-400 bg-slate-50/60'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <MapPin size={15} className={isSelected ? 'text-teal-700' : 'text-slate-400'} />
                        <span className="font-bold text-slate-900 text-xs">{addr.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {addr.city}, {addr.region} ({addr.country})
                      </p>
                      {addr.note && (
                        <p className="text-[10px] text-teal-800 font-medium">📍 {addr.note}</p>
                      )}
                    </div>

                    <div className="shrink-0 mt-1">
                      {isSelected ? (
                        <CheckCircle2 size={18} className="text-teal-700" />
                      ) : (
                        <span className="text-[10px] font-bold text-teal-700 px-2 py-1 bg-white rounded-lg border border-slate-200">
                          Select
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setTitle('');
                setNote('');
                setViewMode('form');
              }}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors mt-2"
            >
              <Plus size={15} />
              <span>Add Another Address / Edit Details</span>
            </button>
          </div>
        ) : (
          /* View Mode 2: Form Body */
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-slate-700">
            {savedAddresses.length > 0 && (
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="text-teal-700 font-bold text-[11px] hover:underline flex items-center gap-1"
              >
                ← Back to Saved Addresses List
              </button>
            )}
            
            {/* Address Title */}
            <div>
              <label className="block text-slate-600 font-bold mb-1">
                Address Title / Shop Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Al Noor Grocery / Azaiba Branch"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-teal-600 font-semibold"
              />
            </div>

            {/* Country & Region Row */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-teal-600"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.name} ({c.dial})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Region / Governorate</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-teal-600"
                >
                  {OMAN_REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* City / Area Dropdown */}
            <div>
              <label className="block text-slate-600 font-bold mb-1">City / Area *</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-teal-600 font-semibold text-slate-800"
              >
                {MUSCAT_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Street / Landmark / Note */}
            <div>
              <label className="block text-slate-600 font-bold mb-1">
                Shop Address & Landmark *
              </label>
              <textarea
                rows={2}
                required
                placeholder="e.g. Near Al Maha Petrol Station, Way 4821, Main Supermarket entrance"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-teal-600"
              />
            </div>

            {/* Map GPS Link Input */}
            <div>
              <label className="block text-slate-600 font-bold mb-1">
                Google Maps Location Link (Optional)
              </label>
              <input
                type="url"
                placeholder="https://maps.google.com/?q=23.5880,58.3829"
                value={locationLink}
                onChange={(e) => setLocationLink(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-teal-600 font-mono text-[11px]"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 active:scale-98 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Check size={14} />
                <span>Save & Set Delivery Address</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
