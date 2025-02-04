import { useState, useEffect } from "react";
import { Switch } from "@headlessui/react";
import { StatusPanel } from "./components/StatusPanel";
import { RecruiterTable } from "./components/RecruiterTable";
import { fetchRecruiters } from "./services/api";
import { Recruiter } from "./types";

function App() {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(() => {
    const saved = localStorage.getItem("useAI");
    return saved ? JSON.parse(saved) : false;
  });

  const loadData = async () => {
    try {
      const data = await fetchRecruiters();
      setRecruiters(data);
      setError(null);
    } catch (err) {
      setError("Failed to load recruiter data");
      console.error("Error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem("useAI", JSON.stringify(useAI));
  }, [useAI]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Email Automation Dashboard
          </h1>
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

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        ) : (
          <>
            <StatusPanel
              recruiters={recruiters}
              onRefresh={loadData}
              useAI={useAI}
            />
            <RecruiterTable recruiters={recruiters} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
