import { CartItem } from '../App';
// FIX: Import GoogleGenAI and Content from @google/genai to support chat functionality.
import { GoogleGenAI, Content } from '@google/genai';

/**
 * This file contains services to interact with external APIs,
 * including a mock order confirmation.
 */

/**
 * MOCK ORDER CONFIRMATION
 * Simulates sending an order to a backend. In a real app, this would
 * make an HTTP request to a server.
 * @param {CartItem[]} cart - The items in the user's cart.
 * @param {string} phoneNumber - The user's WhatsApp number.
 * @returns {Promise<{success: boolean}>} - A promise that resolves if the order is confirmed.
 */
export const confirmarPedido = async (cart: CartItem[], phoneNumber: string): Promise<{success: boolean}> => {
  console.log("Simulating order confirmation...");
  if (!phoneNumber || cart.length === 0) {
      console.error("Order confirmation failed: Phone number and cart items are required.");
      throw new Error("Phone number and cart items are required.");
  }
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('Order confirmed for:', { phoneNumber, cart });
  // Return a success message
  return { success: true };
};

// FIX: Implement `obtenerRespuestaDeSoporte` using Gemini API for the support chat.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Gets a response from the Gemini AI for the support chat.
 * @param history The conversation history.
 * @param message The user's latest message.
 * @returns A promise that resolves to the AI's text response.
 */
export const obtenerRespuestaDeSoporte = async (history: Content[], message: string): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history,
      config: {
        systemInstruction: "Eres el asistente virtual de Estrella, un servicio de entrega a domicilio. Tu objetivo es ayudar a los usuarios con sus pedidos, preguntas sobre restaurantes y servicios de entrega. Sé amable y servicial."
      }
    });

    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error fetching AI response:", error);
    return "Lo siento, estoy teniendo problemas para conectarme en este momento. Por favor, intenta de nuevo más tarde.";
  }
};
