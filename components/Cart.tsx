import React, { useState } from 'react';
import { CartItem, Page } from '../App';
import { PlusIcon, MinusIcon, TrashIcon } from './icons';

interface CartProps {
  cartItems: CartItem[];
  onUpdateCart: (cartItemId: string, newQuantity: number) => void;
  onNavigate: (page: Page) => void;
  onConfirmOrder: (phoneNumber: string) => void;
}

export const Cart: React.FC<CartProps> = ({ cartItems, onUpdateCart, onNavigate, onConfirmOrder }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 25.00 : 0; // Example delivery fee
  const totalPrice = subtotal + deliveryFee;

  const isOrderValid = phoneNumber.trim().length >= 10 && consentChecked;

  const handleConfirm = () => {
    if (!isOrderValid) {
        alert("Por favor, ingresa un número de WhatsApp válido y acepta recibir notificaciones.");
        return;
    }
    onConfirmOrder(phoneNumber);
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <h1 className="text-2xl font-bold text-center mb-4">MI CARRITO</h1>
      
      {cartItems.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500">
          <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          <p className="text-lg font-semibold">Tu carrito está vacío</p>
          <p>¡Añade productos de tus restaurantes favoritos!</p>
          <button 
            onClick={() => onNavigate('restaurants')}
            className="mt-6 bg-orange-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-orange-600 transition-colors shadow-lg"
          >
            Ver Restaurantes
          </button>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto pr-2 space-y-3">
          {cartItems.map((cartItem) => {
            const originalIngredients = cartItem.product.ingredients?.map(i => i.name) || [];
            const customizedIngredients = cartItem.customizedIngredients.map(i => i.name);
            const removedIngredients = originalIngredients.filter(name => !customizedIngredients.includes(name));
            
            return (
              <div key={cartItem.id} className="flex items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex-grow">
                  <p className="font-bold">{cartItem.product.name}</p>
                   {removedIngredients.length > 0 && (
                      <p className="text-xs text-red-600 font-medium">Sin: {removedIngredients.join(', ')}</p>
                    )}
                  <p className="text-sm text-gray-600">${cartItem.product.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onUpdateCart(cartItem.id, cartItem.quantity - 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">
                    {cartItem.quantity === 1 ? <TrashIcon className="w-4 h-4 text-red-600" /> : <MinusIcon className="w-4 h-4 text-gray-700"/>}
                  </button>
                  <span className="font-bold w-6 text-center">{cartItem.quantity}</span>
                  <button onClick={() => onUpdateCart(cartItem.id, cartItem.quantity + 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">
                    <PlusIcon className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {cartItems.length > 0 && (
        <div className="border-t pt-4 mt-4 space-y-4 pb-20">
            <div className="space-y-1 text-gray-700 font-medium">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-xl font-bold border-t-2 border-dashed pt-3 mt-3">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
            </div>
             <input
                type="tel"
                placeholder="Tu número de WhatsApp"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full py-3 px-4 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
             />
             <div className="flex items-center gap-2">
                <input 
                    type="checkbox" 
                    id="whatsapp-consent" 
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="whatsapp-consent" className="text-xs text-gray-600">
                    Acepto recibir la confirmación de mi pedido por WhatsApp.
                </label>
             </div>
          <button
            onClick={handleConfirm}
            disabled={!isOrderValid}
            className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            FINALIZAR PEDIDO
          </button>
        </div>
      )}
    </div>
  );
};