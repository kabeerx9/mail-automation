import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { UnauthorizedError, NotFoundError, ConflictError } from '../types/errors';

// Zod schema for configuration validation
const configurationSchema = z.object({
    SMTP_HOST: z.string().min(1, 'SMTP host is required'),
    SMTP_PORT: z.string().min(1, 'SMTP port is required'),
    SMTP_USER: z.string().min(1, 'SMTP user is required'),
    SMTP_PASS: z.string().min(1, 'SMTP password is required'),
    EMAIL_FROM: z.string().email('Invalid email format'),
    EMAIL_SUBJECT: z.string().min(1, 'Email subject is required'),
    EMAIL_RATE_LIMIT: z.number().int().positive('Rate limit must be a positive number')
});


export class ConfigController {
    addConfiguration = async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedError();
        }

        // Parse and validate the request body
        const validatedData = configurationSchema.parse({
            ...req.body,
            EMAIL_RATE_LIMIT: Number(req.body.EMAIL_RATE_LIMIT)
        });

        // Check if configuration already exists for this user
        const existingConfig = await prisma.configuration.findUnique({
            where: { userId }
        });

        if (existingConfig) {
            throw new ConflictError('Configuration already exists for this user');
        }

        // Create new configuration
        await prisma.configuration.create({
            data: {
                ...validatedData,
                userId
            }
        });

        res.status(201).json({
            success: true,
            message: 'Configuration added successfully',
        });
    }

    getConfiguration = async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedError();
        }

        const configuration = await prisma.configuration.findUnique({
            where: { userId },
            select: {
                SMTP_HOST: true,
                SMTP_PORT: true,
                SMTP_USER: true,
                SMTP_PASS: true,
                EMAIL_FROM: true,
                EMAIL_SUBJECT: true,
                EMAIL_RATE_LIMIT: true
            }
        });

        if (!configuration) {
            throw new NotFoundError('Configuration not found');
        }

        res.status(200).json({
            success: true,
            data: configuration
        });
    }

    updateConfiguration = async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedError();
        }

        // Parse and validate the request body
        const validatedData = configurationSchema.parse({
            ...req.body,
            EMAIL_RATE_LIMIT: Number(req.body.EMAIL_RATE_LIMIT)
        });

        // Check if configuration exists for this user
        const existingConfig = await prisma.configuration.findUnique({
            where: { userId }
        });

        if (!existingConfig) {
            throw new NotFoundError('Configuration not found');
        }

        // Update configuration
        await prisma.configuration.update({
            where: { userId },
            data: validatedData
        });

        res.status(200).json({
            success: true,
            message: 'Configuration updated successfully',
        });
    }
}
