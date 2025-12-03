import React from 'react';
import { Link } from 'react-router-dom';
import { useRestaurants } from '../../hooks/useRestaurants';
import { useAdminCategories } from '../../hooks/useAdminCategories';
import { useAdminTariffs } from '../../hooks/useAdminTariffs';
import { useMenuItems } from '../../hooks/useMenuItems';
import { useServiceRequests } from '../../hooks/useServiceRequests';
import { BuildingStorefrontIcon, TagIcon, CurrencyDollarIcon, UtensilsIcon, DocumentTextIcon, ArrowRightIcon } from '../icons';
import { RecentActivity } from './RecentActivity';
import { QuickActions } from './QuickActions';
import { AdminHeader } from './AdminHeader';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactElement;
  loading: boolean;
  to: string;
  gradientFrom: string;
  gradientTo: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, loading, to, gradientFrom, gradientTo, iconColor }) => (
  <Link to={to} className="block group">
    <div className={`relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>

      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
          {loading ? (
            <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-md"></div>
          ) : (
            <h3 className="text-4xl font-extrabold text-gray-800 tracking-tight">{value}</h3>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} shadow-lg text-white`}>
          {React.cloneElement(icon, { className: "w-6 h-6" })}
        </div>
      </div>

      <div className="mt-4 flex items-center text-sm font-medium text-gray-400 group-hover:text-purple-600 transition-colors">
        <span>Gestionar</span>
        <ArrowRightIcon className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </Link>
);

export const DashboardOverview: React.FC = () => {
  const { restaurants, loading: restaurantsLoading } = useRestaurants();
  const { categories, loading: categoriesLoading } = useAdminCategories();
  const { tariffs, loading: tariffsLoading } = useAdminTariffs();
  const { menuItems, loading: menuItemsLoading } = useMenuItems();
  const { requests, loading: requestsLoading } = useServiceRequests();

  const stats = [
    {
      title: 'Restaurantes',
      value: restaurants.length,
      icon: <BuildingStorefrontIcon />,
      loading: restaurantsLoading,
      to: '/admin/restaurants',
      gradientFrom: 'from-purple-600',
      gradientTo: 'to-indigo-600',
      iconColor: 'text-white'
    },
    {
      title: 'Categorías',
      value: categories.length,
      icon: <TagIcon />,
      loading: categoriesLoading,
      to: '/admin/categories',
      gradientFrom: 'from-fuchsia-500',
      gradientTo: 'to-purple-600',
      iconColor: 'text-white'
    },
    {
      title: 'Tarifas',
      value: tariffs.length,
      icon: <CurrencyDollarIcon />,
      loading: tariffsLoading,
      to: '/admin/tariffs',
      gradientFrom: 'from-violet-500',
      gradientTo: 'to-purple-700',
      iconColor: 'text-white'
    },
    {
      title: 'Productos',
      value: menuItems.length,
      icon: <UtensilsIcon />,
      loading: menuItemsLoading,
      to: '/admin/restaurants',
      gradientFrom: 'from-purple-400',
      gradientTo: 'to-purple-500',
      iconColor: 'text-white'
    },
    {
      title: 'Solicitudes',
      value: requests.length,
      icon: <DocumentTextIcon />,
      loading: requestsLoading,
      to: '/admin/requests',
      gradientFrom: 'from-slate-700',
      gradientTo: 'to-slate-900',
      iconColor: 'text-white'
    },
    {
      title: 'Banners',
      value: 'Gestión',
      icon: <TagIcon />, // Reusing TagIcon or similar if Image icon not available in imports
      loading: false,
      to: '/admin/banners',
      gradientFrom: 'from-pink-500',
      gradientTo: 'to-rose-500',
      iconColor: 'text-white'
    }
  ];

  return (
    <div className="space-y-8 pb-20">
      <AdminHeader />

      <div className="px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stats.map(stat => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
};
