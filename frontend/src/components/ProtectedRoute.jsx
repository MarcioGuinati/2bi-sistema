import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role, requiredFeature }) => {
  const { signed, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!signed) {
    return <Navigate to="/login" />;
  }

  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(user.role)) {
      return <Navigate to="/" />;
    }
  }

  if (requiredFeature && user.role === 'client') {
    if (!user[requiredFeature]) {
      return <Navigate to="/dashboard" />;
    }
  }

  return children;
};

export default ProtectedRoute;
