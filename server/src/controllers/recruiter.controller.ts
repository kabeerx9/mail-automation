import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { UnauthorizedError, NotFoundError, ConflictError } from '../types/errors';

// Zod schema for recruiter validation
const recruiterSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    phone: z.string().min(1, 'Phone is required'),
    company: z.string().min(1, 'Company is required'),
});

export class RecruiterController {
    addRecruiter = async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedError();
        }

    }

    getRecruiters = async (req: Request, res: Response) => {
        const userId = req.user?.id;

        const recruiters = await prisma.recruiter.findMany({
            where: {
                userId
            },
            select : {
                id : true,
                name : true,
                company : true,
                email : true,
                lastReachOutDate : true,
                reachOutFrequency : true,
            }
        })

        res.status(200).json({
            success: true,
            data: recruiters
        })

    }

    updateRecruiter = async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedError();
        }

    }
}
