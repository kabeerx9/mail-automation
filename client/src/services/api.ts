import { Recruiter, EmailResponse } from '../types';
import axiosInstance from './axios';
import axios from './axios';

export interface SmtpConfig {
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_USER: string;
    SMTP_PASS: string;
    EMAIL_FROM: string;
    EMAIL_SUBJECT: string;
    EMAIL_RATE_LIMIT: number;
}

export interface Recruiter {
    id : string;
    name :string;
    company : string;
    email : string;
    lastReachOutDate : Date;
    reachOutFrequency : number;
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
    } catch (error) {
        return null;
    }
};

export const uploadRecruiters = async(recruiters: {name: string, company: string, email: string}[]) => {
    const response = await axiosInstance.post('/recruiters/bulk', recruiters);
    return response.data;
}
