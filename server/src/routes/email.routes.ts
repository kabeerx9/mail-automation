import { Router } from 'express';
import { EmailController } from '../controllers/email.controller';
import asyncHandler from 'express-async-handler';

export const createEmailRouter = (emailController: EmailController): Router => {
  const router = Router();

  router.get('/status', asyncHandler(emailController.getStatus));
  router.post('/send', asyncHandler(emailController.processEmails));
  router.post('/test', asyncHandler(emailController.sendTestEmail));

  return router;
};

export default createEmailRouter;
