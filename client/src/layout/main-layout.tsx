import { Outlet, Navigate } from 'react-router';
import MainNavbar from '../components/main-navbar';
import { authService } from '../services/auth';

export default function MainLayout() {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="full-screen bg-gray-50">
      <MainNavbar />
      <main className="page-container">
        <div className="flex-1 scrollable">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
