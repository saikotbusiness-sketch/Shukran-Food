import React, { useState } from 'react';
import { ClipboardList, FileText, Send, ShoppingBag, Search, X, MapPin } from 'lucide-react';
import { Order, AppConfig } from '../types';

interface OrdersViewProps {
  orders: Order[];
  config: AppConfig;
  onViewInvoice: (order: Order) => void;
  onStartShopping: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  config,
  onViewInvoice,
  onStartShopping,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (orders.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center text-slate-500 pb-24">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
          <ClipboardList size={32} />
        </div>
        <h3 className="font-bold text-base text-slate-800 mb-1">No Orders Available</h3>
        <p className="text-xs text-slate-400 max-w-xs mb-5">
          Your wholesale supermarket orders and official tax invoices will appear here once placed.
        </p>
        <button
          onClick={onStartShopping}
          className="px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-md active:scale-95 transition-all"
          style={{ backgroundColor: config.customColor }}
        >
          Explore Catalog & Order
        </button>
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchInv = o.invoiceNo.toLowerCase().includes(q);
    const matchCust = o.customerName.toLowerCase().includes(q);
    const matchPhone = o.phone.toLowerCase().includes(q);
    const matchLoc = o.address ? `${o.address.city} ${o.address.region} ${o.address.note || ''}`.toLowerCase().includes(q) : false;
    const matchProd = o.items.some((it) => it.name.toLowerCase().includes(q) || it.productId.toString().includes(q));
    return matchInv || matchCust || matchPhone || matchLoc || matchProd;
  });

  return (
    <div className="p-3 pb-24 space-y-3">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-base font-extrabold text-slate-800">Your Orders ({orders.length})</h2>
        <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
          History
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Invoice #, item, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-7 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-teal-600 shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-400 space-y-2">
          <p className="font-semibold text-xs text-slate-600">No orders matching "{searchQuery}"</p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-bold text-teal-700 hover:underline"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {order.invoiceNo}
                  </span>
                  <h4 className="font-bold text-xs text-slate-900 mt-1.5">{order.customerName}</h4>
                  <p className="text-[11px] text-slate-500">
                    📍 {order.address?.city || 'Muscat'}, {order.address?.region || 'Oman'}
                  </p>
                </div>

                <div className="text-right">
                  <span 
                    className="text-sm font-extrabold font-mono"
                    style={{ color: config.customColor }}
                  >
                    {order.grandTotal.toFixed(3)} {config.currency}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{order.date}</p>
                  <span className={`inline-block mt-1 text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                    order.status === 'Delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.status === 'Out for Delivery'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-teal-50 text-teal-800 border border-teal-200'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items summary */}
              <div className="bg-slate-50 rounded-xl p-2.5 space-y-1 text-[11px] text-slate-600 border border-slate-100">
                <p className="font-bold text-slate-700 text-[10px] uppercase tracking-wider mb-1">
                  Ordered Products ({order.items.length})
                </p>
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-700">
                    <span className="truncate pr-2">
                      • {it.name} {it.pack ? `(${it.pack})` : ''}
                    </span>
                    <span className="font-mono text-slate-500 whitespace-nowrap">
                      x{it.quantity} = {it.total.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => onViewInvoice(order)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileText size={13} />
                  <span>View Tax Invoice</span>
                </button>

                <button
                  onClick={() => {
                    const cleanNum = config.whatsappNumber.replace(/[^0-9]/g, '');
                    const shortUrl = `${window.location.origin}${window.location.pathname}?invoice=${order.invoiceNo}`;
                    const msg = `Hello ${config.name}, inquiry regarding Invoice #${order.invoiceNo} (${order.grandTotal.toFixed(3)} ${config.currency}).\nLink: ${shortUrl}`;
                    window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Send size={13} />
                  <span>WhatsApp Shop</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
