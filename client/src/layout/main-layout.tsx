import { Outlet, Navigate } from 'react-router';
import MainNavbar from '../components/main-navbar';
import { authService } from '../services/auth';

export default function MainLayout() {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MainNavbar />
      <main className="flex-1 flex flex-col h-full">
        <div className="flex-1 px-4 sm:px-6 lg:px-8 h-full">
          <div className="h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
