import { Router } from 'express';
import { TestController } from '../controllers/test.controller';

const router = Router();
const testController = new TestController();

// Test routes for database inspection
router.get('/users', testController.getAllUsers);
router.get('/users/:id', testController.getUserById);
router.get('/stats', testController.getDBStats);

export default router;
