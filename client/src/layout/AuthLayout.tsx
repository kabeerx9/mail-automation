import { Outlet, Navigate } from 'react-router';
import AuthNavbar from '../components/AuthNavbar';

interface JWTPayload {
  id: string;
  email: string;
  name?: string;
  exp: number;
}

export default function AuthLayout() {
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const [, base64Payload] = token.split('.');
      const payload = JSON.parse(atob(base64Payload)) as JWTPayload;

      const currentTime = Date.now() / 1000;
      console.log(payload.exp, currentTime);
      console.log("difference", payload.exp - currentTime);
      if (payload.exp < currentTime) {
        localStorage.removeItem('token');
        return false;
      }

      return true;
    } catch {
      localStorage.removeItem('token');
      return false;
    }
  };

  // If authenticated, redirect to home page
  if (isAuthenticated()) {
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
