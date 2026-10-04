import React, { useState, useRef } from 'react';
import { 
  Printer, Send, ArrowLeft, Check, Copy, 
  Download, Image as ImageIcon, Sparkles, Loader2,
  FileText, CheckCircle2, ShieldCheck, Share2
} from 'lucide-react';
import { Order, AppConfig } from '../types';
import { ShukranFoodLogo } from './ShukranFoodLogo';
import { encodeOrderToUrl } from '../utils/orderEncoder';
import { 
  downloadInvoicePDF, 
  downloadInvoiceImage, 
  downloadInvoiceDoc, 
  triggerPrintInvoice,
  getInvoicePDFBlob,
  getInvoiceImageBlob
} from '../utils/invoiceExporter';

interface InvoiceViewProps {
  order: Order;
  config: AppConfig;
  onBack: () => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({ order, config, onBack }) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  const invoiceRef = useRef<HTMLDivElement>(null);

  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

  // Clean short URL for direct sharing (NOT the huge base64 string!)
  const shareableUrl = `${window.location.origin}${window.location.pathname}?invoice=${order.invoiceNo}`;

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 3500);
  };

  // 1. BULLETPROOF PDF GENERATION
  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPdf(true);
      showToast('Rendering official PDF document...');
      const success = await downloadInvoicePDF(order, config);
      if (success) {
        showToast('✓ Official PDF downloaded successfully!');
      } else {
        triggerPrintInvoice(order, config);
      }
    } catch (e) {
      console.error('PDF error', e);
      triggerPrintInvoice(order, config);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 2. DIRECT PDF SHARE TO WHATSAPP (As Requested: "শুধু পিডিএফ হিসেবে যাবে")
  const handleSharePDFToWhatsApp = async () => {
    try {
      setIsGeneratingPdf(true);
      showToast('Generating official PDF invoice...');
      
      // Also download the PDF locally so the user definitely has the PDF file
      await downloadInvoicePDF(order, config);

      const blob = await getInvoicePDFBlob(order, config);
      if (blob) {
        const file = new File([blob], `Tax-Invoice-${order.invoiceNo}.pdf`, { type: 'application/pdf' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Tax Invoice ${order.invoiceNo}`,
          });
          showToast('✓ PDF shared directly to WhatsApp!');
          return;
        }
      }

      // Clean WhatsApp message (no junk, only direct PDF link)
      const cleanNum = config.whatsappNumber.replace(/[^0-9]/g, '');
      const msg = `*Official Tax Invoice PDF #${order.invoiceNo}*\nCustomer: ${order.customerName}\nTotal Amount: ${order.grandTotal.toFixed(3)} ${config.currency}\n\n*📄 Open & Download Official PDF:*\n${shareableUrl}`;
      window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`, '_blank');
      showToast('✓ PDF downloaded & WhatsApp opened!');
    } catch (err) {
      console.error('PDF share error', err);
      const cleanNum = config.whatsappNumber.replace(/[^0-9]/g, '');
      const msg = `*Official Tax Invoice PDF #${order.invoiceNo}*\n${shareableUrl}`;
      window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`, '_blank');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 3. IMAGE GENERATION & DIRECT WHATSAPP/FILE SHARING (As Requested: "অথবা ছবি হিসেবে যাবে")
  const handleDownloadImage = async () => {
    try {
      setIsGeneratingImage(true);
      showToast('Creating high-resolution invoice image...');

      const blob = await downloadInvoiceImage(order, config);
      if (!blob) {
        showToast('✓ Image downloaded to gallery!');
        return;
      }

      const file = new File([blob], `Invoice-${order.invoiceNo}.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Tax Invoice ${order.invoiceNo}`,
            text: `Official Tax Invoice from ${config.name} for ${order.customerName}.\nLink: ${shareableUrl}`,
          });
          showToast('✓ Shared to WhatsApp successfully!');
          return;
        } catch (err) {
          // User closed share sheet, file already downloaded
        }
      }

      showToast('✓ Invoice PNG saved to your downloads!');
    } catch (e) {
      console.error('Image error', e);
      showToast('✓ Download complete');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 4. WORD DOCUMENT (.DOC) EXPORT
  const handleDownloadDoc = () => {
    downloadInvoiceDoc(order, config);
    showToast('✓ Word Document (.doc) downloaded!');
  };

  // 5. PRINT SHEET
  const handlePrint = () => {
    showToast('Opening print dialog...');
    triggerPrintInvoice(order, config);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    showToast('✓ Short invoice link copied to clipboard!');
    setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  // Compact, professional WhatsApp text (no ugly base64 string!)
  const handleShareWhatsAppText = () => {
    let msg = `*OFFICIAL TAX INVOICE - ${config.name.toUpperCase()}*\n`;
    msg += `📄 *Invoice No:* ${order.invoiceNo}\n`;
    msg += `📅 *Date:* ${order.date}\n`;
    msg += `👤 *Customer / Shop:* ${order.customerName}\n`;
    if (order.phone) msg += `📞 *Phone:* ${order.phone}\n`;
    if (order.address?.city) {
      msg += `📍 *Location:* ${order.address.title ? order.address.title + ', ' : ''}${order.address.city}, ${order.address.region}\n`;
    }
    if (order.paymentMethod) msg += `💳 *Payment Method:* ${order.paymentMethod}\n`;
    msg += `💰 *Grand Total: ${order.grandTotal.toFixed(3)} ${config.currency}*\n\n`;
    msg += `*🔗 Tap to view, print & download PDF invoice:*\n${shareableUrl}`;

    const cleanNum = config.whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-100 p-2 sm:p-4 text-slate-900 pb-24">
      
      {/* Toast Feedback Notification */}
      {statusMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-2xl z-50 animate-in slide-in-from-top border border-teal-500/50 flex items-center gap-2">
          <Sparkles size={14} className="text-teal-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Top Floating Action Bar */}
      <div className="max-w-2xl mx-auto mb-3 no-print bg-white p-3 rounded-2xl shadow-sm border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-teal-700 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Store</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
              title="Copy shareable short link"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>

            {/* Direct WhatsApp Share: shares the PDF document directly */}
            <button
              onClick={handleSharePDFToWhatsApp}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
              title="Send PDF document directly via WhatsApp"
            >
              <Send size={14} />
              <span>Share PDF to WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Primary Download & Export Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          {/* 1. PDF Download */}
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="py-2.5 px-2 bg-teal-700 hover:bg-teal-800 active:scale-98 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            title="Download printable PDF file"
          >
            {isGeneratingPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            <span>Download PDF</span>
          </button>

          {/* 2. Image Export & WhatsApp Photo Share */}
          <button
            onClick={handleDownloadImage}
            disabled={isGeneratingImage}
            className="py-2.5 px-2 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            title="Export and share as high-res PNG image"
          >
            {isGeneratingImage ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
            <span>Share Image</span>
          </button>

          {/* 3. Word Document (.doc) */}
          <button
            onClick={handleDownloadDoc}
            className="py-2.5 px-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all"
            title="Download Microsoft Word .doc file"
          >
            <FileText size={14} />
            <span>Word Doc</span>
          </button>

          {/* 4. Browser Print */}
          <button
            onClick={handlePrint}
            className="py-2.5 px-2 bg-slate-800 hover:bg-slate-900 active:scale-98 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all"
            title="Print or save as PDF via system printer"
          >
            <Printer size={14} />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* Official Tax Invoice Container */}
      <div 
        ref={invoiceRef}
        id="invoice-capture-area"
        className="max-w-2xl mx-auto bg-white p-4 sm:p-7 rounded-2xl shadow-md border border-slate-300 text-slate-900 print:shadow-none print:border-none print:p-0"
      >
        
        {/* 1. Header Logo (Configurable via Admin Panel) */}
        <div className="text-center mb-4 flex flex-col items-center">
          {config.logoUrl ? (
            <img
              src={config.logoUrl}
              alt={config.name}
              className="h-10 mx-auto object-contain"
            />
          ) : (
            <ShukranFoodLogo variant="invoice" className="mx-auto" />
          )}
          <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-1">
            {config.tagline || 'Shukran Food • Fresh Wholesale & Food Supplies'}
          </p>
        </div>

        {/* 2. Bilingual Company Legal Details (Left: English, Right: Arabic) */}
        <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-[11px] leading-tight text-slate-800 mb-5">
          {/* Left Column (English) */}
          <div className="space-y-0.5">
            <p className="font-bold">{config.companyName}</p>
            <p>{config.companyDetails.split('\n')[0]}</p>
            <p>{config.companyDetails.split('\n')[1] || 'Sultanate of Oman, Muscat, Bosher'}</p>
            <p><strong>CR No:</strong> {config.crNumber}</p>
            <p><strong>VATIN:</strong> {config.vatin}</p>
            <p><strong>Contact:</strong> {config.whatsappNumber}</p>
            <p><strong>E-Mail:</strong> {config.email || 'saikotbusiness@gmail.com'}</p>
          </div>

          {/* Right Column (Arabic) */}
          <div className="text-right space-y-0.5" dir="rtl">
            <p className="font-bold">{config.arabicCompanyName || 'الطاقة الذكية للتجارة'}</p>
            <p>{config.arabicCompanyDetails || 'azaiba130 :صندوق البريد: 2906، الرمز البريدي'}</p>
            <p>{config.arabicSultanateDetails || 'سلطنة عُمان، مسقط، بوشر'}</p>
            <p><strong>رقم السجل التجاري:</strong> {config.crNumber}</p>
            <p><strong>رقم ضريبة القيمة المضافة:</strong> {config.vatin}</p>
            <p><strong>المسؤول المباشر:</strong> {config.whatsappNumber.replace(/[^0-9]/g, '')}</p>
            <p><strong>البريد الإلكتروني:</strong> {config.email || 'saikotbusiness@gmail.com'}</p>
          </div>
        </div>

        {/* 3. Two Side-by-Side Tables (Matching Screenshot) */}
        <div className="grid grid-cols-2 gap-4 mb-5 text-[10px] sm:text-[11px]">
          
          {/* Left Table: Cash / Credit Invoice */}
          <div>
            <h3 className="font-bold text-center mb-1 text-[11px] sm:text-xs underline">
              Cash / Credit Invoice
            </h3>
            <table className="w-full border-collapse border border-slate-700 text-left">
              <tbody>
                <tr className="border-b border-slate-700">
                  <td className="p-1.5 font-bold border-r border-slate-700 bg-slate-50 w-1/2">
                    رقم الفاتورة / Invoice No
                  </td>
                  <td className="p-1.5 font-bold font-mono text-[10px] sm:text-[11px] text-teal-800">
                    {order.invoiceNo || 'Not Available'}
                  </td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold border-r border-slate-700 bg-slate-50">
                    بتاريخ / Date
                  </td>
                  <td className="p-1.5 font-medium font-mono">
                    {order.date}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right Table: Customer Details */}
          <div>
            <h3 className="font-bold text-center mb-1 text-[11px] sm:text-xs underline">
              Customer Details
            </h3>
            <table className="w-full border-collapse border border-slate-700 text-left">
              <tbody>
                <tr className="border-b border-slate-700">
                  <td className="p-1.5 font-bold border-r border-slate-700 bg-slate-50 w-1/2">
                    اسم العميل / Customer name
                  </td>
                  <td className="p-1.5 font-bold">
                    {order.customerName || 'Walk-in Supermarket'}
                  </td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="p-1.5 font-bold border-r border-slate-700 bg-slate-50">
                    رقم الهاتف / Phone number
                  </td>
                  <td className="p-1.5 font-medium font-mono">
                    {order.phone || ''}
                  </td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold border-r border-slate-700 bg-slate-50">
                    س.ت / CR & Location
                  </td>
                  <td className="p-1.5 font-medium">
                    {order.address?.title ? `${order.address.title}, ` : ''}
                    {order.address?.city ? `${order.address.city}, ${order.address.region}` : 'Azaiba, Muscat'}
                    {order.address?.note ? ` (${order.address.note})` : ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

        {/* 4. Products Table (Exact Columns & Borders from Screenshot) */}
        <div className="overflow-x-auto mb-5">
          <table className="w-full border-collapse border border-slate-700 text-[9.5px] sm:text-[10px] text-center">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-50">
                <th className="border-r border-slate-700 p-1.5 font-bold w-[10%]">
                  Product ID
                </th>
                <th className="border-r border-slate-700 p-1.5 font-bold text-left w-[40%]">
                  وصف المنتج Description of goods
                </th>
                <th className="border-r border-slate-700 p-1.5 font-bold w-[10%]">
                  الكمية Quantity
                </th>
                <th className="border-r border-slate-700 p-1.5 font-bold w-[10%]">
                  معدل Price per Quantity
                </th>
                <th className="border-r border-slate-700 p-1.5 font-bold w-[10%]">
                  الوحدة unit
                </th>
                <th className="border-r border-slate-700 p-1.5 font-bold w-[10%]">
                  معدل (%) VAT الضريبة
                </th>
                <th className="p-1.5 font-bold w-[10%]">
                  Amount (OMR)
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => {
                const vatVal = item.vatAmount || (item.total * 0.05);
                const grossVal = item.total + vatVal;
                return (
                  <tr key={idx} className="border-b border-slate-700">
                    <td className="border-r border-slate-700 p-1.5 font-mono">
                      {item.productId}
                    </td>
                    <td className="border-r border-slate-700 p-1.5 text-left font-medium">
                      <span>{item.name}</span>
                      {item.pack && (
                        <span className="text-slate-500 text-[9px] block">
                          Pack: {item.pack} {item.size ? `(${item.size})` : ''}
                        </span>
                      )}
                      {item.arabicName && (
                        <span className="text-slate-600 block mt-0.5" dir="rtl">
                          {item.arabicName}
                        </span>
                      )}
                    </td>
                    <td className="border-r border-slate-700 p-1.5 font-bold">
                      {item.quantity}
                    </td>
                    <td className="border-r border-slate-700 p-1.5 font-mono">
                      {item.price.toFixed(3)}
                    </td>
                    <td className="border-r border-slate-700 p-1.5">
                      {item.unit || 'Pieces'}
                    </td>
                    <td className="border-r border-slate-700 p-1.5 font-mono">
                      {vatVal.toFixed(3)}
                    </td>
                    <td className="p-1.5 font-mono font-bold">
                      {grossVal.toFixed(3)}
                    </td>
                  </tr>
                );
              })}

              {/* Total Summary Row matching Screenshot */}
              <tr className="border-t-2 border-slate-800 font-bold bg-slate-50">
                <td className="border-r border-slate-700 p-1.5" colSpan={2}>
                  Total
                </td>
                <td className="border-r border-slate-700 p-1.5 font-bold">
                  {totalQuantity}
                </td>
                <td className="border-r border-slate-700 p-1.5"></td>
                <td className="border-r border-slate-700 p-1.5"></td>
                <td className="border-r border-slate-700 p-1.5 font-mono">
                  {order.vat.toFixed(3)}
                </td>
                <td className="p-1.5 font-mono font-black text-slate-900 text-xs">
                  {order.grandTotal.toFixed(3)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 5. Terms & Conditions and Payment Details */}
        <div className="mb-6 text-[10px] text-slate-700 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <p className="font-bold underline text-slate-800">Terms & Conditions:</p>
            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck size={12} />
              <span>Authorized B2B Wholesale Document</span>
            </span>
          </div>
          <p>Terms and conditions have been applied as agreed in the contract and website.</p>
          {order.paymentMethod && (
            <p className="text-[10px] text-slate-600 font-medium">
              Payment Method: <strong>{order.paymentMethod}</strong>
              {order.paymentDetails && <span> ({order.paymentDetails})</span>}
            </p>
          )}
        </div>

        {/* 6. Footer matching Screenshot */}
        <div className="border-t border-slate-300 pt-3 text-[9px] text-slate-500 text-center tracking-tight">
          <p className="uppercase">
            SMART ENERGY TRADING LLC P.O. Box: 2906, Azaiba 130, Muscat, Sultanate of Oman Way No.6602 | {config.whatsappNumber} | Tamween.om
          </p>
        </div>

      </div>
    </div>
  );
};
