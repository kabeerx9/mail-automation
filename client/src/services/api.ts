import { Recruiter, EmailResponse } from '../types';
import axiosInstance from './axios';

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
