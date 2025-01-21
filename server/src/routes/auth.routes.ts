import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';

export const createAuthRouter = (authController: AuthController): Router => {
  const router = Router();

  router.get('/status', authController.getStatus);
  router.post('/register', authController.register);
  router.post('/login', authController.login);
  router.post('/refresh', authController.refreshToken);

  return router;
};

export default createAuthRouter;
