import { Request, Response } from 'express';
import { inventoryService } from '../services/inventoryService';

export const inventoryController = {
  getOverview(req: Request, res: Response) {
    try {
      const data = inventoryService.getInventoryOverview();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  restock(req: Request, res: Response) {
    try {
      const result = inventoryService.restock(req.body);
      if (!result) {
        return res.status(404).json({ success: false, error: 'Product not found for restocking' });
      }
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  adjust(req: Request, res: Response) {
    try {
      const result = inventoryService.adjustStock(req.body);
      if (!result) {
        return res.status(404).json({ success: false, error: 'Product not found for stock adjustment' });
      }
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  getHistory(req: Request, res: Response) {
    try {
      const history = inventoryService.getStockHistory();
      res.json({ success: true, data: history });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
