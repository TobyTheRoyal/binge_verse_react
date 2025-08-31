import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AuthGuardProps {
  children: JSX.Element;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { loggedIn } = useAuth();

  return loggedIn ? children : <Navigate to="/auth/login" replace />;
};

export default AuthGuard;