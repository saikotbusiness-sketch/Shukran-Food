import { jsPDF } from 'jspdf';
import { Order, AppConfig } from '../types';

/**
 * Robust invoice exporter utility that avoids html2canvas/oklch crashes.
 * Uses pure HTML5 Canvas2D rendering and clean vector generation.
 */

// Draw invoice onto an offscreen canvas with crisp high resolution (2x DPI)
export function renderInvoiceToCanvas(order: Order, config: AppConfig): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    const width = 800;
    // Calculate dynamic height based on number of items
    const baseHeight = 900;
    const itemsHeight = Math.max(1, order.items.length) * 38;
    const height = baseHeight + itemsHeight;

    const canvas = document.createElement('canvas');
    canvas.width = width * 2; // 2x for retina sharpness
    canvas.height = height * 2;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(canvas);
      return;
    }

    // Scale for crisp resolution
    ctx.scale(2, 2);

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Top decorative bar
    ctx.fillStyle = config.customColor || '#0d9488';
    ctx.fillRect(0, 0, width, 8);

    // Header Logo / Brand Name
    ctx.textAlign = 'center';
    ctx.fillStyle = config.customColor || '#0d9488';
    ctx.font = 'bold 28px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(config.name.toUpperCase(), width / 2, 45);

    ctx.fillStyle = '#64748b';
    ctx.font = '11px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(config.tagline || 'Tamween B2B Buyer & Supplier • Sultanate of Oman', width / 2, 64);

    // Divider
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 80);
    ctx.lineTo(width - 30, 80);
    ctx.stroke();

    // Legal & Company Info Row
    // Left: English
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(config.companyName || 'Smart Energy Trading LLC', 30, 102);

    ctx.fillStyle = '#475569';
    ctx.font = '10px sans-serif';
    ctx.fillText(`P.O. Box: 2906, Postal Code: 130, Azaiba, Muscat`, 30, 118);
    ctx.fillText(`CR No: ${config.crNumber}   |   VATIN: ${config.vatin}`, 30, 134);
    ctx.fillText(`Contact: ${config.whatsappNumber}   |   Email: ${config.email || 'saikotbusiness@gmail.com'}`, 30, 150);

    // Right: Arabic Legal details
    ctx.textAlign = 'right';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(config.arabicCompanyName || 'الطاقة الذكية للتجارة ش.م.م', width - 30, 102);

    ctx.fillStyle = '#475569';
    ctx.font = '10px sans-serif';
    ctx.fillText(config.arabicCompanyDetails || 'صندوق البريد: 2906، الرمز البريدي: 130 العذيبة', width - 30, 118);
    ctx.fillText(`سلطنة عُمان، مسقط، بوشر   |   س.ت: ${config.crNumber}`, width - 30, 134);
    ctx.fillText(`المسؤول: ${config.whatsappNumber.replace(/[^0-9]/g, '')}`, width - 30, 150);

    // 2 Side-by-Side Summary Boxes (Cash/Credit Invoice & Customer Details)
    const boxY = 175;
    const boxW = (width - 75) / 2;
    const boxH = 90;

    // Box 1: Invoice Meta
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(30, boxY, boxW, boxH);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, boxY, boxW, boxH);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Cash / Credit Invoice  (فاتورة نقدية / آجل)', 30 + boxW / 2, boxY + 18);

    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(30, boxY + 26);
    ctx.lineTo(30 + boxW, boxY + 26);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('Invoice No:', 40, boxY + 46);
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(order.invoiceNo, 120, boxY + 46);

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('Date (التاريخ):', 40, boxY + 68);
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(order.date, 120, boxY + 68);

    // Box 2: Customer Details
    const box2X = 30 + boxW + 15;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(box2X, boxY, boxW, boxH);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(box2X, boxY, boxW, boxH);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Customer Details  (بيانات العميل)', box2X + boxW / 2, boxY + 18);

    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(box2X, boxY + 26);
    ctx.lineTo(box2X + boxW, boxY + 26);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('Customer:', box2X + 10, boxY + 46);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(order.customerName || 'Walk-in Supermarket', box2X + 85, boxY + 46);

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('Phone:', box2X + 10, boxY + 64);
    ctx.fillStyle = '#0f172a';
    ctx.font = '10px monospace';
    ctx.fillText(order.phone || 'N/A', box2X + 85, boxY + 64);

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('Location:', box2X + 10, boxY + 80);
    ctx.fillStyle = '#0f172a';
    ctx.font = '9.5px sans-serif';
    const locParts: string[] = [];
    if (order.address?.title) locParts.push(order.address.title);
    if (order.address?.city) locParts.push(order.address.city);
    if (order.address?.region) locParts.push(order.address.region);
    if (order.address?.note) locParts.push(`(${order.address.note})`);
    const locText = locParts.length > 0 ? locParts.join(', ') : 'Muscat, Oman';
    ctx.fillText(locText.length > 45 ? locText.slice(0, 42) + '...' : locText, box2X + 85, boxY + 80);

    // Items Table Header
    const tableY = 285;
    const tableW = width - 60;
    const colX = {
      id: 30,
      desc: 90,
      qty: 420,
      price: 490,
      unit: 570,
      vat: 640,
      total: 710,
    };

    // Header Background
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(30, tableY, tableW, 26);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, tableY, tableW, 26);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 9.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Product ID', 60, tableY + 16);
    ctx.textAlign = 'left';
    ctx.fillText('Description of Goods (وصف المنتج)', 95, tableY + 16);
    ctx.textAlign = 'center';
    ctx.fillText('Qty', 455, tableY + 16);
    ctx.fillText('Price (OMR)', 530, tableY + 16);
    ctx.fillText('Unit', 605, tableY + 16);
    ctx.fillText('VAT (5%)', 675, tableY + 16);
    ctx.fillText('Amount', 750, tableY + 16);

    // Items Rows
    let curY = tableY + 26;
    order.items.forEach((item, index) => {
      const rowH = 34;
      ctx.fillStyle = index % 2 === 0 ? '#ffffff' : '#fafafa';
      ctx.fillRect(30, curY, tableW, rowH);
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(30, curY, tableW, rowH);

      // Product ID
      ctx.textAlign = 'center';
      ctx.fillStyle = '#334155';
      ctx.font = '9px monospace';
      ctx.fillText(item.productId.toString(), 60, curY + 20);

      // Description
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9.5px sans-serif';
      const truncatedName = item.name.length > 44 ? item.name.slice(0, 42) + '...' : item.name;
      ctx.fillText(truncatedName, 95, curY + 15);

      if (item.pack || item.size) {
        ctx.fillStyle = '#64748b';
        ctx.font = '8.5px sans-serif';
        ctx.fillText(`Pack: ${item.pack || 'Wholesale'} | ${item.size || ''}`, 95, curY + 27);
      }

      // Qty
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(item.quantity.toString(), 455, curY + 20);

      // Price
      ctx.font = '9px monospace';
      ctx.fillStyle = '#334155';
      ctx.fillText(item.price.toFixed(3), 530, curY + 20);

      // Unit
      ctx.font = '9px sans-serif';
      ctx.fillText(item.unit || 'Pieces', 605, curY + 20);

      // VAT
      const vatVal = item.vatAmount || item.total * 0.05;
      ctx.font = '9px monospace';
      ctx.fillText(vatVal.toFixed(3), 675, curY + 20);

      // Total
      const grossVal = item.total + vatVal;
      ctx.font = 'bold 9.5px monospace';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(grossVal.toFixed(3), 750, curY + 20);

      curY += rowH;
    });

    // Total Row
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(30, curY, tableW, 28);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(30, curY, tableW, 28);

    const totalQty = order.items.reduce((sum, it) => sum + it.quantity, 0);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('Grand Total (المجموع الكلي)', 95, curY + 18);

    ctx.textAlign = 'center';
    ctx.fillText(totalQty.toString(), 455, curY + 18);
    ctx.font = 'bold 10px monospace';
    ctx.fillText(order.vat.toFixed(3), 675, curY + 18);

    ctx.fillStyle = config.customColor || '#0d9488';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`${order.grandTotal.toFixed(3)} ${config.currency}`, 750, curY + 18);

    curY += 45;

    // Payment & Terms
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('Payment & Delivery Terms:', 30, curY);

    ctx.fillStyle = '#475569';
    ctx.font = '9px sans-serif';
    ctx.fillText(`• Payment Method: ${order.paymentMethod || 'Cash / Credit on Delivery'} (${order.paymentDetails || 'Wholesale Settlement'})`, 30, curY + 14);
    ctx.fillText(`• Delivery Time: Next-day morning priority delivery to shop location`, 30, curY + 28);
    ctx.fillText(`• Terms & conditions have been applied as agreed in the contract and website.`, 30, curY + 42);

    // Stamp & Signature Box
    const stampX = width - 180;
    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(stampX, curY - 10, 150, 65);
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.font = '8px sans-serif';
    ctx.fillText('Authorized Signature & Stamp', stampX + 75, curY + 50);

    // Stamp Circle Simulation
    ctx.strokeStyle = config.customColor || '#0d9488';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(stampX + 75, curY + 18, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = config.customColor || '#0d9488';
    ctx.font = 'bold 7px sans-serif';
    ctx.fillText('VERIFIED B2B', stampX + 75, curY + 16);
    ctx.fillText('TAX INVOICE', stampX + 75, curY + 24);

    // Footer
    curY += 75;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, curY);
    ctx.lineTo(width - 30, curY);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `SMART ENERGY TRADING LLC P.O. Box: 2906, Azaiba 130, Muscat, Sultanate of Oman | CR: ${config.crNumber} | VATIN: ${config.vatin} | ${config.whatsappNumber}`,
      width / 2,
      curY + 16
    );

    resolve(canvas);
  });
}

/**
 * Generates and triggers instant PDF download using jsPDF + high-res canvas
 */
export async function downloadInvoicePDF(order: Order, config: AppConfig): Promise<boolean> {
  try {
    const canvas = await renderInvoiceToCanvas(order, config);
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Tax-Invoice-${order.invoiceNo}.pdf`);
    return true;
  } catch (err) {
    console.error('PDF Generation failed:', err);
    return false;
  }
}

/**
 * Returns raw PDF Blob for native Web Share API (WhatsApp direct file attach)
 */
export async function getInvoicePDFBlob(order: Order, config: AppConfig): Promise<Blob | null> {
  try {
    const canvas = await renderInvoiceToCanvas(order, config);
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    return pdf.output('blob');
  } catch (err) {
    console.error('getInvoicePDFBlob failed:', err);
    return null;
  }
}

/**
 * Returns raw Image Blob for native Web Share API (WhatsApp direct image attach)
 */
export async function getInvoiceImageBlob(order: Order, config: AppConfig): Promise<Blob | null> {
  try {
    const canvas = await renderInvoiceToCanvas(order, config);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  } catch (err) {
    console.error('getInvoiceImageBlob failed:', err);
    return null;
  }
}

/**
 * Generates and triggers instant Image download (.png)
 */
export async function downloadInvoiceImage(order: Order, config: AppConfig): Promise<Blob | null> {
  try {
    const canvas = await renderInvoiceToCanvas(order, config);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `Tax-Invoice-${order.invoiceNo}.png`;
        link.href = url;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        resolve(blob);
      }, 'image/png');
    });
  } catch (err) {
    console.error('Image capture failed:', err);
    return null;
  }
}

/**
 * Generates and triggers downloadable Word document (.doc)
 */
export function downloadInvoiceDoc(order: Order, config: AppConfig) {
  const totalQty = order.items.reduce((s, it) => s + it.quantity, 0);

  const htmlDoc = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Invoice ${order.invoiceNo}</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 11pt; color: #111; }
      table { border-collapse: collapse; width: 100%; margin-top: 15px; }
      th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; }
      th { background-color: #f2f2f2; font-weight: bold; }
      .header-title { font-size: 20pt; font-weight: bold; color: ${config.customColor || '#0d9488'}; text-align: center; }
      .sub-title { font-size: 10pt; color: #555; text-align: center; }
      .total-row { font-weight: bold; background-color: #f7f7f7; }
    </style>
    </head>
    <body>
      <div class="header-title">${config.name.toUpperCase()}</div>
      <div class="sub-title">TAX INVOICE / فاتورة ضريبية - SULTANATE OF OMAN</div>
      <br/>
      <table style="border: none;">
        <tr style="border: none;">
          <td style="border: none; width: 50%;">
            <strong>${config.companyName}</strong><br/>
            CR No: ${config.crNumber}<br/>
            VATIN: ${config.vatin}<br/>
            Tel: ${config.whatsappNumber}
          </td>
          <td style="border: none; width: 50%; text-align: right;">
            <strong>Invoice No: ${order.invoiceNo}</strong><br/>
            Date: ${order.date}<br/>
            Customer: ${order.customerName}<br/>
            Location: ${order.address?.title ? order.address.title + ', ' : ''}${order.address?.city || 'Muscat'}, ${order.address?.region || 'Oman'}${order.address?.note ? ' (' + order.address.note + ')' : ''}
          </td>
        </tr>
      </table>
      <br/>
      <table>
        <thead>
          <tr>
            <th>Item #</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Unit</th>
            <th>VAT (5%)</th>
            <th>Total (OMR)</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map((it, i) => `
            <tr>
              <td>${it.productId}</td>
              <td>${it.name} ${it.pack ? `(${it.pack})` : ''}</td>
              <td style="text-align: center;">${it.quantity}</td>
              <td style="text-align: right;">${it.price.toFixed(3)}</td>
              <td>${it.unit || 'Pieces'}</td>
              <td style="text-align: right;">${(it.vatAmount || it.total * 0.05).toFixed(3)}</td>
              <td style="text-align: right; font-weight: bold;">${(it.total + (it.vatAmount || it.total * 0.05)).toFixed(3)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="2">TOTAL</td>
            <td style="text-align: center;">${totalQty}</td>
            <td colspan="2"></td>
            <td style="text-align: right;">${order.vat.toFixed(3)}</td>
            <td style="text-align: right; font-size: 13pt;">${order.grandTotal.toFixed(3)} ${config.currency}</td>
          </tr>
        </tbody>
      </table>
      <br/>
      <p><strong>Payment Method:</strong> ${order.paymentMethod || 'Cash / Credit'}</p>
      <p><strong>Terms:</strong> Standard wholesale agreement terms apply. Thank you for your business!</p>
    </body>
    </html>
  `;

  const blob = new Blob([htmlDoc], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Invoice-${order.invoiceNo}.doc`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Isolated print window that works seamlessly inside iframes and all browsers
 */
export function triggerPrintInvoice(order: Order, config: AppConfig) {
  const totalQty = order.items.reduce((s, it) => s + it.quantity, 0);

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Tax Invoice - ${order.invoiceNo}</title>
        <style>
          @page { size: A4; margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111; margin: 0; padding: 15px; font-size: 12px; }
          .header { text-align: center; margin-bottom: 20px; }
          .logo { font-size: 26px; font-weight: 900; color: ${config.customColor || '#0d9488'}; }
          .bilingual { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 20px; line-height: 1.4; }
          .arabic { text-align: right; direction: rtl; }
          .boxes { display: flex; gap: 15px; margin-bottom: 20px; }
          .box { flex: 1; border: 1px solid #333; }
          .box-title { background: #f0f0f0; padding: 6px; font-weight: bold; text-align: center; border-bottom: 1px solid #333; }
          .box-body { padding: 8px; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
          th, td { border: 1px solid #333; padding: 6px 8px; }
          th { background: #f0f0f0; text-align: center; font-weight: bold; }
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .total-row { background: #f0f0f0; font-weight: bold; }
          .footer { margin-top: 30px; font-size: 10px; color: #666; text-align: center; border-top: 1px solid #ccc; padding-top: 10px; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">${config.name.toUpperCase()}</div>
          <div style="font-size: 11px; color: #666;">${config.tagline || 'Tamween B2B Buyer & Supplier • Sultanate of Oman'}</div>
        </div>

        <div class="bilingual">
          <div>
            <strong>${config.companyName}</strong><br>
            P.O. Box: 2906, Azaiba 130, Muscat, Sultanate of Oman<br>
            CR No: ${config.crNumber} | VATIN: ${config.vatin}<br>
            Contact: ${config.whatsappNumber}
          </div>
          <div class="arabic">
            <strong>${config.arabicCompanyName || 'الطاقة الذكية للتجارة'}</strong><br>
            صندوق البريد: 2906، الرمز البريدي: 130 العذيبة<br>
            رقم السجل التجاري: ${config.crNumber} | الرقم الضريبي: ${config.vatin}<br>
            المسؤول: ${config.whatsappNumber.replace(/[^0-9]/g, '')}
          </div>
        </div>

        <div class="boxes">
          <div class="box">
            <div class="box-title">Cash / Credit Invoice (فاتورة نقدية / آجل)</div>
            <div class="box-body">
              <strong>Invoice No:</strong> ${order.invoiceNo}<br>
              <strong>Date (التاريخ):</strong> ${order.date}
            </div>
          </div>
          <div class="box">
            <div class="box-title">Customer Details (بيانات العميل)</div>
            <div class="box-body">
              <strong>Customer:</strong> ${order.customerName}<br>
              <strong>Phone:</strong> ${order.phone || 'N/A'}<br>
              <strong>Location:</strong> ${order.address?.city || 'Muscat'}, ${order.address?.region || 'Oman'}
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 10%;">ID</th>
              <th class="text-left" style="width: 40%;">Description of Goods (وصف المنتج)</th>
              <th style="width: 10%;">Qty</th>
              <th style="width: 10%;">Rate</th>
              <th style="width: 10%;">Unit</th>
              <th style="width: 10%;">VAT (5%)</th>
              <th style="width: 10%;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((it) => `
              <tr>
                <td class="text-center">${it.productId}</td>
                <td class="text-left">${it.name} ${it.pack ? `<small>(${it.pack})</small>` : ''}</td>
                <td class="text-center font-bold">${it.quantity}</td>
                <td class="text-center">${it.price.toFixed(3)}</td>
                <td class="text-center">${it.unit || 'Pieces'}</td>
                <td class="text-center">${(it.vatAmount || it.total * 0.05).toFixed(3)}</td>
                <td class="text-right"><strong>${(it.total + (it.vatAmount || it.total * 0.05)).toFixed(3)}</strong></td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2" class="text-center">Grand Total</td>
              <td class="text-center">${totalQty}</td>
              <td colspan="2"></td>
              <td class="text-center">${order.vat.toFixed(3)}</td>
              <td class="text-right" style="font-size: 13px;">${order.grandTotal.toFixed(3)} ${config.currency}</td>
            </tr>
          </tbody>
        </table>

        <div style="font-size: 11px; margin-top: 15px;">
          <strong>Payment Method:</strong> ${order.paymentMethod || 'Cash / Credit Settlement'}<br>
          <strong>Terms & Conditions:</strong> Terms and conditions have been applied as agreed in the contract and website.
        </div>

        <div class="footer">
          SMART ENERGY TRADING LLC P.O. Box: 2906, Azaiba 130, Muscat, Sultanate of Oman | CR: ${config.crNumber} | VATIN: ${config.vatin}
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  // Try creating an isolated hidden iframe for guaranteed print without blocking main UI
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(printContent);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        window.print();
      }
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 5000);
    }, 400);
  } else {
    window.print();
  }
}
