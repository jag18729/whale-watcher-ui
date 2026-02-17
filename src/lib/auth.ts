import { createContext, useContext } from 'react';

export interface User {
  id: string;
  email: string;
  role?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export function getStoredAuth(): { user: User | null; token: string | null } {
  try {
    const token = localStorage.getItem('ww_token');
    const userStr = localStorage.getItem('ww_user');
    const user = userStr ? JSON.parse(userStr) : null;
    return { user, token };
  } catch {
    return { user: null, token: null };
  }
}

export function storeAuth(user: User, token: string) {
  localStorage.setItem('ww_token', token);
  localStorage.setItem('ww_user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('ww_token');
  localStorage.removeItem('ww_user');
}
