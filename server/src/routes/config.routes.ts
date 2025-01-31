import { Router } from 'express';
import { ConfigController } from '../controllers/config.controller';
import { authMiddleware } from '@/middleware/authMiddleware';

const router = Router();
const configController = new ConfigController();

router.post('/', authMiddleware, configController.addConfiguration);
router.get('/', authMiddleware, configController.getConfiguration);

export default router;
