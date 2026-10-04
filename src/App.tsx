import React, { useState, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  SideDrawer 
} from './components/SideDrawer';
import { 
  ProductCard 
} from './components/ProductCard';
import { 
  ProductDetailModal 
} from './components/ProductDetailModal';
import { 
  CartScreen 
} from './components/CartScreen';
import { 
  InvoiceView 
} from './components/InvoiceView';
import { 
  AddressModal 
} from './components/AddressModal';
import { 
  AuthModal 
} from './components/AuthModal';
import { 
  AdminPanel 
} from './components/AdminPanel';
import { 
  BottomNavBar 
} from './components/BottomNavBar';
import { 
  CategoriesView 
} from './components/CategoriesView';
import { 
  OrdersView 
} from './components/OrdersView';
import { 
  PWAInstallBanner 
} from './components/PWAInstallBanner';
import { 
  HeroBannerCarousel 
} from './components/HeroBannerCarousel';
import { 
  SplashScreen 
} from './components/SplashScreen';
import { decodeOrderFromUrl } from './utils/orderEncoder';
import { 
  INITIAL_CONFIG, 
  INITIAL_PRODUCTS, 
  CATEGORIES, 
  BRANDS,
  INITIAL_CUSTOMERS,
  INITIAL_HERO_BANNERS
} from './data/initialData';
import { 
  Product, 
  CustomerAddress, 
  CustomerProfile, 
  AppConfig, 
  Order 
} from './types';
import { 
  ChevronRight, 
  SlidersHorizontal, 
  Sparkles, 
  Store, 
  Check, 
  Truck, 
  ShoppingBag,
  User as UserIcon,
  MapPin,
  Settings,
  HelpCircle,
  Phone
} from 'lucide-react';

export default function App() {
  // Helper to check if developer/admin mode was active
  const checkIsDeveloperMode = () => {
    try {
      return (
        localStorage.getItem('om_developer_mode') === 'true' ||
        localStorage.getItem('star_active_screen') === 'admin' ||
        window.location.hash === '#admin' ||
        new URLSearchParams(window.location.search).get('mode') === 'admin'
      );
    } catch (e) {
      return false;
    }
  };

  // Splash Screen State (Do not show splash if resuming in Developer Mode)
  const [showSplash, setShowSplash] = useState(() => !checkIsDeveloperMode());

  // App Configurations with LocalStorage persistence
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('star_wholesale_config');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (parsed.name === 'huzaifa' || parsed.name === 'tamween' || parsed.name === 'Star Wholesale' || !parsed.name) {
          parsed.name = 'Shukran Food';
          parsed.splashTitle = 'Shukran Food';
          parsed.companyName = 'SHUKRAN FOOD TRADING LLC';
          parsed.arabicCompanyName = 'شركة شكراً فود للتجارة ش.م.م';
          parsed.tagline = 'Fresh Wholesale & Food Supplies | তাজা ও পাইকারি খাদ্য সরবরাহ';
          parsed.splashTagline = 'Fresh Wholesale & Food Supplies | তাজা ও পাইকারি খাদ্য সরবরাহ';
          localStorage.setItem('star_wholesale_config', JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) { /* fallback */ }
    }
    return INITIAL_CONFIG;
  });

  // Products Catalog with LocalStorage persistence
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('star_wholesale_products');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_PRODUCTS;
  });

  // Categories & Brands
  const [categories] = useState(CATEGORIES);
  const [brands] = useState(BRANDS);

  // Cart: { [productId]: quantity }
  const [cart, setCart] = useState<{ [productId: number]: number }>(() => {
    const saved = localStorage.getItem('star_wholesale_cart');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {};
  });

  // Favorites: [productId, ...]
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('star_wholesale_favorites');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [1, 8, 12]; // default favorites
  });

  // Customer Profile
  const [user, setUser] = useState<CustomerProfile | null>(() => {
    const saved = localStorage.getItem('star_wholesale_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return null;
  });

  // Selected Address
  const [selectedAddress, setSelectedAddress] = useState<CustomerAddress | null>(() => {
    const saved = localStorage.getItem('star_wholesale_address');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      id: 'default-addr',
      title: 'Main Supermarket Store',
      country: 'Oman',
      region: 'Muscat',
      city: 'Azaiba',
      locationLink: 'https://maps.google.com/?q=23.5880,58.3829',
      closeAtNoon: true,
      note: 'Near Bank Muscat, Al Maha Petrol Station',
    };
  });

  // Orders History
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('star_wholesale_orders');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [];
  });

  // Registered Customers / Users
  const [customers, setCustomers] = useState<CustomerProfile[]>(() => {
    const saved = localStorage.getItem('star_wholesale_customers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_CUSTOMERS as CustomerProfile[];
  });

  // Navigation & Screens State (Persistent Auto-Backup)
  const [currentTab, setCurrentTab] = useState<'home' | 'categories' | 'orders' | 'profile'>(() => {
    const saved = localStorage.getItem('star_active_tab') as any;
    if (saved && ['home', 'categories', 'orders', 'profile'].includes(saved)) {
      return saved;
    }
    return 'home';
  });

  const [currentScreen, setCurrentScreen] = useState<'home' | 'cart' | 'invoice' | 'admin'>(() => {
    if (checkIsDeveloperMode()) return 'admin';
    return 'home';
  });
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // Theme Toggle State (Obsidian Dark / Clean Light Mode)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('star_wholesale_dark_mode') === 'true';
  });

  // Store Refresh & Sync State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState('');

  // Persist dark mode and sync HTML root class
  useEffect(() => {
    localStorage.setItem('star_wholesale_dark_mode', isDarkMode ? 'true' : 'false');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Persist current active tab for state backup
  useEffect(() => {
    localStorage.setItem('star_active_tab', currentTab);
  }, [currentTab]);

  // Refresh handler (re-evaluates storage & catalog)
  const handleRefreshStore = () => {
    setIsRefreshing(true);
    try {
      const savedConfig = localStorage.getItem('star_wholesale_config');
      if (savedConfig) setConfig(JSON.parse(savedConfig));
      const savedProducts = localStorage.getItem('star_wholesale_products');
      if (savedProducts) setProducts(JSON.parse(savedProducts));
      const savedOrders = localStorage.getItem('star_wholesale_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } catch (e) {
      // fallback
    }
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshToast('✓ Store catalog & data refreshed');
      setTimeout(() => setRefreshToast(''), 2500);
    }, 500);
  };

  // Persistent address selection & profile update
  const handleSaveAndSelectAddress = (addr: CustomerAddress) => {
    setSelectedAddress(addr);
    if (user) {
      const existingIdx = user.addresses?.findIndex((a) => a.id === addr.id);
      let updatedAddresses = user.addresses ? [...user.addresses] : [];
      if (existingIdx !== undefined && existingIdx >= 0) {
        updatedAddresses[existingIdx] = addr;
      } else {
        updatedAddresses = [addr, ...updatedAddresses];
      }
      const updatedUser: CustomerProfile = {
        ...user,
        addresses: updatedAddresses,
        selectedAddressId: addr.id,
      };
      setUser(updatedUser);
      setCustomers((prev) => prev.map((c) => c.id === user.id ? updatedUser : c));
    }
  };

  // Synchronize active screen in localStorage & URL hash so developer mode persists forever
  useEffect(() => {
    localStorage.setItem('star_active_screen', currentScreen);
    if (currentScreen === 'admin') {
      localStorage.setItem('om_developer_mode', 'true');
      if (window.location.hash !== '#admin') {
        window.history.replaceState(null, '', '#admin');
      }
    } else if (currentScreen === 'home') {
      localStorage.removeItem('om_developer_mode');
      if (window.location.hash === '#admin') {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  }, [currentScreen]);

  // Support hardware/browser back and direct hash navigation
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setCurrentScreen('admin');
        setShowSplash(false);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedSubCategoryFilter, setSelectedSubCategoryFilter] = useState<string | null>(null);
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'name'>('featured');

  // Modals
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [productDetail, setProductDetail] = useState<Product | null>(null);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // Synchronize CSS custom color variable
  useEffect(() => {
    document.documentElement.style.setProperty('--theme-primary', config.customColor);
    localStorage.setItem('star_wholesale_config', JSON.stringify(config));
  }, [config]);

  // Persist products
  useEffect(() => {
    localStorage.setItem('star_wholesale_products', JSON.stringify(products));
  }, [products]);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('star_wholesale_cart', JSON.stringify(cart));
  }, [cart]);

  // Persist favorites
  useEffect(() => {
    localStorage.setItem('star_wholesale_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Persist user
  useEffect(() => {
    if (user) {
      localStorage.setItem('star_wholesale_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('star_wholesale_user');
    }
  }, [user]);

  // Persist address
  useEffect(() => {
    if (selectedAddress) {
      localStorage.setItem('star_wholesale_address', JSON.stringify(selectedAddress));
    }
  }, [selectedAddress]);

  // Persist orders
  useEffect(() => {
    localStorage.setItem('star_wholesale_orders', JSON.stringify(orders));
  }, [orders]);

  // Persist customers
  useEffect(() => {
    localStorage.setItem('star_wholesale_customers', JSON.stringify(customers));
  }, [customers]);

  // Splash Screen Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, []);

  // Check for direct invoice link in URL: ?cartpdf=... or ?invoice=...
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const cartpdf = params.get('cartpdf');
      const invoiceNo = params.get('invoice');

      if (cartpdf) {
        const decoded = decodeOrderFromUrl(cartpdf);
        if (decoded) {
          setViewingOrder(decoded);
          setCurrentScreen('invoice');
          setShowSplash(false);
        }
      } else if (invoiceNo) {
        const found = orders.find((o) => o.invoiceNo === invoiceNo);
        if (found) {
          setViewingOrder(found);
          setCurrentScreen('invoice');
          setShowSplash(false);
        }
      }
    } catch (e) {
      console.error('Error loading shared invoice from URL', e);
    }
  }, [orders]);

  // Total items in cart
  const cartTotalCount = Object.values(cart).reduce((sum, q) => sum + q, 0);

  // Cart total value
  const cartTotalValue = Object.entries(cart).reduce((total, [id, qty]) => {
    const p = products.find((prod) => prod.id === parseInt(id, 10));
    return total + (p ? p.price * qty : 0);
  }, 0);

  // Cart Handlers
  const handleUpdateCart = (productId: number, delta: number) => {
    setCart((prev) => {
      const currentQty = prev[productId] || 0;
      const nextQty = Math.max(0, currentQty + delta);
      if (nextQty === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: nextQty };
    });
  };

  const handleSetCartQty = (productId: number, qty: number) => {
    setCart((prev) => {
      if (qty <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: qty };
    });
  };

  const handleToggleFavorite = (productId: number) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Filter & Search Logic
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      !searchQuery ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategoryFilter === 'All' || prod.category === selectedCategoryFilter;

    const matchesSubCategory =
      !selectedSubCategoryFilter || prod.subCategory === selectedSubCategoryFilter;

    const matchesBrand =
      !selectedBrandFilter || prod.brand.toLowerCase() === selectedBrandFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesSubCategory && matchesBrand;
  }).sort((a, b) => {
    if (sortBy === 'price_low') return a.price - b.price;
    if (sortBy === 'price_high') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0; // default featured
  });

  // Sections
  const featuredProducts = products.filter((p) => p.isFeatured);
  const mostSellingProducts = products.filter((p) => p.isMostSelling);
  const newProducts = products.filter((p) => p.isNew);

  // Splash Screen UI
  if (showSplash) {
    return (
      <div 
        onClick={() => setShowSplash(false)}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center text-white cursor-pointer select-none"
        style={{ backgroundColor: config.customColor }}
      >
        <div className="w-24 h-24 rounded-3xl bg-white/20 p-4 flex items-center justify-center shadow-2xl mb-4 backdrop-blur-xs animate-pulse">
          {config.logoUrl ? (
            <img src={config.logoUrl} alt={config.name} className="h-16 w-16 object-contain" />
          ) : (
            <Sparkles size={48} className="text-amber-300 fill-amber-300" />
          )}
        </div>
        <h1 className="text-3xl font-black tracking-wide lowercase">{config.splashTitle || config.name}</h1>
        <p className="text-sm font-medium text-white/80 mt-1">{config.splashTagline || config.tagline}</p>
        <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-white/70">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>Sultanate of Oman • Wholesale B2B</span>
        </div>
      </div>
    );
  }

  // Invoice Screen View
  if (currentScreen === 'invoice' && viewingOrder) {
    return (
      <InvoiceView
        order={viewingOrder}
        config={config}
        onBack={() => {
          setCurrentScreen('home');
          setViewingOrder(null);
          if (window.location.search) {
            window.history.replaceState({}, '', window.location.pathname);
          }
        }}
      />
    );
  }

  // Cart Screen View
  if (currentScreen === 'cart') {
    return (
      <CartScreen
        cart={cart}
        products={products}
        config={config}
        user={user}
        selectedAddress={selectedAddress}
        onUpdateCart={handleUpdateCart}
        onClearCart={() => setCart({})}
        onOpenAddressModal={() => setIsAddressModalOpen(true)}
        onSelectAddress={handleSaveAndSelectAddress}
        onBackToHome={() => setCurrentScreen('home')}
        onOrderPlaced={(order) => {
          setOrders((prev) => [order, ...prev]);
          // Sync with registered customers list
          setCustomers((prev) => {
            const idx = prev.findIndex((c) => c.phone === order.phone);
            if (idx !== -1) {
              const copy = [...prev];
              copy[idx] = {
                ...copy[idx],
                ordersCount: (copy[idx].ordersCount || 0) + 1,
                totalSpent: (copy[idx].totalSpent || 0) + order.grandTotal,
              };
              return copy;
            } else {
              const newCust: CustomerProfile = {
                id: `cust-${Date.now()}`,
                name: order.customerName,
                phone: order.phone,
                email: 'buyer@wholesale.om',
                customerType: order.customerType || 'Grocery & Super Market',
                joinedDate: order.date,
                ordersCount: 1,
                totalSpent: order.grandTotal,
                addresses: order.address ? [order.address] : [],
              };
              return [newCust, ...prev];
            }
          });
          setCart({});
        }}
        onPreviewInvoice={(order) => {
          setViewingOrder(order);
          setCurrentScreen('invoice');
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />
    );
  }

  // Developer / Admin Screen View (Clean Full-Screen Isolated Route, Never Drops Out)
  if (currentScreen === 'admin') {
    return (
      <AdminPanel
        config={config}
        products={products}
        categories={categories}
        orders={orders}
        customers={customers}
        onUpdateConfig={(newConfig) => setConfig(newConfig)}
        onAddProduct={(newProd) => setProducts((prev) => [newProd, ...prev])}
        onUpdateProduct={(updated) => setProducts((prev) => prev.map((p) => p.id === updated.id ? updated : p))}
        onDeleteProduct={(id) => setProducts((prev) => prev.filter((p) => p.id !== id))}
        onAddCustomer={(newCust) => setCustomers((prev) => [newCust, ...prev])}
        onAddOrder={(newOrd) => setOrders((prev) => [newOrd, ...prev])}
        onUpdateOrderStatus={(orderId, status) => {
          setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
        }}
        onClose={() => {
          // EXPLICIT EXIT: Only user clicking store exit returns to buyer view
          localStorage.setItem('star_active_screen', 'home');
          localStorage.removeItem('om_developer_mode');
          if (window.location.hash === '#admin') {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
          setCurrentScreen('home');
        }}
        onResetData={() => {
          setProducts(INITIAL_PRODUCTS);
          setConfig(INITIAL_CONFIG);
          localStorage.removeItem('star_admin_pin');
        }}
        onViewOrderInvoice={(ord) => {
          setViewingOrder(ord);
          setCurrentScreen('invoice');
        }}
        onPreviewSplash={() => setShowSplash(true)}
      />
    );
  }

  return (
    <div 
      className={`max-w-md mx-auto min-h-screen flex flex-col font-sans relative border-x shadow-2xl selection:bg-teal-500 selection:text-white transition-colors duration-200 ${
        isDarkMode 
          ? 'bg-slate-950 text-slate-100 border-slate-800' 
          : 'bg-slate-100 text-slate-900 border-slate-200/80'
      }`}
      dir={config.language === 'ar' ? 'rtl' : 'ltr'}
    >
      
      {/* Optional Install PWA Banner */}
      <PWAInstallBanner />

      {/* Quick Refresh Toast Notification */}
      {refreshToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-60 bg-teal-800 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-xl border border-teal-500/40 flex items-center gap-2 animate-in slide-in-from-top duration-150">
          <Sparkles size={14} className="text-amber-300" />
          <span>{refreshToast}</span>
        </div>
      )}

      {/* Top Header App Bar */}
      <Header
        config={config}
        cartCount={cartTotalCount}
        currentScreen={currentScreen}
        currentTab={currentTab}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (currentTab !== 'home') setCurrentTab('home');
        }}
        onOpenMenu={() => setIsDrawerOpen(true)}
        onOpenCart={() => setCurrentScreen('cart')}
        onGoHome={() => {
          setCurrentTab('home');
          setCurrentScreen('home');
          setSelectedCategoryFilter('All');
          setSelectedSubCategoryFilter(null);
          setSelectedBrandFilter(null);
          setSearchQuery('');
        }}
        onOpenAdmin={() => setCurrentScreen('admin')}
        onOpenFilters={() => setShowFilterSheet(true)}
        onRefresh={handleRefreshStore}
        isRefreshing={isRefreshing}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        notifications={config.notifications}
        onSelectCategory={(catName) => {
          setSelectedCategoryFilter(catName);
          setSelectedSubCategoryFilter(null);
          setSelectedBrandFilter(null);
          setCurrentTab('home');
        }}
      />

      {/* Main Body per Tab */}
      <main className="flex-1 pb-24">
        
        {/* ================= TAB 1: HOME ================= */}
        {currentTab === 'home' && (
          <div className="space-y-4">
            
            {/* If searching or filtering, show active filter bar & filtered results */}
            {(searchQuery || selectedCategoryFilter !== 'All' || selectedSubCategoryFilter || selectedBrandFilter) ? (
              <div className="p-3 space-y-3">
                
                {/* Active Filter Strip */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap text-xs">
                    <span className="font-bold text-slate-800">
                      {filteredProducts.length} Results
                    </span>
                    {selectedCategoryFilter !== 'All' && (
                      <span className="bg-teal-50 text-teal-800 font-semibold px-2 py-0.5 rounded-full border border-teal-200 text-[11px]">
                        {selectedCategoryFilter}
                      </span>
                    )}
                    {selectedSubCategoryFilter && (
                      <span className="bg-sky-50 text-sky-800 font-semibold px-2 py-0.5 rounded-full border border-sky-200 text-[11px]">
                        {selectedSubCategoryFilter}
                      </span>
                    )}
                    {selectedBrandFilter && (
                      <span className="bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-200 text-[11px]">
                        {selectedBrandFilter}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCategoryFilter('All');
                      setSelectedSubCategoryFilter(null);
                      setSelectedBrandFilter(null);
                      setSearchQuery('');
                    }}
                    className="text-xs text-rose-600 font-semibold hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                {/* Subcategory quick filter scroller */}
                {selectedCategoryFilter !== 'All' && (
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
                    {categories
                      .find((c) => c.name === selectedCategoryFilter)
                      ?.subCategories.map((sub, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedSubCategoryFilter(sub === 'All' ? null : sub)}
                          className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors ${
                            (selectedSubCategoryFilter === sub || (sub === 'All' && !selectedSubCategoryFilter))
                              ? 'bg-teal-700 text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-200'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                  </div>
                )}

                {/* Filtered Grid */}
                {filteredProducts.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
                    <p className="font-bold text-sm text-slate-800 mb-1">No products match your criteria</p>
                    <p className="text-xs text-slate-400 mb-4">Try clearing filters or search for popular brands like Kinza or Oman Chips.</p>
                    <button
                      onClick={() => {
                        setSelectedCategoryFilter('All');
                        setSelectedSubCategoryFilter(null);
                        setSelectedBrandFilter(null);
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {filteredProducts.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        quantity={cart[prod.id] || 0}
                        config={config}
                        isFavorite={favorites.includes(prod.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onUpdateCart={handleUpdateCart}
                        onSetCartQty={handleSetCartQty}
                        onOpenDetails={(p) => setProductDetail(p)}
                      />
                    ))}
                  </div>
                )}

              </div>
            ) : (
              /* DEFAULT HOME FEED (Matching Video Layout) */
              <>
                {/* 1. Promotional Hero Banner Carousel (30s Slide & Touch Gestures) */}
                <HeroBannerCarousel
                  banners={config.heroBanners && config.heroBanners.length > 0 ? config.heroBanners : INITIAL_HERO_BANNERS}
                  config={config}
                  onSelectCategory={(catName) => {
                    setSelectedCategoryFilter(catName);
                    setSelectedSubCategoryFilter(null);
                    setSelectedBrandFilter(null);
                    setCurrentTab('home');
                  }}
                  isDarkMode={isDarkMode}
                />

                {/* 2. Categories Horizontal Bar with "See all >" matching video */}
                <div className="px-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-extrabold text-sm text-slate-800">Categories</h3>
                    <button
                      onClick={() => setCurrentTab('categories')}
                      className="text-xs font-bold text-teal-700 flex items-center gap-0.5 hover:underline"
                    >
                      <span>See all</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                    {categories.slice(0, 6).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategoryFilter(cat.name);
                        }}
                        className="bg-white hover:border-teal-500 border border-slate-200/90 rounded-2xl p-2.5 min-w-[95px] flex flex-col items-center justify-center text-center shadow-xs transition-all active:scale-95"
                      >
                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-1.5">
                          <Store size={20} className="text-teal-700" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 leading-tight line-clamp-2">
                          {cat.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Featured Products 2-Column Grid matching video */}
                <div className="px-3">
                  <div className="flex justify-between items-center mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={16} className="text-amber-500 fill-amber-500" />
                      <h3 className="font-extrabold text-sm text-slate-800">Featured Products</h3>
                    </div>
                    <button
                      onClick={() => setSelectedCategoryFilter('All')}
                      className="text-xs font-bold text-teal-700 flex items-center gap-0.5 hover:underline"
                    >
                      <span>See all</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {featuredProducts.slice(0, 6).map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        quantity={cart[prod.id] || 0}
                        config={config}
                        isFavorite={favorites.includes(prod.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onUpdateCart={handleUpdateCart}
                        onSetCartQty={handleSetCartQty}
                        onOpenDetails={(p) => setProductDetail(p)}
                      />
                    ))}
                  </div>
                </div>

                {/* 4. Featured Brands Slider matching video */}
                <div className="px-3 pt-1">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-extrabold text-sm text-slate-800">Featured Brands</h3>
                    <span className="text-[11px] text-slate-400">Authentic Partners</span>
                  </div>

                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {brands.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBrandFilter(b.name)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center justify-center shrink-0 shadow-xs hover:border-teal-500 transition-colors"
                      >
                        <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                          {b.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Most Selling Products 2-Column Grid matching video */}
                <div className="px-3 pt-1">
                  <div className="flex justify-between items-center mb-2.5">
                    <h3 className="font-extrabold text-sm text-slate-800">Most Selling Products</h3>
                    <button
                      onClick={() => setSelectedCategoryFilter('All')}
                      className="text-xs font-bold text-teal-700 flex items-center gap-0.5 hover:underline"
                    >
                      <span>See all</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {mostSellingProducts.slice(0, 6).map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        quantity={cart[prod.id] || 0}
                        config={config}
                        isFavorite={favorites.includes(prod.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onUpdateCart={handleUpdateCart}
                        onSetCartQty={handleSetCartQty}
                        onOpenDetails={(p) => setProductDetail(p)}
                      />
                    ))}
                  </div>
                </div>

                {/* 6. New Products Grid */}
                {newProducts.length > 0 && (
                  <div className="px-3 pt-1 pb-4">
                    <div className="flex justify-between items-center mb-2.5">
                      <h3 className="font-extrabold text-sm text-slate-800">New Products</h3>
                      <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full">
                        Fresh Stock
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {newProducts.map((prod) => (
                        <ProductCard
                          key={prod.id}
                          product={prod}
                          quantity={cart[prod.id] || 0}
                          config={config}
                          isFavorite={favorites.includes(prod.id)}
                          onToggleFavorite={handleToggleFavorite}
                          onUpdateCart={handleUpdateCart}
                          onSetCartQty={handleSetCartQty}
                          onOpenDetails={(p) => setProductDetail(p)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        )}

        {/* ================= TAB 2: CATEGORIES ================= */}
        {currentTab === 'categories' && (
          <CategoriesView
            categories={categories}
            brands={brands}
            config={config}
            onSelectCategory={(catName, subCat, brandName) => {
              setSelectedCategoryFilter(catName);
              setSelectedSubCategoryFilter(subCat || null);
              setSelectedBrandFilter(brandName || null);
              setCurrentTab('home');
            }}
          />
        )}

        {/* ================= TAB 3: ORDERS ================= */}
        {currentTab === 'orders' && (
          <OrdersView
            orders={orders}
            config={config}
            onViewInvoice={(order) => {
              setViewingOrder(order);
              setCurrentScreen('invoice');
            }}
            onStartShopping={() => setCurrentTab('home')}
          />
        )}

        {/* ================= TAB 4: PROFILE ================= */}
        {currentTab === 'profile' && (
          <div className="p-4 space-y-4">
            
            {/* User Profile Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0"
                  style={{ backgroundColor: config.customColor }}
                >
                  {user?.name ? user.name[0].toUpperCase() : <UserIcon size={26} />}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-sm text-slate-900 truncate">
                    {user?.name || 'Guest Wholesale Buyer'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {user?.phone || '+968 91707438'}
                  </p>
                  <span className="inline-block mt-1 text-[10px] bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded-full border border-teal-200">
                    {user?.customerType || 'Grocery & Super Market'}
                  </span>
                </div>
              </div>

              {!user && (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full mt-3 py-2 bg-teal-700 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  Sign In / Register Account
                </button>
              )}
            </div>

            {/* Quick Actions List */}
            <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xs space-y-1 text-xs font-semibold text-slate-700">
              <button
                onClick={() => setIsAddressModalOpen(true)}
                className="w-full p-2.5 hover:bg-slate-50 rounded-xl flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin size={17} className="text-teal-700" />
                  <span>Delivery Address ({selectedAddress?.city || 'Muscat'})</span>
                </div>
                <ChevronRight size={15} className="text-slate-400" />
              </button>

              <button
                onClick={() => setCurrentTab('orders')}
                className="w-full p-2.5 hover:bg-slate-50 rounded-xl flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag size={17} className="text-teal-700" />
                  <span>Order Invoices ({orders.length})</span>
                </div>
                <ChevronRight size={15} className="text-slate-400" />
              </button>

              <button
                onClick={() => setCurrentScreen('admin')}
                className="w-full p-2.5 hover:bg-amber-50 rounded-xl flex items-center justify-between text-amber-900 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Settings size={17} className="text-amber-600" />
                  <span>Developer & Admin Mode</span>
                </div>
                <ChevronRight size={15} className="text-amber-500" />
              </button>

              <a
                href={`https://wa.me/${config.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full p-2.5 hover:bg-emerald-50 rounded-xl flex items-center justify-between text-emerald-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Phone size={17} className="text-emerald-600" />
                  <span>WhatsApp Wholesale Hotline</span>
                </div>
                <ChevronRight size={15} className="text-emerald-500" />
              </a>
            </div>

            {/* Legal Info */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-[11px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-700">{config.companyName}</p>
              <p>{config.companyDetails}</p>
              <p>CR No: {config.crNumber} • VATIN: {config.vatin}</p>
            </div>

          </div>
        )}

      </main>

      {/* Fixed Sticky Bottom Checkout Strip when Cart has items matching video */}
      {cartTotalCount > 0 && currentScreen === 'home' && (
        <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 px-4 flex items-center justify-between shadow-2xl z-30 animate-in slide-in-from-bottom duration-200">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Bill</p>
            <p 
              className="text-base font-black font-mono tracking-tight"
              style={{ color: config.customColor }}
            >
              {cartTotalValue.toFixed(3)} {config.currency}
            </p>
          </div>

          <button
            onClick={() => setCurrentScreen('cart')}
            className="px-6 py-2.5 text-white font-extrabold text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            style={{ backgroundColor: config.customColor }}
          >
            <span>Go to Cart ({cartTotalCount})</span>
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* Fixed Bottom Navigation Tabs */}
      <BottomNavBar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (currentScreen !== 'home') setCurrentScreen('home');
        }}
        config={config}
        cartCount={cartTotalCount}
      />

      {/* Side Drawer Navigation Menu */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        config={config}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={() => {
          setUser(null);
          localStorage.removeItem('star_wholesale_user');
          setRefreshToast('Logged out successfully');
          setTimeout(() => setRefreshToast(''), 2500);
        }}
        onOpenAdmin={() => setCurrentScreen('admin')}
        onOpenAddresses={() => setIsAddressModalOpen(true)}
        onSelectLanguage={(lang) => setConfig({ ...config, language: lang })}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* Product Details Modal */}
      {productDetail && (
        <ProductDetailModal
          product={productDetail}
          onClose={() => setProductDetail(null)}
          cartQty={cart[productDetail.id] || 0}
          config={config}
          allProducts={products}
          onUpdateCart={handleUpdateCart}
          onSetCartQty={handleSetCartQty}
          onSelectProduct={(p) => setProductDetail(p)}
        />
      )}

      {/* Address Form / Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        config={config}
        initialAddress={selectedAddress}
        savedAddresses={user?.addresses || []}
        onSaveAddress={handleSaveAndSelectAddress}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        config={config}
        onLoginSuccess={(profile) => {
          setUser(profile);
          if (profile.addresses && profile.addresses.length > 0) {
            setSelectedAddress(profile.addresses[0]);
            localStorage.setItem('star_wholesale_address', JSON.stringify(profile.addresses[0]));
          }
          setCustomers((prev) => {
            const exists = prev.some((c) => c.phone === profile.phone || c.name === profile.name);
            if (!exists) {
              return [profile, ...prev];
            }
            return prev.map((c) => (c.phone === profile.phone ? profile : c));
          });
        }}
      />

      {/* Filter / Sort Bottom Sheet */}
      {showFilterSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-2">
          <div className="bg-white w-full max-w-md rounded-t-3xl rounded-b-2xl shadow-2xl p-4 text-xs space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <SlidersHorizontal size={16} className="text-teal-700" />
                <span>Sort & Filter Catalog</span>
              </h3>
              <button onClick={() => setShowFilterSheet(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            {/* Sorting options */}
            <div>
              <label className="block text-slate-500 font-bold mb-1.5">Sort Products By</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'featured' as const, label: 'Featured / Best' },
                  { id: 'price_low' as const, label: 'Price: Low to High' },
                  { id: 'price_high' as const, label: 'Price: High to Low' },
                  { id: 'name' as const, label: 'Alphabetical A-Z' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSortBy(s.id)}
                    className={`py-2 px-2.5 rounded-xl border text-left font-semibold ${
                      sortBy === s.id
                        ? 'border-teal-600 bg-teal-50 text-teal-800'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-slate-500 font-bold mb-1.5">Department / Category</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedCategoryFilter('All')}
                  className={`px-3 py-1.5 rounded-full font-semibold ${
                    selectedCategoryFilter === 'All'
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategoryFilter(c.name)}
                    className={`px-3 py-1.5 rounded-full font-semibold ${
                      selectedCategoryFilter === c.name
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowFilterSheet(false)}
              className="w-full py-2.5 bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
