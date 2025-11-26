import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, BuildingStorefrontIcon, TagIcon, CurrencyDollarIcon } from '../icons';

export const QuickActions: React.FC = () => {
    const actions = [
        {
            label: 'Nuevo Restaurante',
            icon: <BuildingStorefrontIcon className="w-6 h-6" />,
            to: '/admin/restaurants?action=new', // We can handle query params in the target page
            color: 'bg-orange-500',
            hoverColor: 'hover:bg-orange-600'
        },
        {
            label: 'Nueva Categoría',
            icon: <TagIcon className="w-6 h-6" />,
            to: '/admin/categories?action=new',
            color: 'bg-blue-500',
            hoverColor: 'hover:bg-blue-600'
        },
        {
            label: 'Nueva Tarifa',
            icon: <CurrencyDollarIcon className="w-6 h-6" />,
            to: '/admin/tariffs?action=new',
            color: 'bg-green-500',
            hoverColor: 'hover:bg-green-600'
        }
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {actions.map((action) => (
                    <Link
                        key={action.label}
                        to={action.to}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl text-white transition-all transform hover:-translate-y-1 shadow-md hover:shadow-lg ${action.color} ${action.hoverColor}`}
                    >
                        <div className="mb-2 p-2 bg-white bg-opacity-20 rounded-lg">
                            {action.icon}
                        </div>
                        <span className="font-semibold text-sm text-center">{action.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};
