import React, { useState, useEffect } from 'react';
import { Store, Mic, Plus, Bell, RefreshCw, Sparkles, Radio } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lowStockCount: number;
  onRefresh: () => void;
  isLoading: boolean;
  isRealtimeConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lowStockCount,
  onRefresh,
  isLoading,
  isRealtimeConnected = true
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Store Identity */}
          <div
            onClick={() => setActiveTab('command-center')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">
                  Shop<span className="text-emerald-600">IQ</span>
                </span>
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 rounded-md border border-emerald-200">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Realtime Cloud Sync</span>
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600 hidden md:block">
                Balaji Stores <span className="text-slate-400 font-normal">• ID: 48293 • Chennai, TN</span>
              </p>
            </div>
          </div>

          {/* Right Controls: Live Time, Low Stock Alert, Copilot, Voice POS, New Bill */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Clock */}
            <div className="hidden xl:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-700">{time}</span>
              <span className="text-[10px] text-slate-400">IST (Chennai)</span>
            </div>

            {/* Refresh Data */}
            <button
              id="refresh-btn"
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh store data"
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Low Stock Indicator */}
            {lowStockCount > 0 && (
              <button
                id="low-stock-nav-btn"
                onClick={() => setActiveTab('reorder')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors"
                title={`${lowStockCount} items running low on stock`}
              >
                <Bell className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
                <span className="hidden sm:inline">Stockouts:</span>
                <span className="font-bold">{lowStockCount}</span>
              </button>
            )}

            {/* Quick Copilot Trigger */}
            <button
              id="nav-copilot-btn"
              onClick={() => setActiveTab('copilot')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors shadow-xs ${
                activeTab === 'copilot'
                  ? 'bg-emerald-700 text-white border-emerald-800'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>

            {/* Quick Voice Billing Button */}
            <button
              id="nav-voice-bill-btn"
              onClick={() => setActiveTab('voice-billing')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors shadow-xs"
            >
              <Mic className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Voice POS</span>
            </button>

            {/* Quick New Bill Button */}
            <button
              id="nav-new-bill-btn"
              onClick={() => setActiveTab('billing')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>New Bill</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
