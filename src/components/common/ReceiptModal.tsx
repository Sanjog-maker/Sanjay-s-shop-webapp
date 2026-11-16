import React, { useEffect, useState } from 'react';
import { Bill } from '../../types/index';
import { X, Printer, Share2, Check, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

interface ReceiptModalProps {
  bill: Bill | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ bill, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    if (bill && bill.paymentMethod === 'UPI') {
      // Generate realistic Indian UPI payment link
      const upiUrl = `upi://pay?pa=shopiq.store@icici&pn=ShopIQ%20Grocery&am=${bill.total}&cu=INR&tn=Bill-${bill.invoiceNumber}`;
      QRCode.toDataURL(upiUrl, { width: 140, margin: 1 })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('QR code error', err));
    }
  }, [bill]);

  if (!bill) return null;

  const totalMrp = bill.items.reduce((acc, item) => acc + item.product.mrp * item.quantity, 0);
  const totalSavings = Math.max(0, totalMrp - bill.total);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const itemsList = bill.items
      .map((i) => `• ${i.product.name} x ${i.quantity} = ₹${i.total}`)
      .join('\n');
    const text = `*BALAJI STORES (ShopIQ - Chennai)*\n*Tax Invoice:* ${bill.invoiceNumber}\n*Date:* ${new Date(bill.date).toLocaleString('en-IN')}\n------------------------\n${itemsList}\n------------------------\n*Subtotal:* ₹${bill.subtotal}\n*Discount:* ₹${bill.discount}\n*Grand Total: ₹${bill.total}*\n*Payment:* ${bill.paymentMethod} (${bill.status})\n${totalSavings > 0 ? `🎉 *You saved ₹${totalSavings} on MRP!*` : ''}\n\nThank you for shopping at Balaji Stores! Visit again.`;

    const encoded = encodeURIComponent(text);
    const phone = bill.customerPhone ? `91${bill.customerPhone.replace(/\D/g, '')}` : '';
    const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleCopyText = () => {
    const itemsList = bill.items
      .map((i) => `${i.product.name} (${i.quantity} ${i.product.unit}) - Rs.${i.total}`)
      .join('\n');
    const summary = `ShopIQ Invoice: ${bill.invoiceNumber}\nTotal: Rs.${bill.total}\nItems:\n${itemsList}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="receipt-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="receipt-modal-content"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <span className="font-semibold text-slate-800 text-sm tracking-wide uppercase">
            Tax Invoice / Bill
          </span>
          <button
            id="close-receipt-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Receipt Card */}
        <div className="p-6 bg-white print:p-0 font-mono text-xs text-slate-800 space-y-4">
          <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-3">
            <h2 className="text-base font-bold tracking-tight text-slate-900 font-sans">
              BALAJI STORES
            </h2>
            <p className="text-[11px] text-slate-600 font-sans font-medium">
              ID: 48293 • Chennai, TN
            </p>
            <p className="text-[11px] text-slate-500 font-sans">
              #42, Bazaar Main Road, T. Nagar, Chennai - 600017
            </p>
            <p className="text-[11px] text-slate-500 font-sans">
              GSTIN: 33AAAAA0000A1Z5 | Ph: +91 98401 98401
            </p>
          </div>

          <div className="flex justify-between text-[11px] text-slate-600">
            <div>
              <p><span className="text-slate-400">Bill No:</span> {bill.invoiceNumber}</p>
              <p><span className="text-slate-400">Date:</span> {new Date(bill.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
            <div className="text-right">
              <p><span className="text-slate-400">Pay Mode:</span> <span className="font-bold text-slate-900">{bill.paymentMethod}</span></p>
              {bill.customerName && (
                <p><span className="text-slate-400">Cust:</span> {bill.customerName}</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border-t border-b border-dashed border-slate-300 py-2">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                  <th className="py-1">Item</th>
                  <th className="text-center py-1">Qty</th>
                  <th className="text-right py-1">Rate</th>
                  <th className="text-right py-1">Amt (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bill.items.map((item, idx) => (
                  <tr key={idx} className="text-slate-800">
                    <td className="py-1.5 pr-2 font-sans font-medium">
                      <div>{item.product.name}</div>
                      {item.product.regionalName && (
                        <div className="text-[10px] text-slate-400 font-normal">{item.product.regionalName}</div>
                      )}
                    </td>
                    <td className="text-center py-1.5">
                      {item.quantity} {item.product.unit}
                    </td>
                    <td className="text-right py-1.5 text-slate-600">
                      ₹{item.unitPrice}
                    </td>
                    <td className="text-right py-1.5 font-bold">
                      ₹{item.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation Breakdown */}
          <div className="space-y-1.5 text-right font-sans text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>₹{bill.subtotal.toFixed(2)}</span>
            </div>
            {bill.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Special Discount:</span>
                <span>-₹{bill.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-2 font-mono">
              <span>GRAND TOTAL:</span>
              <span className="text-emerald-700">₹{bill.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Savings Highlight */}
          {totalSavings > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-center text-emerald-800 font-sans text-xs font-semibold">
              🎉 Total Savings on MRP: ₹{totalSavings.toFixed(2)}!
            </div>
          )}

          {/* UPI QR Display if payment is UPI */}
          {bill.paymentMethod === 'UPI' && qrCodeDataUrl && (
            <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 font-sans">
                <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                Scan to Pay with GPay / PhonePe / Paytm
              </div>
              <img src={qrCodeDataUrl} alt="UPI QR Code" className="w-28 h-28 rounded-md bg-white p-1 border" />
              <span className="text-[10px] text-slate-500">UPI ID: shopiq.store@icici</span>
            </div>
          )}

          {/* Footer Note */}
          <div className="text-center text-[10px] text-slate-400 font-sans border-t border-dashed border-slate-300 pt-3 space-y-0.5">
            <p>Thank you for your visit!</p>
            <p>Goods once sold can be exchanged within 2 days with bill.</p>
            <p className="font-semibold text-slate-500">Powered by ShopIQ Kirana POS</p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
          <button
            id="copy-receipt-btn"
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            id="whatsapp-share-btn"
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            WhatsApp Bill
          </button>
          <button
            id="print-receipt-btn"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
