import React from 'react';
import {
  Compass,
  Receipt,
  Mic,
  Bot,
  Truck,
  TrendingUp,
  Clock,
  Package,
  Boxes,
  History,
  BarChart3,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lowStockCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  lowStockCount
}) => {
  const primaryOperations = [
    { id: 'command-center', label: 'Command Center', icon: Compass, badge: 'Intelligence' },
    { id: 'billing', label: 'New Bill (POS)', icon: Receipt, highlight: true },
    { id: 'voice-billing', label: 'Voice Billing', icon: Mic, badge: 'Multilingual' },
    { id: 'copilot', label: 'ShopIQ Copilot', icon: Bot, badge: 'AI Advisor' }
  ];

  const intelligenceModules = [
    { id: 'reorder', label: 'Smart Reorder PO', icon: Truck, count: lowStockCount > 0 ? lowStockCount : undefined },
    { id: 'profit-intel', label: 'Profit Intelligence', icon: TrendingUp },
    { id: 'expiry-watch', label: 'Expiry Watch', icon: Clock, badge: 'Zero Waste' }
  ];

  const catalogAndHistory = [
    { id: 'inventory', label: 'Inventory Stock', icon: Boxes },
    { id: 'products', label: 'Product Catalog', icon: Package },
    { id: 'sales', label: 'Sales History', icon: History },
    { id: 'analytics', label: 'Store Analytics', icon: BarChart3 }
  ];

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 space-y-6">
        {/* Core Operations */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Store Operations
          </p>
          <nav className="space-y-1 mt-2">
            {primaryOperations.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 rounded">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Intelligence Engines */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Retail Intelligence
          </p>
          <nav className="space-y-1 mt-2">
            {intelligenceModules.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-100 rounded-full">
                      {item.count}
                    </span>
                  ) : item.badge ? (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold text-teal-800 bg-teal-100 rounded">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Catalog & History */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Inventory & Khata
          </p>
          <nav className="space-y-1 mt-2">
            {catalogAndHistory.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Store Identifier Card */}
        <div className="mt-auto space-y-2">
          <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Balaji Stores</span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                Live
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              ID: 48293 • Chennai, TN
            </p>
          </div>

          {/* Smart Tip Card */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Voice POS Ready</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Ask: <strong className="text-slate-700">&quot;How much sales today?&quot;</strong> or speak items to bill.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {[
          { id: 'command-center', label: 'Home', icon: Compass },
          { id: 'billing', label: 'Bill', icon: Receipt },
          { id: 'voice-billing', label: 'Voice', icon: Mic },
          { id: 'copilot', label: 'Copilot', icon: Bot },
          { id: 'reorder', label: 'Reorder', icon: Truck, count: lowStockCount }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 min-w-[44px] min-h-[44px] rounded-lg relative transition-colors ${
                isActive ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
