import { StoreDb } from '../data/store';
import { Sale } from '../../src/types/index';

export const salesService = {
  getAllSales(): Sale[] {
    return StoreDb.getBills();
  },

  createSale(saleData: {
    items: { productId: string; quantity: number; unitPrice: number; discount?: number }[];
    subtotal?: number;
    discount?: number;
    paymentMethod: any;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
  }): Sale {
    return StoreDb.createBill(saleData);
  }
};
