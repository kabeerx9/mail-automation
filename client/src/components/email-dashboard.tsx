import { Switch } from "@headlessui/react";
import { useState } from "react";
import { EmailStatus, Recruiter } from "../types";
import { RecruiterTable } from "./recruiters/recruiter-table";
import { AddRecruiterDialog } from "./recruiters/add-recruiter-dialog";
import { sendSingleEmail } from "../services/api";

interface EmailState {
  status: EmailStatus;
  error?: string;
}

export default function EmailDashboard({recruiters: initialRecruiters} : {recruiters : Recruiter[]}) {
  const [useAI, setUseAI] = useState(false);
  const [isAddRecruiterOpen, setIsAddRecruiterOpen] = useState(false);
  const [recruiters] = useState<Recruiter[]>(initialRecruiters);
  const [emailStates, setEmailStates] = useState<Record<string, EmailState>>(() =>
    Object.fromEntries(initialRecruiters.map(r => [r.id, { status: 'idle' as EmailStatus }]))
  );
  const [isSendingAll, setIsSendingAll] = useState(false);

  const BATCH_SIZE = 5;

  const updateRecruiterStatus = (id: string, status: EmailStatus, error?: string) => {
    setEmailStates(current => ({
      ...current,
      [id]: { status, error }
    }));
  };

  const resetAllStatuses = () => {
    setEmailStates(current =>
      Object.fromEntries(
        Object.keys(current).map(id => [id, { status: 'idle' }])
      )
    );
  };

  const sendEmailBatch = async (batch: Recruiter[]) => {
    const promises = batch.map(async (recruiter) => {
      try {
        updateRecruiterStatus(recruiter.id, 'loading');
        const response = await sendSingleEmail(recruiter.id, useAI);
        if (response.success) {
          updateRecruiterStatus(recruiter.id, 'success');
        } else {
          updateRecruiterStatus(recruiter.id, 'error', response.message);
        }
      } catch (error) {
        updateRecruiterStatus(recruiter.id, 'error', 'Failed to send email');
      }
    });

    await Promise.all(promises);
  };

  const handleSendAll = async () => {
    try {
      setIsSendingAll(true);
      resetAllStatuses();

      const pendingRecruiters = recruiters.filter(r => emailStates[r.id]?.status === 'idle');

      for (let i = 0; i < pendingRecruiters.length; i += BATCH_SIZE) {
        const batch = pendingRecruiters.slice(i, i + BATCH_SIZE);
        await sendEmailBatch(batch);
      }
    } catch (error) {
      console.error('Error sending all emails:', error);
    } finally {
      setIsSendingAll(false);
    }
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
              disabled={isAnySending}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                isAnySending
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
