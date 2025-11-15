import React from 'react';

export const PriceSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="animate-pulse flex space-x-4">
        <div className="flex-1 space-y-2 py-1">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
      <div className="animate-pulse h-64 w-full bg-gray-200 rounded-lg"></div>
    </div>
  );
};
