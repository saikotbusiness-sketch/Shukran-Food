import React, { useState } from 'react';
import { Star, Plus, Minus, Image as ImageIcon } from 'lucide-react';
import { Product, AppConfig } from '../types';

interface ProductCardProps {
  product: Product;
  quantity: number;
  config: AppConfig;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onUpdateCart: (id: number, delta: number) => void;
  onSetCartQty: (id: number, qty: number) => void;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantity,
  config,
  isFavorite,
  onToggleFavorite,
  onUpdateCart,
  onSetCartQty,
  onOpenDetails,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isEditingQty, setIsEditingQty] = useState(false);
  const [inputVal, setInputVal] = useState(quantity.toString());

  const handleInputSubmit = () => {
    setIsEditingQty(false);
    const parsed = parseInt(inputVal, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onSetCartQty(product.id, parsed);
    } else {
      setInputVal(quantity.toString());
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 relative group">
      
      {/* Top badges & favorite star */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          {/* Favorite Star */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product.id);
            }}
            aria-label="Add to favorites"
            className="p-1 text-slate-300 hover:text-amber-400 active:scale-110 transition-transform"
          >
            <Star
              size={18}
              className={isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
            />
          </button>

          {/* Supplier/Brand Indicator */}
          <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
            {product.brand}
          </span>
        </div>

        {/* Pack and Size Badges matching video */}
        <div className="flex items-center gap-1.5 mb-2">
          <span 
            className="text-[11px] font-bold px-2 py-0.5 rounded-md text-white shadow-xs"
            style={{ backgroundColor: config.customColor }}
          >
            {product.pack}
          </span>
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            {product.size}
          </span>
        </div>

        {/* Product Photo clickable to details */}
        <div
          onClick={() => onOpenDetails(product)}
          className="cursor-pointer relative h-28 w-full flex items-center justify-center p-1 bg-slate-50/50 rounded-xl overflow-hidden mb-2 group-hover:scale-[1.02] transition-transform"
        >
          {!imageError ? (
            <img
              src={product.img}
              alt={product.name}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-1">
              <ImageIcon size={28} />
              <span className="text-[9px] font-medium text-slate-500">{product.brand}</span>
            </div>
          )}
        </div>

        {/* Product Title (2-line clamped) */}
        <div onClick={() => onOpenDetails(product)} className="cursor-pointer">
          <h4 className="font-bold text-xs text-slate-800 leading-snug line-clamp-2 min-h-8">
            {product.name}
          </h4>
          {product.arabicName && config.language !== 'en' && (
            <p className="text-[10px] text-slate-500 truncate mt-0.5" dir="rtl">
              {product.arabicName}
            </p>
          )}
          <div className="mt-1 flex items-baseline gap-1">
            <span
              className="font-extrabold text-sm tracking-tight"
              style={{ color: config.customColor }}
            >
              {product.price.toFixed(3)} {config.currency}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Wholesale Quantity Stepper Stepper button matching video */}
      <div className="mt-2.5 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200/90 rounded-xl p-1">
          {/* Decrement Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateCart(product.id, -1);
            }}
            disabled={quantity <= 0}
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-slate-700 bg-white shadow-xs active:bg-slate-200 transition-colors ${
              quantity <= 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100'
            }`}
          >
            <Minus size={14} />
          </button>

          {/* Qty Display / Direct Edit */}
          {isEditingQty ? (
            <input
              type="number"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onBlur={handleInputSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
              autoFocus
              className="w-10 text-center font-bold text-xs bg-white border border-teal-500 rounded p-0.5 text-slate-900"
            />
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingQty(true);
                setInputVal(quantity.toString());
              }}
              title="Click to type exact quantity"
              className="px-2 py-0.5 text-xs font-black text-slate-800 hover:bg-slate-200/70 rounded transition-colors"
            >
              {quantity}
            </button>
          )}

          {/* Increment Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateCart(product.id, 1);
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-xs active:scale-95 transition-all"
            style={{ backgroundColor: config.customColor }}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

    </div>
  );
};
