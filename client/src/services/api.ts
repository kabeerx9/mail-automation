import { Recruiter, EmailResponse } from '../types';
import axiosInstance from './axios';

export interface SmtpConfig {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    fromEmail: string;
}

export const fetchRecruiters = async (): Promise<Recruiter[]> => {
    const response = await axiosInstance.get('/emails/status');
    return response.data;
};

export const sendEmails = async (): Promise<EmailResponse> => {
    const response = await axiosInstance.post('/emails/send');
    return response.data;
};

export const sendTestEmail = async (email: string): Promise<EmailResponse> => {
    const response = await axiosInstance.post('/emails/test', { email });
    return response.data;
};

export const saveConfiguration = async (config: SmtpConfig): Promise<void> => {
    await axiosInstance.post('/config/', config);
};
