import { StoreDb } from '../data/store';
import { DashboardMetrics } from '../../src/types/index';

export const dashboardService = {
  getMetrics(): DashboardMetrics {
    return StoreDb.getDashboardMetrics();
  }
};
