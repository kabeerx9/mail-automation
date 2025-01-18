import { z } from 'zod';

export const RecruiterSchema = z.object({
  Name: z.string(),
  Email: z.string().email(),
  ReachOutCount: z.number().int().min(0),
  Status: z.enum(['Pending', 'Sent', 'Failed']),
  LastContactDate: z.string().optional(),
});

export type Recruiter = z.infer<typeof RecruiterSchema>;

export interface EmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
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
