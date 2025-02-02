import { jwtDecode } from 'jwt-decode';

export interface JWTPayload {
  id: string;
  email: string;
  name?: string;
  type: 'access' | 'refresh';
  has_configured : boolean;
}

export const getUserFromToken = (): JWTPayload | null => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;

  try {
    const decoded = jwtDecode<JWTPayload>(token);
    console.log({decoded})
    return decoded;
  } catch {
    return null;
  }
};
