import React, { useState, useEffect } from 'react';
import {
  Clock,
  AlertTriangle,
  ShieldCheck,
  Tag,
  ArrowRight,
  RefreshCw,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { ExpiryRiskReport, ExpiryItem } from '../../types/index';
import { api } from '../../services/api';

interface ExpiryWatchViewProps {
  onNavigateToBilling: () => void;
}

export const ExpiryWatchView: React.FC<ExpiryWatchViewProps> = ({ onNavigateToBilling }) => {
  const [report, setReport] = useState<ExpiryRiskReport | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'SAFE'>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchExpiryData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getExpiryRiskReport();
      setReport(res);
    } catch (err) {
      console.error('Failed to load expiry report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiryData();
  }, []);

  if (isLoading || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Auditing product batches & shelf life remaining...</p>
      </div>
    );
  }

  const filteredItems = report.items.filter((item) => {
    if (activeFilter === 'ALL') return true;
    return item.status === activeFilter;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Expiry Watch & Shelf-Life Guardian
            </h1>
            <span className="px-2 py-0.5 text-xs font-bold text-rose-800 bg-rose-100 rounded-md">
              Zero Dead-Stock Intelligence
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Proactive alerts on dairy, bakery, and FMCG batches before expiry occurs.
          </p>
        </div>

        {/* Capital At Risk Badge */}
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <Clock className="w-5 h-5 text-rose-600" />
          <div>
            <span className="text-[11px] font-bold text-rose-800 uppercase block tracking-wider">
              Capital at Risk
            </span>
            <span className="text-base font-bold text-rose-900">
              ₹{report.totalValueAtRisk.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Promotional Advice Cards */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-700" />
          <h2 className="text-sm font-bold text-emerald-900">
            Clearance & Spoilage Avoidance Strategies
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {report.promotionalAdvice.map((advice, idx) => (
            <div key={idx} className="bg-white p-3.5 rounded-xl border border-emerald-100 text-xs text-slate-700 leading-relaxed font-medium">
              {advice}
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'ALL', label: `All Batches (${report.items.length})` },
          { id: 'CRITICAL', label: `Critical ≤2 Days (${report.criticalItemsCount})` },
          { id: 'WARNING', label: `Warning 3–7 Days (${report.warningItemsCount})` },
          { id: 'SAFE', label: `Safe Shelf-life (>7 Days)` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeFilter === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Expiry Items Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Product & Batch</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Stock Qty</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Capital at Risk</th>
                <th className="py-3 px-4">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const isCritical = item.status === 'CRITICAL' || item.status === 'EXPIRED';
                const isWarning = item.status === 'WARNING';

                return (
                  <tr
                    key={item.productId}
                    className={`hover:bg-slate-50 transition-colors ${
                      isCritical ? 'bg-rose-50/40' : isWarning ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : isWarning
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        {item.productName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Batch: {item.batchNumber} • Supplier: {item.supplier}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.quantity} units
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={isCritical ? 'text-rose-700 font-bold' : 'text-slate-700'}>
                        {new Date(item.expiryDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        ({item.daysToExpiry} day{item.daysToExpiry === 1 ? '' : 's'} remaining)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{item.valueAtRisk.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700 max-w-xs leading-relaxed">
                      {item.recommendedAction}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
