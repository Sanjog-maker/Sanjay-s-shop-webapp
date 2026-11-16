import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Truck,
  Copy,
  Check,
  Share2,
  Calendar,
  AlertCircle,
  TrendingDown,
  ShoppingBag,
  Plus,
  RefreshCw
} from 'lucide-react';
import { ReorderRecommendation, SupplierPurchaseList, Product } from '../../types/index';
import { api } from '../../services/api';

interface SmartReorderViewProps {
  products: Product[];
  onRestockSuccess: () => void;
  onNavigateToBilling: () => void;
}

export const SmartReorderView: React.FC<SmartReorderViewProps> = ({
  products,
  onRestockSuccess,
  onNavigateToBilling
}) => {
  const [recommendations, setRecommendations] = useState<ReorderRecommendation[]>([]);
  const [supplierGroups, setSupplierGroups] = useState<SupplierPurchaseList[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [copiedSupplier, setCopiedSupplier] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchReorderData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getSmartReorder();
      setRecommendations(res.recommendations);
      setSupplierGroups(res.supplierGroups);

      // Pre-select all urgent and recommended items
      const initialSelection: Record<string, boolean> = {};
      res.recommendations.forEach((r) => {
        initialSelection[r.productId] = true;
      });
      setSelectedItems(initialSelection);
    } catch (err) {
      console.error('Failed to load reorder data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReorderData();
  }, []);

  const toggleItemSelection = (productId: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleCopyWhatsAppPO = (group: SupplierPurchaseList) => {
    const activeItems = group.items.filter((i) => selectedItems[i.productId]);
    if (activeItems.length === 0) {
      alert('Please select at least one item to generate a purchase order.');
      return;
    }

    const totalUnits = activeItems.reduce((acc, i) => acc + i.recommendedOrderQty, 0);
    const totalCost = activeItems.reduce((acc, i) => acc + i.estimatedOrderCost, 0);
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const lines = [
      `*PURCHASE ORDER - Balaji Stores (ID: 48293, Chennai, TN)*`,
      `Supplier: *${group.supplier}*`,
      `Date: ${dateStr}`,
      `---------------------------------`,
      ...activeItems.map(
        (i, idx) =>
          `${idx + 1}. ${i.productName} - *${i.recommendedOrderQty} ${i.unit}s* (₹${i.estimatedOrderCost.toLocaleString('en-IN')})`
      ),
      `---------------------------------`,
      `*Total Items:* ${activeItems.length}`,
      `*Total Quantity:* ${totalUnits} units`,
      `*Estimated Amount:* ₹${totalCost.toLocaleString('en-IN')}`,
      `\nPlease deliver by tomorrow morning. Thank you!`
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedSupplier(group.supplier);
    setTimeout(() => setCopiedSupplier(null), 3000);
  };

  const handleOneClickRestockAll = async (group: SupplierPurchaseList) => {
    const activeItems = group.items.filter((i) => selectedItems[i.productId]);
    if (activeItems.length === 0) return;

    try {
      for (const item of activeItems) {
        await api.restockProduct({
          productId: item.productId,
          quantity: item.recommendedOrderQty,
          purchasePrice: item.purchasePrice,
          supplier: item.supplier,
          notes: `Batch restock from ${group.supplier}`
        });
      }
      alert(`Successfully restocked ${activeItems.length} items from ${group.supplier}!`);
      onRestockSuccess();
      fetchReorderData();
    } catch (err: any) {
      alert(`Restock failed: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Calculating EOQ reorder thresholds & distributor lead times...</p>
      </div>
    );
  }

  const grandTotalCost = supplierGroups.reduce((acc, g) => {
    const groupActive = g.items.filter((i) => selectedItems[i.productId]);
    return acc + groupActive.reduce((sum, item) => sum + item.estimatedOrderCost, 0);
  }, 0);

  const grandTotalUnits = supplierGroups.reduce((acc, g) => {
    const groupActive = g.items.filter((i) => selectedItems[i.productId]);
    return acc + groupActive.reduce((sum, item) => sum + item.recommendedOrderQty, 0);
  }, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Smart Reorder Assistant
            </h1>
            <span className="px-2 py-0.5 text-xs font-bold text-emerald-800 bg-emerald-100 rounded-md">
              Lead Time & Safety Stock Aware
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Automated Purchase Orders grouped by supplier to prevent grocery stockouts.
          </p>
        </div>

        {/* Global summary badge */}
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-4 shadow-xs">
          <div>
            <span className="text-[11px] font-medium text-slate-400 block uppercase">Selected Orders</span>
            <span className="text-base font-bold text-slate-900">{grandTotalUnits} units</span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <span className="text-[11px] font-medium text-slate-400 block uppercase">Total Investment</span>
            <span className="text-base font-bold text-emerald-700">₹{grandTotalCost.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Supplier Purchase Order Groups */}
      <div className="space-y-6">
        {supplierGroups.map((group) => {
          const isCopied = copiedSupplier === group.supplier;
          const groupSelectedItems = group.items.filter((i) => selectedItems[i.productId]);
          const groupTotalCost = groupSelectedItems.reduce((acc, i) => acc + i.estimatedOrderCost, 0);
          const groupTotalUnits = groupSelectedItems.reduce((acc, i) => acc + i.recommendedOrderQty, 0);

          return (
            <div
              key={group.supplier}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-slate-300 transition-all"
            >
              {/* Group Header */}
              <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{group.supplier}</h2>
                    <p className="text-xs text-slate-500">
                      {group.items.length} items suggested • {groupTotalUnits} units selected (₹{groupTotalCost.toLocaleString('en-IN')})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyWhatsAppPO(group)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-emerald-600" />}
                    <span>{isCopied ? 'PO Copied to Clipboard!' : 'Copy WhatsApp PO'}</span>
                  </button>

                  <button
                    onClick={() => handleOneClickRestockAll(group)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Receive Delivery</span>
                  </button>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 w-10 text-center">Select</th>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">Current Stock</th>
                      <th className="py-3 px-4">Daily Velocity</th>
                      <th className="py-3 px-4">Lead Time</th>
                      <th className="py-3 px-4 font-bold text-emerald-800">Suggested Order</th>
                      <th className="py-3 px-4">Purchase Rate</th>
                      <th className="py-3 px-4 text-right">Est. Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {group.items.map((item) => {
                      const isChecked = !!selectedItems[item.productId];
                      return (
                        <tr
                          key={item.productId}
                          className={`hover:bg-slate-50 transition-colors ${
                            item.priority === 'URGENT' ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleItemSelection(item.productId)}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                              {item.productName}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span>{item.category}</span>
                              {item.priority === 'URGENT' && (
                                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                  Imminent Stockout
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-medium">
                            <span className={item.currentStock <= 3 ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                              {item.currentStock} {item.unit}s
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            ~{item.averageDailyDemand} {item.unit}s / day
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {item.leadTimeDays} days
                          </td>
                          <td className="py-3.5 px-4 font-bold text-emerald-800 text-sm">
                            {item.recommendedOrderQty} {item.unit}s
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            ₹{item.purchasePrice}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                            ₹{item.estimatedOrderCost.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
