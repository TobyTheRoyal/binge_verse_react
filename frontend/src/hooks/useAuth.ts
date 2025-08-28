import { useCallback, useState } from 'react';
import { apiFetch } from '../api/client';

interface Credentials {
  email: string;
  password: string;
}
interface RegisterCredentials extends Credentials {
  username: string;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('auth_token')
  );
  const [loggedIn, setLoggedIn] = useState<boolean>(!!token);

  const getToken = useCallback(() => token, [token]);
  const isLoggedIn = useCallback(() => loggedIn, [loggedIn]);

  const login = useCallback(async (creds: Credentials) => {
    const res = await apiFetch(
      `${process.env.REACT_APP_API_URL}/auth/login`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(creds) }
    );
    const data = await res.json();
    localStorage.setItem('auth_token', data.access_token);
    setToken(data.access_token);
    setLoggedIn(true);
  }, []);

  const register = useCallback(async (creds: RegisterCredentials) => {
    const res = await apiFetch(
      `${process.env.REACT_APP_API_URL}/auth/register`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(creds) }
    );
    const data = await res.json();
    localStorage.setItem('auth_token', data.access_token);
    setToken(data.access_token);
    setLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setLoggedIn(false);
  }, []);

  return { getToken, isLoggedIn, register, login, logout };
}
