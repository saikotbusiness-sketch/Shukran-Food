import { Order } from '../types';

/**
 * Encodes an order into a compressed URL-safe string
 */
export function encodeOrderToUrl(order: Order): string {
  try {
    const minified = {
      i: order.invoiceNo,
      d: order.date,
      c: order.customerName,
      p: order.phone,
      t: order.customerType,
      a: order.address
        ? {
            t: order.address.title,
            c: order.address.city,
            r: order.address.region,
            l: order.address.locationLink,
            n: order.address.note,
          }
        : null,
      it: order.items.map((item) => ({
        id: item.productId,
        n: item.name,
        an: item.arabicName || '',
        pr: item.price,
        pk: item.pack,
        sz: item.size,
        u: item.unit || 'Pieces',
        q: item.quantity,
        tt: item.total,
        v: item.vatAmount || item.total * 0.05,
      })),
      s: order.subtotal,
      v: order.vat,
      df: order.deliveryFee,
      g: order.grandTotal,
    };

    const json = JSON.stringify(minified);
    // Base64 encoding supporting Unicode
    return btoa(
      encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
  } catch (e) {
    console.error('Failed to encode order to URL', e);
    return '';
  }
}

/**
 * Decodes an order from a compressed URL-safe string
 */
export function decodeOrderFromUrl(encoded: string): Order | null {
  try {
    const json = decodeURIComponent(
      Array.prototype.map
        .call(atob(encoded), (c: string) =>
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        )
        .join('')
    );
    const m = JSON.parse(json);

    return {
      id: `ord-${m.i || Date.now()}`,
      invoiceNo: m.i || 'Not Available',
      date: m.d || new Date().toISOString().slice(0, 10).replace(/-/g, '/'),
      customerName: m.c || 'Walk-in Customer',
      phone: m.p || '',
      customerType: m.t || 'Grocery & Super Market',
      address: m.a
        ? {
            id: 'decoded-addr',
            title: m.a.t || '',
            country: 'Oman',
            region: m.a.r || 'Muscat',
            city: m.a.c || 'Azaiba',
            locationLink: m.a.l || '',
            closeAtNoon: true,
            note: m.a.n || '',
          }
        : null,
      items: (m.it || []).map((item: any) => ({
        productId: item.id || 0,
        name: item.n || '',
        arabicName: item.an || '',
        price: item.pr || 0,
        pack: item.pk || '# 1',
        size: item.sz || '',
        unit: item.u || 'Pieces',
        quantity: item.q || 1,
        total: item.tt || 0,
        vatAmount: item.v || item.tt * 0.05,
      })),
      subtotal: m.s || 0,
      vat: m.v || 0,
      deliveryFee: m.df || 0,
      grandTotal: m.g || 0,
      status: 'Confirmed',
    };
  } catch (e) {
    console.error('Failed to decode order from URL', e);
    return null;
  }
}
