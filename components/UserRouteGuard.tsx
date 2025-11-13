import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Spinner } from './Spinner';

const UserRouteGuard: React.FC = () => {
  const { userRole, isLoadingAuth } = useAppContext();

  if (isLoadingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (userRole !== 'guest') {
    return <Outlet />;
  }

  return <Navigate to="/login" replace />;
};

export default UserRouteGuard;
