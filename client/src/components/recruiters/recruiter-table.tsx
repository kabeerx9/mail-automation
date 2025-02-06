import { Switch } from '@headlessui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { deleteRecruiter, sendSingleEmail } from '../../services/api';
import { EmailStatus, Recruiter } from '../../types';
import { ConfirmationDialog } from '../ui/confirmation-dialog';
import { formatDate } from '../../utils/date';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface EmailState {
    status: EmailStatus;
    error?: string;
}

interface Props {
    recruiters: Recruiter[];
    globalAIEnabled: boolean;
    isProcessing: boolean;
    onUpdateStatus: (id: string, status: EmailStatus, error?: string) => void;
    emailStates: Record<string, EmailState>;
}

export function RecruiterTable({ recruiters, globalAIEnabled, isProcessing, onUpdateStatus, emailStates }: Props) {
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        recruiterId?: string;
    }>({
        isOpen: false,
        recruiterId: undefined
    });

    const [aiSettings, setAiSettings] = useState<Record<string, boolean>>({});

    // Initialize all AI settings to false when recruiters change
    useEffect(() => {
        const initialSettings: Record<string, boolean> = {};
        recruiters.forEach(recruiter => {
            initialSettings[recruiter.id] = false;
        });
        setAiSettings(initialSettings);
    }, [recruiters]);

    // Update all AI settings when global switch changes
    useEffect(() => {
        const newSettings: Record<string, boolean> = {};
        recruiters.forEach(recruiter => {
            newSettings[recruiter.id] = globalAIEnabled;
        });
        setAiSettings(newSettings);
    }, [globalAIEnabled, recruiters]);

    const queryClient = useQueryClient();

    const deleteRecruiterMutation = useMutation({
        mutationFn: deleteRecruiter,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recruiters-check'] });
            toast.success('Recruiter deleted successfully');
            setDeleteConfirmation({ isOpen: false, recruiterId: undefined });
        },
        onError: () => {
            toast.error('Failed to delete recruiter');
        }
    });

    const handleDelete = (recruiterId: string) => {
        setDeleteConfirmation({
            isOpen: true,
            recruiterId
        });
    };

    const handleSendEmail = async (recruiterId: string) => {
        try {
            onUpdateStatus(recruiterId, 'loading');
            const response = await sendSingleEmail(recruiterId, aiSettings[recruiterId]);
            if (response.success) {
                onUpdateStatus(recruiterId, 'success');
                toast.success('Email sent successfully');
            } else {
                onUpdateStatus(recruiterId, 'error', response.message);
                toast.error(response.message || 'Failed to send email');
            }
        } catch {
            onUpdateStatus(recruiterId, 'error', 'Failed to send email');
            toast.error('Failed to send email');
        }
    };

    const toggleAI = (recruiterId: string) => {
        setAiSettings(prev => ({
            ...prev,
            [recruiterId]: !prev[recruiterId]
        }));
    };

    const confirmDelete = () => {
        if (deleteConfirmation.recruiterId) {
            deleteRecruiterMutation.mutate(deleteConfirmation.recruiterId);
        }
    };

    const getStatusIcon = (status?: EmailStatus) => {
        switch (status) {
            case 'success':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'error':
                return <XCircleIcon className="h-5 w-5 text-red-500" />;
            case 'loading':
                return (
                    <div className="h-5 w-5">
                        <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead>
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                                    Name
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Company
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Email
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Last Reach Out
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Reach Out Frequency
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Use AI
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Status
                                </th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {recruiters.map((recruiter) => (
                                <tr key={recruiter.id}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                                        {recruiter.name}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{recruiter.company}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{recruiter.email}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {formatDate(recruiter.lastReachOutDate)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {recruiter.reachOutFrequency}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        <Switch
                                            checked={aiSettings[recruiter.id] || false}
                                            onChange={() => toggleAI(recruiter.id)}
                                            disabled={isProcessing}
                                            className={`${
                                                aiSettings[recruiter.id] ? 'bg-blue-600' : 'bg-gray-200'
                                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                        >
                                            <span className="sr-only">Use AI for email generation</span>
                                            <span
                                                className={`${
                                                    aiSettings[recruiter.id] ? 'translate-x-6' : 'translate-x-1'
                                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                            />
                                        </Switch>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(emailStates[recruiter.id]?.status)}
                                            {emailStates[recruiter.id]?.error && (
                                                <span className="text-red-500 text-xs">{emailStates[recruiter.id].error}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleSendEmail(recruiter.id)}
                                                disabled={isProcessing}
                                                className={`text-blue-600 hover:text-blue-900 ${
                                                    isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            >
                                                Send Email
                                            </button>
                                            <button
                                                onClick={() => handleDelete(recruiter.id)}
                                                disabled={isProcessing}
                                                className={`text-red-600 hover:text-red-900 ${
                                                    isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationDialog
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, recruiterId: undefined })}
                onConfirm={confirmDelete}
                title="Delete Recruiter"
                description="Are you sure you want to delete this recruiter? This action cannot be undone."
            />
        </div>
    );
}
