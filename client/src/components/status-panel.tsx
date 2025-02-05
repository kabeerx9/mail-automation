import { useState } from 'react';
import { Recruiter } from '../types';
import { sendEmails, sendTestEmail } from '../services/api';
import toast from 'react-hot-toast';

interface Props {
    recruiters: Recruiter[];
    onRefresh: () => void;
    useAI: boolean;
}

export function StatusPanel({ recruiters, onRefresh, useAI }: Props) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Ready to send emails');
    const [showModal, setShowModal] = useState(false);
    const [testEmail, setTestEmail] = useState('');

    const stats = recruiters.reduce((acc, recruiter) => {
        acc[recruiter.Status] = (acc[recruiter.Status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const handleSendEmails = async () => {
        if (isProcessing) return;

        try {
            setIsProcessing(true);
            const promise = sendEmails();
            await toast.promise(promise, {
                loading: 'Sending emails...',
                success: (result) => `Emails processed: ${result.details?.sent} sent, ${result.details?.failed} failed`,
                error: 'Failed to send emails'
            });
            onRefresh();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleTestEmail = async () => {
        if (!testEmail.trim()) return;

        try {
            const promise = sendTestEmail(testEmail, useAI);
            await toast.promise(promise, {
                loading: 'Sending test email...',
                success: 'Test email sent successfully!',
                error: 'Failed to send test email'
            });
            setShowModal(false);
            setTestEmail('');
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <section className="bg-white rounded-lg p-6 mb-8 shadow-sm">
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Current Status</h3>
                <div className={`p-4 rounded-md mb-4 ${
                    statusMessage.includes('Error') ? 'bg-red-100' :
                    statusMessage.includes('Success') ? 'bg-green-100' :
                    'bg-blue-100'
                }`}>
                    {statusMessage}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md text-center">
                        <span className="block text-gray-600 text-sm">Pending</span>
                        <span className="block text-2xl font-semibold mt-2">{stats.Pending || 0}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md text-center">
                        <span className="block text-gray-600 text-sm">Sent</span>
                        <span className="block text-2xl font-semibold mt-2">{stats.Sent || 0}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md text-center">
                        <span className="block text-gray-600 text-sm">Failed</span>
                        <span className="block text-2xl font-semibold mt-2">{stats.Failed || 0}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-4">
                <button
                    onClick={handleSendEmails}
                    disabled={isProcessing}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    Send Emails
                </button>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                    Send Test Email
                </button>
                <button
                    onClick={onRefresh}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                >
                    Refresh Data
                </button>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-6">Send Test Email</h2>
                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2" htmlFor="testEmail">
                                Email Address:
                            </label>
                            <input
                                type="email"
                                id="testEmail"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                placeholder="Enter email address"
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setTestEmail('');
                                }}
                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTestEmail}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
