import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Spinner } from './Spinner';

interface ProtectedRouteProps {
    children: React.ReactNode;
    role?: 'admin' | 'user'; // Optional role requirement
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
    const { user, userRole, isLoadingAuth } = useAppContext();
    const location = useLocation();

    if (isLoadingAuth) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <Spinner className="w-10 h-10 border-purple-600" />
            </div>
        );
    }

    if (!user) {
        // Redirect to login but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (role && userRole !== role) {
        // User is authenticated but doesn't have the required role
        // Redirect to home or show a 403 page. For now, home is safer.
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
