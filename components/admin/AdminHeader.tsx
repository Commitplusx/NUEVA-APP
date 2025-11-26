import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { SearchIcon, SlidersIcon, GridIcon } from '../icons';

export const AdminHeader: React.FC = () => {
    const { profile } = useAppContext();

    return (
        <div className="bg-white pt-4 pb-6 px-4 mb-6 rounded-b-[2rem] shadow-sm">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-6">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-100 shadow-sm">
                    <img
                        src={profile?.avatar || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop"}
                        alt="Admin User"
                        className="w-full h-full object-cover"
                    />
                </div>
                <button className="p-2 text-purple-600 bg-purple-50 rounded-full hover:bg-purple-100 transition-colors">
                    <GridIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Title */}
            <div className="mb-6">
                <h1 className="text-3xl text-gray-500 font-light">Admin</h1>
                <h1 className="text-3xl font-extrabold text-purple-900">Dashboard!</h1>
            </div>

            {/* Search Bar */}
            <div className="flex gap-3">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder="Buscar en admin..."
                        className="w-full py-4 pl-12 pr-4 bg-gray-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-600 placeholder-gray-400 text-base transition-all"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <SearchIcon className="w-6 h-6" />
                    </div>
                </div>
                <button className="p-4 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-200 active:scale-95 transition-all flex-shrink-0 hover:bg-purple-700">
                    <SlidersIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};
