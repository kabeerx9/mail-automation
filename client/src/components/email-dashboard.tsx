import { Switch } from "@headlessui/react";
import { useState, useEffect } from "react";
import { EmailStatus, Recruiter } from "../types";
import { RecruiterTable } from "./recruiters/recruiter-table";
import { AddRecruiterDialog } from "./recruiters/add-recruiter-dialog";
import { sendSingleEmail } from "../services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface EmailState {
  status: EmailStatus;
  error?: string;
}

export default function EmailDashboard({recruiters} : {recruiters : Recruiter[]}) {
  const [useAI, setUseAI] = useState(false);
  const [isAddRecruiterOpen, setIsAddRecruiterOpen] = useState(false);
  const [emailStates, setEmailStates] = useState<Record<string, EmailState>>(() =>
    Object.fromEntries(recruiters.map(r => [r.id, { status: 'idle' as EmailStatus }]))
  );
  const [isSendingAll, setIsSendingAll] = useState(false);
  const queryClient = useQueryClient();

  // Update email states when recruiters change
  useEffect(() => {
    setEmailStates(current => {
      const newStates = Object.fromEntries(
        recruiters.map(r => [r.id, current[r.id] || { status: 'idle' as EmailStatus }])
      );
      return newStates;
    });
  }, [recruiters]);

  const BATCH_SIZE = 5;

  const updateRecruiterStatus = (id: string, status: EmailStatus, error?: string) => {
    setEmailStates(current => ({
      ...current,
      [id]: { status, error }
    }));
  };

  const resetAllStatuses = () => {
    setEmailStates(
      Object.fromEntries(
        recruiters.map(r => [r.id, { status: 'idle' }])
      )
    );
  };

  const sendEmailBatch = async (batch: Recruiter[]) => {
    console.log('Sending batch:', batch);
    const promises = batch.map(async (recruiter) => {
      try {
        updateRecruiterStatus(recruiter.id, 'loading');
        const response = await sendSingleEmail(recruiter.id, useAI);
        console.log('Response for', recruiter.id, ':', response);
        if (response.success) {
          updateRecruiterStatus(recruiter.id, 'success');
          return { success: true, id: recruiter.id };
        } else {
          updateRecruiterStatus(recruiter.id, 'error', response.message);
          return { success: false, id: recruiter.id, error: response.message };
        }
      } catch (error) {
        console.error('Error sending email for', recruiter.id, ':', error);
        updateRecruiterStatus(recruiter.id, 'error', 'Failed to send email');
        return { success: false, id: recruiter.id, error: 'Failed to send email' };
      }
    });

    return Promise.all(promises);
  };

  const sendAllMutation = useMutation({
    mutationFn: async () => {
      console.log('Starting send all mutation');
      const pendingRecruiters = recruiters.filter(r => emailStates[r.id]?.status === 'idle');
      console.log('Pending recruiters:', pendingRecruiters);
      const results = [];

      for (let i = 0; i < pendingRecruiters.length; i += BATCH_SIZE) {
        const batch = pendingRecruiters.slice(i, i + BATCH_SIZE);
        console.log('Processing batch', i / BATCH_SIZE + 1);
        const batchResults = await sendEmailBatch(batch);
        results.push(...batchResults);
      }

      return results;
    },
    onMutate: () => {
      console.log('Mutation starting, resetting statuses');
      setIsSendingAll(true);
      resetAllStatuses();
    },
    onSuccess: (results) => {
      console.log('Send all completed, results:', results);
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      if (successCount > 0 && failureCount === 0) {
        toast.success(`Successfully sent ${successCount} emails`);
      } else if (successCount > 0 && failureCount > 0) {
        toast.success(`Sent ${successCount} emails, ${failureCount} failed`);
      } else if (failureCount > 0) {
        toast.error(`Failed to send ${failureCount} emails`);
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['recruiters-check'] });
    },
    onError: (error) => {
      console.error('Error in send all mutation:', error);
      toast.error('Failed to send emails');
    },
    onSettled: () => {
      console.log('Mutation settled, resetting sending state');
      setIsSendingAll(false);
    }
  });

  const handleSendAll = () => {
    console.log('Send all clicked');
    if (recruiters.length === 0) {
      toast.error('No recruiters to send emails to');
      return;
    }
    sendAllMutation.mutate();
  };

  const isAnySending = Object.values(emailStates).some(state => state.status === 'loading') || isSendingAll;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Email Automation Dashboard
          </h1>
          <div className="space-x-4">
            <button
              onClick={handleSendAll}
              disabled={isAnySending || recruiters.length === 0}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                isAnySending || recruiters.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
              }`}
            >
              {isSendingAll ? 'Sending...' : 'Send All'}
            </button>
            <button
              onClick={() => setIsAddRecruiterOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Recruiter
            </button>
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <Switch
            checked={useAI}
            onChange={setUseAI}
            className={`${
              useAI ? "bg-blue-600" : "bg-gray-200"
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            <span className="sr-only">Use AI for email generation</span>
            <span
              className={`${
                useAI ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <span className="ml-3 text-sm font-medium text-gray-700">
            Use AI for email generation
          </span>
        </div>
      </header>

      <RecruiterTable
        recruiters={recruiters}
        globalAIEnabled={useAI}
        isProcessing={isAnySending}
        onUpdateStatus={updateRecruiterStatus}
        emailStates={emailStates}
      />

      <AddRecruiterDialog
        isOpen={isAddRecruiterOpen}
        onClose={() => setIsAddRecruiterOpen(false)}
      />
    </div>
  );
}
