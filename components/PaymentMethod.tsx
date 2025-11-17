import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeftIcon, XIcon, PlusIcon } from './icons';
import { AddCardForm } from './AddCardForm';

interface PaymentMethodProps {
  onBack: () => void;
}

const PaymentOptionCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onClick: () => void;
}> = ({ icon, label, selected, onClick }) => (
  <motion.button
    onClick={onClick}
    className={`payment-option-card ${selected ? 'payment-option-selected' : ''}`}
    whileTap={{ scale: 0.95 }}
    whileHover={{ scale: 1.05, y: -3 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
  >
    <div className="payment-icon-wrapper">
      {icon}
    </div>
    <p className="payment-label">{label}</p>
    {selected && (
      <div className="payment-checkmark">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="black" />
          <path
            d="M8 12l2 2 4-4"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    )}
  </motion.button>
);

const AddNewPaymentCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <motion.button
        onClick={onClick}
        className="add-new-card"
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05, y: -3 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2, delay: 0.2 }}
    >
        <div className="add-new-icon-wrapper">
            <PlusIcon className="w-6 h-6 text-black" />
        </div>
        <p className="add-new-label">AÑADIR NUEVA</p>
    </motion.button>
);


const CashIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <path
      d="M24 20c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
      fill="currentColor"
    />
    <path
      d="M30 18H18c-2.21 0-4 1.79-4 4v4c0 2.21 1.79 4 4 4h12c2.21 0 4-1.79 4-4v-4c0-2.21-1.79-4-4-4zm2 8c0 1.1-.9 2-2 2H18c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v4z"
      fill="currentColor"
    />
  </svg>
);

const VisaIcon = () => (
  <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
    <path
      d="M23.5 5.5l-4.5 9h-3l-2.2-6.5c-.1-.4-.3-.6-.6-.7-.6-.3-1.6-.6-2.5-.8l.1-.5h4.3c.6 0 1 .4 1.1 1l1 5.3 2.5-6.3h2.8zm11.1 6c0-2.4-3.3-2.5-3.3-3.6 0-.3.3-.6 1-.7.3 0 1.2-.1 2.2.4l.4-1.8c-.5-.2-1.2-.4-2.1-.4-2.2 0-3.8 1.2-3.8 2.8 0 1.2 1.1 1.9 1.9 2.3.9.4 1.2.7 1.2 1.1 0 .6-.7.9-1.4.9-1.2 0-1.8-.3-2.3-.5l-.4 1.9c.5.2 1.5.4 2.5.4 2.4 0 4-1.2 4-3zm5.9 3h2.5l-2.2-9h-2.3c-.5 0-1 .3-1.1.8l-4 8.2h2.4l.5-1.3h3l.2 1.3zm-2.6-3.1l1.2-3.4.7 3.4h-1.9zm-11-5.9l-1.9 9h-2.3l1.9-9h2.3z"
      fill="#1434CB"
    />
  </svg>
);

const MastercardIcon = () => (
  <svg width="48" height="30" viewBox="0 0 48 30" fill="none">
    <circle cx="18" cy="15" r="12" fill="#EB001B" />
    <circle cx="30" cy="15" r="12" fill="#F79E1B" />
    <path
      d="M24 6.6c-2.4 2-3.9 5.1-3.9 8.4s1.5 6.4 3.9 8.4c2.4-2 3.9-5.1 3.9-8.4s-1.5-6.4-3.9-8.4z"
      fill="#FF5F00"
    />
  </svg>
);

const PayPalIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <path
      d="M35.5 12.2c-.4 2.5-2.3 4.8-5.3 4.8h-4.5l-1.2 7.5h-3.8l3.2-19.5h7.2c3.9 0 5.8 2.2 4.4 7.2zm-8.3 8.3h2.6c1.8 0 3.2-1.4 3.5-3.2.4-2.2-.7-3.2-2.5-3.2h-2.6l-1 6.4z"
      fill="#003087"
    />
    <path
      d="M20.5 27.5h-3.8l2.2-13.5h3.8l-2.2 13.5zm-6.8-13.5l-3.2 9.2-.4-1.8c-.6-1.8-2.4-3.8-4.5-4.8l3.4 11.4h4l5.9-14h-4.2z"
      fill="#009CDE"
    />
  </svg>
);

export const PaymentMethod: React.FC<PaymentMethodProps> = ({ onBack }) => {
  const [selectedPayment, setSelectedPayment] = useState<'cash' | 'visa' | 'mastercard' | 'paypal'>('mastercard');
  const [isAddingCard, setIsAddingCard] = useState(false);

  const handleSaveCard = (newCard: { last4: string; expiry: string; type: string }) => {
    console.log('Nueva tarjeta guardada:', newCard);
    // Aquí puedes agregar la lógica para guardar la tarjeta en tu estado o backend
    setIsAddingCard(false);
  };

  return (
    <div className={`payment-method-container ${isAddingCard ? 'overflow-hidden' : ''}`}>
      <style>{`
        .payment-method-container {
          min-height: 100vh;
          background: #F8F9FA;
          padding-bottom: 100px;
        }

        .payment-header {
          display: flex;
          align-items: center;
          padding: 16px;
          background: white;
          gap: 16px;
        }

        .payment-back-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #F1F3F5;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .payment-back-btn:hover {
          background: #E9ECEF;
        }

        .payment-title {
          font-size: 24px;
          font-weight: 600;
          color: #2B3139;
          margin: 0;
        }

        .payment-options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
          padding: 20px 16px;
        }

        .payment-option-card {
          position: relative;
          background: white;
          border-radius: 16px;
          padding: 16px;
          border: 2px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
          color: #4b5563;
        }

        .payment-option-card:hover {
          border-color: #d1d5db;
        }

        .payment-option-selected {
          border-color: #000;
          background: #f9fafb;
          color: #000;
        }

        .payment-icon-wrapper {
          width: 56px;
          height: 56px;
          background: #F8F9FA;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .payment-option-selected .payment-icon-wrapper {
          background: white;
        }

        .payment-label {
          font-size: 14px;
          font-weight: 500;
          color: #2B3139;
          margin: 0;
        }

        .payment-checkmark {
          position: absolute;
          top: 8px;
          right: 8px;
        }

        .card-section {
          margin: 0 16px 24px;
          background: white;
          border-radius: 20px;
          padding: 24px;
        }

        .card-visual {
          width: 100%;
          max-width: 340px;
          height: 200px;
          margin: 0 auto 24px;
          background: linear-gradient(135deg, #3a3a3a 0%, #1c1c1c 100%);
          border-radius: 16px;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .mastercard-logo {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 1;
        }

        .card-chip {
          width: 50px;
          height: 40px;
          background: linear-gradient(135deg, #d4af37 0%, #c09b2d 100%);
          border-radius: 6px;
          position: relative;
          z-index: 1;
        }

        .card-info {
          position: relative;
          z-index: 1;
        }

        .card-number {
          font-family: 'Courier New', monospace;
          font-size: 18px;
          font-weight: 600;
          color: white;
          letter-spacing: 2px;
          margin-bottom: 16px;
        }

        .card-bottom {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .card-holder,
        .card-expiry {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .card-label {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .card-value {
          font-size: 14px;
          color: white;
          font-weight: 500;
        }

        .no-card-message {
          text-align: center;
        }

        .no-card-title {
          font-size: 20px;
          font-weight: 600;
          color: #2B3139;
          margin: 0 0 8px;
        }

        .no-card-subtitle {
          font-size: 14px;
          color: #868E96;
          margin: 0;
          line-height: 1.5;
        }

        .add-new-card {
            background: white;
            border: 2px dashed #d1d5db;
            border-radius: 16px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .add-new-card:hover {
            border-color: #000;
            background: #f9fafb;
        }
        .add-new-icon-wrapper {
            width: 56px;
            height: 56px;
            background: #F8F9FA;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .add-new-label {
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
            margin: 0;
        }
      `}</style>

      <div className="payment-header">
        <button onClick={onBack} className="payment-back-btn">
          <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="payment-title">Métodos de Pago</h1>
      </div>

      <AnimatePresence>
        <div className="payment-options-grid">
            <PaymentOptionCard
              icon={<CashIcon />}
              label="Efectivo"
              selected={selectedPayment === 'cash'}
              onClick={() => setSelectedPayment('cash')}
            />
            <PaymentOptionCard
              icon={<VisaIcon />}
              label="Visa"
              selected={selectedPayment === 'visa'}
              onClick={() => setSelectedPayment('visa')}
            />
            <PaymentOptionCard
              icon={<MastercardIcon />}
              label="Mastercard"
              selected={selectedPayment === 'mastercard'}
              onClick={() => setSelectedPayment('mastercard')}
            />
            <PaymentOptionCard
              icon={<PayPalIcon />}
              label="PayPal"
              selected={selectedPayment === 'paypal'}
              onClick={() => setSelectedPayment('paypal')}
            />
            <AddNewPaymentCard onClick={() => setIsAddingCard(true)} />
        </div>
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
        className="card-section"
      >
        <div className="card-visual">
          <div className="mastercard-logo">
            <MastercardIcon />
          </div>
          <div className="card-chip" />
          <div className="card-info">
            <div className="card-number">•••• •••• •••• ••••</div>
            <div className="card-bottom">
              <div className="card-holder">
                <span className="card-label">Titular de la Tarjeta</span>
                <span className="card-value">Añadir Tarjeta</span>
              </div>
              <div className="card-expiry">
                <span className="card-label">Expira</span>
                <span className="card-value">MM/AA</span>
              </div>
            </div>
          </div>
        </div>

        <div className="no-card-message">
          <h3 className="no-card-title">No has añadido ninguna tarjeta</h3>
          <p className="no-card-subtitle">
            Puedes añadir una tarjeta y<br />guardarla para después
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {isAddingCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ y: "100vh" }}
              animate={{ y: 0 }}
              exit={{ y: "100vh" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-md bg-gray-100 rounded-t-2xl"
            >
              <AddCardForm
                onCancel={() => setIsAddingCard(false)}
                onSave={handleSaveCard}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
