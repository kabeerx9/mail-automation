import { useEffect, useState } from 'react';
import { getUserFromToken } from '../utils/token';
import { useNavigate } from 'react-router';

export default function Home() {
  const [userName, setUserName] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = getUserFromToken();
    console.log(user);
    if (user?.name) {
      setUserName(user.name);
    }
  }, []);

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
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          About BulkMailer
        </h2>

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
    </div>
  );
}
