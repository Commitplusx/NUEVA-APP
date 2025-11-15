import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (date: Date, time: string) => void;
  weekDays: Date[];
  timeSlots: string[];
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  weekDays,
  timeSlots,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [scheduleTime, setScheduleTime] = useState<string>('');

  const handleSubmit = () => {
    if (selectedDate && scheduleTime) {
      onSubmit(selectedDate, scheduleTime);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Programar Recogida</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="schedule-date" className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <select
                  id="schedule-date"
                  className="w-full py-2 px-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                >
                  <option value="">Selecciona una fecha</option>
                  {weekDays.map((day) => (
                    <option key={day.toISOString()} value={day.toISOString().split('T')[0]}>
                      {day.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="schedule-time" className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                <select
                  id="schedule-time"
                  className="w-full py-2 px-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                >
                  <option value="">Selecciona una hora</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed"
                disabled={!selectedDate || !scheduleTime}
              >
                Confirmar Horario
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
