import React, { useState, useEffect } from 'react';
import {
  Percent,
  TrendingUp,
  AlertTriangle,
  Award,
  DollarSign,
  Layers,
  ArrowUpRight,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { ProfitAnalysis } from '../../types/index';
import { api } from '../../services/api';

export const ProfitIntelligenceView: React.FC = () => {
  const [profitData, setProfitData] = useState<ProfitAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfitData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getProfitAnalysis();
      setProfitData(res);
    } catch (err) {
      console.error('Failed to load profit data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfitData();
  }, []);

  if (isLoading || !profitData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Calculating gross margin contribution and discount slippage...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Profit Intelligence Hub
          </h1>
          <span className="px-2 py-0.5 text-xs font-bold text-teal-800 bg-teal-100 rounded-md">
            Unit Economics & Category Margins
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Know which products generate true cash profit vs those that only drive footfall.
        </p>
      </div>

      {/* Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Overall Gross Margin
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {profitData.overallMarginPercent}%
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Healthy Target
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Weighted average across all categories</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Total Revenue
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              ₹{profitData.totalRevenue.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Billed through POS registers</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Total Gross Profit
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-700">
              ₹{profitData.grossProfit.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Revenue minus wholesale purchase cost</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Discount Slippage
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-700">
              ₹{profitData.discountImpact.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-500">given</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Direct impact on bottom line profit</p>
        </div>
      </div>

      {/* Two Column Layout: Highest Margin vs Low Margin Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Highest Margin Gems */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">High Margin Profit Gems</h2>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              &gt; 15% Margin
            </span>
          </div>

          <div className="space-y-3">
            {profitData.highestMarginProducts.map((p) => (
              <div
                key={p.productId}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors"
              >
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">{p.productName}</h3>
                  <span className="text-[11px] text-slate-500">{p.category}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-700">+{p.marginPercent}%</span>
                  <span className="block text-[10px] text-slate-500">₹{p.unitMargin} unit margin</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Margin Risk Products with Negotiation Tips */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">Low Margin Risk Products</h2>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
              &le; 13% Margin
            </span>
          </div>

          <div className="space-y-3">
            {profitData.lowMarginRiskProducts.map((p) => (
              <div
                key={p.productId}
                className="p-3 rounded-xl bg-amber-50/40 border border-amber-200/70 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">{p.productName}</h3>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {p.marginPercent}% margin
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  {p.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Margin Contribution Table & Progress Bars */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Category Profitability Breakdown</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Ranked by Gross Profit Value</span>
        </div>

        <div className="space-y-4 pt-2">
          {profitData.categoryProfits.map((cat) => (
            <div key={cat.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-800">{cat.category}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">Rev: ₹{cat.revenue.toLocaleString('en-IN')}</span>
                  <span className="text-emerald-700 font-bold">Profit: ₹{cat.profit.toLocaleString('en-IN')} ({cat.marginPercent}%)</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(10, cat.marginPercent * 3))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
