import { Request, Response } from 'express';
import prisma from '../lib/prisma';

interface ConfigurationInput {
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_USER: string;
    SMTP_PASS: string;
    EMAIL_FROM: string;
    EMAIL_SUBJECT: string;
    EMAIL_RATE_LIMIT: number;
}

export class ConfigController {
    addConfiguration = async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const {
            SMTP_HOST,
            SMTP_PORT,
            SMTP_USER,
            SMTP_PASS,
            EMAIL_FROM,
            EMAIL_SUBJECT,
            EMAIL_RATE_LIMIT
        } = req.body as ConfigurationInput;

        try {
            // Check if all required fields are present
            if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !EMAIL_FROM || !EMAIL_SUBJECT || !EMAIL_RATE_LIMIT) {
                return res.status(400).json({
                    success: false,
                    message: 'All configuration fields are required'
                });
            }

            // Check if configuration already exists for this user
            const existingConfig = await prisma.configuration.findUnique({
                where: { userId }
            });

            if (existingConfig) {
                return res.status(400).json({
                    success: false,
                    message: 'Configuration already exists for this user'
                });
            }

            // Create new configuration
            const configuration = await prisma.configuration.create({
                data: {
                    SMTP_HOST,
                    SMTP_PORT,
                    SMTP_USER,
                    SMTP_PASS,
                    EMAIL_FROM,
                    EMAIL_SUBJECT,
                    EMAIL_RATE_LIMIT: Number(EMAIL_RATE_LIMIT),
                    userId
                }
            });

            res.status(201).json({
                success: true,
                message: 'Configuration added successfully',
                data: configuration
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error adding configuration',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    getConfiguration = async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        try {
            const configuration = await prisma.configuration.findUnique({
                where: { userId }
            });

            if (!configuration) {
                return res.status(404).json({
                    success: false,
                    message: 'Configuration not found'
                });
            }

            res.status(200).json({
                success: true,
                data: configuration
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching configuration',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
