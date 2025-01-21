import { Outlet, Navigate } from 'react-router';
import AuthNavbar from '../components/AuthNavbar';
import { authService } from '../services/auth';

export default function AuthLayout() {
  // If authenticated, redirect to home page
  if (authService.isAuthenticated()) {
    return <Navigate to="/main" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AuthNavbar />
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
