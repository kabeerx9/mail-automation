import { Router } from 'express';
import { authMiddleware } from '@/middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';
import { RecruiterController } from '@/controllers/recruiter.controller';

const router = Router();
const recruiterController = new RecruiterController();

// Get all recruiters
router.get('/', authMiddleware, asyncHandler(recruiterController.getRecruiters));

// Add a single recruiter
router.post('/', authMiddleware, asyncHandler(recruiterController.addRecruiter));

// Add multiple recruiters
router.post('/bulk', authMiddleware, asyncHandler(recruiterController.addMultipleRecruiters));

// Update a recruiter
router.put('/:recruiterId', authMiddleware, asyncHandler(recruiterController.updateRecruiter));

// Delete a recruiter
router.delete('/:recruiterId', authMiddleware, asyncHandler(recruiterController.deleteRecruiter));

export default router;
