import { Button, Switch } from '@headlessui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { deleteRecruiter, sendSingleEmail } from '../../services/api';
import { Recruiter } from '../../types';
import { ConfirmationDialog } from '../ui/confirmation-dialog';
import { formatDate } from '../../utils/date';

interface Props {
    recruiters: Recruiter[];
    globalAIEnabled: boolean;
}

export function RecruiterTable({ recruiters, globalAIEnabled }: Props) {
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        recruiterId?: string;
    }>({
        isOpen: false,
        recruiterId: undefined
    });

    const [sendingEmailRecruiterId, setSendingEmailRecruiterId] = useState<string | null>(null);
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

    const sendEmailMutation = useMutation({
        mutationFn: ({ recruiterId, useAI }: { recruiterId: string; useAI: boolean }) =>
            sendSingleEmail(recruiterId, useAI),
        onSuccess: () => {
            toast.success('Test email sent successfully');
            setSendingEmailRecruiterId(null);

            // invalidate the get query
            queryClient.invalidateQueries({ queryKey: ['recruiters-check'] });
        },
        onError: () => {
            toast.error('Failed to send test email');
            setSendingEmailRecruiterId(null);
        }
    });

    const handleDelete = (recruiterId: string) => {
        setDeleteConfirmation({ isOpen: true, recruiterId });
    };

    const handleSendEmail = (recruiterId: string) => {
        setSendingEmailRecruiterId(recruiterId);
        sendEmailMutation.mutate({
            recruiterId,
            useAI: aiSettings[recruiterId] || false
        });
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

    return (
        <section className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Recruiter Data</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr className="bg-gray-50">
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Company
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Reach Out Frequency
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Reach Out
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Use AI
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {recruiters.map((recruiter) => (
                            <tr key={recruiter.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {recruiter.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {recruiter.company}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {recruiter.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {recruiter.reachOutFrequency}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(recruiter.lastReachOutDate)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <Switch
                                        checked={aiSettings[recruiter.id] || false}
                                        onChange={() => toggleAI(recruiter.id)}
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center gap-3">
                                        <Button
                                            className={`
                                                inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md
                                                border border-gray-300 shadow-sm
                                                transition-all duration-150
                                                ${sendEmailMutation.isPending && sendingEmailRecruiterId === recruiter.id
                                                    ? 'bg-gray-50 text-gray-400'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                                }
                                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                            `}
                                            onClick={() => handleSendEmail(recruiter.id)}
                                            disabled={sendEmailMutation.isPending && sendingEmailRecruiterId === recruiter.id}
                                        >
                                            {sendEmailMutation.isPending && sendingEmailRecruiterId === recruiter.id ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                                    </svg>
                                                    Send Email
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            className={`
                                                inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md
                                                transition-all duration-150
                                                ${deleteRecruiterMutation.isPending && deleteConfirmation.recruiterId === recruiter.id
                                                    ? 'bg-red-100 text-red-400'
                                                    : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                                                }
                                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                            `}
                                            onClick={() => handleDelete(recruiter.id)}
                                            disabled={deleteRecruiterMutation.isPending}
                                        >
                                            {deleteRecruiterMutation.isPending && deleteConfirmation.recruiterId === recruiter.id ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Deleting...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                    </svg>
                                                    Delete
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ConfirmationDialog
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, recruiterId: undefined })}
                onConfirm={confirmDelete}
                title="Delete Recruiter"
                description="Are you sure you want to delete this recruiter? This action cannot be undone."
            />
        </section>
    );
}
