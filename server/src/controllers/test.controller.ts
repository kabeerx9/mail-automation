import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export class TestController {
    // Get all users
    getAllUsers = async (_req: Request, res: Response) => {
        try {
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
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching users',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Get user by ID
    getUserById = async (req: Request, res: Response) => {
        try {
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
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                user
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching user',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Get database stats
    getDBStats = async (_req: Request, res: Response) => {
        try {
            const userCount = await prisma.user.count();

            res.json({
                success: true,
                stats: {
                    totalUsers: userCount,
                    lastUpdated: new Date().toISOString()
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching database stats',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
