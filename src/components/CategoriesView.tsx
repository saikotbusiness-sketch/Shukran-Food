import React, { useState } from 'react';
import { Category, Brand, AppConfig } from '../types';
import { 
  Wine, Cookie, Sparkles, Utensils, Home, 
  Wheat, Shirt, Egg, Apple, Heart, ChevronRight, X 
} from 'lucide-react';

interface CategoriesViewProps {
  categories: Category[];
  brands: Brand[];
  config: AppConfig;
  onSelectCategory: (categoryName: string, subCategory?: string, brand?: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  brands,
  config,
  onSelectCategory,
}) => {
  const [activeCategoryModal, setActiveCategoryModal] = useState<Category | null>(null);

  // Category Icon Mapping
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'drinks':
        return <Wine size={24} className="text-teal-700" />;
      case 'snacks':
        return <Cookie size={24} className="text-amber-600" />;
      case 'condiments':
        return <Utensils size={24} className="text-rose-600" />;
      case 'cleaning':
        return <Shirt size={24} className="text-sky-600" />;
      case 'dairy':
        return <Egg size={24} className="text-amber-500" />;
      case 'breakfast':
        return <Wheat size={24} className="text-amber-700" />;
      case 'beauty':
        return <Heart size={24} className="text-pink-600" />;
      case 'household':
        return <Home size={24} className="text-emerald-600" />;
      default:
        return <Sparkles size={24} className="text-teal-700" />;
    }
  };

  return (
    <div className="p-3 pb-24 space-y-4">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-extrabold text-slate-800">All Categories</h2>
          <p className="text-[11px] text-slate-500">Browse wholesale inventory by department</p>
        </div>
        <span className="text-[10px] font-bold bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
          {categories.length} Departments
        </span>
      </div>

      {/* Grid of 2 columns matching video */}
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => setActiveCategoryModal(cat)}
            className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md hover:border-teal-500 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              {getCategoryIcon(cat.id)}
            </div>

            <h4 className="font-bold text-xs text-slate-800 leading-snug line-clamp-2">
              {cat.name}
            </h4>

            {cat.arabicName && config.language !== 'en' && (
              <p className="text-[10px] text-slate-400 mt-0.5" dir="rtl">
                {cat.arabicName}
              </p>
            )}

            <span className="text-[10px] text-teal-700 font-semibold mt-1">
              {cat.subCategories.length - 1} subcategories
            </span>
          </div>
        ))}
      </div>

      {/* Subcategory & Brand Selection Bottom Sheet matching video timestamp 09:37 */}
      {activeCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-2">
          <div className="bg-white w-full max-w-md rounded-t-3xl rounded-b-2xl shadow-2xl p-4 animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto">
            
            {/* Sheet Handle */}
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3" />

            <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{activeCategoryModal.name}</h3>
                <p className="text-[10px] text-slate-400">Select sub-department or view all</p>
              </div>
              <button
                onClick={() => setActiveCategoryModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sub Categories list */}
            <div className="mb-4">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Sub Categories
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {activeCategoryModal.subCategories.map((sub, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectCategory(activeCategoryModal.name, sub === 'All' ? undefined : sub);
                      setActiveCategoryModal(null);
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 border border-slate-200/80 rounded-xl text-left text-xs font-semibold text-slate-700 hover:text-teal-800 transition-colors flex items-center justify-between"
                  >
                    <span>{sub}</span>
                    <ChevronRight size={13} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Brands in this category */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Featured Brands
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {brands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      onSelectCategory(activeCategoryModal.name, undefined, b.name);
                      setActiveCategoryModal(null);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-teal-700 hover:text-white rounded-full text-xs font-medium text-slate-700 transition-colors"
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* View All Button */}
            <button
              onClick={() => {
                onSelectCategory(activeCategoryModal.name);
                setActiveCategoryModal(null);
              }}
              className="w-full mt-4 py-2.5 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              style={{ backgroundColor: config.customColor }}
            >
              Browse All in {activeCategoryModal.name}
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
