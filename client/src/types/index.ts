export interface Recruiter {
    Name: string;
    Email: string;
    ReachOutCount: number;
    Status: 'Pending' | 'Sent' | 'Failed';
    LastContactDate: string | null;
    Company: string;
    Role: string;
}

export interface EmailResponse {
    success: boolean;
    message?: string;
    details?: {
        sent: number;
        failed: number;
    };
}
