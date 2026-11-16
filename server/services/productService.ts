import { StoreDb } from '../data/store';
import { Product } from '../../src/types/index';

export const productService = {
  getAllProducts(): Product[] {
    return StoreDb.getProducts();
  },

  getProductById(id: string): Product | undefined {
    return StoreDb.getProductById(id);
  },

  createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    return StoreDb.addProduct(data);
  },

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    return StoreDb.updateProduct(id, updates);
  },

  deleteProduct(id: string): boolean {
    return StoreDb.deleteProduct(id);
  }
};
