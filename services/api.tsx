import { CartItem, Restaurant } from '../App';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

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


// --- AI Services ---

/**
 * Searches for restaurants using a natural language query powered by Gemini.
 * @param {string} query - The user's search query.
 * @param {Restaurant[]} restaurants - The list of all available restaurants.
 * @returns {Promise<number[]>} - A promise that resolves to an array of matching restaurant IDs.
 */
export const buscarRestaurantesConIA = async (query: string, restaurants: Restaurant[]): Promise<number[]> => {
    console.log(`Searching with AI for: "${query}"`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Simplify data to reduce token usage
    const simplifiedRestaurants = restaurants.map(r => ({
        id: r.id,
        name: r.name,
        category: r.category,
        menu: r.menu.map(m => ({ name: m.name, description: m.description }))
    }));

    const prompt = `You are a smart restaurant search assistant for the 'Estrella' app. Based on the user's query, find the most relevant restaurants from the provided JSON data. Return a JSON array of the restaurant IDs, ordered by relevance. User query: "${query}". Restaurant data: ${JSON.stringify(simplifiedRestaurants)}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    description: "List of relevant restaurant IDs.",
                    items: {
                        type: Type.NUMBER
                    }
                }
            }
        });

        const result = JSON.parse(response.text);
        console.log("AI search results (IDs):", result);
        return result as number[];
    } catch (error) {
        console.error("Error during AI search:", error);
        return [];
    }
}


/**
 * Sends a user's message to the Gemini API and handles function calls for actions like checking order status.
 * @param {Array} chatHistory - The existing conversation history.
 * @param {string} userMessage - The new message from the user.
 * @returns {Promise<string>} - The AI's response text.
 */
const verificarEstadoPedido: FunctionDeclaration = {
  name: 'verificarEstadoPedido',
  parameters: {
    type: Type.OBJECT,
    description: 'Verifica el estado actual de un pedido de un restaurante específico.',
    properties: {
      nombreRestaurante: {
        type: Type.STRING,
        description: 'El nombre del restaurante del cual se quiere saber el estado del pedido. Por ejemplo: "Rose Garden Restaurant" o "Burger Joint".',
      },
    },
    required: ['nombreRestaurante'],
  },
};

export const obtenerRespuestaDeSoporte = async (chatHistory: { role: string; parts: { text: string }[] }[], userMessage: string): Promise<string> => {
    console.log("Getting support response from Gemini API with function calling...");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const contents = [...chatHistory, { role: 'user', parts: [{ text: userMessage }] }];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
            systemInstruction: "You are a friendly and helpful customer support agent for a delivery service called 'Estrella'. Your knowledge is limited to the services offered: food delivery from restaurants, grocery and errand services, and package/document delivery. The service tariffs for general requests are: 'Céntrico' ($45), 'Plaza y Orillas' ($70), and 'Foráneos' ($250). You can check order status for 'Rose Garden Restaurant' and 'Burger Joint'. Always respond in Spanish. Keep your answers concise and friendly.",
            tools: [{ functionDeclarations: [verificarEstadoPedido] }],
        }
    });

    const functionCalls = response.functionCalls;

    if (functionCalls && functionCalls.length > 0) {
        const fc = functionCalls[0];
        console.log("Function call detected:", fc);
        if (fc.name === 'verificarEstadoPedido') {
            const restaurantName = fc.args.nombreRestaurante as string;
            
            // MOCK: In a real app, this would query a database.
            const statuses = ["Tu pedido está siendo preparado.", `Tu pedido de ${restaurantName} ya salió y está en camino.`, "El repartidor está a 5 minutos.", "Tu pedido ha sido entregado."];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            
            // Send the function result back to the model
            const functionResponsePart = {
                functionResponse: {
                    id: fc.id,
                    name: fc.name,
                    response: { result: randomStatus },
                }
            };

            const modelResponsePart = { role: 'model', parts: [{ functionCall: fc }] };
            const userResponsePart = { role: 'user', parts: [functionResponsePart] };

            const secondResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [...contents, modelResponsePart, userResponsePart]
            });

            return secondResponse.text;
        }
    }
    
    return response.text;
};