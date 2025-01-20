import { Outlet, Navigate } from 'react-router';
import MainNavbar from '../components/MainNavbar';

interface JWTPayload {
  id: string;
  email: string;
  name?: string;
  exp: number;
}

export default function MainLayout() {
    console.log("MainLayout");
  const isAuthenticated = () => {
    console.log("inside isAuthenticated");
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      // Decode the JWT token
      const [, base64Payload] = token.split('.');
      const payload = JSON.parse(atob(base64Payload)) as JWTPayload;

      // Check if token has expired
      const currentTime = Date.now() / 1000; // Convert to seconds
      console.log(payload.exp, currentTime);
      console.log("difference", payload.exp - currentTime);
      if (payload.exp < currentTime) {
        localStorage.removeItem('token'); // Remove expired token
        return false;
      }

      return true;
    } catch {
      localStorage.removeItem('token'); // Remove invalid token
      return false;
    }
  };

  if (!isAuthenticated()) {
    console.log("MainLayout not authenticated");
    return <Navigate to="/auth/login" replace />;
  }
  console.log("MainLayout authenticated");

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
