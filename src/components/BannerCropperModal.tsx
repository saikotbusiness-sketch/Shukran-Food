import React, { useState, useRef, useEffect } from 'react';
import { X, Crop, ZoomIn, ZoomOut, Check, RefreshCw, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { HeroBanner } from '../types';

interface BannerCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: HeroBanner;
  onSaveCroppedBanner: (updatedBanner: HeroBanner) => void;
}

export const BannerCropperModal: React.FC<BannerCropperModalProps> = ({
  isOpen,
  onClose,
  banner,
  onSaveCroppedBanner,
}) => {
  const [imgUrl, setImgUrl] = useState(banner.imgUrl);
  const [badge, setBadge] = useState(banner.badge);
  const [title, setTitle] = useState(banner.title);
  const [subtitle, setSubtitle] = useState(banner.subtitle);
  const [buttonText, setButtonText] = useState(banner.buttonText);
  const [targetCategory, setTargetCategory] = useState(banner.targetCategory || 'Drinks & Water');
  const [aspectRatio, setAspectRatio] = useState<'16:7' | '16:9' | '21:9'>(banner.aspectRatio === '16:9' || banner.aspectRatio === '21:9' ? banner.aspectRatio : '16:7');
  
  // Crop / Transform state
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // High quality Oman & GCC Wholesale preset banners
  const PRESET_BANNERS = [
    {
      label: '🥤 Kinza & Soft Drinks',
      url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=1200&auto=format&fit=crop&q=80',
      badge: 'WHOLESALE PRICES',
      title: 'Stay Refreshed With Top Beverages',
      subtitle: 'Free delivery on bulk carton orders over 35.000 OMR',
      cat: 'Drinks & Water',
    },
    {
      label: '🍜 Buldak Spicy Ramen',
      url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=1200&auto=format&fit=crop&q=80',
      badge: 'HOT WHOLESALE DEAL',
      title: 'Buldak Spicy Ramen & Noodle Cartons',
      subtitle: 'Special wholesale rates on 40-pack Master Cartons',
      cat: 'Snacks & Candy',
    },
    {
      label: '🥔 Oman Chips & Snacks',
      url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=1200&auto=format&fit=crop&q=80',
      badge: 'CONTAINER ARRIVAL',
      title: 'Oman Chips & Traditional Snacks',
      subtitle: 'Direct wholesale dispatch across Muscat, Seeb & Sohar',
      cat: 'Snacks & Candy',
    },
    {
      label: '🌾 Rice & Cooking Oil',
      url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1200&auto=format&fit=crop&q=80',
      badge: 'SUPERMARKET STAPLES',
      title: 'Bulk Cooking Oils, Basmati Rice & Ghee',
      subtitle: 'Direct refinery pricing for registered grocery stores',
      cat: 'Condiments & Canned Food',
    },
    {
      label: '🧼 Loyal Detergents & Cleaning',
      url: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=1200&auto=format&fit=crop&q=80',
      badge: 'HYGIENE & CLEANING',
      title: 'Loyal Detergents & Commercial Supplies',
      subtitle: 'Bulk disinfectant and cleaning cartons at distributor rates',
      cat: 'Cleaning & Laundry',
    },
  ];

  useEffect(() => {
    setImgUrl(banner.imgUrl);
    setBadge(banner.badge);
    setTitle(banner.title);
    setSubtitle(banner.subtitle);
    setButtonText(banner.buttonText);
    setTargetCategory(banner.targetCategory || 'Drinks & Water');
    setZoom(1);
    setPanX(0);
    setPanY(0);
  }, [banner]);

  if (!isOpen) return null;

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImgUrl(event.target.result as string);
          setZoom(1);
          setPanX(0);
          setPanY(0);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Crop image to canvas and generate cropped output
  const handleApplyCropAndSave = async () => {
    setIsProcessing(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imgUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => resolve(true); // fallback without blocking
      });

      const canvas = document.createElement('canvas');
      const targetW = 800;
      let targetH = 350; // 16:7 default
      if (aspectRatio === '16:9') targetH = 450;
      if (aspectRatio === '21:9') targetH = 340;

      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, targetW, targetH);

        // Calculate drawing dimensions with zoom and pan
        const imgRatio = img.width / (img.height || 1);
        let drawW = targetW * zoom;
        let drawH = drawW / imgRatio;

        if (drawH < targetH * zoom) {
          drawH = targetH * zoom;
          drawW = drawH * imgRatio;
        }

        const drawX = (targetW - drawW) / 2 + (panX * targetW) / 100;
        const drawY = (targetH - drawH) / 2 + (panY * targetH) / 100;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);

        let finalUrl = imgUrl;
        try {
          finalUrl = canvas.toDataURL('image/jpeg', 0.9);
        } catch (e) {
          // If tainted by CORS, retain the clean image URL
          finalUrl = imgUrl;
        }

        const updated: HeroBanner = {
          ...banner,
          badge: badge.trim() || 'SPECIAL DEAL',
          title: title.trim() || 'Wholesale Offer',
          subtitle: subtitle.trim() || 'Bulk carton savings',
          buttonText: buttonText.trim() || 'Shop Now',
          targetCategory,
          imgUrl: finalUrl,
          aspectRatio,
          active: true,
        };

        onSaveCroppedBanner(updated);
        onClose();
      }
    } catch (e) {
      console.error('Cropping error', e);
      onSaveCroppedBanner({
        ...banner,
        badge,
        title,
        subtitle,
        buttonText,
        targetCategory,
        imgUrl,
        aspectRatio,
        active: true,
      });
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Crop size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Banner Image Editor & Cropper</h3>
              <p className="text-[10px] text-slate-400">Crop, scale & customize promotional hero banner</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* 1. Live Interactive Banner Preview Card */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-bold text-slate-300">Live Card Preview (As Seen in Buyer Feed)</span>
              <span className="font-mono text-indigo-400 font-bold">{aspectRatio}</span>
            </div>

            <div 
              className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-slate-700/80 bg-slate-950 flex items-center"
              style={{
                aspectRatio: aspectRatio === '16:7' ? '16/7' : aspectRatio === '16:9' ? '16/9' : '21/9',
                minHeight: '140px',
              }}
            >
              {/* Background Cropped Image */}
              <img
                src={imgUrl}
                alt="Banner preview"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-100"
                style={{
                  transform: `scale(${zoom}) translate(${panX}%, ${panY}%)`,
                  transformOrigin: 'center center',
                }}
              />

              {/* Dark Gradient Overlay for Readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent" />

              {/* Text & Button Content Overlay */}
              <div className="relative z-10 p-4 max-w-[68%] space-y-1 text-white">
                <span className="inline-block bg-white/20 text-white font-extrabold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs">
                  {badge || 'SPECIAL DEAL'}
                </span>
                <h4 className="font-black text-xs sm:text-sm line-clamp-2 leading-tight">
                  {title || 'Banner Headline'}
                </h4>
                <p className="text-[10px] text-white/80 line-clamp-1">
                  {subtitle || 'Promotional subtitle'}
                </p>
                <div className="pt-1">
                  <span className="inline-block bg-amber-400 text-teal-950 font-black px-2.5 py-1 rounded-lg text-[10px] shadow-sm">
                    {buttonText || 'Shop Now'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Crop & Aspect Ratio Controls */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300">1. Aspect Ratio</span>
              <div className="flex gap-1">
                {(['16:7', '16:9', '21:9'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setAspectRatio(r)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      aspectRatio === r
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Zoom Slider */}
            <div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                <span className="flex items-center gap-1 font-bold">
                  <ZoomIn size={12} />
                  <span>Image Zoom ({zoom.toFixed(1)}x)</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setPanX(0);
                    setPanY(0);
                  }}
                  className="text-indigo-400 hover:underline"
                >
                  Reset Position
                </button>
              </div>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Pan / Move Slider */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-slate-400 block mb-0.5">Horizontal Pan ({panX}%)</span>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={panX}
                  onChange={(e) => setPanX(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Vertical Pan ({panY}%)</span>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={panY}
                  onChange={(e) => setPanY(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 3. Image URL or File Upload */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold text-[11px]">
              2. Banner Image Source (URL or File)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-indigo-500 font-mono"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center gap-1 shrink-0"
              >
                <Upload size={13} />
                <span>Upload</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {/* 4. One-Click Curated Wholesale Presets */}
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              ⚡ Quick Curated Wholesale Presets:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {PRESET_BANNERS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setImgUrl(p.url);
                    setBadge(p.badge);
                    setTitle(p.title);
                    setSubtitle(p.subtitle);
                    setTargetCategory(p.cat);
                    setZoom(1);
                    setPanX(0);
                    setPanY(0);
                  }}
                  className="p-1.5 bg-slate-800/80 hover:bg-indigo-950 hover:border-indigo-600 border border-slate-700 rounded-xl text-left transition-all text-[10px]"
                >
                  <p className="font-bold text-white truncate">{p.label}</p>
                  <p className="text-slate-400 truncate">{p.badge}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Text & CTA Customization */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Badge Text</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="WHOLESALE PRICES"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Button Text</label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="Shop Drinks"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-slate-400 font-bold mb-1">Headline Text *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Stay Refreshed With Top Beverages"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-slate-400 font-bold mb-1">Subtitle / Deal Details</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Free delivery on bulk carton orders over 35.000 OMR"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-slate-400 font-bold mb-1">Target Category (When Buyer Clicks)</label>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
              >
                <option value="Drinks & Water">Drinks & Water (مشروبات ومياه)</option>
                <option value="Snacks & Candy">Snacks & Candy (شيبس وحلويات)</option>
                <option value="Condiments & Canned Food">Condiments & Canned Food (معلبات وزيوت)</option>
                <option value="Cleaning & Laundry">Cleaning & Laundry (منظفات ومطهرات)</option>
              </select>
            </div>
          </div>

        </div>

        {/* Footer Buttons */}
        <div className="p-3 border-t border-slate-800 flex justify-end gap-2 shrink-0 bg-slate-950">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleApplyCropAndSave}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 active:scale-98 transition-all disabled:opacity-50"
          >
            <Check size={14} />
            <span>{isProcessing ? 'Processing...' : 'Apply Crop & Save Banner'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
