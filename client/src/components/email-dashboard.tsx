import { Switch } from "@headlessui/react";
import { useState } from "react";
import { Recruiter } from "../types";
import { RecruiterTable } from "./recruiters/recruiter-table";
import { AddRecruiterDialog } from "./recruiters/add-recruiter-dialog";

export default function EmailDashboard({recruiters} : {recruiters : Recruiter[]}) {
  const [useAI, setUseAI] = useState(false);
  const [isAddRecruiterOpen, setIsAddRecruiterOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Email Automation Dashboard
          </h1>
          <button
            onClick={() => setIsAddRecruiterOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Recruiter
          </button>
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

      <RecruiterTable recruiters={recruiters} globalAIEnabled={useAI} />

      <AddRecruiterDialog
        isOpen={isAddRecruiterOpen}
        onClose={() => setIsAddRecruiterOpen(false)}
      />
    </div>
  );
}
