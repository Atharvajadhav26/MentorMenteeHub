import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Loader } from './UIComponents';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Loader />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Force password change lock
  if (user.requirePasswordChange) {
    return <Navigate to="/change-password" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />; // Redirect to login if unauthorized
  }

  return <Outlet />;
};

export default ProtectedRoute;
