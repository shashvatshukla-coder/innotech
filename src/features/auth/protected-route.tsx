import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth-context';
import { UserRole } from '../../types';
import { ROUTES } from '../../constants/routes';
import { UnauthorizedPage } from './unauthorized-page';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, canAccessRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles && !canAccessRole(allowedRoles)) {
    return <UnauthorizedPage requiredRoles={allowedRoles} />;
  }

  return <>{children}</>;
};
