import React from 'react';
import { Home, Grid, ClipboardList, User } from 'lucide-react';
import { AppConfig } from '../types';

interface BottomNavBarProps {
  currentTab: 'home' | 'categories' | 'orders' | 'profile';
  onSelectTab: (tab: 'home' | 'categories' | 'orders' | 'profile') => void;
  config: AppConfig;
  cartCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
  config,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 shadow-lg max-w-md mx-auto transition-colors">
      <div className="grid grid-cols-4 items-center h-16 px-2">
        
        {/* Tab 1: Home */}
        <button
          onClick={() => onSelectTab('home')}
          className="flex flex-col items-center justify-center relative py-1"
        >
          {currentTab === 'home' ? (
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md -mt-2 transition-transform scale-105"
              style={{ backgroundColor: config.customColor }}
            >
              <Home size={20} />
            </div>
          ) : (
            <div className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
              <Home size={22} />
            </div>
          )}
          <span 
            className={`text-[10px] font-bold mt-0.5 tracking-tight ${
              currentTab === 'home' ? 'text-teal-800 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            Home
          </span>
        </button>

        {/* Tab 2: Categories */}
        <button
          onClick={() => onSelectTab('categories')}
          className="flex flex-col items-center justify-center relative py-1"
        >
          {currentTab === 'categories' ? (
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md -mt-2 transition-transform scale-105"
              style={{ backgroundColor: config.customColor }}
            >
              <Grid size={20} />
            </div>
          ) : (
            <div className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
              <Grid size={22} />
            </div>
          )}
          <span 
            className={`text-[10px] font-bold mt-0.5 tracking-tight ${
              currentTab === 'categories' ? 'text-teal-800 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            Categories
          </span>
        </button>

        {/* Tab 3: Orders */}
        <button
          onClick={() => onSelectTab('orders')}
          className="flex flex-col items-center justify-center relative py-1"
        >
          {currentTab === 'orders' ? (
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md -mt-2 transition-transform scale-105"
              style={{ backgroundColor: config.customColor }}
            >
              <ClipboardList size={20} />
            </div>
          ) : (
            <div className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
              <ClipboardList size={22} />
            </div>
          )}
          <span 
            className={`text-[10px] font-bold mt-0.5 tracking-tight ${
              currentTab === 'orders' ? 'text-teal-800 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            Orders
          </span>
        </button>

        {/* Tab 4: Profile */}
        <button
          onClick={() => onSelectTab('profile')}
          className="flex flex-col items-center justify-center relative py-1"
        >
          {currentTab === 'profile' ? (
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md -mt-2 transition-transform scale-105"
              style={{ backgroundColor: config.customColor }}
            >
              <User size={20} />
            </div>
          ) : (
            <div className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
              <User size={22} />
            </div>
          )}
          <span 
            className={`text-[10px] font-bold mt-0.5 tracking-tight ${
              currentTab === 'profile' ? 'text-teal-800 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            Profile
          </span>
        </button>

      </div>
    </nav>
  );
};
