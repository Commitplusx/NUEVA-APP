import { CartItem } from '../App';

/**
 * REAL BACKEND API SERVICE
 * 
 * This file makes HTTP requests to a real backend server.
 * Ensure your backend server (e.g., the Node.js server) is running.
 */

const API_BASE_URL = 'http://localhost:3001'; // The address of your local backend server

// --- Order Confirmation ---

/**
 * Sends the order to the backend, which will handle the WhatsApp notification.
 * @param {CartItem[]} cart - The items in the user's cart.
 * @param {string} phoneNumber - The user's WhatsApp number.
 * @returns {Promise<{success: boolean}>} - A promise that resolves if the order is confirmed.
 */
export const confirmarPedido = async (cart: CartItem[], phoneNumber: string): Promise<{success: boolean}> => {
  console.log("Contactando al backend para confirmar el pedido...");
  const response = await fetch(`${API_BASE_URL}/api/confirm-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cart, phoneNumber }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Fallo al confirmar el pedido en el servidor.');
  }

  return response.json();
};


// --- AI Support Chat ---

/**
 * Sends a user's message to the backend to get a response from the AI assistant.
 * @param {string} userMessage - The message from the user.
 * @returns {Promise<string>} - The AI's response text.
 */
export const obtenerRespuestaDeSoporte = async (userMessage: string): Promise<string> => {
    console.log("Enviando mensaje al backend para el chat de soporte...");
    const response = await fetch(`${API_BASE_URL}/api/support-chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Fallo al obtener respuesta del asistente.");
    }

    const data = await response.json();
    return data.reply;
};
