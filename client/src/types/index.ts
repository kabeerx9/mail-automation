export type EmailStatus = 'idle' | 'loading' | 'success' | 'error';

export interface Recruiter {
    id : string;
    name :string;
    company : string;
    email : string;
    lastReachOutDate : string;
    reachOutFrequency : number;
}

export interface EmailResponse {
    success: boolean;
    message?: string;
    details?: {
        sent: number;
        failed: number;
    };
}
