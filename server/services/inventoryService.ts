import { StoreDb } from '../data/store';
import { Product, StockMovement, RestockEntry, StockAdjustmentEntry } from '../../src/types/index';

export const inventoryService = {
  getInventoryOverview() {
    const products = StoreDb.getProducts();
    const lowStock = products.filter((p) => p.currentStock <= (p.minimumStock ?? p.minStockLevel ?? 5));
    const costValue = products.reduce((acc, p) => acc + p.currentStock * p.purchasePrice, 0);
    const retailValue = products.reduce((acc, p) => acc + p.currentStock * p.sellingPrice, 0);
    const totalUnits = products.reduce((acc, p) => acc + p.currentStock, 0);

    return {
      products,
      lowStock,
      totalUnits,
      costValue,
      retailValue,
      potentialProfit: retailValue - costValue
    };
  },

  restock(entry: RestockEntry): { product: Product; movement: StockMovement } | null {
    return StoreDb.restockProduct(entry);
  },

  adjustStock(entry: StockAdjustmentEntry): { product: Product; movement: StockMovement } | null {
    return StoreDb.adjustStock(entry);
  },

  getStockHistory(): StockMovement[] {
    return StoreDb.getStockMovements();
  }
};
