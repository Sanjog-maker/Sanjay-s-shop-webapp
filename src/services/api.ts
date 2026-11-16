import {
  Product,
  Sale,
  DashboardMetrics,
  AnalyticsData,
  RestockEntry,
  StockAdjustmentEntry,
  StockMovement,
  VoiceParseResponse,
  VoiceIntentResult,
  StockoutPrediction,
  ProfitAnalysis,
  ExpiryRiskReport,
  ReorderRecommendation,
  SupplierPurchaseList,
  SalesAnomaly,
  CommandCenterData,
  AIInsightReport
} from '../types/index';
import { realtimeStore } from './realtimeStore';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });

  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.error || `HTTP ${res.status}: Failed to fetch ${url}`);
  }
  return json.data !== undefined ? json.data : json;
}

export const api = {
  // --- Products ---
  async getProducts(): Promise<Product[]> {
    try {
      const data = await fetchJson<Product[]>(`${API_BASE}/products`);
      return data;
    } catch {
      return realtimeStore.getProducts();
    }
  },

  async addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const created = await realtimeStore.addProduct(product);
    return created;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const updated = await realtimeStore.updateProduct(id, updates);
    if (!updated) throw new Error('Product not found');
    return updated;
  },

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    await realtimeStore.deleteProduct(id);
    return { success: true };
  },

  // --- Inventory ---
  async getInventorySummary(): Promise<{
    products: Product[];
    lowStock: Product[];
    totalUnits: number;
    costValue: number;
    retailValue: number;
    potentialProfit: number;
  }> {
    try {
      return await fetchJson(`${API_BASE}/inventory`);
    } catch {
      const prods = realtimeStore.getProducts();
      const metrics = realtimeStore.getDashboardMetrics();
      return {
        products: prods,
        lowStock: prods.filter((p) => p.currentStock <= p.minimumStock),
        totalUnits: prods.reduce((acc, p) => acc + p.currentStock, 0),
        costValue: metrics.totalInventoryCostValue,
        retailValue: metrics.totalInventoryRetailValue,
        potentialProfit: metrics.totalInventoryRetailValue - metrics.totalInventoryCostValue
      };
    }
  },

  async restockProduct(entry: RestockEntry): Promise<{ product: Product; movement: StockMovement }> {
    const updated = await realtimeStore.restockProduct(entry);
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      productId: entry.productId,
      productName: updated?.name || '',
      type: 'RESTOCK',
      quantityChange: entry.quantity,
      remainingStock: updated?.currentStock || entry.quantity,
      reason: `Restocked from ${entry.supplier || updated?.supplier || 'Supplier'}`,
      createdAt: new Date().toISOString()
    };
    return { product: updated!, movement };
  },

  async adjustStock(entry: StockAdjustmentEntry): Promise<{ product: Product; movement: StockMovement }> {
    const updated = await realtimeStore.adjustStock(entry);
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      productId: entry.productId,
      productName: updated?.name || '',
      type: 'ADJUSTMENT',
      quantityChange: entry.quantity,
      remainingStock: updated?.currentStock || 0,
      reason: entry.reason,
      createdAt: new Date().toISOString()
    };
    return { product: updated!, movement };
  },

  async getStockHistory(): Promise<StockMovement[]> {
    try {
      return await fetchJson<StockMovement[]>(`${API_BASE}/inventory/history`);
    } catch {
      return [];
    }
  },

  // --- Sales / Billing ---
  async getSales(): Promise<Sale[]> {
    try {
      const data = await fetchJson<Sale[]>(`${API_BASE}/sales`);
      return data;
    } catch {
      return realtimeStore.getBills();
    }
  },

  async createSale(bill: {
    items: { productId: string; quantity: number; unitPrice: number; discount?: number }[];
    subtotal?: number;
    discount?: number;
    paymentMethod: string;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
  }): Promise<Sale> {
    const sub = bill.subtotal || bill.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    const disc = bill.discount || 0;
    const tot = sub - disc;
    const sale = await realtimeStore.createSale({
      items: bill.items as any,
      subtotal: sub,
      discount: disc,
      total: tot,
      paymentMethod: bill.paymentMethod as any,
      customerName: bill.customerName,
      customerPhone: bill.customerPhone,
      notes: bill.notes,
      status: 'PAID'
    });
    return sale;
  },

  // --- Dashboard & Analytics ---
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return fetchJson<DashboardMetrics>(`${API_BASE}/dashboard/metrics`);
  },

  async getAnalytics(): Promise<AnalyticsData> {
    return fetchJson<AnalyticsData>(`${API_BASE}/analytics`);
  },

  // --- Retail Intelligence Platform ---
  async getCommandCenter(): Promise<CommandCenterData> {
    return fetchJson<CommandCenterData>(`${API_BASE}/intelligence/command-center`);
  },

  async getStockoutPredictions(): Promise<StockoutPrediction[]> {
    return fetchJson<StockoutPrediction[]>(`${API_BASE}/intelligence/stockouts`);
  },

  async getProfitAnalysis(): Promise<ProfitAnalysis> {
    return fetchJson<ProfitAnalysis>(`${API_BASE}/intelligence/profit`);
  },

  async getExpiryRiskReport(): Promise<ExpiryRiskReport> {
    return fetchJson<ExpiryRiskReport>(`${API_BASE}/intelligence/expiry`);
  },

  async getSmartReorder(): Promise<{ recommendations: ReorderRecommendation[]; supplierGroups: SupplierPurchaseList[] }> {
    return fetchJson(`${API_BASE}/intelligence/reorder`);
  },

  async getSalesAnomalies(): Promise<SalesAnomaly[]> {
    return fetchJson<SalesAnomaly[]>(`${API_BASE}/intelligence/anomalies`);
  },

  // --- AI Voice & Copilot ---
  async parseVoiceBilling(transcript: string, language = 'en-IN'): Promise<VoiceParseResponse> {
    return fetchJson<VoiceParseResponse>(`${API_BASE}/ai/voice-parse`, {
      method: 'POST',
      body: JSON.stringify({ transcript, language })
    });
  },

  async parseVoiceBill(transcript: string, language = 'en-IN'): Promise<VoiceParseResponse> {
    return this.parseVoiceBilling(transcript, language);
  },

  async parseVoiceIntent(transcript: string): Promise<VoiceIntentResult> {
    return fetchJson<VoiceIntentResult>(`${API_BASE}/ai/voice-intent`, {
      method: 'POST',
      body: JSON.stringify({ transcript })
    });
  },

  async askCopilot(question: string): Promise<{
    answer: string;
    supportingData?: {
      salesNumbers?: string;
      stockLevel?: string | number;
      timePeriod?: string;
      confidence?: number;
      productsInvolved?: string[];
      metricsBreakdown?: { label: string; value: string }[];
    };
    suggestedFollowUps?: string[];
  }> {
    return fetchJson(`${API_BASE}/ai/ask`, {
      method: 'POST',
      body: JSON.stringify({ question })
    });
  },

  async askAI(question: string): Promise<{ answer: string; supportingData?: any; suggestedFollowUps?: string[] }> {
    return this.askCopilot(question);
  },

  async getAIStoreInsights(): Promise<AIInsightReport> {
    return fetchJson<AIInsightReport>(`${API_BASE}/ai/insights`, {
      method: 'POST'
    });
  },

  async getAIInsights(): Promise<AIInsightReport> {
    return this.getAIStoreInsights();
  }
};
