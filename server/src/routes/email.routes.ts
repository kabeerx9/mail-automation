import { Router } from 'express';
import { EmailController } from '../controllers/email.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

export const createEmailRouter = (emailController: EmailController): Router => {
  const router = Router();

  // Protected routes - require authentication
  router.get('/status', authMiddleware, asyncHandler(emailController.getStatus));
  router.post('/send', authMiddleware, asyncHandler(emailController.processEmails));
  router.post('/test', authMiddleware, asyncHandler(emailController.sendTestEmail));
  return router;
};

export default createEmailRouter;
