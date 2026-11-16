import { StoreDb } from '../data/store';
import { AnalyticsData } from '../../src/types/index';

export const analyticsService = {
  getAnalytics(): AnalyticsData {
    return StoreDb.getAnalytics();
  }
};
