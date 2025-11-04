import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, UserCircleIcon, LocationIcon, InfoIcon, MailIcon } from './icons';
import { useAppContext } from '../context/AppContext';
import { useThemeColor } from '../hooks/useThemeColor';
import { OrderUserDetails } from '../types';

type CartStep = 'cart' | 'details' | 'confirmation';

const Stepper: React.FC<{ currentStep: CartStep }> = ({ currentStep }) => {
  const steps: CartStep[] = ['cart', 'details', 'confirmation'];
  const currentStepIndex = steps.indexOf(currentStep);

  const getStepName = (step: CartStep) => {
    if (step === 'cart') return 'Carrito';
    if (step === 'details') return 'Tus Datos';
    return 'Confirmar';
  }

  return (
    <div className="flex items-center w-full mb-8 px-2">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors duration-300 ${
                index <= currentStepIndex ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index < currentStepIndex ? <ChevronLeftIcon className="w-6 h-6 rotate-180" /> : index + 1}
            </div>
            <p
              className={`mt-2 text-xs font-bold transition-colors duration-300 ${
                index <= currentStepIndex ? 'text-orange-500' : 'text-gray-500'
              }`}
            >
              {getStepName(step)}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-auto border-t-2 transition-colors duration-300 mx-2 ${
              index < currentStepIndex ? 'border-orange-500' : 'border-gray-200'
            }`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export const Cart: React.FC = () => {
  useThemeColor('#f97316');
  const {
    cart: cartItems,
    handleUpdateCart,
    handleConfirmOrder,
    baseFee
  } = useAppContext();
  const navigate = useNavigate();
  const [step, setStep] = useState<CartStep>('cart');

  // State for user details form
  const [userDetails, setUserDetails] = useState<OrderUserDetails>({
    name: '',
    address: '',
    postalCode: '',
    neighborhood: '',
    phone: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({ ...prev, [name]: value }));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const restaurant = cartItems.length > 0 ? cartItems[0].restaurant : null;
  const deliveryFee = restaurant ? Math.max(restaurant.deliveryFee, baseFee) : 0;
  const total = subtotal + deliveryFee;

  const canProceedToDetails = cartItems.length > 0;
  const canProceedToConfirmation = 
    userDetails.name.trim() !== '' &&
    userDetails.address.trim() !== '' &&
    userDetails.phone.trim().length >= 10;

  const handleFinalOrderConfirmation = () => {
    if (!canProceedToConfirmation) {
      alert('Por favor, completa todos los campos requeridos.');
      return;
    }
    handleConfirmOrder(userDetails);
    setStep('cart'); // Reset to cart view after order
  };

  const renderCartStep = () => (
    <div>
      <div className="space-y-4 mb-6">
        {cartItems.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
            <img src={item.product.imageUrl} alt={item.product.name} className="w-20 h-20 rounded-md object-cover" />
            <div className="flex-grow">
              <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
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
          <span className="font-semibold">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Envío</span>
          <span className="font-semibold">${deliveryFee.toFixed(2)}</span>
        </div>
        <hr className="my-3" />
        <div className="flex justify-between items-center font-bold text-xl">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <button 
        onClick={() => setStep('details')}
        disabled={!canProceedToDetails}
        className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg shadow-md hover:bg-orange-600 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Continuar a la Entrega
      </button>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg space-y-6">
      <h3 className="font-bold text-lg text-gray-800">Datos de Entrega</h3>
      <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
          <div className="relative flex items-center">
              <UserCircleIcon className="absolute left-3 w-5 h-5 text-gray-400" />
              <input type="text" name="name" id="name" value={userDetails.name} onChange={handleInputChange} className="w-full py-3 pl-10 pr-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Tu nombre" />
          </div>
      </div>
      <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
          <div className="relative flex items-center">
              <LocationIcon className="absolute left-3 w-5 h-5 text-gray-400" />
              <input type="text" name="address" id="address" value={userDetails.address} onChange={handleInputChange} className="w-full py-3 pl-10 pr-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Calle y número" />
          </div>
      </div>
      <div>
          <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">Barrio / Colonia</label>
          <input type="text" name="neighborhood" id="neighborhood" value={userDetails.neighborhood} onChange={handleInputChange} className="w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Tu barrio o colonia" />
      </div>
      <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
          <input type="text" name="postalCode" id="postalCode" value={userDetails.postalCode} onChange={handleInputChange} className="w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Tu código postal" />
      </div>
      <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono de Contacto *</label>
          <div className="relative flex items-center">
              <MailIcon className="absolute left-3 w-5 h-5 text-gray-400" />
              <input type="tel" name="phone" id="phone" value={userDetails.phone} onChange={handleInputChange} className="w-full py-3 pl-10 pr-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Tu número de WhatsApp" />
          </div>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4">
        <button onClick={() => setStep('cart')} className="bg-gray-200 text-gray-800 font-bold py-3 rounded-lg">Volver</button>
        <button onClick={() => setStep('confirmation')} disabled={!canProceedToConfirmation} className="bg-orange-500 text-white font-bold py-3 rounded-lg disabled:bg-gray-400">Revisar Pedido</button>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg space-y-4">
        <h3 className="font-bold text-lg text-gray-800">Resumen del Pedido</h3>
        <div className="text-sm">
            <p><strong>Nombre:</strong> {userDetails.name}</p>
            <p><strong>Dirección:</strong> {userDetails.address}, {userDetails.neighborhood}, {userDetails.postalCode}</p>
            <p><strong>Teléfono:</strong> {userDetails.phone}</p>
        </div>
        <hr/>
        <div>
            <div className="flex justify-between items-center"><p>Subtotal:</p> <p>${subtotal.toFixed(2)}</p></div>
            <div className="flex justify-between items-center"><p>Envío:</p> <p>${deliveryFee.toFixed(2)}</p></div>
            <div className="flex justify-between items-center font-bold text-lg mt-2"><p>Total:</p> <p>${total.toFixed(2)}</p></div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4">
            <button onClick={() => setStep('details')} className="bg-gray-200 text-gray-800 font-bold py-3 rounded-lg">Volver</button>
            <button onClick={handleFinalOrderConfirmation} className="bg-green-500 text-white font-bold py-3 rounded-lg">Confirmar Pedido</button>
        </div>
    </div>
  );

  return (
    <div className="p-4 bg-gray-50 min-h-full">
      <div className="flex items-center gap-4 mb-6">
        {step === 'cart' && (
            <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white shadow-sm">
                <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
            </button>
        )}
        <h1 className="text-xl font-bold text-gray-800">{step === 'cart' ? 'Mi Carrito' : 'Checkout'}</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-20">
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
            <Stepper currentStep={step} />
            {step === 'cart' && renderCartStep()}
            {step === 'details' && renderDetailsStep()}
            {step === 'confirmation' && renderConfirmationStep()}
        </div>
      )}
    </div>
  );
};


