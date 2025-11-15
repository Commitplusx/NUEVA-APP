import React from 'react';
import * as Icons from './icons';

export type Step = 'details' | 'confirmation' | 'submitted';

const getStepName = (step: Step) => {
  if (step === 'details') return 'Detalles';
  if (step === 'confirmation') return 'Confirmar';
  return 'Enviado';
};

export const Stepper: React.FC<{ currentStep: Step }> = ({ currentStep }) => {
  const steps: Step[] = ['details', 'confirmation', 'submitted'];
  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div className="flex items-center w-full mb-8 px-2">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors duration-300 ${
                index <= currentStepIndex ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index < currentStepIndex ? <Icons.CheckCircleIcon className="w-6 h-6" /> : index + 1}
            </div>
            <p
              className={`mt-2 text-xs font-bold transition-colors duration-300 ${
                index <= currentStepIndex ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              {getStepName(step as Step)}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-auto border-t-2 transition-colors duration-300 mx-2 ${
                index < currentStepIndex ? 'border-green-600' : 'border-gray-200'
              }`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
