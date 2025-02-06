import { Switch } from '@headlessui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { deleteRecruiter, sendSingleEmail } from '../../services/api';
import { EmailStatus, Recruiter } from '../../types';
import { ConfirmationDialog } from '../ui/confirmation-dialog';
import { formatDate } from '../../utils/date';
import { CheckCircleIcon, XCircleIcon, ClockIcon, EnvelopeIcon, TrashIcon } from '@heroicons/react/24/solid';

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

    const handleSendEmail = async (recruiterId: string , wasIndividualEmail: boolean = false) => {
        try {
            onUpdateStatus(recruiterId, 'loading');
            const response = await sendSingleEmail(recruiterId, aiSettings[recruiterId]);
            if (response.success) {
                onUpdateStatus(recruiterId, 'success');
                toast.success('Email sent successfully');
                if (wasIndividualEmail) {
                    queryClient.invalidateQueries({ queryKey: ['recruiters-check'] });
                }
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
            case 'idle':
                return <ClockIcon className="h-5 w-5 text-gray-400" />;
            default:
                return <ClockIcon className="h-5 w-5 text-gray-400" />;
        }
    };

    return (
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Name
                                </th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Company
                                </th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Email
                                </th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Last Reach Out
                                </th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Frequency
                                </th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    AI
                                </th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Status
                                </th>
                                <th scope="col" className="relative py-4 pl-3 pr-6">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recruiters.map((recruiter) => (
                                <tr key={recruiter.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 pl-6 pr-3">
                                        <div className="flex items-center">
                                            <div className="h-9 w-9 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-blue-600 font-medium text-sm">
                                                    {recruiter.name.split(' ').map(n => n[0]).join('')}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="font-medium text-gray-900">{recruiter.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4">
                                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                            {recruiter.company}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">{recruiter.email}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                                        {formatDate(recruiter.lastReachOutDate)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4">
                                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                            {recruiter.reachOutFrequency}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4">
                                        <Switch
                                            checked={aiSettings[recruiter.id] || false}
                                            onChange={() => toggleAI(recruiter.id)}
                                            disabled={isProcessing}
                                            className={`${
                                                aiSettings[recruiter.id] ? 'bg-blue-600' : 'bg-gray-200'
                                            } relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                        >
                                            <span className="sr-only">Use AI for email generation</span>
                                            <span
                                                className={`${
                                                    aiSettings[recruiter.id] ? 'translate-x-5' : 'translate-x-1'
                                                } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                                            />
                                        </Switch>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4">
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(emailStates[recruiter.id]?.status)}
                                            {emailStates[recruiter.id]?.error && (
                                                <span className="text-red-500 text-xs max-w-[150px] truncate" title={emailStates[recruiter.id].error}>
                                                    {emailStates[recruiter.id].error}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right">
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() => handleSendEmail(recruiter.id, true)}
                                                disabled={isProcessing}
                                                className={`inline-flex items-center rounded-md px-2.5 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors ${
                                                    isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            >
                                                <EnvelopeIcon className="h-4 w-4 mr-1" />
                                                Send
                                            </button>
                                            <button
                                                onClick={() => handleDelete(recruiter.id)}
                                                disabled={isProcessing}
                                                className={`inline-flex items-center rounded-md px-2.5 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors ${
                                                    isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            >
                                                <TrashIcon className="h-4 w-4 mr-1" />
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
