import { useState, useEffect } from 'react';
import { StatusPanel } from './components/StatusPanel';
import { RecruiterTable } from './components/RecruiterTable';
import { fetchRecruiters } from './services/api';
import { Recruiter } from './types';

function App() {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await fetchRecruiters();
      console.log("data", data);
      setRecruiters(data);
      setError(null);
    } catch (err) {
      setError('Failed to load recruiter data');
      console.error('Error:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Email Automation Dashboard</h1>
        </header>

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        ) : (
          <>
            <StatusPanel recruiters={recruiters} onRefresh={loadData} />
            <RecruiterTable recruiters={recruiters} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
