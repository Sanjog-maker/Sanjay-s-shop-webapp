export type ProductCategory =
  | 'Atta & Flours'
  | 'Dal & Pulses'
  | 'Oils & Ghee'
  | 'Rice & Grains'
  | 'Dairy'
  | 'Snacks & Biscuits'
  | 'Spices & Masala'
  | 'Personal Care'
  | 'Household & Cleaning'
  | 'Beverages'
  | 'Sugar & Salt';

export type UnitType = 'kg' | 'g' | 'L' | 'ml' | 'packet' | 'piece' | 'pouch' | 'bottle' | 'box';

export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'KHATA';

export type StockMovementType = 'SALE' | 'RESTOCK' | 'DAMAGE' | 'ADJUSTMENT' | 'RETURN';

export type ExpiryStatus = 'CRITICAL' | 'WARNING' | 'SAFE' | 'EXPIRED';

export type StockAlertSeverity = 'CRITICAL' | 'WARNING' | 'HEALTHY';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  sku: string;
  unit: UnitType;
  mrp: number;
  sellingPrice: number;
  purchasePrice: number; // Cost price
  currentStock: number;
  minimumStock: number; // Low stock threshold
  minStockLevel?: number; // Alias for backward compatibility
  supplier: string;
  regionalName?: string; // Tamil / Hindi transliteration
  image?: string;
  barcode?: string;
  isLoose?: boolean;
  expiryDate?: string; // ISO date string (YYYY-MM-DD)
  batchNumber?: string;
  leadTimeDays?: number; // Days to restock from supplier
  safetyStock?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  productName?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal?: number;
  total: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product?: Product;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax?: number;
  total: number;
  profit?: number;
  paymentMethod: PaymentMethod;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  status: 'PAID' | 'CREDIT';
  createdAt: string;
  date?: string; // Alias
}

export type Bill = Sale;

export interface InventoryMovement {
  id: string;
  productId: string;
  productName?: string;
  type: StockMovementType | 'IN' | 'OUT' | 'ADJUSTMENT' | 'SALE' | 'RESTOCK' | 'DAMAGE';
  quantity?: number;
  quantityChange?: number;
  remainingStock?: number;
  reason?: string;
  referenceId?: string;
  createdAt?: string;
  date?: string;
}

export type StockMovement = InventoryMovement;

export interface StockAlert {
  product: Product;
  currentStock: number;
  minimumStock: number;
  severity: StockAlertSeverity;
  statusText: string;
  explanation: string;
}

export interface RestockEntry {
  productId: string;
  quantity: number;
  purchasePrice: number;
  supplier: string;
  invoiceNumber?: string;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}

export interface StockAdjustmentEntry {
  productId: string;
  adjustmentType: 'SET_STOCK' | 'ADD_STOCK' | 'REMOVE_STOCK';
  quantity: number;
  reason: 'DAMAGE' | 'EXPIRED' | 'RECOUNT' | 'THEFT' | 'INTERNAL_USE' | 'OTHER';
  notes?: string;
}

// ----------------------------------------------------------------------
// RETAIL INTELLIGENCE & DATA SCIENCE MODELS
// ----------------------------------------------------------------------

export interface StockoutPrediction {
  productId: string;
  productName: string;
  brand: string;
  category: ProductCategory;
  unit: UnitType;
  currentStock: number;
  averageDailySales: number;
  recentSalesVelocity: number; // e.g. 1.25x average
  daysRemaining: number;
  predictedStockoutDate: string;
  recommendedReorderQty: number;
  confidenceScore: number; // e.g. 87%
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: {
    what: string;
    why: string;
    action: string;
  };
}

export interface ProfitAnalysis {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  overallMarginPercent: number;
  discountImpact: number;
  topProfitProducts: {
    productId: string;
    productName: string;
    brand: string;
    category: ProductCategory;
    unitsSold: number;
    sellingPrice: number;
    purchasePrice: number;
    unitMargin: number;
    totalProfit: number;
    marginPercent: number;
  }[];
  highestMarginProducts: {
    productId: string;
    productName: string;
    category: ProductCategory;
    marginPercent: number;
    unitMargin: number;
    currentStock: number;
  }[];
  lowMarginRiskProducts: {
    productId: string;
    productName: string;
    category: ProductCategory;
    marginPercent: number;
    unitsSold: number;
    recommendation: string;
  }[];
  highVolumeLowMargin: {
    productId: string;
    productName: string;
    unitsSold: number;
    marginPercent: number;
    revenue: number;
  }[];
  categoryProfits: {
    category: ProductCategory;
    revenue: number;
    cost: number;
    profit: number;
    marginPercent: number;
    contributionPercent: number;
  }[];
}

export interface ExpiryItem {
  productId: string;
  productName: string;
  brand: string;
  category: ProductCategory;
  batchNumber: string;
  expiryDate: string;
  daysToExpiry: number;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  valueAtRisk: number; // quantity * purchasePrice
  status: ExpiryStatus; // CRITICAL (0-2d), WARNING (3-7d), SAFE (>7d)
  supplier: string;
  salesVelocity: number; // units/day
  recommendedAction: string;
}

export interface ExpiryRiskReport {
  criticalItemsCount: number;
  warningItemsCount: number;
  totalValueAtRisk: number;
  items: ExpiryItem[];
  promotionalAdvice: string[];
}

export interface ReorderRecommendation {
  productId: string;
  productName: string;
  brand: string;
  category: ProductCategory;
  supplier: string;
  currentStock: number;
  unit: UnitType;
  averageDailyDemand: number;
  leadTimeDays: number;
  safetyStock: number;
  recommendedOrderQty: number;
  purchasePrice: number;
  estimatedOrderCost: number;
  reason: string;
  priority: 'URGENT' | 'RECOMMENDED' | 'NORMAL';
  selected?: boolean;
}

export interface SupplierPurchaseList {
  supplier: string;
  items: ReorderRecommendation[];
  totalItemCount: number;
  totalUnits: number;
  totalEstimatedCost: number;
}

export interface SalesAnomaly {
  id: string;
  type: 'SPIKE' | 'DROP' | 'UNUSUAL_BEHAVIOR' | 'CATEGORY_SHIFT';
  productOrCategory: string;
  currentSales: number;
  expectedSales: number;
  percentageDifference: number; // e.g. +42% or -35%
  timeFrame: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  detectedPattern: string;
  possibleExplanation: string;
  suggestedAction: string;
}

export type ActionPriority = 'HIGH' | 'ATTENTION' | 'OPPORTUNITY';

export interface TodayActionItem {
  id: string;
  priority: ActionPriority; // 🔴 HIGH, 🟡 ATTENTION, 🟢 OPPORTUNITY
  urgency?: 'HIGH' | 'MEDIUM' | 'NORMAL'; // backward compatibility
  title: string;
  why: string; // The explainable reasoning based on real sales/inventory numbers
  category?: 'REORDER' | 'EXPIRY' | 'MARGIN' | 'CASH_UPI' | 'STOCK_AUDIT' | 'SALES_VELOCITY' | 'COMBO' | 'DEAD_STOCK' | 'OVERSTOCK';
  description?: string;
  impact?: string;
  actionText: string;
  targetTab?: string;
  productId?: string;
  productName?: string;
  completed?: boolean;
  meta?: {
    currentStock?: number;
    minimumStock?: number;
    avgDailySales?: number;
    daysRemaining?: number;
    expiryDate?: string;
    velocityScore?: number;
    potentialProfit?: number;
  };
}

export interface TodayActionPlan {
  totalTasks: number;
  completedTasks: number;
  highPriority: TodayActionItem[];
  attention: TodayActionItem[];
  opportunity: TodayActionItem[];
  items: TodayActionItem[];
}

export interface CommandCenterData {
  greeting: string;
  summaryHeadline: string;
  todayActionPlan?: TodayActionPlan;
  actionRequired: {
    stockoutSoonCount: number;
    approachingExpiryCount: number;
    unusualPatternsCount: number;
    revenueAtRisk: number;
    criticalAlerts: {
      id: string;
      title: string;
      description: string;
      urgency: 'HIGH' | 'MEDIUM';
      category: 'INVENTORY' | 'EXPIRY' | 'SALES' | 'MARGIN';
    }[];
  };
  aiRecommendations: {
    id: string;
    title: string;
    productName: string;
    currentStock: number;
    avgDailySales: number;
    predictedStockout: string;
    recommendedReorder: number;
    confidence: number;
    what: string;
    why: string;
    action: string;
  }[];
  profitOpportunities: {
    id: string;
    title: string;
    productName: string;
    highlight: string;
    potentialGain: string;
    explanation: string;
  }[];
  businessAlerts: {
    id: string;
    type: 'SPIKE' | 'DROP' | 'LOW_MARGIN' | 'OVERSTOCK' | 'INCONSISTENCY';
    title: string;
    message: string;
    impact: string;
    explanation: string;
  }[];
}

// ----------------------------------------------------------------------
// COPILOT & VOICE INTENT MODELS
// ----------------------------------------------------------------------

export interface CopilotSupportingData {
  salesNumbers?: string;
  stockLevel?: number | string;
  timePeriod?: string;
  confidence?: number;
  productsInvolved?: string[];
  metricsBreakdown?: { label: string; value: string }[];
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  supportingData?: CopilotSupportingData;
  suggestedFollowUps?: string[];
}

export type VoiceIntentType =
  | 'CREATE_BILL'
  | 'CHECK_SALES'
  | 'CHECK_INVENTORY'
  | 'ADD_STOCK'
  | 'CHECK_LOW_STOCK'
  | 'CHECK_PROFIT'
  | 'CHECK_TOP_PRODUCTS'
  | 'CHECK_SLOW_PRODUCTS'
  | 'CHECK_ANALYTICS'
  | 'GET_LAST_BILL'
  | 'UNKNOWN';

export interface ParsedVoiceItem {
  rawText: string;
  matchedProductId?: string;
  matchedProduct?: Product;
  productName: string;
  quantity: number;
  unit?: string;
  confidence: number;
  isCustomItem?: boolean;
}

export interface VoiceIntentResult {
  intent: VoiceIntentType;
  transcript: string;
  language: string;
  confidence: number;
  entities: {
    products?: ParsedVoiceItem[];
    quantity?: number;
    targetProduct?: Product;
    timeframe?: string;
    category?: string;
  };
  spokenFeedback: string;
  actionResult?: {
    type: 'NAVIGATE' | 'BILL_ITEMS' | 'METRICS_DISPLAY' | 'STOCK_ADDED' | 'RECEIPT_DISPLAY';
    targetTab?: string;
    data?: any;
  };
}

export interface VoiceParseResponse {
  success: boolean;
  transcript: string;
  language: string;
  parsedItems: ParsedVoiceItem[];
  unrecognizedPhrases: string[];
  suggestedAction?: string;
  rawAIResponse?: string;
}

// ----------------------------------------------------------------------
// STANDARD DASHBOARD & ANALYTICS
// ----------------------------------------------------------------------

export interface DashboardMetrics {
  todayRevenue: number;
  todayBillsCount: number;
  todayProfit: number;
  totalProductsCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalInventoryCostValue: number;
  totalInventoryRetailValue: number;
  topSellingProducts: {
    productId: string;
    productName: string;
    brand: string;
    quantitySold: number;
    revenue: number;
  }[];
  recentSales: Sale[];
  lowStockProducts: Product[];
  salesTrend: {
    date: string;
    revenue: number;
    billsCount: number;
  }[];
}

export interface AnalyticsData {
  totalRevenue: number;
  grossProfit: number;
  profitMarginPercent: number;
  averageBillValue: number;
  totalTransactions: number;
  totalUnitsSold: number;
  dailyRevenue: {
    date: string;
    label: string;
    revenue: number;
    profit: number;
    bills: number;
  }[];
  weeklyRevenue: {
    week: string;
    revenue: number;
    bills: number;
  }[];
  monthlyRevenue: {
    month: string;
    revenue: number;
    bills: number;
  }[];
  categoryPerformance: {
    category: ProductCategory;
    revenue: number;
    itemsSold: number;
    percentage: number;
  }[];
  topSellingProducts: {
    productId: string;
    name: string;
    category: ProductCategory;
    unitsSold: number;
    revenue: number;
    turnoverDays: number;
  }[];
  slowMovingProducts: {
    productId: string;
    name: string;
    category: ProductCategory;
    currentStock: number;
    stockValue: number;
    daysInStock: number;
  }[];
  paymentMethodSplit: {
    method: PaymentMethod;
    count: number;
    totalAmount: number;
    percentage: number;
  }[];
  hourlyTraffic: {
    hour: string;
    billsCount: number;
    revenue: number;
  }[];
}

export interface AIInsightReport {
  generatedAt: string;
  summary: string;
  topSellersInsight: {
    title: string;
    description: string;
    items: string[];
  };
  slowMovingRisk: {
    title: string;
    description: string;
    actionableAdvice: string;
    items: string[];
  };
  stockoutPredictions: {
    title: string;
    items: {
      productName: string;
      currentStock: number;
      estimatedDaysLeft: number;
      suggestedReorderQty: number;
      urgency: 'HIGH' | 'MEDIUM' | 'LOW';
    }[];
  };
  trendObservations: string[];
  businessRecommendations: string[];
}
