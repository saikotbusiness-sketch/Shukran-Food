import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ShoppingCart, Send, FileText, MapPin, 
  Plus, Minus, Trash2, CheckCircle2, ChevronDown, 
  PlusCircle, Sparkles, Copy, Check, ExternalLink,
  Download, Image as ImageIcon, CreditCard, Building2, Edit,
  LogIn, AlertCircle, ShieldAlert
} from 'lucide-react';
import { CartItem, CustomerAddress, CustomerProfile, AppConfig, Order, OrderItem } from '../types';
import { getInvoicePDFBlob, getInvoiceImageBlob } from '../utils/invoiceExporter';
import { AddressModal } from './AddressModal';

interface CartScreenProps {
  cart: { [productId: number]: number };
  products: any[];
  config: AppConfig;
  user: CustomerProfile | null;
  selectedAddress: CustomerAddress | null;
  onUpdateCart: (id: number, delta: number) => void;
  onClearCart: () => void;
  onOpenAddressModal: () => void;
  onSelectAddress: (addr: CustomerAddress) => void;
  onBackToHome: () => void;
  onOrderPlaced: (order: Order) => void;
  onPreviewInvoice: (order: Order) => void;
  onOpenAuth: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  cart,
  products,
  config,
  user,
  selectedAddress,
  onUpdateCart,
  onClearCart,
  onOpenAddressModal,
  onSelectAddress,
  onBackToHome,
  onOrderPlaced,
  onPreviewInvoice,
  onOpenAuth,
}) => {
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState<
    'Cash on Delivery' | 'Credit Terms (30 Days)' | 'Credit / Debit Card' | 'Bank Muscat Transfer'
  >('Cash on Delivery');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [bankRefNo, setBankRefNo] = useState('');
  const [isLocalAddressModalOpen, setIsLocalAddressModalOpen] = useState(false);
  
  // WhatsApp Confirmation Modal State
  const [showWhatsAppSuccess, setShowWhatsAppSuccess] = useState<Order | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSharingFile, setIsSharingFile] = useState(false);

  // Sync user info and address when user logs in or profile changes
  const isGuestUser = !user || !user.phone || !user.email || user.customerType === 'Guest Visitor' || user.id.startsWith('cust-guest');

  useEffect(() => {
    if (user?.name) setCustomerName(user.name);
    if (user?.phone) setCustomerPhone(user.phone);
    if (user?.addresses && user.addresses.length > 0) {
      if (!selectedAddress || selectedAddress.id === 'default-addr') {
        onSelectAddress(user.addresses[0]);
      }
    }
  }, [user]);

  // Compute Cart Items
  const cartItems: (CartItem & { lineTotal: number })[] = Object.entries(cart)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const prod = products.find((p) => p.id === parseInt(id, 10));
      return {
        product: prod!,
        quantity: qty,
        lineTotal: (prod?.price || 0) * qty,
      };
    })
    .filter((item) => item.product !== undefined);

  const subtotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const vat = subtotal * 0.05; // 5% VAT in Oman
  const isFreeDelivery = subtotal >= config.freeDeliveryThreshold;
  const deliveryFee = isFreeDelivery ? 0 : 2.000;
  const grandTotal = subtotal + vat + deliveryFee;

  // Group items by supplier for realistic wholesale feel
  const groupedBySupplier = cartItems.reduce((acc, item) => {
    const supp = item.product.brand || config.name;
    if (!acc[supp]) acc[supp] = [];
    acc[supp].push(item);
    return acc;
  }, {} as { [key: string]: typeof cartItems });

  const createOrderObject = (): Order => {
    const orderItems: OrderItem[] = cartItems.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      arabicName: item.product.arabicName || '',
      price: item.product.price,
      pack: item.product.pack,
      size: item.product.size,
      unit: item.product.unit || 'Pieces',
      quantity: item.quantity,
      total: item.lineTotal,
      vatAmount: item.lineTotal * 0.05,
    }));

    const invoiceNo = `TW-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    return {
      id: `ord-${Date.now()}`,
      invoiceNo,
      date: new Date().toISOString().slice(0, 10).replace(/-/g, '/'),
      customerName: customerName || user?.name || 'Walk-in Supermarket',
      phone: customerPhone || user?.phone || config.whatsappNumber,
      customerType: user?.customerType || 'Grocery & Super Market',
      address: selectedAddress,
      items: orderItems,
      subtotal,
      vat,
      deliveryFee,
      grandTotal,
      status: 'Confirmed',
      paymentMethod,
      paymentDetails:
        paymentMethod === 'Credit / Debit Card'
          ? `Card ending in ${cardNumber.slice(-4) || '4242'}`
          : paymentMethod === 'Bank Muscat Transfer'
          ? `Bank Ref: ${bankRefNo || 'BM-ONLINE-TRANSFER'}`
          : paymentMethod,
    };
  };

  // Clean short link for the invoice
  const getShortInvoiceLink = (order: Order) => {
    return `${window.location.origin}${window.location.pathname}?invoice=${order.invoiceNo}`;
  };

  const handleWhatsAppOrder = async () => {
    if (isGuestUser) {
      onOpenAuth();
      return;
    }
    const order = createOrderObject();
    onOrderPlaced(order);

    const invoiceLink = getShortInvoiceLink(order);

    // Ultra-clean, concise WhatsApp order summary (NO ugly huge base64 text)
    let msg = `*🛒 TAX INVOICE - ${config.name.toUpperCase()}*\n`;
    msg += `📄 *Invoice No:* ${order.invoiceNo}\n`;
    msg += `👤 *Customer:* ${order.customerName}\n`;
    if (order.phone) msg += `📞 *Phone:* ${order.phone}\n`;
    if (selectedAddress?.city) {
      msg += `📍 *Location:* ${selectedAddress.title ? selectedAddress.title + ', ' : ''}${selectedAddress.city}, ${selectedAddress.region}\n`;
      if (selectedAddress.note) msg += `📝 *Landmark:* ${selectedAddress.note}\n`;
    }
    msg += `💰 *Grand Total: ${grandTotal.toFixed(3)} ${config.currency}*\n`;
    msg += `💳 *Payment Method:* ${paymentMethod}\n\n`;
    msg += `*🔗 View & Download Official Tax Invoice PDF:*\n${invoiceLink}`;

    const cleanNumber = config.whatsappNumber.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;

    // Try native Web Share with PDF file directly if available on device
    try {
      const pdfBlob = await getInvoicePDFBlob(order, config);
      if (pdfBlob && navigator.canShare) {
        const file = new File([pdfBlob], `Tax-Invoice-${order.invoiceNo}.pdf`, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Tax Invoice ${order.invoiceNo}`,
            text: `Tax Invoice #${order.invoiceNo} - ${order.customerName} (${grandTotal.toFixed(3)} ${config.currency})\nLink: ${invoiceLink}`,
          });
          setShowWhatsAppSuccess(order);
          return;
        }
      }
    } catch (e) {
      // User cancelled or unsupported, fallback to WhatsApp text link
    }

    // Open WhatsApp
    window.open(waUrl, '_blank');
    setShowWhatsAppSuccess(order);
  };

  // Direct share PDF file to WhatsApp / apps
  const handleSharePDFDirectly = async (order: Order) => {
    try {
      setIsSharingFile(true);
      const pdfBlob = await getInvoicePDFBlob(order, config);
      if (!pdfBlob) return;
      const file = new File([pdfBlob], `Tax-Invoice-${order.invoiceNo}.pdf`, { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Tax Invoice ${order.invoiceNo}`,
          text: `Official Tax Invoice from ${config.name} (${order.grandTotal.toFixed(3)} ${config.currency})`,
        });
      } else {
        const cleanNumber = config.whatsappNumber.replace(/[^0-9]/g, '');
        const msg = `*Tax Invoice #${order.invoiceNo}*\nCustomer: ${order.customerName}\nTotal: ${order.grandTotal.toFixed(3)} ${config.currency}\nView PDF: ${getShortInvoiceLink(order)}`;
        window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, '_blank');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSharingFile(false);
    }
  };

  // Direct share Image file to WhatsApp / apps
  const handleShareImageDirectly = async (order: Order) => {
    try {
      setIsSharingFile(true);
      const imgBlob = await getInvoiceImageBlob(order, config);
      if (!imgBlob) return;
      const file = new File([imgBlob], `Tax-Invoice-${order.invoiceNo}.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Tax Invoice ${order.invoiceNo}`,
          text: `Tax Invoice #${order.invoiceNo} - ${order.customerName}`,
        });
      } else {
        const cleanNumber = config.whatsappNumber.replace(/[^0-9]/g, '');
        const msg = `*Tax Invoice #${order.invoiceNo}*\nCustomer: ${order.customerName}\nTotal: ${order.grandTotal.toFixed(3)} ${config.currency}\nView: ${getShortInvoiceLink(order)}`;
        window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, '_blank');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSharingFile(false);
    }
  };

  const handlePreviewInvoice = () => {
    if (isGuestUser) {
      onOpenAuth();
      return;
    }
    const order = createOrderObject();
    onOrderPlaced(order);
    onPreviewInvoice(order);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mb-4 shadow-inner">
          <ShoppingCart size={36} />
        </div>
        <h3 className="font-bold text-lg text-slate-800 mb-1">Your Wholesale Cart is Empty</h3>
        <p className="text-xs text-slate-500 max-w-xs mb-6">
          Explore Kinza beverages, Oman Chips, Loyal cleaners, and wholesale carton packages.
        </p>
        <button
          onClick={onBackToHome}
          className="px-6 py-3 rounded-xl font-bold text-xs text-white shadow-md active:scale-95 transition-all"
          style={{ backgroundColor: config.customColor }}
        >
          Start Adding Items
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col pb-28">
      
      {/* Top Header */}
      <div 
        className="p-3.5 text-white flex items-center justify-between sticky top-0 z-30 shadow-md"
        style={{ backgroundColor: config.customColor }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToHome}
            className="p-1 rounded-full hover:bg-white/20 text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-bold text-base">Cart Review ({cartItems.length} items)</h2>
        </div>

        <button
          onClick={onClearCart}
          className="text-xs text-white/80 hover:text-white flex items-center gap-1 font-semibold"
        >
          <Trash2 size={14} />
          <span>Clear</span>
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Guest Mode Notice Banner */}
        {isGuestUser && (
          <div className="p-3.5 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-xs">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="font-extrabold text-xs text-amber-950 dark:text-amber-300">
                  আপনি গেস্ট মোডে আছেন (Guest Mode)
                </p>
                <p className="text-[11px] text-amber-900/80 dark:text-amber-400">
                  অর্ডার সম্পন্ন করতে জিমেইল বা মোবাইল নাম্বার দিয়ে লগইন আবশ্যক।
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-slate-950 font-extrabold rounded-xl text-xs shrink-0 shadow-sm transition-all"
            >
              লগইন / সাইন ইন
            </button>
          </div>
        )}
        
        {/* Address Selector Dropdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
              <MapPin size={13} className="text-teal-600" />
              <span>Customer Delivery Location (Oman)</span>
            </span>
            <button
              type="button"
              onClick={() => setIsLocalAddressModalOpen(true)}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 transition-colors"
            >
              <Edit size={12} />
              <span>{selectedAddress ? 'Change / Add Address' : '+ Add Address'}</span>
            </button>
          </div>

          {selectedAddress ? (
            <div 
              onClick={() => setIsLocalAddressModalOpen(true)}
              className="bg-slate-50 hover:bg-slate-100/80 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between cursor-pointer transition-colors"
              title="Click to change or add address"
            >
              <div>
                <p className="font-bold text-xs text-slate-800">{selectedAddress.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {selectedAddress.city}, {selectedAddress.region} ({selectedAddress.country})
                </p>
                {selectedAddress.note && (
                  <p className="text-[10px] text-teal-700 mt-0.5 font-medium">📍 {selectedAddress.note}</p>
                )}
                {selectedAddress.locationLink && (
                  <a 
                    href={selectedAddress.locationLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-teal-600 underline flex items-center gap-0.5 mt-0.5"
                  >
                    <span>View GPS Coordinates</span>
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] text-teal-700 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                  Change
                </span>
                <CheckCircle2 size={18} className="text-teal-600" />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsLocalAddressModalOpen(true)}
              className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold flex items-center justify-between transition-colors"
            >
              <span>Please select or add your store delivery address</span>
              <ChevronDown size={16} />
            </button>
          )}

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
            <span>Wholesale Dispatch Schedule:</span>
            <span className="font-bold text-teal-800">Tomorrow Morning (9AM - 1PM)</span>
          </div>
        </div>

        {/* Free Delivery Banner */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-2 shadow-xs">
          <Sparkles size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            {isFreeDelivery ? (
              <p className="font-bold">
                🎉 You Got Free Delivery! (Order exceeds {config.freeDeliveryThreshold.toFixed(3)} {config.currency})
              </p>
            ) : (
              <div>
                <p className="font-bold">
                  Add {(config.freeDeliveryThreshold - subtotal).toFixed(3)} {config.currency} more for FREE Delivery!
                </p>
                <div className="w-full bg-emerald-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (subtotal / config.freeDeliveryThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cart Item Cards Grouped by Supplier */}
        {(Object.entries(groupedBySupplier) as [string, (CartItem & { lineTotal: number })[]][]).map(([supplier, items]) => (
          <div key={supplier} className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2.5">
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
              <span className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                <span>{supplier}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Wholesale Supplier</span>
            </div>

            <div className="space-y-2">
              {items.map(({ product, quantity, lineTotal }) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100 gap-2"
                >
                  <img
                    src={product.img}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-contain bg-white rounded-lg p-1 border border-slate-200/60 shrink-0"
                  />

                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-mono text-teal-700 bg-teal-50 px-1 rounded font-bold">
                        #{product.id}
                      </span>
                      <p className="font-bold text-xs text-slate-900 truncate leading-tight">
                        {product.name}
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Pack: <span className="font-bold text-teal-800">{product.pack}</span> • {product.size}
                    </p>
                    <p className="text-xs font-black text-teal-700 mt-0.5">
                      {lineTotal.toFixed(3)} {config.currency}
                    </p>
                  </div>

                  {/* Stepper +/- */}
                  <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-xs shrink-0">
                    <button
                      onClick={() => onUpdateCart(product.id, -1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-6 text-center font-bold text-xs text-slate-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => onUpdateCart(product.id, 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: config.customColor }}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Customer Information Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2 text-xs">
          <h4 className="font-bold text-slate-800 mb-2">Customer & Shop Details</h4>
          
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Shop / Customer Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. md saikot ahmmad"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:outline-teal-600"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Customer Phone Number *</label>
            <input
              type="tel"
              required
              placeholder="+968 91707438"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:outline-teal-600"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1.5">Payment Method</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {config.paymentSettings?.enableCashOnDelivery !== false && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors ${
                    paymentMethod === 'Cash on Delivery'
                      ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  💵 Cash on Delivery
                </button>
              )}
              {config.paymentSettings?.enableCreditTerms !== false && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Credit Terms (30 Days)')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors ${
                    paymentMethod === 'Credit Terms (30 Days)'
                      ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  📑 Credit (30 Days)
                </button>
              )}
              {config.paymentSettings?.enableCreditCard !== false && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Credit / Debit Card')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors ${
                    paymentMethod === 'Credit / Debit Card'
                      ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  💳 Debit / Credit Card
                </button>
              )}
              {config.paymentSettings?.enableBankTransfer !== false && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Bank Muscat Transfer')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors ${
                    paymentMethod === 'Bank Muscat Transfer'
                      ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  🏦 {config.paymentSettings?.bankName || 'Bank Muscat'}
                </button>
              )}
            </div>

            {/* Credit / Debit Card Form */}
            {paymentMethod === 'Credit / Debit Card' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-2">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                  <span>CARD DETAILS ({config.paymentSettings?.acceptedCardTypes || 'Visa / MasterCard / OmanNet'})</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCardNumber('4242 4242 4242 4242');
                      setCardExpiry('12/28');
                      setCardCvv('123');
                    }}
                    className="text-teal-700 hover:underline"
                  >
                    Auto-Fill Test Card
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Card Number (4242 •••• •••• 4242)"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-xs text-slate-800"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg p-2 font-mono text-xs text-slate-800"
                  />
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="CVV"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg p-2 font-mono text-xs text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* Bank Transfer Details */}
            {paymentMethod === 'Bank Muscat Transfer' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-2 text-[11px]">
                <p className="font-bold text-slate-800">
                  {config.paymentSettings?.bankName || 'Bank Muscat'} Direct Deposit Details:
                </p>
                <div className="bg-white p-2.5 rounded-lg font-mono text-[10px] text-slate-700 space-y-0.5 border border-slate-200">
                  <p><strong>Bank:</strong> {config.paymentSettings?.bankName || 'Bank Muscat'} {config.paymentSettings?.bankBranch ? `(${config.paymentSettings.bankBranch})` : '(Azaiba Branch)'}</p>
                  <p><strong>Account:</strong> {config.paymentSettings?.bankAccountNo || '0314012250190011'}</p>
                  <p><strong>IBAN:</strong> {config.paymentSettings?.bankIban || 'OM23BMUS0314012250190011'}</p>
                  <p><strong>Beneficiary:</strong> {config.paymentSettings?.bankBeneficiary || config.companyName}</p>
                </div>
                {config.paymentSettings?.customPaymentNotes && (
                  <p className="text-[10px] text-slate-500 italic">{config.paymentSettings.customPaymentNotes}</p>
                )}
                <input
                  type="text"
                  placeholder="Transfer Reference / Deposit Slip No."
                  value={bankRefNo}
                  onChange={(e) => setBankRefNo(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-xs text-slate-800"
                />
              </div>
            )}
          </div>
        </div>

        {/* Bill Summary Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2 text-xs">
          <h4 className="font-bold text-slate-800 pb-1.5 border-b border-slate-100">Bill Breakdown</h4>
          
          <div className="flex justify-between text-slate-600">
            <span>Total Orders Value:</span>
            <span className="font-mono font-bold">{subtotal.toFixed(3)} {config.currency}</span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>VAT (5% Included):</span>
            <span className="font-mono">{vat.toFixed(3)} {config.currency}</span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Delivery Charges:</span>
            <span className="font-bold text-emerald-700">
              {deliveryFee === 0 ? 'FREE' : `${deliveryFee.toFixed(3)} ${config.currency}`}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
            <span>Grand Total:</span>
            <span 
              className="font-mono text-base"
              style={{ color: config.customColor }}
            >
              {grandTotal.toFixed(3)} {config.currency}
            </span>
          </div>
        </div>

        {/* Action Buttons: WhatsApp & Tax Invoice or Forced Login for Guest */}
        <div className="space-y-2 pt-1">
          {isGuestUser ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={onOpenAuth}
                className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-slate-950 py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <LogIn size={18} />
                <span>অর্ডার সম্পন্ন করতে জিমেইল বা নাম্বার দিয়ে লগইন করুন</span>
              </button>
              <p className="text-[11px] text-center text-amber-700 dark:text-amber-400 font-bold">
                * জিমেইল বা যেকোনো দেশের মোবাইল ওটিপি দিয়ে সরাসরি লগইন করে অর্ডার শেষ করুন
              </p>
            </div>
          ) : (
            <>
              <button
                onClick={handleWhatsAppOrder}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <Send size={18} />
                <span>Submit Order via WhatsApp</span>
              </button>

              <button
                onClick={handlePreviewInvoice}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <FileText size={16} />
                <span>Preview Official Tax Invoice (PDF)</span>
              </button>
            </>
          )}
        </div>

      </div>

      {/* WhatsApp Order Success / Direct Link Modal */}
      {showWhatsAppSuccess && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl text-center space-y-3.5 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900">Wholesale Order Generated!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Tax Invoice #{showWhatsAppSuccess.invoiceNo} is ready for WhatsApp sharing and official record.
              </p>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-left text-xs font-mono text-teal-800 break-all">
              {getShortInvoiceLink(showWhatsAppSuccess)}
            </div>

            {/* Direct WhatsApp Share Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={isSharingFile}
                onClick={() => handleSharePDFDirectly(showWhatsAppSuccess)}
                className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
              >
                <Download size={14} />
                <span>Share PDF Document to WhatsApp</span>
              </button>

              <button
                type="button"
                disabled={isSharingFile}
                onClick={() => handleShareImageDirectly(showWhatsAppSuccess)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
              >
                <ImageIcon size={14} />
                <span>Share Invoice Image to WhatsApp</span>
              </button>
            </div>

            <div className="flex gap-2 pt-1 border-t border-slate-100">
              <button
                onClick={() => {
                  const url = getShortInvoiceLink(showWhatsAppSuccess);
                  navigator.clipboard.writeText(url);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>

              <button
                onClick={() => {
                  onPreviewInvoice(showWhatsAppSuccess);
                  setShowWhatsAppSuccess(null);
                }}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <FileText size={14} />
                <span>Open Invoice</span>
              </button>
            </div>

            <button
              onClick={() => setShowWhatsAppSuccess(null)}
              className="text-xs text-slate-400 font-semibold hover:text-slate-600 block mx-auto pt-1"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Interactive Delivery Address Selection & Editor Modal */}
      <AddressModal
        isOpen={isLocalAddressModalOpen}
        onClose={() => setIsLocalAddressModalOpen(false)}
        config={config}
        initialAddress={selectedAddress}
        savedAddresses={user?.addresses || []}
        onSaveAddress={(addr) => {
          onSelectAddress(addr);
          setIsLocalAddressModalOpen(false);
        }}
      />

    </div>
  );
};
