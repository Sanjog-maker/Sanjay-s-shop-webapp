import { Request, Response } from 'express';
import { salesService } from '../services/salesService';

export const salesController = {
  getAll(req: Request, res: Response) {
    try {
      const sales = salesService.getAllSales();
      res.json({ success: true, data: sales });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  create(req: Request, res: Response) {
    try {
      const { items, paymentMethod } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'Sale must include at least one item' });
      }
      const newSale = salesService.createSale(req.body);
      res.status(201).json({ success: true, data: newSale });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
};
