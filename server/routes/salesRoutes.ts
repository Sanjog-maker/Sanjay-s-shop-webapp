import { Router } from 'express';
import { salesController } from '../controllers/salesController';

const router = Router();

router.get('/', salesController.getAll);
router.post('/', salesController.create);

export default router;
