import { Recruiter, EmailResponse } from '../types';
import axiosInstance from './axios';

export interface SmtpConfig {
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_USER: string;
    SMTP_PASS: string;
    EMAIL_FROM: string;
    EMAIL_SUBJECT: string;
    EMAIL_RATE_LIMIT: number;
}

export const fetchRecruiters = async (): Promise<Recruiter[]> => {
    const response = await axiosInstance.get('/emails/status');
    return response.data;
};

export const sendEmails = async (): Promise<EmailResponse> => {
    const response = await axiosInstance.post('/emails/send');
    return response.data;
};

export const sendTestEmail = async (email: string, useAI: boolean = false): Promise<EmailResponse> => {
    const response = await axiosInstance.post('/emails/test', {
        email: email,
        useAI: useAI
    });
    return response.data;
};

export const saveConfiguration = async (config: SmtpConfig): Promise<void> => {
    await axiosInstance.post('/config/', config);
};

export const updateConfiguration = async (config: SmtpConfig): Promise<void> => {
    await axiosInstance.put('/config/', config);
};

export const fetchConfiguration = async (): Promise<SmtpConfig> => {
    const response = await axiosInstance.get('/config/');
    return response.data.data;
};
