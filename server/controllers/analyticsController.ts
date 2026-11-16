import { Request, Response } from 'express';
import { analyticsService } from '../services/analyticsService';

export const analyticsController = {
  getAnalytics(req: Request, res: Response) {
    try {
      const analytics = analyticsService.getAnalytics();
      res.json({ success: true, data: analytics });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
