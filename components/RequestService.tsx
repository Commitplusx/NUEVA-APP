import React, { useState } from 'react';
import { TariffCard } from './TariffCard';
import { InputWithIcon } from './InputWithIcon';
import { LocationIcon, LockIcon, ForaneosIcon } from './icons';

type Tariff = 'cénttrico' | 'plaza' | 'foráneos';

export const RequestService: React.FC = () => {
  const [selectedTariff, setSelectedTariff] = useState<Tariff>('cénttrico');
  const [origin, setOrigin] = useState('');
  const [description, setDescription] = useState('');

  const handleConfirm = () => {
    if (!origin || !description) {
      alert('Por favor, complete todos los detalles del pedido.');
      return;
    }
    alert(`Solicitud confirmada:
      Tarifa: ${selectedTariff}
      Origen: ${origin}
      Descripción: ${description}`);
  };

  return (
    <div className="p-4 space-y-6">
      <section className="text-center">
        <h1 className="text-2xl font-bold">SOLICITA TU SERVICIO</h1>
      </section>

      <section>
        <h2 className="text-sm font-bold mb-2">NUESTRAS TARIFAS</h2>
        <div className="grid grid-cols-3 gap-2">
          <TariffCard
            icon={<LocationIcon className="w-6 h-6 mx-auto mb-1" />}
            title="CÉNTTRICO"
            price={45}
            isSelected={selectedTariff === 'cénttrico'}
            onClick={() => setSelectedTariff('cénttrico')}
          />
          <TariffCard
            icon={<LockIcon className="w-6 h-6 mx-auto mb-1" />}
            title="PLAZA Y ORILLAS"
            price={70}
            isSelected={selectedTariff === 'plaza'}
            onClick={() => setSelectedTariff('plaza')}
          />
          <TariffCard
            icon={<ForaneosIcon className="w-6 h-6 mx-auto mb-1" />}
            title="FORÁNOS"
            price={250}
            isSelected={selectedTariff === 'foráneos'}
            onClick={() => setSelectedTariff('foráneos')}
          />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold mb-2">DETALLES EL PEDIDO</h2>
        <div className="space-y-3">
          <InputWithIcon
            placeholder="Origen"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            isSearch={true}
          />
          <InputWithIcon
            placeholder="Descripción del Paquete"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <button className="bg-green-500 text-white text-xs font-bold py-3 rounded-md hover:bg-green-600 transition-colors">
          PROGRAMAR RECOGIDA
        </button>
        <button className="bg-blue-500 text-white text-xs font-bold py-3 rounded-md hover:bg-blue-600 transition-colors">
          CONTACTAR SOPORTE
        </button>
      </section>

      <section className="pb-20">
        <button
          onClick={handleConfirm}
          className="bg-red-600 text-white w-full py-4 rounded-md font-bold hover:bg-red-700 transition-colors"
        >
          CONFIRMAR SOLICITUD
        </button>
      </section>
    </div>
  );
};
