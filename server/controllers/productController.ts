import { Request, Response } from 'express';
import { productService } from '../services/productService';

export const productController = {
  getAll(req: Request, res: Response) {
    try {
      const products = productService.getAllProducts();
      res.json({ success: true, data: products });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getById(req: Request, res: Response) {
    try {
      const product = productService.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      res.json({ success: true, data: product });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  create(req: Request, res: Response) {
    try {
      const product = productService.createProduct(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  update(req: Request, res: Response) {
    try {
      const updated = productService.updateProduct(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  delete(req: Request, res: Response) {
    try {
      const deleted = productService.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      res.json({ success: true, message: 'Product deleted' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
