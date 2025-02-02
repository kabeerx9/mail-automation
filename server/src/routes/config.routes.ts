import { Router } from 'express';
import { ConfigController } from '../controllers/config.controller';
import { authMiddleware } from '@/middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const configController = new ConfigController();

router.post('/', authMiddleware, asyncHandler(configController.addConfiguration));
router.get('/', authMiddleware, asyncHandler(configController.getConfiguration));
router.put('/', authMiddleware, asyncHandler(configController.updateConfiguration));

export default router;
