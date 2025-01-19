import { Recruiter, EmailResponse } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

export const fetchRecruiters = async (): Promise<Recruiter[]> => {
    const response = await fetch(`${API_BASE_URL}/emails/status`);
    if (!response.ok) throw new Error('Failed to fetch recruiters');
    return response.json();
};

export const sendEmails = async (): Promise<EmailResponse> => {
    const response = await fetch(`${API_BASE_URL}/emails/send`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to send emails');
    return response.json();
};

export const sendTestEmail = async (email: string): Promise<EmailResponse> => {
    const response = await fetch(`${API_BASE_URL}/emails/test`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error('Failed to send test email');
    return response.json();
};
