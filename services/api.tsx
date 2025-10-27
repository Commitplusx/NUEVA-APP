import { CartItem } from '../App';
import { GoogleGenAI } from "@google/genai";

/**
 * This file contains services to interact with external APIs,
 * including a mock order confirmation and an AI-powered support chat.
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


// --- AI Support Chat ---

/**
 * Sends a user's message to the Gemini API to get a response from the AI assistant.
 * @param {string} userMessage - The message from the user.
 * @returns {Promise<string>} - The AI's response text.
 */
export const obtenerRespuestaDeSoporte = async (userMessage: string): Promise<string> => {
    console.log("Getting support response from Gemini API...");
    
    // The API key is sourced from process.env.API_KEY by the execution environment.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userMessage,
        config: {
            systemInstruction: "You are a friendly and helpful customer support agent for a delivery service called 'Estrella'. Your knowledge is limited to the services offered: food delivery from restaurants, grocery and errand services ('Mandados y Súper'), and package/document delivery ('Paquetería y Trámites'). The service tariffs for general requests are: 'Céntrico' ($45), 'Plaza y Orillas' ($70), and 'Foráneos' ($250). Always respond in Spanish. Keep your answers concise and friendly.",
        }
    });
    
    return response.text;
};
