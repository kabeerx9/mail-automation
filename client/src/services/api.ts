import { EmailResponse, Recruiter } from '../types';
import { default as axios, default as axiosInstance } from './axios';

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

export const sendSingleEmail = async (recruiterId: string, useAI: boolean = false): Promise<EmailResponse> => {
    const response = await axiosInstance.post(`/emails/${recruiterId}`, {
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

export const checkRecruiters = async (): Promise<Recruiter[]> => {
    const response = await axios.get('/recruiters/');
    console.log("response", response.data);
    return response.data.data;
};

export const fetchConfiguration = async (): Promise<SmtpConfig | null> => {
    try {
        const response = await axios.get('/config');
        console.log("response", response.data);
        return response.data.data;
    } catch (err) {
        console.error("Error fetching configuration", err);
        return null;
    }
};

export const uploadRecruiters = async(recruiters: {name: string, company: string, email: string}[]) => {
    const response = await axiosInstance.post('/recruiters/bulk', recruiters);
    return response.data;
}

export const addRecruiter = async (recruiter: {name: string, company: string, email: string}): Promise<Recruiter> => {
    const response = await axiosInstance.post('/recruiters', recruiter);
    return response.data;
};

export const deleteRecruiter = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/recruiters/${id}`);
};
