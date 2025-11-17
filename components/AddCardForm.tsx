import React, { useState } from 'react';
import { CreditCard } from './CreditCard';
import { XIcon } from './icons';

interface AddCardFormProps {
  onCancel: () => void;
  onSave: (newCard: { last4: string; expiry: string; type: string }) => void;
}

export const AddCardForm: React.FC<AddCardFormProps> = ({ onCancel, onSave }) => {
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');

    const formatCardNumber = (num: string) => {
        return (num.replace(/\s/g, '').match(/.{1,4}/g) || []).join(' ');
    };

    const formatExpiryDate = (date: string) => {
        if (date.length === 2 && !date.includes('/')) {
            return date + '/';
        }
        return date;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Aquí puedes agregar validación de la tarjeta si es necesario
        const newCard = {
            last4: cardNumber.slice(-4),
            expiry: expiryDate,
            type: 'Visa', // Puedes detectar el tipo de tarjeta basado en el número
        };
        onSave(newCard);
    };

    return (
        <div className="mt-6 p-4 bg-white rounded-xl shadow-lg">
            <CreditCard 
                cardNumber={cardNumber}
                cardName={cardName}
                expiryDate={expiryDate}
            />

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <input 
                        type="tel" 
                        maxLength={19}
                        value={formatCardNumber(cardNumber)}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
                        placeholder="Número de Tarjeta" 
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" 
                    />
                </div>
                <div className="mb-3">
                    <input 
                        type="text" 
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Nombre del Titular" 
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" 
                    />
                </div>
                <div className="flex gap-3 mb-4">
                    <div className="w-1/2">
                        <input 
                            type="text" 
                            maxLength={5}
                            value={formatExpiryDate(expiryDate)}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            placeholder="MM/AA" 
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" 
                        />
                    </div>
                    <div className="w-1/2">
                        <input 
                            type="password" 
                            maxLength={4}
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            placeholder="CVV" 
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" 
                        />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button type="submit" className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        Guardar Tarjeta
                    </button>
                    <button type="button" onClick={onCancel} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};
