import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { asyncHandler } from '../utils/asyncHandler';

export const createAuthRouter = (authController: AuthController): Router => {
  const router = Router();

  router.get('/status', asyncHandler(authController.getStatus));
  router.post('/register', asyncHandler(authController.register));
  router.post('/login', asyncHandler(authController.login));
  router.post('/refresh', asyncHandler(authController.refreshToken));

  return router;
};

export default createAuthRouter;
