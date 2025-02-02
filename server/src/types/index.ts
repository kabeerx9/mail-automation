import { z } from 'zod';
import nodemailer from 'nodemailer';
import { JwtPayload } from 'jsonwebtoken';
import { Configuration } from '@prisma/client';

export const RecruiterSchema = z.object({
  Name: z.string(),
  Email: z.string().email(),
  ReachOutCount: z.number().int().min(0),
  Status: z.enum(['Pending', 'Sent', 'Failed']),
  LastContactDate: z.string().optional(),
  Company: z.string(),
  Role : z.string(),
});

export type Recruiter = z.infer<typeof RecruiterSchema>;

export interface EmailService {
  sendEmail(to: string, body: string , transporter: nodemailer.Transporter , configuration : Configuration ): Promise<void>;
}

export interface CSVService {
  readRecruiters(): Promise<Recruiter[]>;
  updateRecruiters(recruiters: Recruiter[]): Promise<void>;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  details?: {
    sent: number;
    failed: number;
    errors: Array<{ email: string; error: string }>;
  };
}

export interface TokenUser {
    id: string;
    email: string;
    name?: string;
    has_configured: boolean;
}

export interface TokenPayload {
    id: string;
    email: string;
    name?: string;
    type: 'access' | 'refresh';
    has_configured: boolean;
}

declare global {
    namespace Express {
        interface Request {
            user?: TokenUser;
        }
    }
}

export {};  // This is important to make the file a module
