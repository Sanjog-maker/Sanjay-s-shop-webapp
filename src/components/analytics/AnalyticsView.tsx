import React, { useState, useEffect } from 'react';
import { AnalyticsData, ProductCategory } from '../../types/index';
import { api } from '../../services/api';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  IndianRupee,
  Receipt,
  Percent,
  Clock,
  ArrowUpRight,
  AlertCircle,
  RefreshCw,
  Award,
  Package
} from 'lucide-react';

interface AnalyticsViewProps {
  onNavigateToProducts: () => void;
  onNavigateToRestock: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  onNavigateToProducts,
  onNavigateToRestock
}) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const result = await api.getAnalytics();
      setData(result);
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <p className="text-xs text-slate-500 font-medium">Crunching Kirana store analytics...</p>
      </div>
    );
  }

  // Calculate max values for SVG bar chart scaling
  const chartItems =
    timeRange === 'daily'
      ? data.dailyRevenue.map((d) => ({ label: d.label, revenue: d.revenue, bills: d.bills, profit: d.profit }))
      : timeRange === 'weekly'
      ? data.weeklyRevenue.map((w) => ({ label: w.week, revenue: w.revenue, bills: w.bills, profit: w.revenue * 0.18 }))
      : data.monthlyRevenue.map((m) => ({ label: m.month, revenue: m.revenue, bills: m.bills, profit: m.revenue * 0.19 }));

  const maxRevenue = Math.max(...chartItems.map((c) => c.revenue), 1000);
  const maxCategoryRev = Math.max(...data.categoryPerformance.map((c) => c.revenue), 1000);

  return (
    <div className="space-y-6 pb-16 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Store Performance & Financial Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gross margins, sales breakdown, payment splits, and product velocity insights
          </p>
        </div>

        <button
          id="refresh-analytics-btn"
          onClick={fetchAnalytics}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Gross Revenue */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Gross Sales</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            ₹{data.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            {data.totalTransactions} transactions
          </p>
        </div>

        {/* Gross Profit & Margin */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Gross Margin</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-teal-700 tracking-tight">
            {data.profitMarginPercent.toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            ₹{data.grossProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })} estimated profit
          </p>
        </div>

        {/* Avg Bill Value */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Average Ticket</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            ₹{data.averageBillValue.toFixed(1)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Per checkout basket</p>
        </div>

        {/* Units Sold */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Items Moved</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            {data.totalUnitsSold}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Units fulfilled</p>
        </div>
      </div>

      {/* Main Revenue Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Revenue & Transactions Trajectory
            </h2>
          </div>

          {/* Time Range Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start">
            <button
              onClick={() => setTimeRange('daily')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeRange === 'daily'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Daily (7 Days)
            </button>
            <button
              onClick={() => setTimeRange('weekly')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeRange === 'weekly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeRange('monthly')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeRange === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Dynamic Bar Chart */}
        <div className="h-60 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
          {chartItems.map((item, idx) => {
            const heightPercent = Math.max(12, Math.round((item.revenue / maxRevenue) * 100));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-900 text-white px-1.5 py-0.5 rounded shadow-xs">
                  ₹{item.revenue} ({item.bills} bills)
                </div>
                <div
                  className="w-full max-w-[50px] bg-emerald-600 hover:bg-emerald-700 rounded-t-lg transition-all duration-300 relative group-hover:shadow-md"
                  style={{ height: `${heightPercent}%` }}
                >
                  <div
                    className="w-full bg-teal-400/80 rounded-t-lg absolute bottom-0"
                    style={{ height: `${Math.min(100, Math.round((item.profit / item.revenue) * 100))}%` }}
                    title={`Est. Profit: ₹${Math.round(item.profit)}`}
                  />
                </div>
                <span className="text-[11px] font-medium text-slate-600 text-center truncate max-w-[60px]">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-4 text-[11px] text-slate-500 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-600"></span>
            <span>Total Sales (₹)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-teal-400"></span>
            <span>Gross Profit Share</span>
          </div>
        </div>
      </div>

      {/* Grid: Category Breakdown & Payment Method Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Sales by Category
              </h2>
            </div>
            <span className="text-xs text-slate-400">Revenue Contribution</span>
          </div>

          <div className="space-y-3">
            {data.categoryPerformance.map((cat, idx) => {
              const widthPct = Math.max(5, Math.round((cat.revenue / maxCategoryRev) * 100));
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-800">{cat.category}</span>
                    <span className="text-slate-900 font-bold">
                      ₹{cat.revenue.toLocaleString('en-IN')} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{cat.itemsSold} items sold</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Split & Hourly Traffic */}
        <div className="space-y-6">
          {/* Payment Split */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Payment Channel Adoption
              </h2>
              <span className="text-xs text-slate-400">UPI vs Cash vs Credit</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {data.paymentMethodSplit.map((p, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{p.method}</span>
                    <span className="text-xs font-semibold text-emerald-700">{p.percentage}%</span>
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    ₹{p.totalAmount.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[10px] text-slate-400">{p.count} bills generated</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hourly Traffic */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Peak Rush Hours
                </h2>
              </div>
              <span className="text-xs text-slate-400">Customer Count</span>
            </div>

            <div className="flex items-end justify-between gap-1.5 h-24 pt-2">
              {data.hourlyTraffic.map((hour, idx) => {
                const maxBills = Math.max(...data.hourlyTraffic.map((h) => h.billsCount), 1);
                const heightPct = Math.max(15, Math.round((hour.billsCount / maxBills) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group h-full justify-end">
                    <div
                      className="w-full bg-sky-500 hover:bg-sky-600 rounded-t-sm transition-all"
                      style={{ height: `${heightPct}%` }}
                      title={`${hour.hour}: ${hour.billsCount} bills (₹${hour.revenue})`}
                    />
                    <span className="text-[9px] text-slate-400 truncate max-w-[32px]">{hour.hour.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Product Velocity Breakdown: Top Sellers vs Slow Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fast Turn Velocity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">
                High Velocity Fast-Moving SKUs
              </h2>
            </div>
            <button
              onClick={onNavigateToProducts}
              className="text-xs text-emerald-700 font-semibold hover:underline"
            >
              Catalog →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {data.topSellingProducts.map((p, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-900">{p.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {p.category} • Turns every {p.turnoverDays} days
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">{p.unitsSold} units</p>
                  <p className="text-[11px] text-emerald-700 font-medium">₹{p.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slow Moving Capital Lock */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">
                Slow Moving Items (Capital Lock)
              </h2>
            </div>
            <button
              onClick={onNavigateToRestock}
              className="text-xs text-amber-800 font-semibold hover:underline"
            >
              Manage Stock →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {data.slowMovingProducts.map((p, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-900">{p.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {p.category} • In stock {p.daysInStock} days
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-amber-800">{p.currentStock} units left</p>
                  <p className="text-[11px] text-slate-500">₹{p.stockValue} capital</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
