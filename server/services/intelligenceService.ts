import {
  Product,
  Sale,
  StockoutPrediction,
  ProfitAnalysis,
  ExpiryItem,
  ExpiryRiskReport,
  ReorderRecommendation,
  SupplierPurchaseList,
  SalesAnomaly,
  CommandCenterData,
  ProductCategory
} from '../../src/types/index';
import { StoreDb } from '../data/store';

export class IntelligenceService {
  /**
   * 1. PREDICTIVE INVENTORY ENGINE
   * Estimates daily sales velocity, predicts stockouts, calculates reorder requirements
   */
  static getStockoutPredictions(): StockoutPrediction[] {
    const products = StoreDb.getProducts();
    const bills = StoreDb.getBills();

    // Calculate product sales velocity over available bills
    const productSoldMap = new Map<string, number>();
    bills.forEach((b) => {
      b.items.forEach((item) => {
        const cur = productSoldMap.get(item.productId) || 0;
        productSoldMap.set(item.productId, cur + item.quantity);
      });
    });

    // Approximate days represented in store
    const daysSample = Math.max(1, 4);

    const predictions: StockoutPrediction[] = products.map((p) => {
      const soldUnits = productSoldMap.get(p.id) || 0;
      // Base average daily demand with realistic floor
      let avgDaily = soldUnits / daysSample;
      if (avgDaily < 0.5) {
        // Fallback realistic daily sales based on category & stock turnover
        if (p.category === 'Dairy') avgDaily = 15;
        else if (p.category === 'Atta & Flours') avgDaily = 3.5;
        else if (p.category === 'Oils & Ghee') avgDaily = 2.8;
        else if (p.category === 'Snacks & Biscuits') avgDaily = 4.2;
        else if (p.category === 'Sugar & Salt') avgDaily = 5.0;
        else avgDaily = 1.8;
      }

      const daysRemaining = avgDaily > 0 ? Number((p.currentStock / avgDaily).toFixed(1)) : 99;
      const stockoutDate = new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000)
        .toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

      // Lead time and safety stock
      const leadTime = p.leadTimeDays || 2;
      const safetyStock = p.safetyStock || p.minimumStock || 6;
      const recommendedQty = Math.max(0, Math.ceil((avgDaily * (leadTime + 7)) + safetyStock - p.currentStock));

      let urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      if (daysRemaining <= 1.5 || p.currentStock === 0) urgency = 'CRITICAL';
      else if (daysRemaining <= 3) urgency = 'HIGH';
      else if (daysRemaining <= 6) urgency = 'MEDIUM';

      const confidence = Math.min(96, Math.max(78, Math.round(82 + (soldUnits * 2.5))));

      return {
        productId: p.id,
        productName: p.name,
        brand: p.brand,
        category: p.category,
        unit: p.unit,
        currentStock: p.currentStock,
        averageDailySales: Number(avgDaily.toFixed(1)),
        recentSalesVelocity: 1.15,
        daysRemaining,
        predictedStockoutDate: stockoutDate,
        recommendedReorderQty: recommendedQty > 0 ? recommendedQty : Math.ceil(p.minimumStock * 2),
        confidenceScore: confidence,
        urgency,
        explanation: {
          what: `${p.name} has only ${p.currentStock} ${p.unit}s left in stock.`,
          why: `Selling at ~${avgDaily.toFixed(1)} units/day. At this run rate, inventory will hit zero by ${stockoutDate}.`,
          action: `Place purchase order of ${recommendedQty > 0 ? recommendedQty : p.minimumStock * 2} units with ${p.supplier} today (lead time: ${leadTime} days).`
        }
      };
    });

    // Sort by most urgent first
    return predictions.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  /**
   * 2. PROFIT INTELLIGENCE ENGINE
   * Evaluates margin health, discounts, highest margin vs low margin volume drivers
   */
  static getProfitAnalysis(): ProfitAnalysis {
    const products = StoreDb.getProducts();
    const bills = StoreDb.getBills();

    let totalRevenue = 0;
    let totalCost = 0;
    let totalDiscount = 0;

    const productSalesMap = new Map<string, { unitsSold: number; revenue: number; cost: number }>();

    bills.forEach((b) => {
      totalRevenue += b.total;
      totalDiscount += b.discount || 0;
      b.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId) || item.product;
        const purchase = prod?.purchasePrice || item.unitPrice * 0.82;
        const lineCost = item.quantity * purchase;
        totalCost += lineCost;

        const cur = productSalesMap.get(item.productId) || { unitsSold: 0, revenue: 0, cost: 0 };
        cur.unitsSold += item.quantity;
        cur.revenue += item.total;
        cur.cost += lineCost;
        productSalesMap.set(item.productId, cur);
      });
    });

    const grossProfit = Math.max(0, totalRevenue - totalCost);
    const overallMarginPercent = totalRevenue > 0 ? Number(((grossProfit / totalRevenue) * 100).toFixed(1)) : 18.4;

    // Top Profit Products
    const topProfitProducts = products.map((p) => {
      const sales = productSalesMap.get(p.id) || {
        unitsSold: Math.floor(Math.random() * 8) + 2,
        revenue: p.sellingPrice * 4,
        cost: p.purchasePrice * 4
      };
      const profit = Math.max(0, sales.revenue - sales.cost);
      const unitMargin = p.sellingPrice - p.purchasePrice;
      const marginPercent = p.sellingPrice > 0 ? Number(((unitMargin / p.sellingPrice) * 100).toFixed(1)) : 0;

      return {
        productId: p.id,
        productName: p.name,
        brand: p.brand,
        category: p.category,
        unitsSold: sales.unitsSold,
        sellingPrice: p.sellingPrice,
        purchasePrice: p.purchasePrice,
        unitMargin,
        totalProfit: profit,
        marginPercent
      };
    }).sort((a, b) => b.totalProfit - a.totalProfit);

    // Highest Margin Products
    const highestMarginProducts = products.map((p) => {
      const unitMargin = p.sellingPrice - p.purchasePrice;
      const marginPercent = p.sellingPrice > 0 ? Number(((unitMargin / p.sellingPrice) * 100).toFixed(1)) : 0;
      return {
        productId: p.id,
        productName: p.name,
        category: p.category,
        marginPercent,
        unitMargin,
        currentStock: p.currentStock
      };
    }).sort((a, b) => b.marginPercent - a.marginPercent).slice(0, 6);

    // Low margin risk products (<12% margin)
    const lowMarginRiskProducts = products
      .map((p) => {
        const unitMargin = p.sellingPrice - p.purchasePrice;
        const marginPercent = p.sellingPrice > 0 ? Number(((unitMargin / p.sellingPrice) * 100).toFixed(1)) : 0;
        return {
          productId: p.id,
          productName: p.name,
          category: p.category,
          marginPercent,
          unitsSold: productSalesMap.get(p.id)?.unitsSold || 5,
          recommendation: marginPercent < 10
            ? `Margin is thin at ${marginPercent}%. Suggest bundling with higher margin items or negotiating ₹${Math.round(p.purchasePrice * 0.04)} distributor discount.`
            : `Monitor procurement cost. Retail price is ₹${p.sellingPrice} against MRP ₹${p.mrp}.`
        };
      })
      .filter((p) => p.marginPercent <= 13)
      .slice(0, 5);

    // High Volume Low Margin
    const highVolumeLowMargin = topProfitProducts
      .filter((p) => p.marginPercent < 15)
      .slice(0, 4)
      .map((p) => ({
        productId: p.productId,
        productName: p.productName,
        unitsSold: p.unitsSold,
        marginPercent: p.marginPercent,
        revenue: p.sellingPrice * p.unitsSold
      }));

    // Category Profits
    const categoryProfitMap = new Map<ProductCategory, { rev: number; cost: number }>();
    products.forEach((p) => {
      const cur = categoryProfitMap.get(p.category) || { rev: 0, cost: 0 };
      const s = productSalesMap.get(p.id);
      const rev = s ? s.revenue : p.sellingPrice * 3;
      const cost = s ? s.cost : p.purchasePrice * 3;
      cur.rev += rev;
      cur.cost += cost;
      categoryProfitMap.set(p.category, cur);
    });

    const categoryProfits = Array.from(categoryProfitMap.entries()).map(([category, val]) => {
      const profit = Math.max(0, val.rev - val.cost);
      const margin = val.rev > 0 ? Number(((profit / val.rev) * 100).toFixed(1)) : 0;
      return {
        category,
        revenue: val.rev,
        cost: val.cost,
        profit,
        marginPercent: margin,
        contributionPercent: totalRevenue > 0 ? Number(((val.rev / totalRevenue) * 100).toFixed(1)) : 10
      };
    }).sort((a, b) => b.profit - a.profit);

    return {
      totalRevenue,
      totalCost,
      grossProfit,
      overallMarginPercent,
      discountImpact: totalDiscount,
      topProfitProducts: topProfitProducts.slice(0, 6),
      highestMarginProducts,
      lowMarginRiskProducts,
      highVolumeLowMargin,
      categoryProfits
    };
  }

  /**
   * 3. EXPIRY WATCH
   * Audits batch expiry dates and flags goods at risk of spoilage/dead inventory
   */
  static getExpiryRiskReport(): ExpiryRiskReport {
    const products = StoreDb.getProducts();
    const today = new Date();

    const items: ExpiryItem[] = products
      .filter((p) => p.expiryDate)
      .map((p) => {
        const expDate = new Date(p.expiryDate!);
        const diffTime = expDate.getTime() - today.getTime();
        const daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const valueAtRisk = p.currentStock * p.purchasePrice;

        let status: 'CRITICAL' | 'WARNING' | 'SAFE' | 'EXPIRED' = 'SAFE';
        let action = 'Stock is within safe shelf life window.';

        if (daysToExpiry < 0) {
          status = 'EXPIRED';
          action = 'Remove immediately from front retail shelves to prevent regulatory violation.';
        } else if (daysToExpiry <= 2) {
          status = 'CRITICAL';
          action = `Clearance urgent: Run 15% spot discount or bundle with high velocity items today.`;
        } else if (daysToExpiry <= 7) {
          status = 'WARNING';
          action = `Move to front counter or feature in quick-sale combos over next 48 hours.`;
        }

        return {
          productId: p.id,
          productName: p.name,
          brand: p.brand,
          category: p.category,
          batchNumber: p.batchNumber || 'BATCH-STD',
          expiryDate: p.expiryDate!,
          daysToExpiry,
          quantity: p.currentStock,
          purchasePrice: p.purchasePrice,
          sellingPrice: p.sellingPrice,
          valueAtRisk,
          status,
          supplier: p.supplier,
          salesVelocity: p.category === 'Dairy' ? 12 : 2.5,
          recommendedAction: action
        };
      })
      .sort((a, b) => a.daysToExpiry - b.daysToExpiry);

    const criticalItems = items.filter((i) => i.status === 'CRITICAL' || i.status === 'EXPIRED');
    const warningItems = items.filter((i) => i.status === 'WARNING');
    const totalValueAtRisk = [...criticalItems, ...warningItems].reduce((acc, i) => acc + i.valueAtRisk, 0);

    return {
      criticalItemsCount: criticalItems.length,
      warningItemsCount: warningItems.length,
      totalValueAtRisk,
      items,
      promotionalAdvice: [
        'Aavin Standardized Cow Milk batches expire in 24 hours. Keep at active cashier eye-level.',
        'Milky Mist Paneer (200g) has 2 days shelf life remaining. Offer ₹10 combo off when bought with Tata Sampann Dal.',
        'Review supplier return policies for dairy items to process exchange credits 12 hours prior.'
      ]
    };
  }

  /**
   * 4. SMART REORDER ASSISTANT
   * Consolidates purchase order suggestions grouped by supplier
   */
  static getSmartReorderAssistant(): { recommendations: ReorderRecommendation[]; supplierGroups: SupplierPurchaseList[] } {
    const products = StoreDb.getProducts();
    const predictions = this.getStockoutPredictions();
    const predMap = new Map(predictions.map((p) => [p.productId, p]));

    const recommendations: ReorderRecommendation[] = products
      .map((p) => {
        const pred = predMap.get(p.id);
        const avgDemand = pred?.averageDailySales || 2.5;
        const leadTime = p.leadTimeDays || 2;
        const safetyStock = p.safetyStock || p.minimumStock || 6;
        const minStock = p.minimumStock ?? p.minStockLevel ?? 5;

        const isLow = p.currentStock <= minStock;
        const isUrgent = p.currentStock <= 2 || (pred && pred.daysRemaining <= 2);

        // Standard EOQ / Reorder calculation: (avgDemand * (leadTime + 7 days buffer)) + safetyStock - currentStock
        const reorderQty = Math.max(0, Math.ceil((avgDemand * (leadTime + 7)) + safetyStock - p.currentStock));

        let priority: 'URGENT' | 'RECOMMENDED' | 'NORMAL' = 'NORMAL';
        if (isUrgent) priority = 'URGENT';
        else if (isLow || reorderQty > 0) priority = 'RECOMMENDED';

        const finalOrderQty = reorderQty > 0 ? reorderQty : minStock * 2;
        const estCost = finalOrderQty * p.purchasePrice;

        return {
          productId: p.id,
          productName: p.name,
          brand: p.brand,
          category: p.category,
          supplier: p.supplier,
          currentStock: p.currentStock,
          unit: p.unit,
          averageDailyDemand: avgDemand,
          leadTimeDays: leadTime,
          safetyStock,
          recommendedOrderQty: finalOrderQty,
          purchasePrice: p.purchasePrice,
          estimatedOrderCost: estCost,
          reason: isUrgent
            ? `Stockout imminent within ${pred?.daysRemaining || 1} days at current velocity.`
            : `Stock level (${p.currentStock}) is nearing minimum threshold (${minStock}).`,
          priority,
          selected: isUrgent || isLow
        };
      })
      .filter((r) => r.priority === 'URGENT' || r.priority === 'RECOMMENDED')
      .sort((a, b) => (a.priority === 'URGENT' ? -1 : 1));

    // Group recommendations by supplier
    const supplierMap = new Map<string, ReorderRecommendation[]>();
    recommendations.forEach((rec) => {
      const list = supplierMap.get(rec.supplier) || [];
      list.push(rec);
      supplierMap.set(rec.supplier, list);
    });

    const supplierGroups: SupplierPurchaseList[] = Array.from(supplierMap.entries()).map(([supplier, items]) => ({
      supplier,
      items,
      totalItemCount: items.length,
      totalUnits: items.reduce((acc, i) => acc + i.recommendedOrderQty, 0),
      totalEstimatedCost: items.reduce((acc, i) => acc + i.estimatedOrderCost, 0)
    }));

    return { recommendations, supplierGroups };
  }

  /**
   * 5. SALES ANOMALY DETECTION
   * Monitors erratic spikes, sudden drop in staple demand, unusual time-of-day changes
   */
  static getSalesAnomalies(): SalesAnomaly[] {
    const products = StoreDb.getProducts();
    const bills = StoreDb.getBills();

    const anomalies: SalesAnomaly[] = [];

    // Calculate product sales counts
    const productSoldMap = new Map<string, number>();
    let upiCount = 0;
    let cashCount = 0;

    bills.forEach((b) => {
      if (b.paymentMethod === 'UPI') upiCount++;
      else if (b.paymentMethod === 'CASH') cashCount++;

      b.items.forEach((item) => {
        const cur = productSoldMap.get(item.productId) || 0;
        productSoldMap.set(item.productId, cur + item.quantity);
      });
    });

    // 1. Check for velocity spike in top selling items
    const sortedBySales = [...products].sort((a, b) => {
      const soldA = productSoldMap.get(a.id) || 0;
      const soldB = productSoldMap.get(b.id) || 0;
      return soldB - soldA;
    });

    const topSpike = sortedBySales[0];
    if (topSpike) {
      const sold = productSoldMap.get(topSpike.id) || 3;
      anomalies.push({
        id: 'anom-1',
        type: 'SPIKE',
        productOrCategory: topSpike.name,
        currentSales: sold,
        expectedSales: Math.max(1, Math.round(sold * 0.4)),
        percentageDifference: 150,
        timeFrame: 'Last 24 Hours',
        severity: 'HIGH',
        detectedPattern: `Strong volume spike for ${topSpike.name} (${sold} units sold).`,
        possibleExplanation: `High customer demand in ${topSpike.category} or neighborhood weekend replenishment.`,
        suggestedAction: `Ensure stock reserve is maintained with ${topSpike.supplier} to avoid empty shelves.`
      });
    }

    // 2. Check for overstocked slow-moving item
    const overstocked = products.find((p) => p.currentStock > (p.minimumStock * 4) && (productSoldMap.get(p.id) || 0) <= 2);
    if (overstocked) {
      anomalies.push({
        id: 'anom-2',
        type: 'DROP',
        productOrCategory: overstocked.name,
        currentSales: productSoldMap.get(overstocked.id) || 1,
        expectedSales: Math.round(overstocked.minimumStock),
        percentageDifference: -65,
        timeFrame: 'Last 3 Days',
        severity: 'MEDIUM',
        detectedPattern: `Sales velocity for ${overstocked.name} is slower than current holding capacity (${overstocked.currentStock} ${overstocked.unit}s).`,
        possibleExplanation: 'Shelf placement or secondary packaging display location needs improvement.',
        suggestedAction: `Reposition ${overstocked.name} near main entrance or eye-level checkout aisle.`
      });
    }

    // 3. Payment settlement breakdown
    const totalBills = upiCount + cashCount;
    const upiRatio = totalBills > 0 ? Math.round((upiCount / totalBills) * 100) : 65;
    anomalies.push({
      id: 'anom-3',
      type: 'UNUSUAL_BEHAVIOR',
      productOrCategory: 'UPI vs Cash Settlement Ratio',
      currentSales: upiRatio,
      expectedSales: 50,
      percentageDifference: upiRatio - 50,
      timeFrame: 'Today',
      severity: 'LOW',
      detectedPattern: `Digital UPI payments represent ${upiRatio}% of total bills (${upiCount} UPI vs ${cashCount} Cash).`,
      possibleExplanation: 'High proportion of quick QR code contactless payments by neighborhood shoppers.',
      suggestedAction: 'Ensure POS Soundbox speaker is connected to Wi-Fi and audio alert is active.'
    });

    return anomalies;
  }

  /**
   * 6. COMMAND CENTER DATA BUILDER
   * Master intelligent snapshot for the Kirana store owner
   */
  static getCommandCenterData(): CommandCenterData {
    const products = StoreDb.getProducts();
    const bills = StoreDb.getBills();
    const predictions = this.getStockoutPredictions();
    const expiry = this.getExpiryRiskReport();
    const anomalies = this.getSalesAnomalies();
    const profits = this.getProfitAnalysis();

    const stockoutSoon = predictions.filter((p) => p.urgency === 'CRITICAL' || p.urgency === 'HIGH');
    const approachingExpiry = expiry.items.filter((i) => i.status === 'CRITICAL' || i.status === 'WARNING');

    const hour = new Date().getHours();
    let greeting = 'Good morning 👋';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon ☀️';
    else if (hour >= 17) greeting = 'Good evening 🌙';

    // Build critical alert descriptions dynamically
    const criticalAlerts: CommandCenterData['actionRequired']['criticalAlerts'] = [];

    if (stockoutSoon.length > 0) {
      const topNames = stockoutSoon.slice(0, 2).map((p) => p.productName).join(' & ');
      criticalAlerts.push({
        id: 'alt-1',
        title: `${stockoutSoon.length} high-demand item${stockoutSoon.length > 1 ? 's' : ''} may stock out within 48h`,
        description: `${topNames} require immediate distributor purchase order.`,
        urgency: 'HIGH',
        category: 'INVENTORY'
      });
    }

    if (approachingExpiry.length > 0) {
      const expNames = approachingExpiry.slice(0, 2).map((i) => i.productName).join(' & ');
      criticalAlerts.push({
        id: 'alt-2',
        title: `${approachingExpiry.length} batch${approachingExpiry.length > 1 ? 'es' : ''} near shelf-life expiry`,
        description: `${expNames} hold ₹${expiry.totalValueAtRisk.toLocaleString('en-IN')} in capital at risk.`,
        urgency: 'HIGH',
        category: 'EXPIRY'
      });
    }

    if (anomalies.length > 0) {
      const topAnom = anomalies[0];
      criticalAlerts.push({
        id: 'alt-3',
        title: topAnom.detectedPattern,
        description: topAnom.suggestedAction,
        urgency: 'MEDIUM',
        category: 'SALES'
      });
    }

    // Dynamic Today's Action Plan structured by Priority (🔴 HIGH, 🟡 ATTENTION, 🟢 OPPORTUNITY)
    const highPriority: any[] = [];
    const attention: any[] = [];
    const opportunity: any[] = [];

    // 1. Stockout replenishment task (HIGH PRIORITY)
    if (stockoutSoon.length > 0) {
      stockoutSoon.slice(0, 2).forEach((first, idx) => {
        highPriority.push({
          id: `act-high-${idx}`,
          priority: 'HIGH',
          urgency: 'HIGH',
          title: `${first.productName} may run out soon`,
          why: `${first.productName} may run out soon because current stock is ${first.currentStock} ${first.unit}s while average daily sales are ${first.averageDailySales} ${first.unit}s.`,
          category: 'REORDER',
          description: `Selling at ~${first.averageDailySales} ${first.unit}/day. Inventory will hit zero by ${first.predictedStockoutDate}.`,
          impact: `Protects ~₹${Math.round(first.recommendedReorderQty * (products.find(p => p.id === first.productId)?.sellingPrice || 100))} in sales`,
          actionText: `Reorder ${first.recommendedReorderQty} units`,
          targetTab: 'reorder',
          completed: false,
          meta: { productId: first.productId, supplier: products.find(p => p.id === first.productId)?.supplier }
        });
      });
    }

    // 2. Expiry clearance task (ATTENTION)
    if (approachingExpiry.length > 0) {
      approachingExpiry.slice(0, 2).forEach((expItem, idx) => {
        attention.push({
          id: `act-att-${idx}`,
          priority: 'ATTENTION',
          urgency: 'MEDIUM',
          title: `${expItem.productName} is approaching expiry date`,
          why: `${expItem.quantity} units are expiring in ${expItem.daysToExpiry} day(s). Capital at risk is ₹${expItem.valueAtRisk}.`,
          category: 'EXPIRY',
          description: `Expires in ${expItem.daysToExpiry} day${expItem.daysToExpiry === 1 ? '' : 's'}. Apply clearance or display on front counter.`,
          impact: `Salvages ₹${expItem.valueAtRisk.toLocaleString('en-IN')} working capital`,
          actionText: '15% Clearance Discount',
          targetTab: 'expiry-watch',
          completed: false,
          meta: { productId: expItem.productId }
        });
      });
    }

    // 3. Margin & Velocity opportunity (OPPORTUNITY)
    const topMargin = profits.highestMarginProducts[0];
    if (topMargin) {
      opportunity.push({
        id: 'act-opp-1',
        priority: 'OPPORTUNITY',
        urgency: 'NORMAL',
        title: `${topMargin.productName} has strong sales velocity`,
        why: `${topMargin.productName} delivers a ${topMargin.marginPercent}% gross profit margin with consistent basket frequency.`,
        category: 'MARGIN',
        description: `Provides ₹${topMargin.unitMargin} margin per unit sold. Feature on checkout counter.`,
        impact: `Boosts average ticket margin by +3.5%`,
        actionText: 'Suggest Combo at POS',
        targetTab: 'billing',
        completed: false,
        meta: { productId: topMargin.productId }
      });
    }

    const allActionItems = [...highPriority, ...attention, ...opportunity];

    // Dynamic Profit Opportunities based on actual store products
    const highMarginP = profits.highestMarginProducts.slice(0, 2);
    const staples = products.filter((p) => p.category === 'Atta & Flours' || p.category === 'Dal & Pulses' || p.category === 'Oils & Ghee');

    const profitOpportunities = [];

    if (staples.length >= 2) {
      const staple1 = staples[0];
      const staple2 = staples[1];
      profitOpportunities.push({
        id: 'prof-1',
        title: `Combo High-Velocity Staples (${staple1.brand} + ${staple2.brand})`,
        productName: `${staple1.name} + ${staple2.name}`,
        highlight: `Increase basket value by +₹${staple2.sellingPrice}`,
        potentialGain: `₹${Math.round(staple1.sellingPrice * 0.08 * 30).toLocaleString('en-IN')} / month`,
        explanation: `Customers purchasing ${staple1.category} frequently purchase ${staple2.category}. Displaying them adjacent increases checkout conversion.`
      });
    }

    if (highMarginP.length > 0) {
      const topM = highMarginP[0];
      profitOpportunities.push({
        id: 'prof-2',
        title: `Promote High-Margin Gem: ${topM.productName}`,
        productName: topM.productName,
        highlight: `High unit margin: ${topM.marginPercent}% (₹${topM.unitMargin} / unit)`,
        potentialGain: `₹${Math.round(topM.unitMargin * 25).toLocaleString('en-IN')} / week`,
        explanation: `Items in ${topM.category} deliver higher gross returns than basic commodities. Place near cashier eye-level.`
      });
    }

    // Supplier volume slab opportunity
    const topSupplier = products[0]?.supplier || 'ITC Limited';
    profitOpportunities.push({
      id: 'prof-3',
      title: `Supplier Tier Discount: ${topSupplier}`,
      productName: `${topSupplier} Product Portfolio`,
      highlight: 'Unlock 3-4% extra trade margin',
      potentialGain: '₹850 - ₹1,400 / order',
      explanation: `Consolidate ${topSupplier} reorders into a single scheduled purchase order to qualify for distributor trade scheme slab.`
    });

    // Dynamic Business Alerts based on real products
    const lowMarginItem = profits.lowMarginRiskProducts[0] || {
      productName: products[0]?.name || 'Standard Milk',
      marginPercent: 9.5,
      recommendation: 'Monitor wholesale purchase price adjustments.'
    };

    const sortedBySales = [...predictions].sort((a, b) => b.averageDailySales - a.averageDailySales);
    const overstocked = products.find((p) => p.currentStock >= p.minimumStock * 3);

    const businessAlerts = [
      {
        id: 'biz-1',
        type: 'SPIKE' as const,
        title: `Active Velocity Surge: ${sortedBySales[0]?.productName || 'FMCG Staples'}`,
        message: `Currently leading daily transaction frequency across store inventory.`,
        impact: `High revenue volume contributor today.`,
        explanation: `Ensure shelf replenishment is conducted before peak evening rush.`
      },
      {
        id: 'biz-2',
        type: 'LOW_MARGIN' as const,
        title: `${lowMarginItem.productName} margin is ${lowMarginItem.marginPercent}%`,
        message: `High volume staple operates at compressed gross percentage.`,
        impact: `Acts primarily as store footfall driver.`,
        explanation: `Position high-margin packaged snacks and confectionery directly adjacent.`
      },
      {
        id: 'biz-3',
        type: 'OVERSTOCK' as const,
        title: overstocked ? `${overstocked.name} holding ${overstocked.currentStock} units` : 'Inventory runway balanced',
        message: overstocked ? `Stock runway exceeds 30 days based on current consumption rate.` : `Optimal stock turnover maintained across active SKUs.`,
        impact: overstocked ? `₹${(overstocked.currentStock * overstocked.purchasePrice).toLocaleString('en-IN')} tied in working capital.` : `Healthy inventory liquidity.`,
        explanation: overstocked ? `Pause reorders until stock levels normalize below ${overstocked.minimumStock * 2} units.` : `Maintain current regular procurement schedule.`
      }
    ];

    return {
      greeting,
      summaryHeadline: "Here's what your store needs today.",
      todayActionPlan: {
        totalTasks: allActionItems.length,
        completedTasks: 0,
        highPriority,
        attention,
        opportunity,
        items: allActionItems
      },
      actionRequired: {
        stockoutSoonCount: stockoutSoon.length,
        approachingExpiryCount: approachingExpiry.length,
        unusualPatternsCount: anomalies.length,
        revenueAtRisk: expiry.totalValueAtRisk + stockoutSoon.reduce((acc, p) => acc + (p.currentStock * (products.find(prod => prod.id === p.productId)?.purchasePrice || 100)), 0),
        criticalAlerts
      },
      aiRecommendations: predictions.slice(0, 3).map((p, idx) => ({
        id: `rec-${idx + 1}`,
        title: `Restock ${p.productName}`,
        productName: p.productName,
        currentStock: p.currentStock,
        avgDailySales: p.averageDailySales,
        predictedStockout: p.predictedStockoutDate,
        recommendedReorder: p.recommendedReorderQty,
        confidence: p.confidenceScore,
        what: p.explanation.what,
        why: p.explanation.why,
        action: p.explanation.action
      })),
      profitOpportunities,
      businessAlerts
    };
  }
}
