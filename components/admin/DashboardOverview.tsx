import React from 'react';
import { useRestaurants } from '../../hooks/useRestaurants';
import { useAdminCategories } from '../../hooks/useAdminCategories';
import { useAdminTariffs } from '../../hooks/useAdminTariffs';
import { useMenuItems } from '../../hooks/useMenuItems'; // Import the new hook
import { Spinner } from '../Spinner';
import { BuildingStorefrontIcon, TagIcon, CurrencyDollarIcon, UtensilsIcon } from '../icons'; // Import UtensilsIcon
import { Link } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactElement;
  loading: boolean;
  to: string;
  iconBgClass?: string; // Optional prop for background color
  iconTextColorClass?: string; // Optional prop for text color
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, loading, to, iconBgClass = 'bg-orange-100', iconTextColorClass = 'text-orange-500' }) => (
  <Link to={to} className="block">
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between hover:shadow-lg transition-shadow duration-200 cursor-pointer">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {loading ? (
          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded-md mt-1"></div>
        ) : (
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        )}
      </div>
      <div className={`${iconBgClass} p-3 rounded-full`}>
        {React.cloneElement(icon, { className: `w-6 h-6 ${iconTextColorClass}` })}
      </div>
    </div>
  </Link>
);

export const DashboardOverview: React.FC = () => {
  const { restaurants, loading: restaurantsLoading } = useRestaurants();
  const { categories, loading: categoriesLoading } = useAdminCategories();
  const { tariffs, loading: tariffsLoading } = useAdminTariffs();
  const { menuItems, loading: menuItemsLoading } = useMenuItems(); // Use the new hook

  const stats = [
    {
      title: 'Total Restaurantes',
      value: restaurants.length,
      icon: <BuildingStorefrontIcon />,
      loading: restaurantsLoading,
      to: 'restaurants',
    },
    {
      title: 'Total Categorías',
      value: categories.length,
      icon: <TagIcon />,
      loading: categoriesLoading,
      to: 'categories',
    },
    {
      title: 'Total Tarifas',
      value: tariffs.length,
      icon: <CurrencyDollarIcon />,
      loading: tariffsLoading,
      to: 'tariffs',
    },
    {
      title: 'Total Productos',
      value: menuItems.length,
      icon: <UtensilsIcon />,
      loading: menuItemsLoading,
      to: 'menu-items', // Assuming a route for managing menu items
      iconBgClass: 'bg-blue-100',
      iconTextColorClass: 'text-blue-500',
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
