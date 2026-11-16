import React, { useState, useEffect, useCallback } from 'react';
import {
  Product,
  Bill,
  CartItem,
  DashboardMetrics
} from './types/index';
import { api } from './services/api';
import { realtimeStore } from './services/realtimeStore';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { CommandCenterView } from './components/intelligence/CommandCenterView';
import { CopilotView } from './components/copilot/CopilotView';
import { SmartReorderView } from './components/intelligence/SmartReorderView';
import { ProfitIntelligenceView } from './components/intelligence/ProfitIntelligenceView';
import { ExpiryWatchView } from './components/intelligence/ExpiryWatchView';
import { DashboardView } from './components/dashboard/DashboardView';
import { BillingView } from './components/billing/BillingView';
import { VoiceBillingView } from './components/voice/VoiceBillingView';
import { ProductsView } from './components/products/ProductsView';
import { InventoryView } from './components/inventory/InventoryView';
import { SalesHistoryView } from './components/sales/SalesHistoryView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AiInsightsView } from './components/ai/AiInsightsView';
import { ReceiptModal } from './components/common/ReceiptModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('command-center');
  const [products, setProducts] = useState<Product[]>(() => realtimeStore.getProducts());
  const [bills, setBills] = useState<Bill[]>(() => realtimeStore.getBills());
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(() => realtimeStore.getDashboardMetrics());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modal & Navigation helpers
  const [selectedReceiptBill, setSelectedReceiptBill] = useState<Bill | null>(null);
  const [prefilledVoiceCart, setPrefilledVoiceCart] = useState<CartItem[]>([]);
  const [isQuickAddProductOpen, setIsQuickAddProductOpen] = useState<boolean>(false);
  const [quickRestockProduct, setQuickRestockProduct] = useState<Product | undefined>(undefined);
  const [copilotInitialQuery, setCopilotInitialQuery] = useState<string>('');

  // Synchronize with Realtime Store Engine
  const syncFromRealtimeStore = useCallback(() => {
    setProducts(realtimeStore.getProducts());
    setBills(realtimeStore.getBills());
    setMetrics(realtimeStore.getDashboardMetrics());
  }, []);

  // Fetch all primary store data from backend API as well
  const loadStoreData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productsData, billsData, metricsData] = await Promise.all([
        api.getProducts(),
        api.getSales(),
        api.getDashboardMetrics()
      ]);
      if (productsData && productsData.length > 0) setProducts(productsData);
      if (billsData && billsData.length > 0) setBills(billsData);
      if (metricsData) setMetrics(metricsData);
    } catch (error) {
      console.warn('API sync check fallback to realtime store:', error);
      syncFromRealtimeStore();
    } finally {
      setIsLoading(false);
    }
  }, [syncFromRealtimeStore]);

  useEffect(() => {
    // 1. Initial load
    loadStoreData();

    // 2. Real-time subscription to Firestore & local store changes
    const unsubscribe = realtimeStore.subscribe(() => {
      syncFromRealtimeStore();
    });

    return () => unsubscribe();
  }, [loadStoreData, syncFromRealtimeStore]);

  // Handlers
  const handleBillCreated = async (newBill: Bill) => {
    setSelectedReceiptBill(newBill);
    await realtimeStore.createSale({
      items: newBill.items as any,
      subtotal: newBill.subtotal,
      discount: newBill.discount,
      tax: newBill.tax,
      total: newBill.total,
      profit: newBill.profit,
      paymentMethod: newBill.paymentMethod,
      customerName: newBill.customerName,
      customerPhone: newBill.customerPhone,
      notes: newBill.notes,
      status: (newBill.status || 'PAID') as any
    });
    syncFromRealtimeStore();
  };

  const handleOpenVoiceWithCart = (cartItems: CartItem[]) => {
    setPrefilledVoiceCart(cartItems);
    setActiveTab('billing');
  };

  const handleQuickAddProduct = () => {
    setIsQuickAddProductOpen(true);
    setActiveTab('products');
  };

  const handleQuickRestock = (product?: Product) => {
    setQuickRestockProduct(product);
    setActiveTab('inventory');
  };

  const handleOpenCopilotWithQuery = (query: string) => {
    setCopilotInitialQuery(query);
    setActiveTab('copilot');
  };

  const lowStockCount = products.filter(
    (p) => p.currentStock <= (p.minimumStock ?? p.minStockLevel ?? 5)
  ).length;

  return (
    <div className="flex flex-col min-h-screen w-full font-sans bg-[#F9FAFB] text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lowStockCount={lowStockCount}
        onRefresh={loadStoreData}
        isLoading={isLoading}
      />

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lowStockCount={lowStockCount}
        />

        {/* Tab View Container */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-full">
          {/* 1. ShopIQ Command Center (Home Screen) */}
          {activeTab === 'command-center' && (
            <CommandCenterView
              metrics={metrics}
              products={products}
              onNavigate={setActiveTab}
              onQuickRestock={handleQuickRestock}
              onOpenCopilotWithQuery={handleOpenCopilotWithQuery}
            />
          )}

          {/* 2. Conversational AI Retail Copilot */}
          {activeTab === 'copilot' && (
            <CopilotView
              initialQuery={copilotInitialQuery}
              onNavigate={setActiveTab}
            />
          )}

          {/* 3. Predictive Inventory & Smart Reorder Assistant */}
          {activeTab === 'reorder' && (
            <SmartReorderView
              products={products}
              onRestockSuccess={loadStoreData}
              onNavigateToBilling={() => setActiveTab('billing')}
            />
          )}

          {/* 4. Profit Intelligence Hub */}
          {activeTab === 'profit-intel' && <ProfitIntelligenceView />}

          {/* 5. Expiry Watch & Shelf-life Guardian */}
          {activeTab === 'expiry-watch' && (
            <ExpiryWatchView onNavigateToBilling={() => setActiveTab('billing')} />
          )}

          {/* 6. High-Speed Billing / POS */}
          {activeTab === 'billing' && (
            <BillingView
              products={products}
              initialCartItems={prefilledVoiceCart}
              onBillCreated={handleBillCreated}
              onOpenVoicePOS={() => setActiveTab('voice-billing')}
            />
          )}

          {/* 7. Voice Billing & Voice Commander */}
          {activeTab === 'voice-billing' && (
            <VoiceBillingView
              products={products}
              onOpenBillingWithCart={handleOpenVoiceWithCart}
            />
          )}

          {/* 8. Products Catalog */}
          {activeTab === 'products' && (
            <ProductsView
              products={products}
              onProductsUpdated={loadStoreData}
              isAddModalOpenInitially={isQuickAddProductOpen}
              onCloseAddModalInitially={() => setIsQuickAddProductOpen(false)}
            />
          )}

          {/* 9. Inventory Stock */}
          {activeTab === 'inventory' && (
            <InventoryView
              products={products}
              onInventoryUpdated={loadStoreData}
              preSelectedRestockProduct={quickRestockProduct}
            />
          )}

          {/* 10. Sales History */}
          {activeTab === 'sales' && (
            <SalesHistoryView
              bills={bills}
              onOpenReceipt={(bill) => setSelectedReceiptBill(bill)}
              onNavigateToBilling={() => setActiveTab('billing')}
            />
          )}

          {/* 11. Store Analytics */}
          {activeTab === 'analytics' && (
            <AnalyticsView
              onNavigateToProducts={() => setActiveTab('products')}
              onNavigateToRestock={() => setActiveTab('inventory')}
            />
          )}

          {/* 12. Legacy AI Insights */}
          {activeTab === 'ai-insights' && (
            <AiInsightsView
              products={products}
              onNavigateToRestock={handleQuickRestock}
            />
          )}

          {/* 13. Dashboard alias / Command Center */}
          {activeTab === 'dashboard' && (
            <CommandCenterView
              metrics={metrics}
              products={products}
              onNavigate={setActiveTab}
              onQuickRestock={handleQuickRestock}
              onOpenCopilotWithQuery={handleOpenCopilotWithQuery}
            />
          )}
        </main>
      </div>

      {/* Global Thermal Receipt Modal */}
      {selectedReceiptBill && (
        <ReceiptModal
          bill={selectedReceiptBill}
          onClose={() => setSelectedReceiptBill(null)}
        />
      )}
    </div>
  );
}
