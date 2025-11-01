import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, CartIcon } from './icons';
import { useAppContext } from '../context/AppContext';

const Cart: React.FC = () => {
  const { cart: cartItems, handleUpdateCart, handleConfirmOrder } = useAppContext();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handlePhoneSubmit = () => {
    if (phoneNumber.trim().length >= 10) {
      handleConfirmOrder(phoneNumber.trim());
    } else {
      alert('Por favor, introduce un número de teléfono válido.');
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-full">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white shadow-sm">
          <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Mi Carrito</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          {/* <CartIcon className="w-16 h-16 mx-auto text-gray-300" /> */}
          <p className="mt-4 text-gray-500">Tu carrito está vacío.</p>
          <button 
            onClick={() => navigate('/restaurants')} 
            className="mt-6 px-6 py-2 bg-orange-500 text-white font-semibold rounded-full shadow-md hover:bg-orange-600 transition-all"
          >
            Ver Restaurantes
          </button>
        </div>
      ) : (
        <div>
          <div className="space-y-4 mb-6">
            {cartItems.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
                <img src={item.product.imageUrl} alt={item.product.name} className="w-20 h-20 rounded-md object-cover" />
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
                  {item.customizedIngredients && item.customizedIngredients.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      Ingredientes: {item.customizedIngredients.map(ing => ing.name).join(', ')}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">${item.product.price.toFixed(2)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => handleUpdateCart(item.id, item.quantity - 1)} className="w-7 h-7 bg-gray-200 rounded-full font-bold">-</button>
                    <span className="font-bold w-6 text-center">{item.quantity}</span>
                    <button onClick={() => handleUpdateCart(item.id, item.quantity + 1)} className="w-7 h-7 bg-gray-200 rounded-full font-bold">+</button>
                  </div>
                </div>
                <p className="font-bold text-lg">${(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Envío</span>
              <span className="font-semibold">$25.00</span>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between items-center font-bold text-xl">
              <span>Total</span>
              <span>${(total + 25).toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-2">Confirmación por WhatsApp</h3>
            <p className="text-sm text-gray-500 mb-3">Te enviaremos un mensaje para confirmar tu pedido.</p>
            <input 
              type="tel" 
              placeholder="Tu número de teléfono"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button 
              onClick={handlePhoneSubmit}
              className="w-full py-3 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 transition-all"
            >
              Confirmar Pedido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export { Cart };