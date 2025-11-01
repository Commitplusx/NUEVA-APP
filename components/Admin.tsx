import React from 'react';
import { Outlet } from 'react-router-dom';

const Admin: React.FC = () => {
  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <Outlet />
    </div>
  );
};

export { Admin };
