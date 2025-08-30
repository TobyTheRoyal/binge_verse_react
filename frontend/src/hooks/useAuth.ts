import { useCallback, useState } from 'react';
import axiosClient from '../api/axiosClient';

interface Credentials {
  email: string;
  password: string;
}
interface RegisterCredentials extends Credentials {
  username: string;
}

interface AuthResponse {
  access_token?: string;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('auth_token')
  );
  const [loggedIn, setLoggedIn] = useState<boolean>(!!token);

  const getToken = useCallback(() => token, [token]);
  const isLoggedIn = useCallback(() => loggedIn, [loggedIn]);

  const login = useCallback(async (creds: Credentials) => {
    const { data } = await axiosClient.post<AuthResponse>(
      '/auth/login',
      creds
    );
    if (data.access_token) {
      localStorage.setItem('auth_token', data.access_token);
      setToken(data.access_token);
      setLoggedIn(true);
    }
  }, []);

  const register = useCallback(async (creds: RegisterCredentials) => {
    const { data } = await axiosClient.post<AuthResponse>(
      '/auth/register',
      creds
    );
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

  return { token, loggedIn, getToken, isLoggedIn, register, login, logout };
}
