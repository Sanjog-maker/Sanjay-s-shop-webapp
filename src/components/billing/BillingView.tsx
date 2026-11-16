import React, { useState, useMemo } from 'react';
import {
  Product,
  CartItem,
  Bill,
  ProductCategory,
  PaymentMethod
} from '../../types/index';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  QrCode,
  CreditCard,
  Banknote,
  BookOpen,
  ShoppingBag,
  Percent,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BillingViewProps {
  products: Product[];
  initialCartItems?: CartItem[];
  onBillCreated: (bill: Bill) => void;
  onOpenVoicePOS: () => void;
}

const CATEGORIES: ('All' | ProductCategory)[] = [
  'All',
  'Atta & Flours',
  'Dal & Pulses',
  'Oils & Ghee',
  'Rice & Grains',
  'Dairy',
  'Snacks & Biscuits',
  'Spices & Masala',
  'Personal Care',
  'Household & Cleaning',
  'Beverages',
  'Sugar & Salt'
];

export const BillingView: React.FC<BillingViewProps> = ({
  products,
  initialCartItems = [],
  onBillCreated,
  onOpenVoicePOS
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const [cart, setCart] = useState<CartItem[]>(initialCartItems);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'FIXED' | 'PERCENT'>('FIXED');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCat;

      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        (p.regionalName && p.regionalName.toLowerCase().includes(q)) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.unitPrice
              }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          product,
          quantity: 1,
          unitPrice: product.sellingPrice,
          discount: 0,
          total: product.sellingPrice
        }
      ];
    });
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: qty,
              total: qty * item.unitPrice - item.discount
            }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountValue(0);
    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
  const calculatedDiscount =
    discountType === 'FIXED'
      ? Math.min(subtotal, discountValue)
      : Math.min(subtotal, (subtotal * discountValue) / 100);
  const grandTotal = Math.max(0, subtotal - calculatedDiscount);
  const totalMrp = cart.reduce((acc, item) => acc + item.product.mrp * item.quantity, 0);
  const totalSavings = Math.max(0, totalMrp - grandTotal);
  const estimatedCost = cart.reduce((acc, item) => acc + item.product.purchasePrice * item.quantity, 0);
  const estimatedProfit = Math.max(0, grandTotal - estimatedCost);

  // Submit bill
  const handleGenerateBill = async () => {
    if (cart.length === 0) {
      setErrorMessage('Please add at least one product to create a bill');
      return;
    }

    // Validation for Khata (credit)
    if (paymentMethod === 'KHATA' && !customerName.trim()) {
      setErrorMessage('Customer name is required for Khata (Credit) accounts');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          subtotal,
          discount: calculatedDiscount,
          tax: 0,
          total: grandTotal,
          profit: estimatedProfit,
          paymentMethod,
          customerName: customerName.trim() || undefined,
          customerPhone: customerPhone.trim() || undefined,
          notes: notes.trim() || undefined,
          status: paymentMethod === 'KHATA' ? 'CREDIT' : 'PAID'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate bill');
      }

      // Celebrate success
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });

      const newBill: Bill = data.data;
      onBillCreated(newBill);
      clearCart();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error creating bill');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20 md:pb-6">
      {/* Left Column: Fast Product Catalog & Search (7 Cols on desktop) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Top Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="pos-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name, Tamil (எ.கா. ஆட்டா), brand, or category..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Voice POS Fast Trigger */}
            <button
              id="pos-open-voice-btn"
              onClick={onOpenVoicePOS}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold shrink-0 transition-colors shadow-xs"
              title="Speak items in Tamil / English"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Voice Order</span>
            </button>
          </div>

          {/* Category Chips Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                    isSelected
                      ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid with Large Touch Cards for Speed */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[calc(100vh-18rem)] overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
              No products found matching &quot;{searchQuery}&quot; in {selectedCategory}.
            </div>
          ) : (
            filteredProducts.map((p) => {
              const cartItem = cart.find((c) => c.productId === p.id);
              const isLowStock = p.currentStock <= p.minStockLevel;
              const isOutOfStock = p.currentStock === 0;

              return (
                <div
                  key={p.id}
                  id={`product-card-${p.id}`}
                  onClick={() => !isOutOfStock && addToCart(p)}
                  className={`relative p-3 rounded-2xl border bg-white shadow-xs transition-all flex flex-col justify-between select-none ${
                    isOutOfStock
                      ? 'opacity-50 border-slate-200 cursor-not-allowed'
                      : 'hover:border-emerald-500 hover:shadow-md cursor-pointer active:scale-98 border-slate-200'
                  }`}
                >
                  {/* Stock Alert Badge */}
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-[10px] font-medium text-slate-400 truncate max-w-[90px]">
                      {p.brand}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                        isOutOfStock
                          ? 'bg-rose-100 text-rose-800'
                          : isLowStock
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isOutOfStock ? '0 left' : `${p.currentStock} ${p.unit}`}
                    </span>
                  </div>

                  {/* Title & Regional Name */}
                  <div className="min-h-[44px]">
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                      {p.name}
                    </h3>
                    {p.regionalName && (
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {p.regionalName}
                      </p>
                    )}
                  </div>

                  {/* Pricing and Add Action */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-slate-900">
                          ₹{p.sellingPrice}
                        </span>
                        {p.mrp > p.sellingPrice && (
                          <span className="text-[10px] text-slate-400 line-through">
                            ₹{p.mrp}
                          </span>
                        )}
                      </div>
                    </div>

                    {cartItem ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
                        {cartItem.quantity}
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Active Cart, Khata / UPI details, & Bill Generation (5 Cols on desktop) */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col justify-between space-y-4">
        {/* Cart Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-sm text-slate-900">
              Active Bill Cart ({cart.reduce((a, b) => a + b.quantity, 0)} items)
            </h2>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[11px] text-rose-600 hover:underline font-medium"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto max-h-60 divide-y divide-slate-100 pr-1">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
              <p>Cart is empty.</p>
              <p className="text-[11px] text-slate-400">
                Click any product on the left or use Voice Order to add items.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.productId} className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0 pr-1">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {item.product.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    ₹{item.unitPrice} × {item.quantity} = ₹{item.total}
                  </p>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-6 h-6 rounded bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 shadow-xs"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-7 text-center text-xs font-bold text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-6 h-6 rounded bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 shadow-xs"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Remove Line Item */}
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Billing Options: Discount & Payment Method */}
        <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
          {/* Discount Section */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-slate-600 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-slate-400" />
              Special Discount:
            </span>
            <div className="flex items-center gap-1.5">
              <div className="flex rounded-md border border-slate-200 overflow-hidden text-[10px]">
                <button
                  onClick={() => setDiscountType('FIXED')}
                  className={`px-2 py-1 ${discountType === 'FIXED' ? 'bg-slate-800 text-white font-bold' : 'bg-slate-50 text-slate-600'}`}
                >
                  ₹
                </button>
                <button
                  onClick={() => setDiscountType('PERCENT')}
                  className={`px-2 py-1 ${discountType === 'PERCENT' ? 'bg-slate-800 text-white font-bold' : 'bg-slate-50 text-slate-600'}`}
                >
                  %
                </button>
              </div>
              <input
                type="number"
                min="0"
                value={discountValue || ''}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-right text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <span className="block font-medium text-slate-600 mb-1.5">
              Payment Method:
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'UPI', label: 'UPI QR', icon: QrCode },
                { id: 'CASH', label: 'Cash', icon: Banknote },
                { id: 'CARD', label: 'Card', icon: CreditCard },
                { id: 'KHATA', label: 'Khata', icon: BookOpen }
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    id={`pay-${m.id.toLowerCase()}-btn`}
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-0.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Khata / Customer Details */}
          {(paymentMethod === 'KHATA' || customerName) && (
            <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-purple-900">
                <span>Customer / Khata Account Details</span>
                {paymentMethod === 'KHATA' && <span className="text-rose-600">* Required</span>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Customer Name (e.g. Suresh)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-purple-500"
                />
                <input
                  type="tel"
                  placeholder="Phone (10 digits)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <input
                type="text"
                placeholder="Optional billing note (e.g. Settle on 1st)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-2.5 py-1 bg-white border border-purple-200 rounded-lg text-[11px] outline-none"
              />
            </div>
          )}

          {/* Subtotal & Totals Breakdown */}
          <div className="bg-slate-50 p-3.5 rounded-xl space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            {calculatedDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Discount Applied:</span>
                <span>-₹{calculatedDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-2">
              <span>Grand Total:</span>
              <span className="text-emerald-700">₹{grandTotal.toFixed(2)}</span>
            </div>
            {totalSavings > 0 && (
              <div className="text-[11px] text-emerald-700 text-right font-medium">
                Customer saves ₹{totalSavings.toFixed(2)} on MRP
              </div>
            )}
          </div>
        </div>

        {/* Generate Bill Action Button */}
        <button
          id="generate-bill-btn"
          onClick={handleGenerateBill}
          disabled={cart.length === 0 || isSubmitting}
          className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md ${
            cart.length === 0 || isSubmitting
              ? 'bg-slate-300 cursor-not-allowed shadow-none'
              : 'bg-emerald-600 hover:bg-emerald-700 active:scale-99'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>{isSubmitting ? 'Generating Invoice...' : `Complete Sale • ₹${grandTotal.toFixed(2)}`}</span>
        </button>
      </div>
    </div>
  );
};
