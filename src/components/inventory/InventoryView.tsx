import React, { useState, useEffect } from 'react';
import { Product, StockMovement, RestockEntry, StockAdjustmentEntry } from '../../types/index';
import { api } from '../../services/api';
import {
  Boxes,
  AlertTriangle,
  PlusCircle,
  Sliders,
  History,
  X,
  RefreshCw,
  IndianRupee,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Package
} from 'lucide-react';

interface InventoryViewProps {
  products: Product[];
  onInventoryUpdated: () => void;
  preSelectedRestockProduct?: Product;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  onInventoryUpdated,
  preSelectedRestockProduct
}) => {
  const [history, setHistory] = useState<StockMovement[]>([]);
  const [historyFilter, setHistoryFilter] = useState<string>('ALL');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Modals
  const [isRestockOpen, setIsRestockOpen] = useState(!!preSelectedRestockProduct);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Restock Form
  const [restockData, setRestockData] = useState<RestockEntry>({
    productId: preSelectedRestockProduct?.id || (products[0]?.id ?? ''),
    quantity: 10,
    purchasePrice: preSelectedRestockProduct?.purchasePrice || (products[0]?.purchasePrice ?? 50),
    supplier: preSelectedRestockProduct?.supplier || (products[0]?.supplier ?? 'Wholesale Agency'),
    invoiceNumber: `PO-${Date.now().toString().slice(-4)}`,
    notes: ''
  });

  // Adjustment Form
  const [adjustmentData, setAdjustmentData] = useState<StockAdjustmentEntry>({
    productId: products[0]?.id || '',
    adjustmentType: 'REMOVE_STOCK',
    quantity: 1,
    reason: 'DAMAGE',
    notes: ''
  });

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await api.getStockHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (preSelectedRestockProduct) {
      setRestockData({
        productId: preSelectedRestockProduct.id,
        quantity: preSelectedRestockProduct.minStockLevel * 2,
        purchasePrice: preSelectedRestockProduct.purchasePrice,
        supplier: preSelectedRestockProduct.supplier,
        invoiceNumber: `PO-${Date.now().toString().slice(-4)}`,
        notes: `Urgent restocking for ${preSelectedRestockProduct.name}`
      });
      setIsRestockOpen(true);
    }
  }, [preSelectedRestockProduct]);

  // Inventory Totals
  const totalCostValuation = products.reduce((acc, p) => acc + p.currentStock * p.purchasePrice, 0);
  const totalRetailValuation = products.reduce((acc, p) => acc + p.currentStock * p.sellingPrice, 0);
  const totalUnits = products.reduce((acc, p) => acc + p.currentStock, 0);
  const lowStockProducts = products.filter((p) => p.currentStock <= p.minStockLevel);

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (restockData.quantity <= 0) {
      setErrorMessage('Quantity must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await api.restockProduct(restockData);
      onInventoryUpdated();
      fetchHistory();
      setIsRestockOpen(false);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error processing restock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustmentData.quantity <= 0) {
      setErrorMessage('Quantity must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await api.adjustStock(adjustmentData);
      onInventoryUpdated();
      fetchHistory();
      setIsAdjustmentOpen(false);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error processing stock adjustment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredHistory = history.filter((h) => {
    if (historyFilter === 'ALL') return true;
    return h.type === historyFilter;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Inventory &amp; Stock Movements
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track purchase restocks, low-stock alerts, damage adjustments, and total valuation
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="open-adjustment-btn"
            onClick={() => {
              setErrorMessage('');
              setIsAdjustmentOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Stock Adjustment</span>
          </button>
          <button
            id="open-restock-btn"
            onClick={() => {
              setErrorMessage('');
              setIsRestockOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Restock Entry</span>
          </button>
        </div>
      </div>

      {/* Metric Cards: Inventory Valuation & Stock Units */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Stock Valuation (Cost)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              ₹{totalCostValuation.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Retail potential: ₹{totalRetailValuation.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Gross Unrealized Margin</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              ₹{(totalRetailValuation - totalCostValuation).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            +{(totalCostValuation > 0 ? ((totalRetailValuation - totalCostValuation) / totalCostValuation) * 100 : 0).toFixed(1)}% potential margin
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Stocked Units &amp; Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {totalUnits}
            </span>
            <span className="text-xs text-slate-400">units in shop</span>
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">
            {lowStockProducts.length} items below minimum threshold
          </p>
        </div>
      </div>

      {/* Low Stock Alert Panel */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Urgent Low-Stock Reorder Watchlist ({lowStockProducts.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {lowStockProducts.map((p) => (
              <div key={p.id} className="p-3 bg-white rounded-xl border border-amber-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">{p.name}</p>
                  <p className="text-[10px] text-slate-400">
                    Supplier: {p.supplier}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded">
                    {p.currentStock} {p.unit}
                  </span>
                  <button
                    onClick={() => {
                      setRestockData({
                        productId: p.id,
                        quantity: p.minStockLevel * 3,
                        purchasePrice: p.purchasePrice,
                        supplier: p.supplier,
                        invoiceNumber: `PO-${Date.now().toString().slice(-4)}`,
                        notes: `Replenish ${p.name}`
                      });
                      setIsRestockOpen(true);
                    }}
                    className="px-2.5 py-1 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs"
                  >
                    + Restock
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Movement History Audit Log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            <h2 className="font-bold text-sm text-slate-900">
              Stock Movement History &amp; Audit Log
            </h2>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {['ALL', 'SALE', 'RESTOCK', 'DAMAGE', 'ADJUSTMENT'].map((type) => (
              <button
                key={type}
                onClick={() => setHistoryFilter(type)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  historyFilter === type
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4 text-center">Movement Type</th>
                <th className="py-3 px-4 text-center">Quantity Change</th>
                <th className="py-3 px-4 text-center">Stock Balance</th>
                <th className="py-3 px-4">Reference / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No stock movements recorded for this filter.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => {
                  const isPositive = item.quantityChange > 0;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(item.date).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {item.productName}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                            item.type === 'SALE'
                              ? 'bg-sky-100 text-sky-800'
                              : item.type === 'RESTOCK'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.type === 'DAMAGE'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        <span
                          className={`inline-flex items-center gap-0.5 ${
                            isPositive ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {isPositive ? `+${item.quantityChange}` : item.quantityChange}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-700">
                        {item.remainingStock}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        <span className="font-medium text-slate-700">
                          {item.referenceId || 'N/A'}
                        </span>
                        {item.reason && (
                          <span className="block text-[11px] text-slate-400">
                            {item.reason}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Purchase Entry Modal */}
      {isRestockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-bold text-slate-900 text-sm">
                Restock Product / Purchase Entry
              </h2>
              <button
                onClick={() => setIsRestockOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="p-6 space-y-4 text-xs">
              {errorMessage && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Select Product *</label>
                <select
                  value={restockData.productId}
                  onChange={(e) => {
                    const sel = products.find((p) => p.id === e.target.value);
                    setRestockData({
                      ...restockData,
                      productId: e.target.value,
                      purchasePrice: sel?.purchasePrice || restockData.purchasePrice,
                      supplier: sel?.supplier || restockData.supplier
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.currentStock} {p.unit} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Quantity Received *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={restockData.quantity}
                    onChange={(e) => setRestockData({ ...restockData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Purchase Rate / Unit (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={restockData.purchasePrice}
                    onChange={(e) => setRestockData({ ...restockData, purchasePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Supplier Name</label>
                <input
                  type="text"
                  value={restockData.supplier}
                  onChange={(e) => setRestockData({ ...restockData, supplier: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Purchase Invoice / PO Number</label>
                <input
                  type="text"
                  value={restockData.invoiceNumber}
                  onChange={(e) => setRestockData({ ...restockData, invoiceNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Weekly replenishment"
                  value={restockData.notes}
                  onChange={(e) => setRestockData({ ...restockData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRestockOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Add to Stock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {isAdjustmentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-bold text-slate-900 text-sm">
                Stock Adjustment (Damage / Recount)
              </h2>
              <button
                onClick={() => setIsAdjustmentOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustmentSubmit} className="p-6 space-y-4 text-xs">
              {errorMessage && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Select Product *</label>
                <select
                  value={adjustmentData.productId}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, productId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: {p.currentStock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Adjustment Action</label>
                  <select
                    value={adjustmentData.adjustmentType}
                    onChange={(e) => setAdjustmentData({ ...adjustmentData, adjustmentType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="REMOVE_STOCK">Deduct / Remove (-)</option>
                    <option value="ADD_STOCK">Add / Excess (+)</option>
                    <option value="SET_STOCK">Set Exact Count (=)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjustmentData.quantity}
                    onChange={(e) => setAdjustmentData({ ...adjustmentData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Reason</label>
                <select
                  value={adjustmentData.reason}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="DAMAGE">Damaged in shop / transit</option>
                  <option value="EXPIRED">Expired stock</option>
                  <option value="RECOUNT">Physical stock recount</option>
                  <option value="INTERNAL_USE">Internal shop consumption</option>
                  <option value="OTHER">Other Reason</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Milk pouch puncture leak"
                  value={adjustmentData.notes || ''}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdjustmentOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Record Adjustment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
