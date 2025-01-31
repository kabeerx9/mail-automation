import { useEffect, useState } from 'react';
import { getUserFromToken } from '../utils/token';
import { useNavigate } from 'react-router';
import ConfigDialog from '../components/ui/config-dialog';
import { saveConfiguration, SmtpConfig } from '../services/api';

interface User {
  name: string;
  has_configuration: boolean;
}

export default function Home() {
  const [userName, setUserName] = useState<string>('');
  const [hasConfig, setHasConfig] = useState<boolean>(false);
  const navigate = useNavigate();
  const [configDialogOpen, setConfigDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    const user = getUserFromToken() as User | null;
    if (user?.name) {
      setUserName(user.name);
    }
    if(user?.has_configuration){
      setHasConfig(true);
    }
  }, []);

  const handleConfigSubmit = async (formData: SmtpConfig) => {
    await saveConfiguration(formData);
    setConfigDialogOpen(false);
    setHasConfig(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome{userName ? `, ${userName}` : ''}! 👋
        </h1>
        <p className="text-xl text-gray-600">
          Let's start sending some amazing emails
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            About BulkMailer
          </h2>
          <button
            onClick={() => setConfigDialogOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <span>{hasConfig ? 'Update Configuration' : 'Add Configuration'}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        <div className="space-y-6 text-gray-600">
          <p>
            BulkMailer is your powerful email automation tool designed to streamline your email campaigns.
            With our platform, you can easily manage and send personalized emails to multiple recipients
            while maintaining a professional touch.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Key Features
              </h3>
              <ul className="space-y-2">
                <li>• Personalized email campaigns</li>
                <li>• Email template management</li>
                <li>• Campaign tracking and analytics</li>
                <li>• Secure and reliable delivery</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Getting Started
              </h3>
              <ul className="space-y-2">
                <li>• Create email templates</li>
                <li>• Import your contact list</li>
                <li>• Customize your campaign</li>
                <li>• Schedule and send</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={() => navigate('/main')}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <span>Let's Get Started</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <ConfigDialog
        isOpen={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        onSubmit={handleConfigSubmit}
      />
    </div>
  );
}
