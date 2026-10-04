import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Lock, Palette, Store, Package, 
  Trash2, Plus, Edit, Check, RefreshCw, Key, 
  ShoppingBag, Send, FileText, X, Users, DollarSign, 
  Search, Eye, Phone, MapPin, Sparkles, PlusCircle, 
  CheckCircle2, AlertCircle, ExternalLink, Printer,
  Download, Image as ImageIcon, ShieldCheck, ChevronRight,
  TrendingUp, CreditCard, Building2, UserPlus, Filter,
  Sun, Moon, Layers, CheckSquare, Settings2, SlidersHorizontal,
  LogOut, Activity, Crop, Bell, Megaphone, Tag
} from 'lucide-react';
import { AppConfig, Product, Category, Order, CustomerProfile, OrderItem, PaymentSettings, HeroBanner, AppNotification } from '../types';
import { THEME_PRESETS, INITIAL_HERO_BANNERS, INITIAL_NOTIFICATIONS } from '../data/initialData';
import { BannerCropperModal } from './BannerCropperModal';

interface AdminPanelProps {
  config: AppConfig;
  products: Product[];
  categories: Category[];
  orders: Order[];
  customers: CustomerProfile[];
  onUpdateConfig: (newConfig: AppConfig) => void;
  onAddProduct: (prod: Product) => void;
  onUpdateProduct: (prod: Product) => void;
  onDeleteProduct: (id: number) => void;
  onAddCustomer: (cust: CustomerProfile) => void;
  onAddOrder: (order: Order) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onClose: () => void;
  onResetData: () => void;
  onViewOrderInvoice: (order: Order) => void;
  onPreviewSplash?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  config,
  products,
  categories,
  orders,
  customers,
  onUpdateConfig,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddCustomer,
  onAddOrder,
  onUpdateOrderStatus,
  onClose,
  onResetData,
  onViewOrderInvoice,
  onPreviewSplash,
}) => {
  // STRICT PIN MANAGEMENT: Read from localStorage first to prevent reverting
  const [currentActivePin, setCurrentActivePin] = useState<string>(() => {
    return localStorage.getItem('star_admin_pin') || config.adminPin || '1234';
  });

  // PERSISTENT AUTHENTICATION: Keep admin logged in across app reloads/exits
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('star_admin_session_auth') === 'true';
  });

  // ADMIN THEME (DARK / WHITE MODE TOGGLE)
  const [adminTheme, setAdminTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('star_admin_theme') as 'dark' | 'light') || 'dark';
  });

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'customers' | 'payments' | 'banners' | 'notifications' | 'branding' | 'security'>(() => {
    const saved = localStorage.getItem('star_admin_active_tab') as any;
    if (saved && ['overview', 'orders', 'products', 'customers', 'payments', 'banners', 'notifications', 'branding', 'security'].includes(saved)) {
      return saved;
    }
    return 'overview';
  });

  useEffect(() => {
    localStorage.setItem('star_admin_active_tab', activeTab);
  }, [activeTab]);

  // Config local form state
  const [localConfig, setLocalConfig] = useState<AppConfig>({ ...config, adminPin: currentActivePin });
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Hero Banners Management State (30-Sec Carousel & Cropper)
  const [bannersList, setBannersList] = useState<HeroBanner[]>(() => {
    return localConfig.heroBanners && localConfig.heroBanners.length > 0 
      ? localConfig.heroBanners 
      : INITIAL_HERO_BANNERS;
  });
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [isBannerCropperOpen, setIsBannerCropperOpen] = useState(false);

  // Notifications & Offer Bar Management State
  const [notificationsList, setNotificationsList] = useState<AppNotification[]>(() => {
    return localConfig.notifications && localConfig.notifications.length > 0
      ? localConfig.notifications
      : INITIAL_NOTIFICATIONS;
  });
  const [isCreateNotifOpen, setIsCreateNotifOpen] = useState(false);
  const [editingNotifId, setEditingNotifId] = useState<string | null>(null);
  const [notifForm, setNotifForm] = useState<Partial<AppNotification>>({
    type: 'offer',
    tag: '🏷️ SPECIAL OFFER',
    title: '',
    desc: '',
    time: 'Limited Time',
    targetCategory: categories[0]?.name || 'Drinks & Water',
    active: true,
    showInTopBar: true,
    topBarBadge: 'HOT DEAL',
  });

  // Payment Settings State
  const defaultPaymentSettings: PaymentSettings = {
    enableCashOnDelivery: true,
    enableCreditCard: true,
    enableBankTransfer: true,
    enableCreditTerms: true,
    bankName: 'Bank Muscat',
    bankAccountNo: '0314012250190011',
    bankIban: 'OM23BMUS0314012250190011',
    bankBeneficiary: 'SMART ENERGY TRADING LLC',
    bankBranch: 'Azaiba Branch, Muscat',
    acceptedCardTypes: 'Visa, MasterCard, OmanNet Debit',
    customPaymentNotes: 'Wholesale settlements accepted via Cash, Card, or Direct Bank Transfer.',
  };

  const [paymentForm, setPaymentForm] = useState<PaymentSettings>(
    config.paymentSettings || defaultPaymentSettings
  );

  // Orders Search & Filter State
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderSearchInput, setOrderSearchInput] = useState('');
  const [orderLocationFilter, setOrderLocationFilter] = useState<string>('All');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'All' | 'Confirmed' | 'Pending' | 'Out for Delivery' | 'Delivered'>('All');

  // Product Management State
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('All');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddProductMode, setIsAddProductMode] = useState(false);
  const [prodForm, setProdForm] = useState<Partial<Product>>({
    id: 5600,
    name: '',
    arabicName: '',
    category: categories[0]?.name || 'Drinks & Water',
    brand: 'Kinza',
    price: 2.100,
    pack: '# 6',
    size: '1 Liter',
    unit: 'Pieces',
    pricePerUnit: 0.350,
    supplier: localConfig.companyName,
    img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80',
    description: '',
    stock: 150,
  });

  // Create Order in Admin State
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [selectedCustName, setSelectedCustName] = useState(customers[0]?.name || '');
  const [selectedCustPhone, setSelectedCustPhone] = useState(customers[0]?.phone || '');
  const [selectedCustCity, setSelectedCustCity] = useState(customers[0]?.addresses[0]?.city || 'Azaiba');
  const [orderPaymentTerm, setOrderPaymentTerm] = useState('Cash on Delivery');
  const [orderItemsBuilder, setOrderItemsBuilder] = useState<{ [productId: number]: number }>({
    5518: 2,
    5505: 1,
  });

  // Customer Management State
  const [customerSearch, setCustomerSearch] = useState('');
  const [isAddCustOpen, setIsAddCustOpen] = useState(false);
  const [newCustForm, setNewCustForm] = useState<Partial<CustomerProfile>>({
    name: '',
    phone: '',
    email: '',
    customerType: 'Grocery & Super Market',
  });
  const [newCustCity, setNewCustCity] = useState('Muscat');
  const [newCustRegion, setNewCustRegion] = useState('Azaiba');

  // Admin Activity Audit Log
  const [auditLogs, setAuditLogs] = useState<string[]>(() => {
    const saved = localStorage.getItem('star_admin_audit_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [
      `System initialized at ${new Date().toLocaleDateString()}`,
      `Security PIN verified successfully`,
    ];
  });

  const addAuditLog = (action: string) => {
    const log = `[${new Date().toLocaleTimeString()}] ${action}`;
    setAuditLogs((prev) => {
      const next = [log, ...prev.slice(0, 19)];
      localStorage.setItem('star_admin_audit_logs', JSON.stringify(next));
      return next;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Toggle Dark / Light Theme
  const handleToggleTheme = () => {
    const nextTheme = adminTheme === 'dark' ? 'light' : 'dark';
    setAdminTheme(nextTheme);
    localStorage.setItem('star_admin_theme', nextTheme);
    showToast(`Switched to ${nextTheme === 'dark' ? '🌙 Obsidian Dark' : '☀️ Clean White'} Theme`);
  };

  // STRICT PIN VERIFICATION
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === currentActivePin.trim()) {
      setIsAuthenticated(true);
      localStorage.setItem('star_admin_session_auth', 'true');
      setPinInput('');
      setPinError('');
      addAuditLog('Admin session authenticated');
    } else {
      setPinError(`Access Denied! Incorrect PIN entered.`);
    }
  };

  // LOCK SESSION
  const handleLockSession = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('star_admin_session_auth');
    showToast('🔒 Admin session locked');
  };

  // SAVE PIN WITH STRICT PERSISTENCE
  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.trim().length < 4) {
      showToast('⚠️ PIN must be at least 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      showToast('⚠️ PIN confirmation does not match');
      return;
    }

    const cleanPin = newPin.trim();
    localStorage.setItem('star_admin_pin', cleanPin);
    setCurrentActivePin(cleanPin);

    const updated = { ...localConfig, adminPin: cleanPin };
    setLocalConfig(updated);
    onUpdateConfig(updated);

    setNewPin('');
    setConfirmPin('');
    addAuditLog(`Security PIN updated. Previous PIN invalidated.`);
    showToast(`✓ Admin PIN changed to: ${cleanPin}. Previous PIN is permanently invalid!`);
  };

  // SAVE PAYMENT SETTINGS
  const handleSavePayments = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...localConfig,
      paymentSettings: paymentForm,
      bankDetails: `${paymentForm.bankName}\nAccount: ${paymentForm.bankAccountNo}\nIBAN: ${paymentForm.bankIban}\nBeneficiary: ${paymentForm.bankBeneficiary}`,
    };
    setLocalConfig(updated);
    onUpdateConfig(updated);
    addAuditLog('Payment methods & bank details updated');
    showToast('✓ Payment methods & Bank accounts saved successfully!');
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(localConfig);
    addAuditLog('Store branding & tax info updated');
    showToast('✓ Branding, Logo & Company details saved!');
  };

  // HERO BANNER MANAGEMENT (30s Carousel & Cropper Handlers)
  const handleToggleBannerActive = (bannerId: string) => {
    const updated = bannersList.map((b) => b.id === bannerId ? { ...b, active: !b.active } : b);
    setBannersList(updated);
    const updatedConfig = { ...localConfig, heroBanners: updated };
    setLocalConfig(updatedConfig);
    onUpdateConfig(updatedConfig);
    showToast('✓ Banner visibility updated');
  };

  const handleAddNewBanner = () => {
    const newId = `banner-${Date.now()}`;
    const newBanner: HeroBanner = {
      id: newId,
      badge: 'SPECIAL OFFER',
      title: 'New Container Arrival Deals',
      subtitle: `Free delivery across Muscat on orders over ${localConfig.freeDeliveryThreshold.toFixed(3)} ${localConfig.currency}`,
      buttonText: 'Order Now',
      targetCategory: categories[0]?.name || 'Drinks & Water',
      imgUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=1200&auto=format&fit=crop&q=80',
      active: true,
      aspectRatio: '16:7',
    };
    const updated = [...bannersList, newBanner];
    setBannersList(updated);
    const updatedConfig = { ...localConfig, heroBanners: updated };
    setLocalConfig(updatedConfig);
    onUpdateConfig(updatedConfig);
    setEditingBanner(newBanner);
    setIsBannerCropperOpen(true);
    addAuditLog('Created new promo banner');
  };

  const handleDeleteBanner = (bannerId: string) => {
    if (bannersList.length <= 1) {
      showToast('⚠️ You need at least 1 hero banner');
      return;
    }
    const updated = bannersList.filter((b) => b.id !== bannerId);
    setBannersList(updated);
    const updatedConfig = { ...localConfig, heroBanners: updated };
    setLocalConfig(updatedConfig);
    onUpdateConfig(updatedConfig);
    addAuditLog('Removed banner ' + bannerId);
    showToast('✓ Banner deleted');
  };

  const handleSaveCroppedBanner = (updatedBanner: HeroBanner) => {
    const updated = bannersList.map((b) => b.id === updatedBanner.id ? updatedBanner : b);
    setBannersList(updated);
    const updatedConfig = { ...localConfig, heroBanners: updated };
    setLocalConfig(updatedConfig);
    onUpdateConfig(updatedConfig);
    addAuditLog(`Cropped and saved banner: ${updatedBanner.title}`);
    showToast('✓ Cropped banner saved & live in 30s carousel!');
    setIsBannerCropperOpen(false);
    setEditingBanner(null);
  };

  const handleSaveAllBanners = () => {
    const updatedConfig = { ...localConfig, heroBanners: bannersList };
    setLocalConfig(updatedConfig);
    onUpdateConfig(updatedConfig);
    addAuditLog('Saved all hero banners');
    showToast('✓ All banners saved to store carousel successfully!');
  };

  // NOTIFICATION & OFFER BAR HANDLERS
  const handleToggleNotificationActive = (id: string) => {
    const updated = notificationsList.map((n) => n.id === id ? { ...n, active: !n.active } : n);
    setNotificationsList(updated);
    const updatedConfig = { ...localConfig, notifications: updated };
    setLocalConfig(updatedConfig);
    onUpdateConfig(updatedConfig);
    showToast('✓ Notification visibility updated');
  };

  const handleToggleNotificationTopBar = (id: string) => {
    const updated = notificationsList.map((n) => n.id === id ? { ...n, showInTopBar: !n.showInTopBar } : n);
    setNotificationsList(updated);
    const updatedConfig = { ...localConfig, notifications: updated };
    setLocalConfig(updatedConfig);
    onUpdateConfig(updatedConfig);
    showToast('✓ Top offer bar pin status updated');
  };

  const handleDeleteNotification = (id: string) => {
    const updated = notificationsList.filter((n) => n.id !== id);
    setNotificationsList(updated);
    const updatedConfig = { ...localConfig, notifications: updated };
    setLocalConfig(updatedConfig);
    onUpdateConfig(updatedConfig);
    addAuditLog('Deleted notification ' + id);
    showToast('✓ Notification removed');
  };

  const handleOpenEditNotification = (notif: AppNotification) => {
    setEditingNotifId(notif.id);
    setNotifForm({
      type: notif.type,
      tag: notif.tag,
      title: notif.title,
      desc: notif.desc,
      time: notif.time,
      targetCategory: notif.targetCategory,
      active: notif.active,
      showInTopBar: notif.showInTopBar,
      topBarBadge: notif.topBarBadge || 'HOT DEAL',
    });
    setIsCreateNotifOpen(true);
  };

  const handleApplyNotificationPreset = (preset: Partial<AppNotification>) => {
    setNotifForm((prev) => ({
      ...prev,
      ...preset,
    }));
    showToast(`✓ Applied preset: ${preset.title?.slice(0, 25)}...`);
  };

  const handleSaveNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifForm.title || !notifForm.desc) {
      showToast('⚠️ Please enter an offer title and description');
      return;
    }

    let updated: AppNotification[];
    if (editingNotifId) {
      updated = notificationsList.map((n) =>
        n.id === editingNotifId
          ? {
              ...n,
              type: notifForm.type || 'offer',
              tag: notifForm.tag || '🏷️ SPECIAL OFFER',
              title: notifForm.title!.trim(),
              desc: notifForm.desc!.trim(),
              time: notifForm.time || 'Limited Time',
              targetCategory: notifForm.targetCategory,
              active: notifForm.active ?? true,
              showInTopBar: notifForm.showInTopBar ?? true,
              topBarBadge: notifForm.topBarBadge || 'HOT DEAL',
            }
          : n
      );
      showToast('✓ Notification updated successfully!');
      addAuditLog(`Updated notification: ${notifForm.title}`);
    } else {
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        type: notifForm.type || 'offer',
        tag: notifForm.tag || '🏷️ SPECIAL OFFER',
        title: notifForm.title!.trim(),
        desc: notifForm.desc!.trim(),
        time: notifForm.time || 'Just now',
        targetCategory: notifForm.targetCategory,
        active: notifForm.active ?? true,
        showInTopBar: notifForm.showInTopBar ?? true,
        topBarBadge: notifForm.topBarBadge || 'HOT DEAL',
      };
      updated = [newNotif, ...notificationsList];
      showToast('✓ New notification & offer published to store!');
      addAuditLog(`Published notification: ${newNotif.title}`);
    }

    setNotificationsList(updated);
    const updatedConfig = { ...localConfig, notifications: updated };
    setLocalConfig(updatedConfig);
    onUpdateConfig(updatedConfig);
    setIsCreateNotifOpen(false);
    setEditingNotifId(null);
    setNotifForm({
      type: 'offer',
      tag: '🏷️ SPECIAL OFFER',
      title: '',
      desc: '',
      time: 'Limited Time',
      targetCategory: categories[0]?.name || 'Drinks & Water',
      active: true,
      showInTopBar: true,
      topBarBadge: 'HOT DEAL',
    });
  };

  const handleSelectPresetTheme = (preset: typeof THEME_PRESETS[0]) => {
    const updated = {
      ...localConfig,
      themePreset: preset.id,
      customColor: preset.primary,
    };
    setLocalConfig(updated);
    document.documentElement.style.setProperty('--theme-primary', preset.primary);
  };

  const handleCustomColorChange = (color: string) => {
    const updated = {
      ...localConfig,
      customColor: color,
      themePreset: 'custom',
    };
    setLocalConfig(updated);
    document.documentElement.style.setProperty('--theme-primary', color);
  };

  // PRODUCT CRUD
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name || !prodForm.price) {
      showToast('⚠️ Please enter product title and wholesale price');
      return;
    }

    if (isAddProductMode) {
      const newProd: Product = {
        id: prodForm.id ? parseInt(prodForm.id.toString(), 10) : Math.floor(5600 + Math.random() * 4000),
        name: prodForm.name,
        arabicName: prodForm.arabicName || prodForm.name,
        category: prodForm.category || categories[0]?.name || 'Drinks & Water',
        brand: prodForm.brand || 'Wholesale',
        price: parseFloat(prodForm.price.toString()),
        pack: prodForm.pack || '# 24',
        size: prodForm.size || '250 ml',
        unit: prodForm.unit || 'Pieces',
        pricePerUnit: prodForm.pricePerUnit ? parseFloat(prodForm.pricePerUnit.toString()) : (parseFloat(prodForm.price.toString()) / 24),
        supplier: prodForm.supplier || localConfig.companyName,
        img: prodForm.img || 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80',
        description: prodForm.description || '',
        stock: prodForm.stock || 100,
        isFeatured: true,
      };
      onAddProduct(newProd);
      addAuditLog(`Added product #${newProd.id}: ${newProd.name}`);
      showToast(`✓ Added product: #${newProd.id} ${newProd.name}`);
      setIsAddProductMode(false);
    } else if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        name: prodForm.name || editingProduct.name,
        arabicName: prodForm.arabicName || editingProduct.arabicName,
        category: prodForm.category || editingProduct.category,
        brand: prodForm.brand || editingProduct.brand,
        price: parseFloat((prodForm.price || editingProduct.price).toString()),
        pack: prodForm.pack || editingProduct.pack,
        size: prodForm.size || editingProduct.size,
        unit: prodForm.unit || editingProduct.unit,
        pricePerUnit: parseFloat((prodForm.pricePerUnit || editingProduct.pricePerUnit).toString()),
        img: prodForm.img || editingProduct.img,
        stock: prodForm.stock !== undefined ? prodForm.stock : editingProduct.stock,
      };
      onUpdateProduct(updated);
      addAuditLog(`Updated product #${updated.id}: ${updated.name}`);
      showToast(`✓ Updated product: #${updated.id}`);
      setEditingProduct(null);
    }
  };

  // 1-Click Stock Adjuster
  const handleAdjustStock = (productId: number, delta: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const nextStock = Math.max(0, (prod.stock || 0) + delta);
    onUpdateProduct({ ...prod, stock: nextStock });
    showToast(`Stock for #${prod.id} updated to ${nextStock}`);
  };

  // CUSTOMER / USER CREATION
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustForm.name || !newCustForm.phone) {
      showToast('⚠️ Please enter customer name and phone');
      return;
    }
    const newCustomer: CustomerProfile = {
      id: `cust-${Date.now().toString().slice(-4)}`,
      name: newCustForm.name,
      phone: newCustForm.phone,
      email: newCustForm.email || `${newCustForm.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@wholesale.om`,
      customerType: newCustForm.customerType || 'Grocery & Super Market',
      joinedDate: new Date().toISOString().slice(0, 10).replace(/-/g, '/'),
      ordersCount: 0,
      totalSpent: 0,
      addresses: [
        {
          id: `addr-${Date.now()}`,
          title: 'Store Location',
          country: 'Oman',
          region: newCustRegion,
          city: newCustCity,
          locationLink: `https://maps.google.com/?q=${encodeURIComponent(newCustCity + ' Oman')}`,
          closeAtNoon: false,
          note: 'Direct wholesale delivery',
        },
      ],
    };
    onAddCustomer(newCustomer);
    addAuditLog(`Registered buyer: ${newCustomer.name} (${newCustomer.phone})`);
    showToast(`✓ Registered Wholesale Buyer: ${newCustomer.name}`);
    setIsAddCustOpen(false);
    setNewCustForm({ name: '', phone: '', email: '', customerType: 'Grocery & Super Market' });
  };

  // ORDER CREATION IN ADMIN
  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeItemEntries = Object.entries(orderItemsBuilder).filter(([_, qty]) => qty > 0);
    if (activeItemEntries.length === 0) {
      showToast('⚠️ Please add at least 1 wholesale item to the order');
      return;
    }

    const orderItems: OrderItem[] = activeItemEntries.map(([pId, qty]) => {
      const prod = products.find((p) => p.id === parseInt(pId, 10));
      const price = prod?.price || 1.500;
      const lineTotal = price * qty;
      const vatAmount = lineTotal * 0.05;
      return {
        productId: parseInt(pId, 10),
        name: prod?.name || `Product #${pId}`,
        arabicName: prod?.arabicName || '',
        price,
        pack: prod?.pack || '# 24',
        size: prod?.size || '',
        unit: prod?.unit || 'Pieces',
        quantity: qty,
        total: lineTotal,
        vatAmount,
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    const vat = subtotal * 0.05;
    const deliveryFee = subtotal >= localConfig.freeDeliveryThreshold ? 0 : 1.500;
    const grandTotal = subtotal + vat + deliveryFee;

    const newOrder: Order = {
      id: `ORD-ADMIN-${Date.now().toString().slice(-6)}`,
      invoiceNo: `TW-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      date: new Date().toISOString().slice(0, 10).replace(/-/g, '/'),
      customerName: selectedCustName || 'Wholesale Buyer',
      phone: selectedCustPhone || localConfig.whatsappNumber,
      customerType: 'Grocery & Super Market',
      address: {
        id: 'addr-manual',
        title: 'Wholesale Storefront',
        country: 'Oman',
        region: 'Muscat',
        city: selectedCustCity,
        locationLink: 'https://maps.google.com/?q=23.5880,58.3829',
        closeAtNoon: false,
        note: 'Direct Wholesale Order',
      },
      items: orderItems,
      subtotal,
      vat,
      deliveryFee,
      grandTotal,
      status: 'Confirmed',
      paymentMethod: orderPaymentTerm,
      paymentDetails: `${orderPaymentTerm} - Admin Authorized`,
    };

    onAddOrder(newOrder);
    addAuditLog(`Created manual Order #${newOrder.invoiceNo} for ${newOrder.customerName}`);
    setIsCreateOrderOpen(false);
    showToast(`✓ Order & Invoice #${newOrder.invoiceNo} generated successfully!`);
    onViewOrderInvoice(newOrder);
  };

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalUnitsOrdered = orders.reduce((sum, o) => sum + o.items.reduce((s, it) => s + it.quantity, 0), 0);

  // SEARCH AND FILTER ORDERS (By Name, Phone, Invoice No, Location, Product)
  const filteredOrders = orders.filter((o) => {
    // Status filter
    if (orderStatusFilter !== 'All' && o.status !== orderStatusFilter) {
      return false;
    }
    // Location filter
    if (orderLocationFilter !== 'All') {
      const locText = o.address ? `${o.address.city} ${o.address.region} ${o.address.title} ${o.address.note}`.toLowerCase() : '';
      if (!locText.includes(orderLocationFilter.toLowerCase())) {
        return false;
      }
    }
    // Query search
    if (!orderSearchQuery.trim()) return true;
    const q = orderSearchQuery.toLowerCase().trim();
    const matchName = o.customerName.toLowerCase().includes(q);
    const matchPhone = o.phone.toLowerCase().includes(q);
    const matchInvoice = o.invoiceNo.toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
    const matchLocation = o.address ? `${o.address.city} ${o.address.region} ${o.address.title} ${o.address.note}`.toLowerCase().includes(q) : false;
    const matchProduct = o.items.some((it) => it.name.toLowerCase().includes(q) || it.productId.toString().includes(q));
    const matchPayment = o.paymentMethod?.toLowerCase().includes(q);
    return matchName || matchPhone || matchInvoice || matchLocation || matchProduct || matchPayment;
  });

  // Filter products for search & category
  const filteredProducts = products.filter((p) => {
    if (productCategoryFilter !== 'All' && p.category !== productCategoryFilter) {
      return false;
    }
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase().trim();
    return p.name.toLowerCase().includes(q) || p.id.toString().includes(q) || p.brand.toLowerCase().includes(q);
  });

  // Filter customers for search
  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch) ||
    c.customerType.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.addresses[0]?.city.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // THEME STYLES (DARK VS LIGHT)
  const isDark = adminTheme === 'dark';
  const themeBg = isDark ? 'bg-[#090d16] text-slate-100' : 'bg-slate-100 text-slate-900';
  const themeHeaderBg = isDark ? 'bg-[#0d1322] border-slate-800/80' : 'bg-white border-slate-200 shadow-xs';
  const themeNavBg = isDark ? 'bg-[#090e1a] border-slate-800' : 'bg-slate-50 border-slate-200';
  const themeCardBg = isDark ? 'bg-[#0f172a] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const themeSubCardBg = isDark ? 'bg-slate-900/80 border-slate-800/80' : 'bg-slate-50 border-slate-200';
  const themeInputBg = isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400';
  const themeTextMuted = isDark ? 'text-slate-400' : 'text-slate-600';

  // ================= PIN AUTH GATE (STRICT) =================
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
        <div className="bg-[#0f172a] border border-slate-800 text-white rounded-3xl p-7 w-full max-w-sm shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/30">
            <Lock size={30} />
          </div>

          <h3 className="text-lg font-black tracking-tight text-white mb-1">
            Executive Admin Portal
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Enter your active administrator passcode to access store analytics, orders, products & users.
          </p>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={8}
                autoFocus
                autoComplete="off"
                placeholder="Enter Security PIN"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3.5 text-center text-2xl font-black tracking-widest text-indigo-400 focus:outline-indigo-500 focus:border-indigo-500 shadow-inner"
              />
            </div>

            {pinError && (
              <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-bold flex items-center justify-center gap-1.5">
                <AlertCircle size={14} />
                <span>{pinError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all active:scale-98"
            >
              Authenticate & Enter
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white font-bold transition-colors"
            >
              ← Cancel & Return to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= MAIN ADMIN DASHBOARD =================
  return (
    <div className={`fixed inset-0 z-50 flex flex-col overflow-hidden font-sans transition-colors ${themeBg}`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-2xl z-70 border border-indigo-400/40 flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <Sparkles size={14} className="text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP HEADER BAR (Fixed 56px, Never Cut Off) */}
      <header className={`h-14 border-b px-3 sm:px-6 flex items-center justify-between shrink-0 z-30 transition-colors ${themeHeaderBg}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              isDark ? 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
            title="Exit to customer app"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Store</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className={`font-black text-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {config.name.toUpperCase()} CONTROL CENTER
              </h2>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-md font-mono font-bold">
                ADMIN
              </span>
            </div>
            <p className={`text-[10px] hidden sm:block ${themeTextMuted}`}>
              {config.companyName} • Oman Wholesale Supermarket Hub
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Dark / Light Mode Toggle */}
          <button
            onClick={handleToggleTheme}
            className={`p-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title="Toggle Dark / White Theme"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
          </button>

          {/* Quick Create Order shortcut */}
          <button
            onClick={() => setIsCreateOrderOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
          >
            <PlusCircle size={15} />
            <span>New Order</span>
          </button>

          {/* Lock Session */}
          <button
            onClick={handleLockSession}
            className={`p-1.5 rounded-xl transition-colors ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Lock Admin Session"
          >
            <LogOut size={16} />
          </button>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Close Admin and return to Store"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* 2. TAB NAVIGATION BAR (Fixed 48px, Horizontally Scrollable, Never Clipped) */}
      <nav className={`h-12 border-b px-3 sm:px-6 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 z-20 text-xs font-semibold ${themeNavBg}`}>
        {[
          { id: 'overview' as const, label: 'Overview', icon: TrendingUp },
          { id: 'orders' as const, label: `Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'products' as const, label: `Products (${products.length})`, icon: Package },
          { id: 'customers' as const, label: `Users & Buyers (${customers.length})`, icon: Users },
          { id: 'payments' as const, label: 'Payments & Banking', icon: CreditCard },
          { id: 'banners' as const, label: `Hero Banners (${bannersList.length})`, icon: ImageIcon },
          { id: 'notifications' as const, label: `Offers & Notices (${notificationsList.length})`, icon: Bell },
          { id: 'branding' as const, label: 'Store & Identity', icon: Palette },
          { id: 'security' as const, label: 'Security & PIN', icon: Key },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                  : isDark 
                    ? 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                    : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 3. SCROLLABLE DASHBOARD BODY */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-6 pb-28 text-xs max-w-5xl w-full mx-auto">
        
        {/* ================= TAB 1: OVERVIEW METRICS ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className={`${themeCardBg} p-4 rounded-2xl space-y-1 relative overflow-hidden border`}>
                <div className="absolute top-2 right-2 p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <DollarSign size={18} />
                </div>
                <span className={`text-[10px] ${themeTextMuted} uppercase font-bold tracking-wider`}>Total Sales</span>
                <p className="text-xl sm:text-2xl font-black text-emerald-500 font-mono">
                  {totalRevenue.toFixed(3)} <span className="text-xs text-emerald-600">{config.currency}</span>
                </p>
                <p className={`text-[10px] ${themeTextMuted}`}>Across {orders.length} wholesale orders</p>
              </div>

              <div className={`${themeCardBg} p-4 rounded-2xl space-y-1 relative overflow-hidden border`}>
                <div className="absolute top-2 right-2 p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <ShoppingBag size={18} />
                </div>
                <span className={`text-[10px] ${themeTextMuted} uppercase font-bold tracking-wider`}>Total Orders</span>
                <p className="text-xl sm:text-2xl font-black text-indigo-500 font-mono">
                  {orders.length}
                </p>
                <p className={`text-[10px] ${themeTextMuted}`}>{totalUnitsOrdered} total carton units</p>
              </div>

              <div className={`${themeCardBg} p-4 rounded-2xl space-y-1 relative overflow-hidden border`}>
                <div className="absolute top-2 right-2 p-2 bg-sky-500/10 rounded-xl text-sky-400">
                  <Users size={18} />
                </div>
                <span className={`text-[10px] ${themeTextMuted} uppercase font-bold tracking-wider`}>Registered Users</span>
                <p className="text-xl sm:text-2xl font-black text-sky-500 font-mono">
                  {customers.length}
                </p>
                <p className={`text-[10px] ${themeTextMuted}`}>Supermarket accounts</p>
              </div>

              <div className={`${themeCardBg} p-4 rounded-2xl space-y-1 relative overflow-hidden border`}>
                <div className="absolute top-2 right-2 p-2 bg-amber-500/10 rounded-xl text-amber-400">
                  <Package size={18} />
                </div>
                <span className={`text-[10px] ${themeTextMuted} uppercase font-bold tracking-wider`}>Catalog Items</span>
                <p className="text-xl sm:text-2xl font-black text-amber-500 font-mono">
                  {products.length}
                </p>
                <p className={`text-[10px] ${themeTextMuted}`}>Wholesale products active</p>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className={`${themeCardBg} rounded-2xl p-4 space-y-3 border`}>
              <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Sparkles size={16} className="text-indigo-400" />
                <span>Executive Management Actions</span>
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={() => setIsCreateOrderOpen(true)}
                  className={`p-3 rounded-xl text-left transition-colors border group ${
                    isDark ? 'bg-slate-900 hover:bg-slate-800 border-slate-800' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <PlusCircle size={18} className="text-indigo-500 mb-1 group-hover:scale-110 transition-transform" />
                  <p className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>Create New Order</p>
                  <p className={`text-[10px] ${themeTextMuted}`}>Manual B2B invoice</p>
                </button>

                <button
                  onClick={() => {
                    setIsAddProductMode(true);
                    setActiveTab('products');
                  }}
                  className={`p-3 rounded-xl text-left transition-colors border group ${
                    isDark ? 'bg-slate-900 hover:bg-slate-800 border-slate-800' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <Package size={18} className="text-amber-500 mb-1 group-hover:scale-110 transition-transform" />
                  <p className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>Add Product</p>
                  <p className={`text-[10px] ${themeTextMuted}`}>Catalog new item</p>
                </button>

                <button
                  onClick={() => setActiveTab('payments')}
                  className={`p-3 rounded-xl text-left transition-colors border group ${
                    isDark ? 'bg-slate-900 hover:bg-slate-800 border-slate-800' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <CreditCard size={18} className="text-emerald-500 mb-1 group-hover:scale-110 transition-transform" />
                  <p className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>Payment Methods</p>
                  <p className={`text-[10px] ${themeTextMuted}`}>Bank, Cards & COD</p>
                </button>

                <button
                  onClick={() => setActiveTab('branding')}
                  className={`p-3 rounded-xl text-left transition-colors border group ${
                    isDark ? 'bg-slate-900 hover:bg-slate-800 border-slate-800' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <Palette size={18} className="text-purple-500 mb-1 group-hover:scale-110 transition-transform" />
                  <p className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>Store Branding</p>
                  <p className={`text-[10px] ${themeTextMuted}`}>Logo, CR, VATIN details</p>
                </button>
              </div>
            </div>

            {/* Audit Log Preview */}
            <div className={`${themeCardBg} rounded-2xl p-4 space-y-3 border`}>
              <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Activity size={16} className="text-sky-400" />
                <span>Recent Admin Activity Logs</span>
              </h3>
              <div className="space-y-1.5 font-mono text-[11px]">
                {auditLogs.slice(0, 5).map((log, i) => (
                  <div key={i} className={`p-2 rounded-lg ${isDark ? 'bg-slate-900/60 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
                    {log}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 2: ORDERS MANAGEMENT WITH ADVANCED SEARCH ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Wholesale Invoices & Orders ({orders.length})
                </h3>
                <p className={`text-[11px] ${themeTextMuted}`}>
                  Search by Customer Name, Phone, Invoice #, Location, or Product
                </p>
              </div>

              <button
                onClick={() => setIsCreateOrderOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
              >
                <PlusCircle size={15} />
                <span>Create Wholesale Order</span>
              </button>
            </div>

            {/* POWERFUL ORDERS SEARCH & FILTER BAR (Requested by user: Search Button, Name, Number, Location, any query) */}
            <div className={`${themeCardBg} p-3.5 rounded-2xl border space-y-3`}>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  setOrderSearchQuery(orderSearchInput.trim());
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${themeTextMuted}`} />
                  <input
                    type="text"
                    placeholder="Search by customer name, phone (+968...), invoice # (TW-...), city/location, or product..."
                    value={orderSearchInput}
                    onChange={(e) => {
                      setOrderSearchInput(e.target.value);
                      setOrderSearchQuery(e.target.value);
                    }}
                    className={`w-full rounded-xl pl-10 pr-9 py-2.5 text-xs font-medium focus:outline-indigo-500 shadow-inner ${themeInputBg}`}
                  />
                  {orderSearchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setOrderSearchInput('');
                        setOrderSearchQuery('');
                      }}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full ${themeTextMuted} hover:text-white`}
                      title="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Explicit Search Button (As requested by user: 'এখানে অর্ডারের অপশনে সার্চ বাটন রাখো') */}
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all shrink-0 active:scale-98"
                >
                  <Search size={14} />
                  <span>Search</span>
                </button>
              </form>

              {/* Location & Status Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* Location Filter Dropdown */}
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-amber-500 shrink-0" />
                  <select
                    value={orderLocationFilter}
                    onChange={(e) => setOrderLocationFilter(e.target.value)}
                    className={`w-full rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-indigo-500 ${themeInputBg}`}
                  >
                    <option value="All">All Locations & Cities</option>
                    <option value="Azaiba">Azaiba (عذيبة)</option>
                    <option value="Muscat">Muscat (مسقط)</option>
                    <option value="Seeb">Seeb (السيب)</option>
                    <option value="Bawshar">Bawshar (بوشر)</option>
                    <option value="Al Khuwair">Al Khuwair (الخوير)</option>
                    <option value="Muttrah">Muttrah (مطرح)</option>
                    <option value="Ruwi">Ruwi (روي)</option>
                    <option value="Barka">Barka (بركاء)</option>
                    <option value="Sohar">Sohar (صحار)</option>
                    <option value="Salalah">Salalah (صلالة)</option>
                  </select>
                </div>

                {/* Status Filter Chips */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {(['All', 'Confirmed', 'Pending', 'Out for Delivery', 'Delivered'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                        orderStatusFilter === st
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : isDark
                          ? 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Search & Filter Indicators + Quick chips */}
              <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-slate-800/40 flex-wrap gap-1">
                <span className={themeTextMuted}>
                  Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> orders
                  {orderLocationFilter !== 'All' && ` in ${orderLocationFilter}`}
                </span>

                {(orderSearchQuery || orderLocationFilter !== 'All' || orderStatusFilter !== 'All') ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOrderSearchInput('');
                      setOrderSearchQuery('');
                      setOrderLocationFilter('All');
                      setOrderStatusFilter('All');
                    }}
                    className="text-rose-400 hover:text-rose-300 font-bold underline"
                  >
                    Reset Filters
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className={themeTextMuted}>Quick:</span>
                    {['Azaiba', 'Muscat', 'Kinza', 'Cash'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setOrderSearchInput(tag);
                          setOrderSearchQuery(tag);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className={`${themeCardBg} border rounded-2xl p-8 text-center space-y-2`}>
                <ShoppingBag size={36} className={`mx-auto ${themeTextMuted}`} />
                <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  No orders match your search criteria
                </p>
                <p className={`text-xs ${themeTextMuted}`}>
                  Try clearing your search query or status filter.
                </p>
                <button
                  onClick={() => {
                    setOrderSearchQuery('');
                    setOrderStatusFilter('All');
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs"
                >
                  Reset Search Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className={`${themeCardBg} border rounded-2xl p-4 space-y-3 hover:border-indigo-500/50 transition-colors`}
                  >
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded-md">
                            INVOICE #{ord.invoiceNo}
                          </span>
                          <span className={`text-[10px] font-mono ${themeTextMuted}`}>{ord.date}</span>
                        </div>
                        <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {ord.customerName}
                        </h4>
                        <div className={`flex items-center gap-3 text-[11px] ${themeTextMuted}`}>
                          <span className="flex items-center gap-1">
                            <Phone size={12} className="text-emerald-500" />
                            <span>{ord.phone}</span>
                          </span>
                          {ord.address?.city && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} className="text-amber-500" />
                              <span>{ord.address.city}, {ord.address.region}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <p className="text-base font-black text-emerald-500 font-mono">
                          {ord.grandTotal.toFixed(3)} {config.currency}
                        </p>
                        
                        {/* Status Dropdown */}
                        <div className="inline-block">
                          <select
                            value={ord.status}
                            onChange={(e) => {
                              onUpdateOrderStatus(ord.id, e.target.value as Order['status']);
                              addAuditLog(`Order #${ord.invoiceNo} status changed to ${e.target.value}`);
                              showToast(`Order status updated to: ${e.target.value}`);
                            }}
                            className={`text-[10px] font-bold py-1 px-2.5 rounded-lg border focus:outline-none ${
                              ord.status === 'Delivered'
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                : ord.status === 'Out for Delivery'
                                ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                                : ord.status === 'Confirmed'
                                ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Items table preview */}
                    <div className={`${themeSubCardBg} rounded-xl p-2.5 border space-y-1`}>
                      <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 flex justify-between ${themeTextMuted}`}>
                        <span>Items List ({ord.items.length})</span>
                        <span>Qty × Price</span>
                      </div>
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] py-0.5">
                          <span className={`truncate pr-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            • [{it.productId}] {it.name} {it.pack ? `(${it.pack})` : ''}
                          </span>
                          <span className={`font-mono whitespace-nowrap ${themeTextMuted}`}>
                            {it.quantity} × {it.price.toFixed(3)} = <strong className={isDark ? 'text-white' : 'text-slate-900'}>{(it.total).toFixed(3)}</strong>
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/40 flex-wrap gap-2">
                      <span className={`text-[10px] ${themeTextMuted}`}>
                        Payment: <strong>{ord.paymentMethod || 'Cash on Delivery'}</strong>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewOrderInvoice(ord)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
                        >
                          <FileText size={13} />
                          <span>View Tax Invoice</span>
                        </button>

                        <button
                          onClick={() => {
                            const cleanNum = (ord.phone || config.whatsappNumber).replace(/[^0-9]/g, '');
                            const msg = `Hello ${ord.customerName}, regarding your wholesale order #${ord.invoiceNo} from ${config.name}. Total: ${ord.grandTotal.toFixed(3)} ${config.currency}. Status: ${ord.status}.`;
                            window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`, '_blank');
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
                        >
                          <Send size={13} />
                          <span>WhatsApp Buyer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: PRODUCTS CATALOG ================= */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Wholesale Catalog ({products.length} Items)
                </h3>
                <p className={`text-[11px] ${themeTextMuted}`}>
                  Manage wholesale carton prices, stock quantities & images
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsAddProductMode(true);
                  setProdForm({
                    id: Math.floor(5600 + Math.random() * 4000),
                    name: '',
                    arabicName: '',
                    category: categories[0]?.name || 'Drinks & Water',
                    brand: 'Kinza',
                    price: 2.200,
                    pack: '# 24',
                    size: '250 ml',
                    unit: 'Pieces',
                    pricePerUnit: 0.091,
                    supplier: localConfig.companyName,
                    img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80',
                    stock: 150,
                  });
                }}
                className="bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-600/30"
              >
                <PlusCircle size={15} />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Product Search & Category Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2 relative">
                <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${themeTextMuted}`} />
                <input
                  type="text"
                  placeholder="Search products by title, ID or brand..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-indigo-500 ${themeInputBg}`}
                />
              </div>

              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className={`rounded-xl px-3 py-2 text-xs focus:outline-indigo-500 ${themeInputBg}`}
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Product List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredProducts.map((p) => {
                const isOutOfStock = (p.stock || 0) === 0;
                const isLowStock = (p.stock || 0) > 0 && (p.stock || 0) <= 25;
                return (
                  <div
                    key={p.id}
                    className={`${themeCardBg} border rounded-2xl p-3 flex gap-3 items-center hover:border-indigo-500/50 transition-colors`}
                  >
                    <img
                      src={p.img}
                      alt={p.name}
                      className="w-16 h-16 rounded-xl object-contain bg-white p-1 shrink-0 border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          #{p.id}
                        </span>
                        <span className={`text-[10px] font-bold ${themeTextMuted}`}>{p.brand}</span>
                      </div>
                      <p className={`font-bold text-xs truncate mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {p.name}
                      </p>
                      <p className={`text-[10px] ${themeTextMuted}`}>
                        Pack: <strong>{p.pack}</strong> • {p.size}
                      </p>
                      
                      {/* Price & Stock Stepper */}
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-mono font-bold text-emerald-500 text-xs">
                          {p.price.toFixed(3)} {config.currency}
                        </span>

                        {/* Stock Controls */}
                        <div className="flex items-center gap-1 text-[10px]">
                          <span className={`px-1.5 py-0.5 rounded font-bold ${
                            isOutOfStock 
                              ? 'bg-rose-500/10 text-rose-500' 
                              : isLowStock 
                              ? 'bg-amber-500/10 text-amber-500' 
                              : 'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            {p.stock || 0} in stock
                          </span>

                          <button
                            type="button"
                            onClick={() => handleAdjustStock(p.id, -10)}
                            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px]"
                            title="-10 stock"
                          >
                            -10
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustStock(p.id, 10)}
                            className="px-1.5 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px]"
                            title="+10 stock"
                          >
                            +10
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setIsAddProductMode(false);
                          setProdForm({ ...p });
                        }}
                        className="p-1.5 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 rounded-lg"
                        title="Edit product"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete product #${p.id} "${p.name}"?`)) {
                            onDeleteProduct(p.id);
                            addAuditLog(`Deleted product #${p.id}`);
                            showToast(`✓ Product #${p.id} removed`);
                          }
                        }}
                        className="p-1.5 bg-rose-600/10 text-rose-400 hover:bg-rose-600/20 rounded-lg"
                        title="Delete product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 4: USERS / CUSTOMERS MANAGEMENT ================= */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Registered Wholesale Buyers & Users
                  </h3>
                  <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full font-mono font-bold text-xs">
                    Total: {customers.length}
                  </span>
                </div>
                <p className={`text-[11px] ${themeTextMuted}`}>
                  Overview of all wholesale client accounts and locations
                </p>
              </div>

              <button
                onClick={() => setIsAddCustOpen(true)}
                className="bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-600/30"
              >
                <UserPlus size={15} />
                <span>Register New Wholesale Buyer</span>
              </button>
            </div>

            {/* Quick Stats banner */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className={`${themeCardBg} border p-3 rounded-xl`}>
                <span className={`text-[10px] ${themeTextMuted} uppercase font-bold`}>Total Accounts</span>
                <p className="text-xl font-black text-sky-400 font-mono mt-0.5">{customers.length}</p>
              </div>
              <div className={`${themeCardBg} border p-3 rounded-xl`}>
                <span className={`text-[10px] ${themeTextMuted} uppercase font-bold`}>Active Buyers</span>
                <p className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                  {customers.filter((c) => (c.ordersCount || 0) > 0).length}
                </p>
              </div>
              <div className={`${themeCardBg} border p-3 rounded-xl col-span-2 sm:col-span-1`}>
                <span className={`text-[10px] ${themeTextMuted} uppercase font-bold`}>Total Spend Recorded</span>
                <p className="text-xl font-black text-amber-400 font-mono mt-0.5">
                  {customers.reduce((s, c) => s + (c.totalSpent || 0), 0).toFixed(3)} {config.currency}
                </p>
              </div>
            </div>

            {/* User Search Bar */}
            <div className="relative">
              <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${themeTextMuted}`} />
              <input
                type="text"
                placeholder="Search registered buyers by name, phone, or location..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-sky-500 ${themeInputBg}`}
              />
            </div>

            {/* Customer List */}
            <div className="space-y-3">
              {filteredCustomers.map((cust, idx) => (
                <div
                  key={cust.id || idx}
                  className={`${themeCardBg} border rounded-2xl p-4 space-y-3 hover:border-sky-500/50 transition-colors`}
                >
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                        {cust.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{cust.name}</h4>
                          <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-medium ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                            {cust.customerType}
                          </span>
                        </div>
                        <p className={`text-xs font-mono ${themeTextMuted}`}>{cust.phone}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] ${themeTextMuted} block`}>Orders Placed</span>
                      <span className="font-black text-emerald-400 font-mono text-sm">
                        {cust.ordersCount || 0} Orders
                      </span>
                    </div>
                  </div>

                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl border ${themeSubCardBg}`}>
                    <div>
                      <span className={`${themeTextMuted} block`}>Location / Shop Address:</span>
                      <p className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {cust.addresses[0]?.city ? `${cust.addresses[0].city}, ${cust.addresses[0].region}` : 'Azaiba, Muscat, Oman'}
                      </p>
                      {cust.addresses[0]?.note && (
                        <p className="text-[10px] text-teal-600 italic">📍 {cust.addresses[0].note}</p>
                      )}
                    </div>
                    <div>
                      <span className={`${themeTextMuted} block`}>Registered Email:</span>
                      <p className={`font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{cust.email || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/40">
                    <span className={`text-[10px] ${themeTextMuted}`}>
                      Joined: <strong>{cust.joinedDate || '2026/09/15'}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const cleanNum = cust.phone.replace(/[^0-9]/g, '');
                          window.open(`https://wa.me/${cleanNum}?text=Hello%20${encodeURIComponent(cust.name)}`, '_blank');
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        <Send size={12} />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedCustName(cust.name);
                          setSelectedCustPhone(cust.phone);
                          setSelectedCustCity(cust.addresses[0]?.city || 'Azaiba');
                          setIsCreateOrderOpen(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        <PlusCircle size={12} />
                        <span>Create Order</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: PAYMENTS & BANKING CONFIGURATION (Requested by user) ================= */}
        {activeTab === 'payments' && (
          <form onSubmit={handleSavePayments} className="space-y-4">
            <div>
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Payment Systems & Banking Management
              </h3>
              <p className={`text-[11px] ${themeTextMuted}`}>
                Enable or customize payment channels, credit/debit card acceptance, and official Oman bank details
              </p>
            </div>

            {/* Toggle Payment Methods */}
            <div className={`${themeCardBg} border rounded-2xl p-4 space-y-3`}>
              <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-400">
                Active Checkout Payment Methods
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Cash on Delivery */}
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  paymentForm.enableCashOnDelivery 
                    ? 'border-emerald-500/50 bg-emerald-500/10' 
                    : isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
                }`}>
                  <input
                    type="checkbox"
                    checked={paymentForm.enableCashOnDelivery}
                    onChange={(e) => setPaymentForm({ ...paymentForm, enableCashOnDelivery: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <div>
                    <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      💵 Cash on Delivery (COD)
                    </span>
                    <span className={`text-[10px] ${themeTextMuted}`}>Accept cash settlement upon order handover</span>
                  </div>
                </label>

                {/* 2. Credit / Debit Card */}
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  paymentForm.enableCreditCard 
                    ? 'border-indigo-500/50 bg-indigo-500/10' 
                    : isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
                }`}>
                  <input
                    type="checkbox"
                    checked={paymentForm.enableCreditCard}
                    onChange={(e) => setPaymentForm({ ...paymentForm, enableCreditCard: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <div>
                    <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      💳 Debit & Credit Card
                    </span>
                    <span className={`text-[10px] ${themeTextMuted}`}>Visa, MasterCard & OmanNet Cards</span>
                  </div>
                </label>

                {/* 3. Bank Transfer */}
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  paymentForm.enableBankTransfer 
                    ? 'border-blue-500/50 bg-blue-500/10' 
                    : isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
                }`}>
                  <input
                    type="checkbox"
                    checked={paymentForm.enableBankTransfer}
                    onChange={(e) => setPaymentForm({ ...paymentForm, enableBankTransfer: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <div>
                    <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      🏦 Direct Bank Transfer
                    </span>
                    <span className={`text-[10px] ${themeTextMuted}`}>Bank Muscat, Bank Dhofar & mobile transfer</span>
                  </div>
                </label>

                {/* 4. Credit Terms */}
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  paymentForm.enableCreditTerms 
                    ? 'border-purple-500/50 bg-purple-500/10' 
                    : isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
                }`}>
                  <input
                    type="checkbox"
                    checked={paymentForm.enableCreditTerms}
                    onChange={(e) => setPaymentForm({ ...paymentForm, enableCreditTerms: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600"
                  />
                  <div>
                    <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      📑 30-Day Commercial Credit
                    </span>
                    <span className={`text-[10px] ${themeTextMuted}`}>B2B credit line for verified supermarkets</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Bank Muscat Account Details Form */}
            <div className={`${themeCardBg} border rounded-2xl p-4 space-y-3`}>
              <h4 className="font-bold text-xs uppercase tracking-wider text-blue-400">
                Official Bank Account Details (Shown in Checkout & Invoices)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold mb-1 ${themeTextMuted}`}>Bank Name</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.bankName}
                    onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })}
                    className={`w-full rounded-xl p-2.5 font-bold ${themeInputBg}`}
                  />
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${themeTextMuted}`}>Branch Name</label>
                  <input
                    type="text"
                    value={paymentForm.bankBranch || ''}
                    onChange={(e) => setPaymentForm({ ...paymentForm, bankBranch: e.target.value })}
                    className={`w-full rounded-xl p-2.5 ${themeInputBg}`}
                  />
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${themeTextMuted}`}>Account Number</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.bankAccountNo}
                    onChange={(e) => setPaymentForm({ ...paymentForm, bankAccountNo: e.target.value })}
                    className={`w-full rounded-xl p-2.5 font-mono ${themeInputBg}`}
                  />
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${themeTextMuted}`}>IBAN Number</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.bankIban}
                    onChange={(e) => setPaymentForm({ ...paymentForm, bankIban: e.target.value })}
                    className={`w-full rounded-xl p-2.5 font-mono ${themeInputBg}`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={`block font-bold mb-1 ${themeTextMuted}`}>Beneficiary / Account Holder</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.bankBeneficiary}
                    onChange={(e) => setPaymentForm({ ...paymentForm, bankBeneficiary: e.target.value })}
                    className={`w-full rounded-xl p-2.5 font-bold ${themeInputBg}`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={`block font-bold mb-1 ${themeTextMuted}`}>Custom Payment Notes / Policy</label>
                  <textarea
                    rows={2}
                    value={paymentForm.customPaymentNotes || ''}
                    onChange={(e) => setPaymentForm({ ...paymentForm, customPaymentNotes: e.target.value })}
                    placeholder="e.g. Please share transfer slip via WhatsApp for instant dispatch."
                    className={`w-full rounded-xl p-2.5 ${themeInputBg}`}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all"
            >
              Save Payment Systems & Banking Setup
            </button>
          </form>
        )}

        {/* ================= TAB 6: BRANDING, LOGO & IDENTITY ================= */}
        {activeTab === 'branding' && (
          <form onSubmit={handleSaveBranding} className="space-y-4">
            <div>
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Store Identity, Logo & Legal Settings
              </h3>
              <p className={`text-[11px] ${themeTextMuted}`}>
                Configure store name, tax invoice letterhead, CR/VATIN, and colors
              </p>
            </div>

            {/* Live Logo & Header Preview Box */}
            <div className={`${themeCardBg} border rounded-2xl p-4 text-center space-y-2`}>
              <span className={`text-[10px] uppercase tracking-wider font-bold ${themeTextMuted}`}>
                Tax Invoice Header Preview
              </span>
              {localConfig.logoUrl ? (
                <img
                  src={localConfig.logoUrl}
                  alt={localConfig.name}
                  className="h-12 mx-auto object-contain bg-white/10 p-1 rounded-lg"
                />
              ) : (
                <h1
                  className="text-2xl font-black uppercase tracking-tight"
                  style={{ color: localConfig.customColor }}
                >
                  {localConfig.name}
                </h1>
              )}
              <p className={`text-[11px] ${themeTextMuted}`}>{localConfig.tagline}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`block font-bold mb-1 ${themeTextMuted}`}>Store / App Name</label>
                <input
                  type="text"
                  value={localConfig.name}
                  onChange={(e) => setLocalConfig({ ...localConfig, name: e.target.value })}
                  className={`w-full rounded-xl p-2.5 font-bold ${themeInputBg}`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${themeTextMuted}`}>Store Tagline</label>
                <input
                  type="text"
                  value={localConfig.tagline}
                  onChange={(e) => setLocalConfig({ ...localConfig, tagline: e.target.value })}
                  className={`w-full rounded-xl p-2.5 ${themeInputBg}`}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={`block font-bold mb-1 ${themeTextMuted}`}>Custom Logo Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={localConfig.logoUrl || ''}
                  onChange={(e) => setLocalConfig({ ...localConfig, logoUrl: e.target.value })}
                  className={`w-full rounded-xl p-2.5 font-mono text-xs ${themeInputBg}`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${themeTextMuted}`}>WhatsApp Order Number</label>
                <input
                  type="text"
                  value={localConfig.whatsappNumber}
                  onChange={(e) => setLocalConfig({ ...localConfig, whatsappNumber: e.target.value })}
                  className={`w-full rounded-xl p-2.5 font-mono ${themeInputBg}`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${themeTextMuted}`}>Commercial Registration (CR No.)</label>
                <input
                  type="text"
                  value={localConfig.crNumber}
                  onChange={(e) => setLocalConfig({ ...localConfig, crNumber: e.target.value })}
                  className={`w-full rounded-xl p-2.5 font-mono ${themeInputBg}`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${themeTextMuted}`}>VATIN (Tax ID Number)</label>
                <input
                  type="text"
                  value={localConfig.vatin}
                  onChange={(e) => setLocalConfig({ ...localConfig, vatin: e.target.value })}
                  className={`w-full rounded-xl p-2.5 font-mono ${themeInputBg}`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${themeTextMuted}`}>Company Registered Name</label>
                <input
                  type="text"
                  value={localConfig.companyName}
                  onChange={(e) => setLocalConfig({ ...localConfig, companyName: e.target.value })}
                  className={`w-full rounded-xl p-2.5 ${themeInputBg}`}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={`block font-bold mb-1 ${themeTextMuted}`}>Company Address & PO Box</label>
                <textarea
                  rows={2}
                  value={localConfig.companyDetails}
                  onChange={(e) => setLocalConfig({ ...localConfig, companyDetails: e.target.value })}
                  className={`w-full rounded-xl p-2.5 ${themeInputBg}`}
                />
              </div>
            </div>

            {/* Color Palette Selector */}
            <div className={`${themeCardBg} border rounded-2xl p-4 space-y-3`}>
              <label className={`block font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                App Color Theme & Accent
              </label>
              
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {THEME_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPresetTheme(p)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      localConfig.themePreset === p.id
                        ? 'border-indigo-500 ring-2 ring-indigo-500'
                        : isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-full mx-auto block mb-1 border border-white/20 shadow-sm"
                      style={{ backgroundColor: p.primary }}
                    />
                    <span className={`text-[10px] font-bold block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {p.name}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <span className={`text-xs font-medium ${themeTextMuted}`}>Or custom hex code:</span>
                <input
                  type="color"
                  value={localConfig.customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <span className="font-mono text-xs font-bold">{localConfig.customColor}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
            >
              Save Store Identity & Settings
            </button>
          </form>
        )}

        {/* ================= TAB: HERO BANNERS & CROPPING ================= */}
        {activeTab === 'banners' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <ImageIcon size={18} className="text-indigo-400" />
                  <span>Promotional Hero Banners (30s Auto Carousel)</span>
                </h3>
                <p className={`text-[11px] ${themeTextMuted} mt-0.5`}>
                  Top banners slide automatically every 30 seconds. Upload photos and crop to exact banner aspect ratio (16:7 / 16:9) with interactive zoom & positioning.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleAddNewBanner}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                >
                  <PlusCircle size={15} />
                  <span>Add New Banner</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAllBanners}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle2 size={15} />
                  <span>Save All Changes</span>
                </button>
              </div>
            </div>

            {/* Banners Grid / List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bannersList.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`${themeCardBg} border rounded-2xl p-4 space-y-3.5 shadow-sm transition-all relative overflow-hidden`}
                >
                  {/* Top Bar with Number, 30s Badge and Active Switch */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-mono font-bold text-xs flex items-center justify-center border border-indigo-500/30">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold truncate max-w-[140px] sm:max-w-[180px]">
                        {banner.badge || 'PROMO BANNER'}
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <span>⏱ 30s Slide</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleBannerActive(banner.id)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                          banner.active
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-700/40 text-slate-400 border-slate-700'
                        }`}
                        title="Toggle visibility in 30s carousel"
                      >
                        <Check size={12} className={banner.active ? 'opacity-100' : 'opacity-30'} />
                        <span>{banner.active ? 'Active' : 'Disabled'}</span>
                      </button>

                      {bannersList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteBanner(banner.id)}
                          className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete banner"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Visual Preview Card (Replicating exact look on home screen) */}
                  <div 
                    className="rounded-xl overflow-hidden relative shadow-md flex items-center min-h-[110px] group border border-black/20"
                    style={{
                      aspectRatio: banner.aspectRatio === '16:9' ? '16/9' : '16/7',
                      background: banner.bgColor || 'linear-gradient(135deg, #0d9488 0%, #042f2e 100%)',
                    }}
                  >
                    {banner.imgUrl && (
                      <img
                        src={banner.imgUrl}
                        alt={banner.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.15) 100%)',
                      }}
                    />

                    <div className="relative z-10 p-3 max-w-[70%] space-y-1 text-white">
                      <span className="inline-block bg-white/20 text-white font-black text-[8.5px] px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs">
                        {banner.badge || 'PROMO'}
                      </span>
                      <h4 className="font-black text-xs leading-tight line-clamp-2">
                        {banner.title}
                      </h4>
                      <p className="text-[10px] text-white/80 leading-tight line-clamp-1">
                        {banner.subtitle}
                      </p>
                      <span 
                        className="inline-block font-black text-[9px] px-2 py-0.5 rounded-lg shadow-xs"
                        style={{
                          backgroundColor: banner.buttonBgColor || '#fbbf24',
                          color: banner.buttonTextColor || '#042f2e',
                        }}
                      >
                        {banner.buttonText || 'Shop'}
                      </span>
                    </div>

                    <div className="absolute right-2 bottom-2 z-10">
                      <span className="text-[9px] font-mono bg-black/60 text-white/80 px-1.5 py-0.5 rounded">
                        {banner.aspectRatio || '16:7'}
                      </span>
                    </div>
                  </div>

                  {/* Banner Configuration Inputs */}
                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={`block text-[10px] font-bold mb-1 ${themeTextMuted}`}>Badge Tag</label>
                        <input
                          type="text"
                          value={banner.badge}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBannersList((prev) => prev.map((b) => b.id === banner.id ? { ...b, badge: val } : b));
                          }}
                          className={`w-full rounded-xl p-2 text-xs font-semibold ${themeInputBg}`}
                          placeholder="e.g. WHOLESALE DEALS"
                        />
                      </div>

                      <div>
                        <label className={`block text-[10px] font-bold mb-1 ${themeTextMuted}`}>Target Category</label>
                        <select
                          value={banner.targetCategory || 'Drinks & Water'}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBannersList((prev) => prev.map((b) => b.id === banner.id ? { ...b, targetCategory: val } : b));
                          }}
                          className={`w-full rounded-xl p-2 text-xs font-semibold ${themeInputBg}`}
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-[10px] font-bold mb-1 ${themeTextMuted}`}>Headline Title</label>
                      <input
                        type="text"
                        value={banner.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBannersList((prev) => prev.map((b) => b.id === banner.id ? { ...b, title: val } : b));
                        }}
                        className={`w-full rounded-xl p-2 text-xs font-semibold ${themeInputBg}`}
                        placeholder="e.g. Stay Refreshed With Top Beverages"
                      />
                    </div>

                    <div>
                      <label className={`block text-[10px] font-bold mb-1 ${themeTextMuted}`}>Subtitle / Delivery Notice</label>
                      <input
                        type="text"
                        value={banner.subtitle}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBannersList((prev) => prev.map((b) => b.id === banner.id ? { ...b, subtitle: val } : b));
                        }}
                        className={`w-full rounded-xl p-2 text-xs ${themeInputBg}`}
                        placeholder="e.g. Free delivery on bulk carton orders over 35 OMR"
                      />
                    </div>

                    <div className="pt-1 flex gap-2">
                      {/* Primary Crop & Upload Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBanner(banner);
                          setIsBannerCropperOpen(true);
                        }}
                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Crop size={14} />
                        <span>Upload & Crop Image</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const val = banner.aspectRatio === '16:9' ? '16:7' : '16:9';
                          setBannersList((prev) => prev.map((b) => b.id === banner.id ? { ...b, aspectRatio: val as any } : b));
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                          isDark ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-200 bg-slate-100 text-slate-700'
                        }`}
                        title="Toggle aspect ratio (16:7 vs 16:9)"
                      >
                        Ratio: {banner.aspectRatio || '16:7'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB: NOTIFICATIONS & OFFER BAR ================= */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Bell size={18} className="text-amber-400" />
                  <span>Notification Bar & Special Offers Center</span>
                </h3>
                <p className={`text-[11px] ${themeTextMuted} mt-0.5`}>
                  Push real-time offers, wholesale discounts, and delivery notices directly to the customer's top notification bar and bell drawer.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingNotifId(null);
                    setNotifForm({
                      type: 'offer',
                      tag: '🏷️ SPECIAL OFFER',
                      title: '',
                      desc: '',
                      time: 'Limited Time',
                      targetCategory: categories[0]?.name || 'Drinks & Water',
                      active: true,
                      showInTopBar: true,
                      topBarBadge: 'HOT DEAL',
                    });
                    setIsCreateNotifOpen(true);
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
                >
                  <PlusCircle size={15} />
                  <span>Add New Offer / Notice</span>
                </button>
              </div>
            </div>

            {/* Live Top Offer Bar Preview */}
            <div className="bg-gradient-to-r from-teal-900 to-slate-900 border border-teal-700/50 rounded-2xl p-3.5 text-white shadow-lg space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-teal-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Megaphone size={14} className="text-amber-300 animate-bounce" />
                  <span>Live Top Bar Preview (As Shown to Buyers Above Header)</span>
                </span>
                <span className="text-[10px] bg-teal-800 text-teal-200 px-2 py-0.5 rounded-full font-mono">
                  {notificationsList.filter(n => n.active && n.showInTopBar).length} Active in Top Bar
                </span>
              </div>

              {notificationsList.filter(n => n.active && n.showInTopBar).length > 0 ? (
                <div className="bg-teal-950/70 border border-teal-600/40 rounded-xl p-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                      {notificationsList.find(n => n.active && n.showInTopBar)?.topBarBadge || 'OFFER'}
                    </span>
                    <p className="text-xs text-teal-50 font-semibold truncate">
                      {notificationsList.find(n => n.active && n.showInTopBar)?.title} •{' '}
                      <span className="text-teal-300 font-normal">
                        {notificationsList.find(n => n.active && n.showInTopBar)?.desc}
                      </span>
                    </p>
                  </div>
                  <span className="text-[10px] text-amber-300 font-bold underline shrink-0 cursor-pointer">
                    Shop Deal &rarr;
                  </span>
                </div>
              ) : (
                <div className="p-2.5 bg-slate-950/50 rounded-xl text-center text-xs text-slate-400 italic">
                  No offers currently pinned to the top notification bar. Turn on "Show in Top Bar" on any offer below.
                </div>
              )}
            </div>

            {/* 1-Click Quick Offer Presets */}
            <div className={`${themeCardBg} border rounded-2xl p-3.5 space-y-2.5`}>
              <span className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <Sparkles size={14} className="text-amber-400" />
                <span>1-Click Wholesale Offer Templates (Click to fill form)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  {
                    type: 'delivery' as const,
                    tag: '🚚 FREE DELIVERY',
                    title: 'Free Delivery Across Muscat & Seeb',
                    desc: 'Place any wholesale order over 35.000 OMR and get free next-day dispatch right to your storefront.',
                    time: 'Active Now',
                    targetCategory: 'Drinks & Water',
                    topBarBadge: 'FREE DELIVERY',
                  },
                  {
                    type: 'discount' as const,
                    tag: '🔥 PALLET DISCOUNT',
                    title: 'Kinza Cola & Drinks 250ml Special Wholesale Price',
                    desc: 'Instant discount on orders of 20+ master cartons of Kinza Cola, Citrus, and Grapes.',
                    time: 'Limited Stock',
                    targetCategory: 'Drinks & Water',
                    topBarBadge: 'HOT DEAL',
                  },
                  {
                    type: 'offer' as const,
                    tag: '🍜 BULK CARTON DEAL',
                    title: 'Buldak 2X Spicy Ramen 40-Pack Super Deal',
                    desc: 'Special distributor rates for supermarkets on Samyang Korean Spicy Ramen noodles cartons.',
                    time: 'Valid this week',
                    targetCategory: 'Snacks & Candy',
                    topBarBadge: 'WHOLESALE DEAL',
                  },
                ].map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setNotifForm({
                        ...tmpl,
                        active: true,
                        showInTopBar: true,
                      });
                      setEditingNotifId(null);
                      setIsCreateNotifOpen(true);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all hover:border-amber-400 group ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-amber-500">{tmpl.tag}</span>
                      <span className="text-[9px] text-slate-400 group-hover:text-amber-400">+ Use</span>
                    </div>
                    <p className={`font-bold text-xs line-clamp-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {tmpl.title}
                    </p>
                    <p className={`text-[10px] line-clamp-1 mt-0.5 ${themeTextMuted}`}>
                      {tmpl.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* List of Active Notifications */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  All Notifications & Offers ({notificationsList.length})
                </span>
                <span className={`text-[11px] ${themeTextMuted}`}>
                  Control what appears in the top banner ticker and bell dropdown
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {notificationsList.map((notif, index) => (
                  <div
                    key={notif.id}
                    className={`${themeCardBg} border rounded-2xl p-4 space-y-3 shadow-xs relative transition-all ${
                      !notif.active ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Top Row: Tag, Badge, Time, and Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-amber-500">
                          {notif.tag}
                        </span>
                        {notif.showInTopBar && (
                          <span className="bg-teal-500/20 text-teal-400 border border-teal-500/30 text-[9.5px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Megaphone size={10} />
                            <span>Top Bar Pinned</span>
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-400">
                          {notif.time}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditNotification(notif)}
                          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
                          title="Edit notification"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNotification(notif.id)}
                          className="p-1 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Notification Title & Body */}
                    <div>
                      <h4 className={`font-bold text-sm leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {notif.title}
                      </h4>
                      <p className={`text-xs mt-1 leading-relaxed ${themeTextMuted}`}>
                        {notif.desc}
                      </p>
                    </div>

                    {/* Target Category & Quick Toggles */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/40 text-xs">
                      <div>
                        {notif.targetCategory ? (
                          <span className="text-[10px] text-teal-400 font-semibold flex items-center gap-1">
                            <span>Link:</span>
                            <span className="underline">{notif.targetCategory}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">No category linked</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Pin to Top Bar Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleNotificationTopBar(notif.id)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                            notif.showInTopBar
                              ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                              : 'bg-slate-700/30 text-slate-400 border-slate-700'
                          }`}
                          title="Toggle pinning to the top announcement bar"
                        >
                          <Megaphone size={11} />
                          <span>{notif.showInTopBar ? 'In Top Bar' : 'Dropdown Only'}</span>
                        </button>

                        {/* Active Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleNotificationActive(notif.id)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                            notif.active
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-700/30 text-slate-400 border-slate-700'
                          }`}
                          title="Enable or disable this notification"
                        >
                          <Check size={11} className={notif.active ? 'opacity-100' : 'opacity-30'} />
                          <span>{notif.active ? 'Active' : 'Muted'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 7: SECURITY & PASSCODE ================= */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <div>
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Administrator Passcode & Data Reset
              </h3>
              <p className={`text-[11px] ${themeTextMuted}`}>
                Update the security PIN. Old PINs and default '1234' are strictly blocked once updated.
              </p>
            </div>

            <div className={`${themeCardBg} border rounded-2xl p-4 space-y-4`}>
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500">
                <ShieldCheck size={18} className="shrink-0" />
                <div>
                  <p className="font-bold text-xs">Strict Security Guard Active</p>
                  <p className="text-[10px] text-emerald-600">
                    Once changed, default 1234 or old PINs are permanently blocked.
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangePin} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block font-bold mb-1 ${themeTextMuted}`}>New 4-Digit Passcode *</label>
                    <input
                      type="password"
                      maxLength={8}
                      required
                      placeholder="e.g. 8899"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      className={`w-full rounded-xl p-2.5 font-mono text-base text-center ${themeInputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block font-bold mb-1 ${themeTextMuted}`}>Confirm New Passcode *</label>
                    <input
                      type="password"
                      maxLength={8}
                      required
                      placeholder="Re-enter passcode"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      className={`w-full rounded-xl p-2.5 font-mono text-base text-center ${themeInputBg}`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
                >
                  Update & Lock Security Passcode
                </button>
              </form>
            </div>

            {/* Factory Reset Danger Zone */}
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 space-y-2">
              <h4 className="font-bold text-sm text-rose-500">System Reset (Danger Zone)</h4>
              <p className={`text-xs ${themeTextMuted}`}>
                Restore all products, orders, and settings back to factory default.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to reset all products and orders to original factory data?')) {
                    onResetData();
                    localStorage.removeItem('star_admin_session_auth');
                    showToast('✓ Factory data restored successfully');
                  }
                }}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Restore Factory Defaults
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ================= MODAL: CREATE ORDER IN ADMIN ================= */}
      {isCreateOrderOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 overflow-y-auto">
          <div className={`${themeCardBg} border w-full max-w-lg rounded-3xl p-5 space-y-4 shadow-2xl max-h-[92vh] flex flex-col`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/40 shrink-0">
              <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <ShoppingBag size={16} className="text-indigo-500" />
                <span>Create New Wholesale Order & Invoice</span>
              </h3>
              <button onClick={() => setIsCreateOrderOpen(false)} className={themeTextMuted}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
              {/* Customer Selector */}
              <div>
                <label className={`block font-bold mb-1 ${themeTextMuted}`}>Select Registered Customer or Enter Shop</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <select
                    value={selectedCustName}
                    onChange={(e) => {
                      setSelectedCustName(e.target.value);
                      const found = customers.find((c) => c.name === e.target.value);
                      if (found) {
                        setSelectedCustPhone(found.phone);
                        setSelectedCustCity(found.addresses[0]?.city || 'Azaiba');
                      }
                    }}
                    className={`rounded-xl p-2 text-xs ${themeInputBg}`}
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Or Custom Shop Name"
                    value={selectedCustName}
                    onChange={(e) => setSelectedCustName(e.target.value)}
                    className={`rounded-xl p-2 text-xs ${themeInputBg}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="tel"
                    placeholder="Phone: +968 91707438"
                    value={selectedCustPhone}
                    onChange={(e) => setSelectedCustPhone(e.target.value)}
                    className={`rounded-xl p-2 text-xs font-mono ${themeInputBg}`}
                  />
                  <input
                    type="text"
                    placeholder="City: Muscat, Azaiba"
                    value={selectedCustCity}
                    onChange={(e) => setSelectedCustCity(e.target.value)}
                    className={`rounded-xl p-2 text-xs ${themeInputBg}`}
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className={`block font-bold mb-1 ${themeTextMuted}`}>Payment Method</label>
                <select
                  value={orderPaymentTerm}
                  onChange={(e) => setOrderPaymentTerm(e.target.value)}
                  className={`w-full rounded-xl p-2 text-xs ${themeInputBg}`}
                >
                  <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                  <option value="Credit Terms (30 Days)">30-Day Wholesale Commercial Credit</option>
                  <option value="Debit / Credit Card">Debit / Credit Card</option>
                  <option value="Bank Muscat Transfer">Bank Muscat Direct Deposit</option>
                </select>
              </div>

              {/* Items Picker */}
              <div>
                <label className={`block font-bold mb-1.5 ${themeTextMuted}`}>Select Products & Quantities</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {products.map((p) => {
                    const qty = orderItemsBuilder[p.id] || 0;
                    return (
                      <div
                        key={p.id}
                        className={`${themeSubCardBg} border rounded-xl p-2 flex items-center justify-between`}
                      >
                        <div className="truncate pr-2">
                          <p className={`font-bold text-xs truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            [{p.id}] {p.name}
                          </p>
                          <p className={`text-[10px] ${themeTextMuted}`}>{p.pack} • {p.price.toFixed(3)} {config.currency}</p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setOrderItemsBuilder((prev) => ({
                                ...prev,
                                [p.id]: Math.max(0, (prev[p.id] || 0) - 1),
                              }));
                            }}
                            className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-xs text-indigo-400">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setOrderItemsBuilder((prev) => ({
                                ...prev,
                                [p.id]: (prev[p.id] || 0) + 1,
                              }));
                            }}
                            className="w-6 h-6 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30"
              >
                Generate Wholesale Order & Invoice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT PRODUCT ================= */}
      {(isAddProductMode || editingProduct) && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 overflow-y-auto">
          <div className={`${themeCardBg} border w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl max-h-[92vh] flex flex-col`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/40 shrink-0">
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isAddProductMode ? 'Add New Wholesale Product' : `Edit Product #${editingProduct?.id}`}
              </h3>
              <button
                onClick={() => {
                  setIsAddProductMode(false);
                  setEditingProduct(null);
                }}
                className={themeTextMuted}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 overflow-y-auto flex-1 pr-1">
              <div>
                <label className={`block font-bold mb-1 ${themeTextMuted}`}>Product Title (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kinza Cola 250ml Wholesale Carton"
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  className={`w-full rounded-xl p-2 text-xs ${themeInputBg}`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${themeTextMuted}`}>Arabic Name (وصف المنتج)</label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="كينزا كولا كرتون بالجملة"
                  value={prodForm.arabicName}
                  onChange={(e) => setProdForm({ ...prodForm, arabicName: e.target.value })}
                  className={`w-full rounded-xl p-2 text-xs ${themeInputBg}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block font-bold mb-1 ${themeTextMuted}`}>Category</label>
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                    className={`w-full rounded-xl p-2 text-xs ${themeInputBg}`}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${themeTextMuted}`}>Brand</label>
                  <input
                    type="text"
                    value={prodForm.brand}
                    onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })}
                    className={`w-full rounded-xl p-2 text-xs ${themeInputBg}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={`block font-bold mb-1 ${themeTextMuted}`}>Price (OMR) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: parseFloat(e.target.value) || 0 })}
                    className={`w-full rounded-xl p-2 text-xs font-mono ${themeInputBg}`}
                  />
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${themeTextMuted}`}>Pack Size</label>
                  <input
                    type="text"
                    placeholder="# 24"
                    value={prodForm.pack}
                    onChange={(e) => setProdForm({ ...prodForm, pack: e.target.value })}
                    className={`w-full rounded-xl p-2 text-xs ${themeInputBg}`}
                  />
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${themeTextMuted}`}>Size / Vol</label>
                  <input
                    type="text"
                    placeholder="250 ml"
                    value={prodForm.size}
                    onChange={(e) => setProdForm({ ...prodForm, size: e.target.value })}
                    className={`w-full rounded-xl p-2 text-xs ${themeInputBg}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${themeTextMuted}`}>Image URL</label>
                <input
                  type="url"
                  value={prodForm.img}
                  onChange={(e) => setProdForm({ ...prodForm, img: e.target.value })}
                  className={`w-full rounded-xl p-2 text-xs font-mono ${themeInputBg}`}
                />
              </div>

              {/* Quick image preset chips */}
              <div className="flex flex-wrap gap-1 pt-1">
                {[
                  { label: 'Kinza Cola', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80' },
                  { label: 'Chips Oman', url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80' },
                  { label: 'Pocari Sweat', url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=80' },
                  { label: 'Unikai Milk', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80' },
                ].map((pre, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setProdForm({ ...prodForm, img: pre.url })}
                    className={`text-[9.5px] px-2 py-1 rounded-lg ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}
                  >
                    + {pre.label}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-600/30"
              >
                {isAddProductMode ? 'Save & Publish Product' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: REGISTER NEW USER / BUYER ================= */}
      {isAddCustOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 overflow-y-auto">
          <div className={`${themeCardBg} border w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/40">
              <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <UserPlus size={16} className="text-sky-500" />
                <span>Register Wholesale Buyer Account</span>
              </h3>
              <button onClick={() => setIsAddCustOpen(false)} className={themeTextMuted}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className={`block font-bold mb-1 ${themeTextMuted}`}>Supermarket / Shop Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al Baraka Wholesale Mart"
                  value={newCustForm.name}
                  onChange={(e) => setNewCustForm({ ...newCustForm, name: e.target.value })}
                  className={`w-full rounded-xl p-2.5 text-xs ${themeInputBg}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block font-bold mb-1 ${themeTextMuted}`}>Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+968 91234567"
                    value={newCustForm.phone}
                    onChange={(e) => setNewCustForm({ ...newCustForm, phone: e.target.value })}
                    className={`w-full rounded-xl p-2.5 text-xs font-mono ${themeInputBg}`}
                  />
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${themeTextMuted}`}>Business Type</label>
                  <select
                    value={newCustForm.customerType}
                    onChange={(e) => setNewCustForm({ ...newCustForm, customerType: e.target.value })}
                    className={`w-full rounded-xl p-2.5 text-xs ${themeInputBg}`}
                  >
                    <option value="Grocery & Super Market">Supermarket</option>
                    <option value="Hypermarket Branch">Hypermarket</option>
                    <option value="Hotel & Restaurant">Hotel / Restaurant</option>
                    <option value="Bakery & Cafe">Bakery / Cafe</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block font-bold mb-1 ${themeTextMuted}`}>City in Oman</label>
                  <input
                    type="text"
                    value={newCustCity}
                    onChange={(e) => setNewCustCity(e.target.value)}
                    placeholder="Muscat / Seeb / Sohar"
                    className={`w-full rounded-xl p-2.5 text-xs ${themeInputBg}`}
                  />
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${themeTextMuted}`}>Area / Region</label>
                  <input
                    type="text"
                    value={newCustRegion}
                    onChange={(e) => setNewCustRegion(e.target.value)}
                    placeholder="Azaiba / Ruwi"
                    className={`w-full rounded-xl p-2.5 text-xs ${themeInputBg}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${themeTextMuted}`}>Email (Optional)</label>
                <input
                  type="email"
                  placeholder="store@domain.om"
                  value={newCustForm.email}
                  onChange={(e) => setNewCustForm({ ...newCustForm, email: e.target.value })}
                  className={`w-full rounded-xl p-2.5 text-xs ${themeInputBg}`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-sky-600/30"
              >
                Register & Save Wholesale Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: BANNER CROPPER & IMAGE EDITOR ================= */}
      {isBannerCropperOpen && editingBanner && (
        <BannerCropperModal
          isOpen={isBannerCropperOpen}
          banner={editingBanner}
          onClose={() => {
            setIsBannerCropperOpen(false);
            setEditingBanner(null);
          }}
          onSaveCroppedBanner={handleSaveCroppedBanner}
        />
      )}

      {/* ================= MODAL: CREATE / EDIT NOTIFICATION & OFFER ================= */}
      {isCreateNotifOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 overflow-y-auto">
          <div className={`${themeCardBg} border w-full max-w-lg rounded-3xl p-5 space-y-4 shadow-2xl max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/40 shrink-0">
              <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Bell size={16} className="text-amber-400" />
                <span>{editingNotifId ? 'Edit Store Notification / Offer' : 'Create & Publish New Offer / Notice'}</span>
              </h3>
              <button 
                onClick={() => {
                  setIsCreateNotifOpen(false);
                  setEditingNotifId(null);
                }} 
                className={themeTextMuted}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNotification} className="space-y-3.5 overflow-y-auto flex-1 pr-1 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block font-bold mb-1 ${themeTextMuted}`}>Notification Type</label>
                  <select
                    value={notifForm.type || 'offer'}
                    onChange={(e) => {
                      const t = e.target.value as any;
                      const tags: Record<string, string> = {
                        offer: '🏷️ SPECIAL OFFER',
                        delivery: '🚚 FREE DELIVERY',
                        stock: '⚡ NEW STOCK ARRIVAL',
                        discount: '💰 WHOLESALE DISCOUNT',
                        announcement: '📢 STORE ANNOUNCEMENT',
                      };
                      setNotifForm({
                        ...notifForm,
                        type: t,
                        tag: tags[t] || '🏷️ SPECIAL OFFER',
                      });
                    }}
                    className={`w-full rounded-xl p-2.5 font-semibold ${themeInputBg}`}
                  >
                    <option value="offer">Special Offer / Promotion</option>
                    <option value="delivery">Delivery Route Alert</option>
                    <option value="stock">Container / Stock Arrival</option>
                    <option value="discount">Bulk Carton Discount</option>
                    <option value="announcement">Store Notice</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${themeTextMuted}`}>Header Tag / Emoji</label>
                  <input
                    type="text"
                    value={notifForm.tag || ''}
                    onChange={(e) => setNotifForm({ ...notifForm, tag: e.target.value })}
                    className={`w-full rounded-xl p-2.5 font-semibold ${themeInputBg}`}
                    placeholder="e.g. 🏷️ SPECIAL OFFER"
                  />
                </div>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${themeTextMuted}`}>Offer Headline / Title *</label>
                <input
                  type="text"
                  required
                  value={notifForm.title || ''}
                  onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                  placeholder="e.g. Free Delivery on all carton orders over 35 OMR"
                  className={`w-full rounded-xl p-2.5 font-bold ${themeInputBg}`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${themeTextMuted}`}>Offer Description & Details *</label>
                <textarea
                  rows={2}
                  required
                  value={notifForm.desc || ''}
                  onChange={(e) => setNotifForm({ ...notifForm, desc: e.target.value })}
                  placeholder="Explain the offer discount, conditions, or arrival info clearly..."
                  className={`w-full rounded-xl p-2.5 ${themeInputBg}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block font-bold mb-1 ${themeTextMuted}`}>Target Category (Shortcut Link)</label>
                  <select
                    value={notifForm.targetCategory || ''}
                    onChange={(e) => setNotifForm({ ...notifForm, targetCategory: e.target.value })}
                    className={`w-full rounded-xl p-2.5 ${themeInputBg}`}
                  >
                    <option value="">No link (Notice only)</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${themeTextMuted}`}>Time / Expiry Tag</label>
                  <input
                    type="text"
                    value={notifForm.time || 'Limited Time'}
                    onChange={(e) => setNotifForm({ ...notifForm, time: e.target.value })}
                    placeholder="e.g. Today Only / Active Now"
                    className={`w-full rounded-xl p-2.5 ${themeInputBg}`}
                  />
                </div>
              </div>

              {/* Top Notification Bar Ticker Options */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-amber-400 block text-xs">
                      Pin to Top Notification Bar
                    </span>
                    <span className="text-[10px] text-amber-500/80 block">
                      Shows as a prominent banner ticker at the very top of the app
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    checked={notifForm.showInTopBar ?? true}
                    onChange={(e) => setNotifForm({ ...notifForm, showInTopBar: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                </div>

                {notifForm.showInTopBar && (
                  <div>
                    <label className="block text-[10px] font-bold text-amber-300 mb-1">Top Bar Badge Label</label>
                    <input
                      type="text"
                      value={notifForm.topBarBadge || 'HOT DEAL'}
                      onChange={(e) => setNotifForm({ ...notifForm, topBarBadge: e.target.value })}
                      placeholder="e.g. HOT DEAL / FREE DELIVERY"
                      className={`w-full rounded-xl p-2 text-xs font-bold ${themeInputBg}`}
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all uppercase tracking-wider"
              >
                {editingNotifId ? 'Save & Update Notification' : 'Publish to Store & Notification Bar'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
