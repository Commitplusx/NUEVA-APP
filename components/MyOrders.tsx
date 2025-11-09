import React, { useState, useEffect } from 'react';
import { getOrders } from '../services/api';
import { Order } from '../types';
import { Spinner } from './Spinner';
import { AlertTriangleIcon } from './icons';

const OrderCard: React.FC<{ order: Order }> = ({ order }) => (
  <div className="bg-white p-4 rounded-lg shadow-md mb-4">
    <div className="flex justify-between items-center mb-2">
      <h3 className="font-bold text-lg">{order.restaurant.name}</h3>
      <span className="text-sm font-semibold text-gray-600">#{order.id}</span>
    </div>
    <div className="flex justify-between items-center mb-2">
      <span className={`text-sm font-bold ${order.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>
        {order.status}
      </span>
      <span className="text-lg font-bold text-orange-500">${order.total_price.toFixed(2)}</span>
    </div>
    <p className="text-sm text-gray-500 mb-4">{new Date(order.created_at).toLocaleDateString()}</p>
    <div className="space-y-2">
      {order.order_items.map(item => (
        <div key={item.id} className="flex items-center">
          <img src={item.menu_item.imageUrl} alt={item.menu_item.name} className="w-12 h-12 rounded-md object-cover mr-4" />
          <div>
            <p className="font-semibold">{item.menu_item.name}</p>
            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
          </div>
        </div>
      ))}
    </div>
    <div className="flex justify-end mt-4 space-x-2">
      {order.status === 'completed' ? (
        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">Rate</button>
      ) : (
        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">Cancel</button>
      )}
      <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm">
        {order.status === 'completed' ? 'Re-Order' : 'Track Order'}
      </button>
    </div>
  </div>
);

export const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ongoing' | 'history'>('ongoing');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const userOrders = await getOrders();
        setOrders(userOrders);
      } catch (err) {
        setError('Error fetching orders. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'ongoing') {
      return order.status === 'pending' || order.status === 'in_progress';
    }
    return order.status === 'completed' || order.status === 'cancelled';
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 col-span-1 py-10 bg-red-50 rounded-lg">
        <AlertTriangleIcon className="w-12 h-12 mx-auto mb-4 text-red-400" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Orders</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-center border-b mb-4">
        <button
          onClick={() => setActiveTab('ongoing')}
          className={`px-6 py-2 font-semibold ${activeTab === 'ongoing' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-500'}`}
        >
          Ongoing
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-2 font-semibold ${activeTab === 'history' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-500'}`}
        >
          History
        </button>
      </div>
      <div>
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => <OrderCard key={order.id} order={order} />)
        ) : (
          <p className="text-center text-gray-500">No orders in this category.</p>
        )}
      </div>
    </div>
  );
};
