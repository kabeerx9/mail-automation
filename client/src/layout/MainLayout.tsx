import { Outlet, Navigate } from 'react-router';
import MainNavbar from '../components/MainNavbar';
import { authService } from '../services/auth';

export default function MainLayout() {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MainNavbar />
      <main className="flex-1 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
