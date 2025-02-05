import { useQuery } from "@tanstack/react-query";
import { checkRecruiters } from "./services/api";
import EmailDashboard from "./components/email-dashboard";
import UploadRecruiters from "./components/upload-recruiters";


function App() {
  const { data , isLoading } = useQuery({
    queryKey: ['recruiters-check'],
    queryFn: checkRecruiters,
    staleTime: 1000 * 60 * 60,
  });

  const hasRecruiters = data && data.length > 0;

  return (
    <div className="full-screen bg-gray-100">
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : hasRecruiters ? (
        <div className="flex-1">
          <EmailDashboard />
        </div>
      ) : (
        <div className="flex-1 scrollable p-8">
          <div className="container mx-auto">
            <UploadRecruiters />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
