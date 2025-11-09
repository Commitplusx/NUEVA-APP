import React, { useState } from 'react';
import { ChevronLeftIcon } from './icons';

interface PaymentMethodProps {
  onBack: () => void;
}

const PaymentOptionCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onClick: () => void;
}> = ({ icon, label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`payment-option-card ${selected ? 'payment-option-selected' : ''}`}
  >
    <div className="payment-icon-wrapper">
      {icon}
    </div>
    <p className="payment-label">{label}</p>
    {selected && (
      <div className="payment-checkmark">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#FF6B35" />
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
  </button>
);

const CashIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <path
      d="M24 20c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
      fill="#FF6B35"
    />
    <path
      d="M30 18H18c-2.21 0-4 1.79-4 4v4c0 2.21 1.79 4 4 4h12c2.21 0 4-1.79 4-4v-4c0-2.21-1.79-4-4-4zm2 8c0 1.1-.9 2-2 2H18c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v4z"
      fill="#FF6B35"
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

  return (
    <div className="payment-method-container">
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
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          padding: 20px 16px;
        }

        @media (min-width: 640px) {
          .payment-options-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .payment-option-card {
          position: relative;
          background: white;
          border-radius: 16px;
          padding: 24px 16px;
          border: 2px solid transparent;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .payment-option-card:hover {
          border-color: #FFE5DC;
        }

        .payment-option-selected {
          border-color: #FF6B35;
          background: #FFF9F7;
        }

        .payment-icon-wrapper {
          width: 64px;
          height: 64px;
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
          background: linear-gradient(135deg, #FF6B35 0%, #FF8F6B 50%, #FFBD9D 100%);
          border-radius: 16px;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 20px;
          box-shadow: 0 8px 24px rgba(255, 107, 53, 0.2);
        }

        .card-visual::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .card-visual::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -10%;
          width: 150px;
          height: 150px;
          background: rgba(255, 189, 157, 0.3);
          border-radius: 50%;
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
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
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
          color: rgba(255, 255, 255, 0.8);
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

        .add-new-btn {
          width: 100%;
          background: white;
          border: 2px dashed #FF6B35;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #FF6B35;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin: 0 16px 24px;
        }

        .add-new-btn:hover {
          background: #FFF9F7;
          border-color: #FF8F6B;
        }

        .plus-icon {
          font-size: 24px;
          font-weight: 700;
        }
      `}</style>

      <div className="payment-header">
        <button onClick={onBack} className="payment-back-btn">
          <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="payment-title">Payment</h1>
      </div>

      <div className="payment-options-grid">
        <PaymentOptionCard
          icon={<CashIcon />}
          label="Cash"
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
      </div>

      <div className="card-section">
        <div className="card-visual">
          <div className="mastercard-logo">
            <MastercardIcon />
          </div>
          <div className="card-chip" />
          <div className="card-info">
            <div className="card-number">•••• •••• •••• ••••</div>
            <div className="card-bottom">
              <div className="card-holder">
                <span className="card-label">Card Holder</span>
                <span className="card-value">Add Card</span>
              </div>
              <div className="card-expiry">
                <span className="card-label">Expiry</span>
                <span className="card-value">MM/YY</span>
              </div>
            </div>
          </div>
        </div>

        <div className="no-card-message">
          <h3 className="no-card-title">No master card added</h3>
          <p className="no-card-subtitle">
            You can add a mastercard and<br />save it for later
          </p>
        </div>
      </div>

      <button className="add-new-btn">
        <span className="plus-icon">+</span>
        ADD NEW
      </button>
    </div>
  );
};
