import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  id: string;
  email: string;
  name?: string;
  type: 'access' | 'refresh';
}

export const getUserFromToken = (): JWTPayload | null => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;

  try {
    return jwtDecode<JWTPayload>(token);
  } catch {
    return null;
  }
};
