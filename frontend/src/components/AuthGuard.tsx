import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AuthGuardProps {
  children: JSX.Element;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isLoggedIn } = useAuth();

  return isLoggedIn() ? children : <Navigate to="/auth/login" replace />;
};

export default AuthGuard;