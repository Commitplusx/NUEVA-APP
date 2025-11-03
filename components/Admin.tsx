import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Admin: React.FC = () => {
  const { userRole } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/login');
    }
  }, [userRole, navigate]);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {userRole === 'admin' ? <Outlet /> : <p>Acceso denegado. Redirigiendo...</p>}
    </div>
  );
};

export { Admin };