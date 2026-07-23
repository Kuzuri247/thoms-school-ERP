import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { hasRole as checkRole, normalizeRole } from '../utils/roleUtils';

/**
 * ProtectedRoute Component for Strict Role-Based Access Control (RBAC)
 * @param {Object} props
 * @param {Array<string>} [props.allowedRoles] - List of allowed roles for this route
 * @param {React.ReactNode} [props.children] - Child elements to render if authorized
 */
const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user } = useAuthStore();

  if (!user || !normalizeRole(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !checkRole(user, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
