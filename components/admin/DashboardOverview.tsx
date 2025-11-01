import React from 'react';
import { useRestaurants } from '../../hooks/useRestaurants';
import { useAdminCategories } from '../../hooks/useAdminCategories';
import { useAdminTariffs } from '../../hooks/useAdminTariffs';
import { Spinner } from '../Spinner';
import { BuildingStorefrontIcon, TagIcon, CurrencyDollarIcon } from '../icons';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactElement;
  loading: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, loading }) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {loading ? (
        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded-md mt-1"></div>
      ) : (
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      )}
    </div>
    <div className="bg-orange-100 p-3 rounded-full">
      {React.cloneElement(icon, { className: 'w-6 h-6 text-orange-500' })}
    </div>
  </div>
);

export const DashboardOverview: React.FC = () => {
  const { restaurants, loading: restaurantsLoading } = useRestaurants();
  const { categories, loading: categoriesLoading } = useAdminCategories();
  const { tariffs, loading: tariffsLoading } = useAdminTariffs();

  const stats = [
    {
      title: 'Total Restaurantes',
      value: restaurants.length,
      icon: <BuildingStorefrontIcon />,
      loading: restaurantsLoading,
    },
    {
      title: 'Total Categorías',
      value: categories.length,
      icon: <TagIcon />,
      loading: categoriesLoading,
    },
    {
      title: 'Total Tarifas',
      value: tariffs.length,
      icon: <CurrencyDollarIcon />,
      loading: tariffsLoading,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map(stat => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
};
