import { Router } from 'express';
import { TestController } from '../controllers/test.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const testController = new TestController();

// Test routes for database inspection
router.get('/users', asyncHandler(testController.getAllUsers));
router.get('/users/:id', asyncHandler(testController.getUserById));
router.get('/stats', asyncHandler(testController.getDBStats));

export default router;
