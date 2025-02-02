import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { NotFoundError } from '../types/errors';

export class TestController {
    // Get all users
    getAllUsers = async (_req: Request, res: Response) => {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                // Excluding password and refreshToken for security
            }
        });

        res.json({
            success: true,
            count: users.length,
            users
        });
    }

    // Get user by ID
    getUserById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        res.json({
            success: true,
            user
        });
    }

    // Get database stats
    getDBStats = async (_req: Request, res: Response) => {
        const userCount = await prisma.user.count();

        res.json({
            success: true,
            stats: {
                totalUsers: userCount,
                lastUpdated: new Date().toISOString()
            }
        });
    }
}
