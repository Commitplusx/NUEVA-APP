import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const UserRouteGuard: React.FC = () => {
  const { userRole } = useAppContext();

  if (userRole !== 'guest') {
    return <Outlet />;
  }

  return <Navigate to="/login" replace />;
};

export default UserRouteGuard;
