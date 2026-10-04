import React, { useState } from 'react';
import { 
  ArrowLeft, Plus, Minus, Package, Layers, 
  Tag, Info, DollarSign, Store, X, Check 
} from 'lucide-react';
import { Product, AppConfig } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  cartQty: number;
  config: AppConfig;
  allProducts: Product[];
  onUpdateCart: (id: number, delta: number) => void;
  onSetCartQty: (id: number, qty: number) => void;
  onSelectProduct: (p: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  cartQty,
  config,
  allProducts,
  onUpdateCart,
  onSetCartQty,
  onSelectProduct,
}) => {
  if (!product) return null;

  const similarProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Top App Bar inside modal */}
        <div 
          className="p-3.5 text-white flex items-center justify-between"
          style={{ backgroundColor: config.customColor }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20 text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <h3 className="font-bold text-sm">Products Details</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Main Product Image */}
          <div className="h-48 w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-center">
            <img
              src={product.img}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-contain"
            />
          </div>

          {/* Category & Title */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Category: <span className="text-teal-700">{product.category}</span>
            </p>
            <h2 className="text-base font-bold text-slate-900 mt-1 leading-snug">
              {product.name}
            </h2>
            {product.arabicName && (
              <p className="text-xs text-slate-500 mt-0.5" dir="rtl">{product.arabicName}</p>
            )}

            <div className="mt-2 flex items-baseline gap-2">
              <span 
                className="text-lg font-black"
                style={{ color: config.customColor }}
              >
                {product.price.toFixed(3)} {config.currency}
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                Vat Included (5%)
              </span>
            </div>
          </div>

          {/* Specs Grid matching Tamween format in video */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2">
              <Package size={16} className="text-teal-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400">Size</p>
                <p className="font-bold text-slate-800">{product.size}</p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2">
              <Layers size={16} className="text-teal-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400">Number of Items</p>
                <p className="font-bold text-slate-800">{product.pack.replace('#', '').trim()} pcs</p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2">
              <Tag size={16} className="text-teal-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400">Unit Type</p>
                <p className="font-bold text-slate-800">{product.unit || 'Carton'}</p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2">
              <Store size={16} className="text-teal-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400">Brand</p>
                <p className="font-bold text-slate-800">{product.brand}</p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 col-span-2 flex items-start gap-2">
              <Info size={16} className="text-teal-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400">Description</p>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  {product.description || `Master wholesale box: ${product.pack} containing ${product.size} each. Factory sealed for grocery retail.`}
                </p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2">
              <DollarSign size={16} className="text-teal-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400">Price per Unit</p>
                <p className="font-bold text-slate-800">{product.pricePerUnit.toFixed(3)} {config.currency}</p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2">
              <Store size={16} className="text-teal-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400">Supplier</p>
                <p className="font-bold text-slate-800">{product.supplier}</p>
              </div>
            </div>
          </div>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <div className="pt-2">
              <h4 className="font-bold text-xs text-slate-800 mb-2">Similar Products</h4>
              <div className="grid grid-cols-2 gap-2">
                {similarProducts.map((sp) => (
                  <div
                    key={sp.id}
                    onClick={() => onSelectProduct(sp)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/70 cursor-pointer flex gap-2 items-center"
                  >
                    <img
                      src={sp.img}
                      alt={sp.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 object-contain rounded"
                    />
                    <div className="truncate">
                      <p className="text-[10px] font-bold text-slate-800 truncate">{sp.name}</p>
                      <p className="text-[10px] font-semibold text-teal-700">
                        {sp.price.toFixed(3)} {config.currency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Bottom Cart Action Bar */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
            <button
              onClick={() => onUpdateCart(product.id, -1)}
              disabled={cartQty <= 0}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-40"
            >
              <Minus size={16} />
            </button>
            <span className="w-10 text-center font-black text-sm text-slate-800">
              {cartQty}
            </span>
            <button
              onClick={() => onUpdateCart(product.id, 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: config.customColor }}
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            onClick={() => {
              if (cartQty === 0) {
                onUpdateCart(product.id, 1);
              }
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5"
            style={{ backgroundColor: config.customColor }}
          >
            <Check size={16} />
            <span>{cartQty > 0 ? `Update Cart (${(product.price * cartQty).toFixed(3)} ${config.currency})` : 'Add to Order'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
