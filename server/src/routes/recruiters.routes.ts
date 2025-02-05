import { Router } from 'express';
import { authMiddleware } from '@/middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';
import { RecruiterController } from '@/controllers/recruiter.controller';

const router = Router();
const recruiterController = new RecruiterController();

router.get('/', authMiddleware, asyncHandler(recruiterController.getRecruiters));
router.post('/', authMiddleware, asyncHandler(recruiterController.addRecruiter));
router.put('/', authMiddleware, asyncHandler(recruiterController.updateRecruiter));

export default router;
