import React, { createContext, useCallback, useContext, useState } from 'react';
import axiosClient from '../api/axiosClient';

interface Credentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends Credentials {
  username: string;
}

interface AuthContextType {
  token: string | null;
  loggedIn: boolean;
  login: (creds: Credentials) => Promise<void>;
  register: (creds: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [loggedIn, setLoggedIn] = useState<boolean>(!!token);

  const login = useCallback(async (creds: Credentials) => {
    const { data } = await axiosClient.post<{ access_token?: string }>('/auth/login', creds);
    if (data.access_token) {
      localStorage.setItem('auth_token', data.access_token);
      setToken(data.access_token);
      setLoggedIn(true);
    }
  }, []);

  const register = useCallback(async (creds: RegisterCredentials) => {
    const { data } = await axiosClient.post<{ access_token?: string }>('/auth/register', creds);
    if (data.access_token) {
      localStorage.setItem('auth_token', data.access_token);
      setToken(data.access_token);
      setLoggedIn(true);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setLoggedIn(false);
  }, []);

  const value: AuthContextType = {
    token,
    loggedIn,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;