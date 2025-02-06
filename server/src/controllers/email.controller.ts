import { Request, Response } from 'express';
import { EmailService, CSVService, EmailResponse } from '../types';
import logger from '../utils/logger';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { ValidationError, NotFoundError } from '../types/errors';
import { AI_MODEL } from '@/config';

const testEmailSchema = z.object({
    email: z.string().email('Invalid email format'),
    useAI: z.boolean().optional().default(false)
}).strict();

export class EmailController {
    constructor(
        private emailService: EmailService,
        private csvService: CSVService
    ) {}

    generateTransporter = (configuration: any) => {
        if (!configuration) {
            return null;
        }

        const modifiedTransporterConfiguration = {
            host: configuration.SMTP_HOST,
            port: parseInt(configuration.SMTP_PORT),
            auth: {
                user: configuration.SMTP_USER,
                pass: configuration.SMTP_PASS
            }
        };

        return nodemailer.createTransport(modifiedTransporterConfiguration);
    }

    getStatus = async (_req: Request, res: Response) => {
        const recruiters = await this.csvService.readRecruiters();
        res.json(recruiters);
    }

    sendSingleEmail = async (req: Request, res: Response) => {
        const startTime = performance.now();

        const { recruiterId } = req.params;
        const { useAI } = req.body;

        try {
            // Use a transaction for the database operations
            const result = await prisma.$transaction(async (tx) => {
                // get the recruiter from the database
                const recruiter = await tx.recruiter.findUnique({
                    where: {
                        id: recruiterId,
                        userId: req.user?.id as string
                    }
                });

                if (!recruiter) {
                    throw new NotFoundError('Recruiter not found or you do not have permission to update it');
                }

                const configuration = await tx.configuration.findUnique({
                    where: {
                        userId: req.user?.id as string
                    }
                });

                if (!configuration) {
                    throw new NotFoundError('Email configuration not found');
                }

                const transporter = this.generateTransporter(configuration);

                if (!transporter) {
                    throw new ValidationError('Invalid email configuration');
                }

                if (!configuration.EMAIL_FROM || !configuration.EMAIL_SUBJECT ||
                    !configuration.SMTP_HOST || !configuration.SMTP_PORT ||
                    !configuration.SMTP_USER || !configuration.SMTP_PASS) {
                    throw new ValidationError('Incomplete email configuration');
                }

                let emailBody: string;
                if (useAI) {
                    try {
                        console.log('Generating AI content');
                        const response = await fetch('http://localhost:1234/v1/chat/completions', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                model: "mistral-nemo-instruct-2407",
                                messages: [
                                    {
                                        role: "user",
                                        content: "Write an email from my side to a recruiter asking for a full-stack role I am interested in at their company. Keep the tone professional and friendly. Do not give anything extra in response, just direct HTML which will be the body of the email—no hi, no hello, no instructions, just direct response of HTML. Keep the sender name as Kabeer Joshi, email: "
                                    }
                                ],
                                temperature: 0.7,
                                max_tokens: -1,
                                stream: false
                            })
                        });

                        if (!response.ok) {
                            throw new Error(`AI request failed with status: ${response.status}`);
                        }

                        interface AIResponse {
                            choices: Array<{
                                message: {
                                    content: string;
                                };
                            }>;
                        }

                        const data = await response.json() as AIResponse;
                        console.log('AI Response:', data);
                        emailBody = data.choices[0]?.message?.content || 'This is a test email from the email automation system.';
                    } catch (error: unknown) {
                        emailBody = 'This is a test email from the email automation system.';
                    }
                } else {
                    emailBody = 'Hello from Kabeer Joshi, I am interested in the full-stack role at your company.';
                }

                const emailSendStartTime = performance.now();
                await this.emailService.sendEmail(
                    recruiter.email,
                    emailBody,
                    transporter,
                    configuration
                );
                logger.info('Email sending time:', { time: performance.now() - emailSendStartTime });

                // Update the recruiter data after successful email send
                const updatedRecruiter = await tx.recruiter.update({
                    where: {
                        id: recruiterId,
                        userId: req.user?.id as string
                    },
                    data: {
                        reachOutFrequency: recruiter.reachOutFrequency + 1,
                        lastReachOutDate: new Date().toISOString()
                    }
                });

                return { recruiter, updatedRecruiter };
            });

            const totalTime = performance.now() - startTime;
            logger.info('Total execution time:', { time: totalTime });

            res.json({
                success: true,
                message: `Test email sent successfully to ${result.recruiter.email}`,
                isAiGenerated: useAI,
                executionTimeMs: totalTime
            });

        } catch (error) {
            logger.error('Error in sendSingleEmail:', error);
            throw error; // Let the error middleware handle it
        }
    }

    processEmails = async (req: Request, res: Response) => {
        const response: EmailResponse = {
            success: false,
            message: '',
            details: {
                sent: 0,
                failed: 0,
                errors: [],
            },
        };

        const configuration = await prisma.configuration.findUnique({
            where: {
                userId: req.user?.id as string
            }
        });

        if (!configuration) {
            throw new NotFoundError('Email configuration not found');
        }

        if (!configuration.EMAIL_FROM || !configuration.EMAIL_SUBJECT ||
            !configuration.SMTP_HOST || !configuration.SMTP_PORT ||
            !configuration.SMTP_USER || !configuration.SMTP_PASS) {
            throw new ValidationError('Incomplete email configuration');
        }

        const transporter = this.generateTransporter(configuration);

        if (!transporter) {
            throw new ValidationError('Invalid email configuration');
        }

        const recruiters = await this.csvService.readRecruiters();
        logger.info(`Processing ${recruiters.length} recruiters`);

        for (const recruiter of recruiters) {
            try {
                if (recruiter.ReachOutCount === 0) {
                    await this.emailService.sendEmail(
                        recruiter.Email,
                        this.generateEmailBody(recruiter.Name, recruiter.Company, recruiter.Role, configuration.EMAIL_FROM),
                        transporter,
                        configuration
                    );
                } else {
                    await this.emailService.sendEmail(
                        recruiter.Email,
                        this.generateFollowUpEmailBody(recruiter.Name, recruiter.Company, recruiter.Role, configuration.EMAIL_FROM),
                        transporter,
                        configuration
                    );
                }
                recruiter.Status = 'Sent';
                recruiter.ReachOutCount += 1;
                recruiter.LastContactDate = new Date().toISOString();
                response.details!.sent++;
            } catch (error) {
                recruiter.Status = 'Failed';
                response.details!.failed++;
                response.details!.errors.push({
                    email: recruiter.Email,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        await this.csvService.updateRecruiters(recruiters);

        response.success = true;
        response.message = 'Email processing completed';
        res.json(response);
    }

    private generateEmailBody(name: string, company: string, role: string, from: string): string {
        return `Dear ${name},\n\nI hope this email finds you well. I noticed that ${company} is looking for a ${role}...`;
    }

    private generateFollowUpEmailBody(name: string, company: string, role: string, from: string): string {
        return `Dear ${name},\n\nI wanted to follow up on my previous email regarding the ${role} position at ${company}...`;
    }
}
