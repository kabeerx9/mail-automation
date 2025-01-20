import { Router } from 'express';
import { EmailController } from '../controllers/email.controller';
import asyncHandler from 'express-async-handler';
import { authMiddleware } from '../middleware/authMiddelware';

export const createEmailRouter = (emailController: EmailController): Router => {
  const router = Router();

  // Protected routes - require authentication
  router.get('/status', authMiddleware, emailController.getStatus);
  router.post('/send', authMiddleware, emailController.processEmails);
  router.post('/test', authMiddleware, emailController.sendTestEmail);

  return router;
};

export default createEmailRouter;
