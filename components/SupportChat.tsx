import React, { useState, useRef, useEffect } from 'react';
import { obtenerRespuestaDeSoporte } from '../services/api';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1 self-start">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
    </div>
);

export const SupportChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
      { sender: 'ai', text: "¡Hola! Soy el asistente virtual de Estrella. ¿Cómo puedo ayudarte hoy con tus pedidos, restaurantes o servicios?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to the bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMessage = inputValue.trim();
    if (!userMessage || isLoading) return;

    // Add user message to UI
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await obtenerRespuestaDeSoporte(userMessage);
      
      // Update local message state for UI
      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    } catch (error) {
      console.error("Error getting support response:", error);
      setMessages(prev => [...prev, { sender: 'ai', text: "Lo siento, estoy teniendo problemas para conectarme. Por favor, intenta de nuevo más tarde." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
        <header className="bg-white p-4 border-b border-gray-200 shadow-sm text-center">
            <h1 className="text-xl font-bold text-gray-800">Soporte Estrella</h1>
            <p className="text-sm text-gray-500">Asistente Virtual</p>
        </header>

        <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${
                        msg.sender === 'user' 
                        ? 'bg-orange-500 text-white rounded-br-none' 
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                    }`}>
                        <p className="text-sm">{msg.text}</p>
                    </div>
                </div>
            ))}
            {isLoading && (
                 <div className="flex justify-start">
                     <div className="max-w-xs md:max-w-md px-4 py-2 rounded-2xl bg-white text-gray-800 border border-gray-200 rounded-bl-none">
                        <TypingIndicator />
                     </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex items-center gap-2">
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe tu pregunta..."
                className="flex-grow py-3 px-4 bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={isLoading}
            />
            <button type="submit" className="bg-orange-500 text-white rounded-full p-3 hover:bg-orange-600 transition-colors disabled:bg-gray-400" disabled={isLoading || !inputValue}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </button>
        </form>
    </div>
  );
};
