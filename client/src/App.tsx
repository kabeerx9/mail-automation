import { useQuery } from "@tanstack/react-query";
import { checkRecruiters } from "./services/api";
import EmailDashboard from "./components/email-dashboard";
import RecruiterStatus from "./components/upload-recruiters";

function App() {
  const { data , isLoading } = useQuery({
    queryKey: ['recruiters-check'],
    queryFn: checkRecruiters
  });

  const hasRecruiters = data && data.length > 0;

  return (
    <div className="w-full h-full bg-gray-800">
      {isLoading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : hasRecruiters ? (
        <EmailDashboard />
      ) : (
        <div className="container mx-auto px-4 py-8">
          <RecruiterStatus />
        </div>
      )}
    </div>
  );
}

export default App;
