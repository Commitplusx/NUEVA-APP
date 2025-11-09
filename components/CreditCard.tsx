import React from 'react';
import { WifiIcon } from './icons';

interface CreditCardProps {
    cardNumber: string;
    cardName: string;
    expiryDate: string;
}

const formatCardNumber = (num: string) => {
    return (num.replace(/\s/g, '').match(/.{1,4}/g) || []).join(' ');
};

export const CreditCard: React.FC<CreditCardProps> = ({ cardNumber, cardName, expiryDate }) => {
    return (
        <div className="w-full max-w-xs mx-auto mb-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-xl shadow-2xl p-5">
                <div className="flex justify-between items-start">
                    <div className="font-bold text-lg">Credit Card</div>
                    <WifiIcon className="w-6 h-6 transform rotate-90" />
                </div>
                <div className="mt-4 mb-6">
                    <div className="font-mono tracking-wider text-xl">
                        {formatCardNumber(cardNumber) || '#### #### #### ####'}
                    </div>
                </div>
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-xs font-light">Card Holder</div>
                        <div className="font-medium tracking-wide">{cardName.toUpperCase() || 'NOMBRE APELLIDO'}</div>
                    </div>
                    <div>
                        <div className="text-xs font-light">Expires</div>
                        <div className="font-medium">{expiryDate || 'MM/YY'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
