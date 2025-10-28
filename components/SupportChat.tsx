import React, { useState, useRef, useEffect } from 'react';
import { obtenerRespuestaDeSoporte } from '../services/api';
import { SparklesIcon, SendIcon } from './icons';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1.5">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
    </div>
);

const PromptButton: React.FC<{text: string, onClick: () => void}> = ({text, onClick}) => (
    <button
        onClick={onClick}
        className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
    >
        {text}
    </button>
);

export const SupportChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
      { sender: 'ai', text: "¡Hola! Soy el asistente virtual de Estrella. ¿Cómo puedo ayudarte hoy con tus pedidos, restaurantes o servicios?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (messageText: string) => {
    if (!messageText || isLoading) return;
    
    setShowPrompts(false);
    const userMessage = messageText.trim();
    const newMessages: Message[] = [...messages, { sender: 'user', text: userMessage }];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const formattedHistory = newMessages.slice(0, -1).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const aiResponse = await obtenerRespuestaDeSoporte(formattedHistory, userMessage);
      
      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    } catch (error) {
      console.error("Error getting support response:", error);
      setMessages(prev => [...prev, { sender: 'ai', text: "Lo siento, estoy teniendo problemas para conectarme. Por favor, intenta de nuevo más tarde." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handlePromptClick = (promptText: string) => {
     sendMessage(promptText);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
        <header className="bg-white p-3 border-b border-gray-200 shadow-sm flex items-center gap-3">
            <div className="relative">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <SparklesIcon className="w-7 h-7 text-orange-500" />
                </div>
                 <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
            </div>
            <div>
                <h1 className="text-lg font-bold text-gray-800">Asistente Estrella</h1>
                <p className="text-sm text-green-600 font-semibold">En línea</p>
            </div>
        </header>

        <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => {
                const isLastMessage = index === messages.length - 1;
                return (
                    <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl shadow-sm ${
                            msg.sender === 'user' 
                            ? 'bg-orange-500 text-white rounded-br-lg' 
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-lg'
                        } ${msg.sender === 'ai' && isLastMessage ? 'animate-fade-in-bubble' : ''}`}>
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
                    </div>
                );
            })}
            
            {showPrompts && (
                <div className="flex justify-center gap-2 pt-2 animate-fade-in">
                    <PromptButton text="Estado de mi pedido" onClick={() => handlePromptClick("¿Cuál es el estado de mi pedido de Burger Joint?")} />
                    <PromptButton text="Tarifas de servicio" onClick={() => handlePromptClick("¿Cuáles son las tarifas de servicio?")} />
                </div>
            )}

            {isLoading && (
                 <div className="flex justify-start">
                     <div className="max-w-xs md:max-w-md px-4 py-3 rounded-2xl bg-white text-gray-800 border border-gray-200 rounded-bl-lg shadow-sm animate-fade-in-bubble">
                        <TypingIndicator />
                     </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleFormSubmit} className="p-3 bg-white border-t border-gray-200">
            <div className="relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    className="w-full py-3 pl-5 pr-16 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 border border-transparent focus:border-orange-500 transition"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="absolute top-1/2 right-2 -translate-y-1/2 bg-orange-500 text-white rounded-full p-2.5 hover:bg-orange-600 transition-all duration-200 transform disabled:bg-gray-400 disabled:scale-90"
                    disabled={isLoading || !inputValue.trim()}
                >
                    <SendIcon className="h-5 w-5" />
                </button>
            </div>
        </form>
    </div>
  );
};