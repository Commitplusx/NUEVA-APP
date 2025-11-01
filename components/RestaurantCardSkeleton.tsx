import React from 'react';

export const RestaurantCardSkeleton: React.FC = () => (
  <div className="w-full text-left bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
    <div className="w-full h-40 bg-gray-200 animate-pulse" />
    <div className="p-4">
      <div className="h-6 w-3/4 mb-2 bg-gray-200 animate-pulse rounded" />
      <div className="h-4 w-1/2 mb-4 bg-gray-200 animate-pulse rounded" />
      <div className="flex items-center gap-4">
        <div className="h-4 w-10 bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-12 bg-gray-200 animate-pulse rounded" />
      </div>
    </div>
  </div>
);
