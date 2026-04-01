import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { accessToken } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}
