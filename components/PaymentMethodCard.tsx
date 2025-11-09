import React from 'react';
import { TrashIcon } from './icons';

export const PaymentMethodCard: React.FC<{ card: { type: string; last4: string; expiry: string; } }> = ({ card }) => (
  <div className="bg-white p-4 rounded-xl shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-transform transform hover:scale-105">
    <div className="flex items-center">
      <img src={`/credit-card-icons/${card.type.toLowerCase()}.svg`} alt={card.type} className="w-10 h-auto mr-4" />
      <div>
        <p className="font-semibold text-gray-800">{card.type} **** {card.last4}</p>
        <p className="text-sm text-gray-500">Expira: {card.expiry}</p>
      </div>
    </div>
    <button className="text-gray-400 hover:text-red-500 transition-colors self-end sm:self-center">
      <TrashIcon className="w-5 h-5" />
    </button>
  </div>
);
