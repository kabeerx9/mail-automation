import { useEffect, useState } from 'react';
import { getUserFromToken, JWTPayload } from '../utils/token';
import { useNavigate } from 'react-router';
import ConfigDialog from '../components/ui/config-dialog';
import { fetchConfiguration, SmtpConfig } from '../services/api';

export default function Home() {
  const [userName, setUserName] = useState<string>('');
  const [hasConfig, setHasConfig] = useState<boolean>(false);
  const navigate = useNavigate();
  const [configDialogOpen, setConfigDialogOpen] = useState<boolean>(false);
  const [existingConfig, setExistingConfig] = useState<SmtpConfig | null>(null);

  useEffect(() => {
    const user = getUserFromToken() as JWTPayload | null;
    if (user?.name) {
      setUserName(user.name);
    }
    if (user?.has_configured) {
      setHasConfig(true);
    }
  }, []);

  useEffect(() => {
    fetchConfiguration().then((config) => {
      if (config) {
        setExistingConfig(config);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 sm:px-6">
      <div className="max-w-5xl mx-auto pt-8 sm:pt-16 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Welcome to BulkMailer{userName ? `, ${userName}` : ''}! 👋
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your email outreach with our powerful automation platform
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-10 mb-8">
          {/* Configuration Button */}
          <div className="flex justify-end mb-8">
            <button
              onClick={() => setConfigDialogOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{hasConfig ? 'Update Configuration' : 'Setup Email Configuration'}</span>
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-blue-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
              <div className="text-blue-600 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bulk Email Sending</h3>
              <p className="text-gray-600">Send personalized emails to multiple recipients efficiently and reliably.</p>
            </div>

            <div className="bg-green-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
              <div className="text-green-600 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Setup</h3>
              <p className="text-gray-600">Quick and simple configuration process to get you started in minutes.</p>
            </div>

            <div className="bg-purple-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
              <div className="text-purple-600 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Customizable</h3>
              <p className="text-gray-600">Customize your email templates and settings to match your needs.</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <button
              onClick={() => navigate('/main')}
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span>Start Sending Emails</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <p className="mt-4 text-gray-500 text-sm">
              {hasConfig ? 'Your email configuration is ready!' : 'Configure your email settings to get started'}
            </p>
          </div>
        </div>
      </div>

      <ConfigDialog
        isOpen={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        existingConfig={existingConfig}
      />
    </div>
  );
}
