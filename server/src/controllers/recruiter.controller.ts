import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { UnauthorizedError, NotFoundError, ConflictError } from '../types/errors';

// Zod schema for recruiter validation
const recruiterSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    company: z.string().min(1, 'Company is required'),
});

export class RecruiterController {
    addRecruiter = async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedError();
        }

        // Validate the recruiter data
        const validatedRecruiter = recruiterSchema.parse(req.body);

        // add the recruiter to the database
        const recruiter = await prisma.recruiter.create({
            data: {
                name: validatedRecruiter.name,
                company: validatedRecruiter.company,
                email: validatedRecruiter.email,
                userId: userId
            }
        });

        res.status(201).json({
            success: true,
            data: recruiter
        });
    }
    addMultipleRecruiters = async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedError();
        }

        const validatedRecruiters = z.array(recruiterSchema).parse(req.body);

        const result = await prisma.recruiter.createMany({
            data: validatedRecruiters.map((recruiter) => ({
                ...recruiter,
                userId
            }))
        });

        res.status(201).json({
            success: true,
            message: `Successfully added ${result.count} recruiters`,
            count: result.count
        });
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

    deleteRecruiter = async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedError();
        }

        const { recruiterId } = req.params;

        // First check if the recruiter exists and belongs to the user
        const recruiter = await prisma.recruiter.findFirst({
            where: {
                id: recruiterId,
                userId
            }
        });

        if (!recruiter) {
            throw new NotFoundError('Recruiter not found or you do not have permission to delete it');
        }

        await prisma.recruiter.delete({
            where: {
                id: recruiterId,
                userId
            }
        });

        res.status(200).json({
            success: true,
            message: 'Recruiter deleted successfully'
        });
    }

    updateRecruiter = async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedError();
        }

        const { recruiterId } = req.params;

        const recruiter = await prisma.recruiter.findFirst({
            where: {
                id: recruiterId,
                userId
            }
        });

        if (!recruiter) {
            throw new NotFoundError('Recruiter not found or you do not have permission to update it');
        }

        const { name, email, company } = recruiterSchema.parse(req.body);

        const updatedRecruiter = await prisma.recruiter.update({
            where: {
                id: recruiterId,
                userId
            },
            data: {
                name,
                email,
                company
            }
        });

        res.status(200).json({
            success: true,
            message: 'Recruiter updated successfully',
            data: updatedRecruiter
        });
    }
}
