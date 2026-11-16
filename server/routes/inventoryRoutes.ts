import { Router } from 'express';
import { inventoryController } from '../controllers/inventoryController';

const router = Router();

router.get('/', inventoryController.getOverview);
router.post('/restock', inventoryController.restock);
router.post('/adjust', inventoryController.adjust);
router.get('/history', inventoryController.getHistory);

export default router;
