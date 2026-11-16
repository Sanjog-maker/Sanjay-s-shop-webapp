import React, { useState, useEffect } from 'react';
import {
  DashboardMetrics,
  Product,
  Bill,
  TodayActionPlan
} from '../../types/index';
import {
  IndianRupee,
  Receipt,
  AlertTriangle,
  Package,
  Mic,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Boxes,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { TodaysActionPlanCard } from './TodaysActionPlanCard';
import { generateTodayActionPlan, getStockAlerts } from '../../services/storeService';
import { api } from '../../services/api';

interface DashboardViewProps {
  metrics: DashboardMetrics | null;
  products: Product[];
  onNavigate: (tab: string, param?: any) => void;
  onOpenReceipt: (bill: Bill) => void;
  onQuickAddProduct: () => void;
  onQuickRestock: (product?: Product) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  products,
  onNavigate,
  onOpenReceipt,
  onQuickAddProduct,
  onQuickRestock
}) => {
  const [actionPlan, setActionPlan] = useState<TodayActionPlan | null>(null);

  useEffect(() => {
    // Generate data-driven action plan from current products and recent sales
    if (products.length > 0 && metrics?.recentSales) {
      const plan = generateTodayActionPlan(products, metrics.recentSales);
      setActionPlan(plan);
    }
  }, [products, metrics]);

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const stockAlerts = getStockAlerts(products);
  const criticalStockouts = stockAlerts.filter((a) => a.severity === 'CRITICAL');
  const warningStock = stockAlerts.filter((a) => a.severity === 'WARNING');
  const maxSalesVal = Math.max(...metrics.salesTrend.map((s) => s.revenue), 1000);

  return (
    <div className="space-y-6 pb-16 md:pb-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Balaji Stores
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 rounded-md">
              ID: 48293 • Chennai, TN
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Store Overview & POS Counter • Barcode-free checkout & real-time inventory
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="dash-voice-btn"
            onClick={() => onNavigate('voice-billing')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold transition-colors shadow-xs"
          >
            <Mic className="w-4 h-4 text-emerald-600" />
            <span>Voice POS</span>
          </button>
          <button
            id="dash-new-bill-btn"
            onClick={() => onNavigate('billing')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
          >
            <Receipt className="w-4 h-4" />
            <span>New Bill</span>
          </button>
          <button
            id="dash-add-product-btn"
            onClick={onQuickAddProduct}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
          <button
            id="dash-restock-btn"
            onClick={() => onQuickRestock()}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium transition-colors"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Restock</span>
          </button>
        </div>
      </div>

      {/* TODAY'S ACTION PLAN - Prominent AI-powered operational section */}
      {actionPlan && (
        <TodaysActionPlanCard
          plan={actionPlan}
          onNavigate={onNavigate}
        />
      )}

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Today Revenue */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Today&apos;s Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              ₹{metrics.todayRevenue.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-2 flex items-center text-[11px] text-emerald-700 font-medium">
            <ArrowUpRight className="w-3 h-3 mr-0.5" />
            <span>Est. Profit: ₹{Math.round(metrics.todayProfit).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Today Bills */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Today&apos;s Bills</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {metrics.todayBillsCount}
            </span>
            <span className="text-xs text-slate-400">invoices</span>
          </div>
          <div className="mt-2 flex items-center text-[11px] text-slate-500">
            <Clock className="w-3 h-3 mr-1 text-slate-400" />
            <span>Avg ₹{metrics.todayBillsCount > 0 ? Math.round(metrics.todayRevenue / metrics.todayBillsCount) : 0} / bill</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Products</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {metrics.totalProductsCount}
            </span>
            <span className="text-xs text-slate-400">SKUs</span>
          </div>
          <div className="mt-2 flex items-center text-[11px] text-slate-500">
            <span>Valuation: ₹{(metrics.totalInventoryRetailValue / 1000).toFixed(1)}k</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-amber-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Stock Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tracking-tight ${metrics.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {metrics.lowStockCount}
            </span>
            <span className="text-xs text-slate-400">items need reorder</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium">
            {criticalStockouts.length > 0 ? (
              <span className="text-rose-600 font-bold">🔴 {criticalStockouts.length} critical</span>
            ) : null}
            {warningStock.length > 0 ? (
              <span className="text-amber-700">🟡 {warningStock.length} low</span>
            ) : (
              <span className="text-emerald-700">🟢 All healthy</span>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Sales Trend Chart & Low-Stock Alerts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend (2 Columns) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-800">
                7-Day Sales Trend (₹)
              </h2>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs text-emerald-700 font-semibold hover:underline"
            >
              Full Analytics →
            </button>
          </div>

          {/* Interactive SVG Bar Chart */}
          <div className="h-48 w-full flex items-end justify-between gap-2 pt-4 px-2">
            {metrics.salesTrend.map((day, idx) => {
              const heightPercent = Math.max(12, Math.round((day.revenue / maxSalesVal) * 100));
              const isToday = idx === metrics.salesTrend.length - 1;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ₹{day.revenue}
                  </div>
                  <div
                    className={`w-full max-w-[42px] rounded-t-lg transition-all duration-300 ${
                      isToday
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-xs'
                        : 'bg-emerald-100 hover:bg-emerald-200'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <div className="text-center">
                    <span className={`text-[10px] block font-medium ${isToday ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                      {day.date.split(',')[0] || day.date}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-800">
                Low Stock Items ({metrics.lowStockProducts.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
            {metrics.lowStockProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                All inventory levels are healthy!
              </div>
            ) : (
              metrics.lowStockProducts.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between">
                  <div className="pr-2 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {p.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Min: {p.minStockLevel} {p.unit} • {p.supplier}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-amber-100 text-amber-800">
                      {p.currentStock} {p.unit}
                    </span>
                    <button
                      onClick={() => onQuickRestock(p)}
                      className="px-2 py-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
                    >
                      + Stock
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Grid: Top-Selling Products & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top-Selling Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800">
              Top Velocity Kirana Items
            </h2>
            <span className="text-xs text-slate-400">Volume Sold</span>
          </div>

          <div className="space-y-3">
            {metrics.topSellingProducts.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 line-clamp-1">
                      {item.productName}
                    </p>
                    <p className="text-[11px] text-slate-400">{item.brand}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-slate-900">
                    {item.quantitySold} units
                  </p>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    ₹{item.revenue.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800">
              Recent Invoices & Bills
            </h2>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs text-emerald-700 font-semibold hover:underline"
            >
              All Sales ({metrics.recentSales.length}) →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {metrics.recentSales.slice(0, 5).map((bill) => (
              <div key={bill.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">
                      {bill.invoiceNumber}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                        bill.paymentMethod === 'UPI'
                          ? 'bg-sky-100 text-sky-800'
                          : bill.paymentMethod === 'CASH'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {bill.paymentMethod}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(bill.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • {bill.items.length} items {bill.customerName ? `• ${bill.customerName}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-900">
                    ₹{bill.total.toFixed(2)}
                  </span>
                  <button
                    onClick={() => onOpenReceipt(bill)}
                    title="View & Print Receipt"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
