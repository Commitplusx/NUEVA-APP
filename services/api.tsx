// services/api.tsx (Código Corregido Definitivo)

import { CartItem, Restaurant } from '../App';
// ¡ESTA LÍNEA ESTÁ CORREGIDA! Usa "GoogleGenAI" y "Type"
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

/*
=================================================
 PARTE 1: TU CÓDIGO ORIGINAL DE GEMINI (PARA EL CHAT)
=================================================
*/

/**
 * MOCK ORDER CONFIRMATION
 * Simulates sending an order to a backend.
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
  return { success: true };
};

// --- AI Services ---
// ¡ESTA LÍNEA ESTÁ CORREGIDA! Usa "GoogleGenAI" y lee la variable de Vercel/Vite
const ai = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY || "");

/**
 * Searches for restaurants using a natural language query powered by Gemini.
 * (Esta es tu función original)
 */
export const buscarRestaurantesConIA = async (query: string, restaurants: Restaurant[]): Promise<number[]> => {
    console.log(`Searching with AI for: "${query}"`);
    
    const simplifiedRestaurants = restaurants.map(r => ({
        id: r.id, name: r.name, category: r.category,
        menu: r.menu.map(m => ({ name: m.name, description: m.description }))
    }));

    // (Adaptado de tu archivo original 'api.tsx.txt')
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" }); // Asegúrate que este modelo sea correcto
    const prompt = `You are a smart restaurant search assistant... (tu prompt aquí) ... User query: "${query}". Restaurant data: ${JSON.stringify(simplifiedRestaurants)}`;

    try {
        const result = await model.generateContent(prompt); // Asumiendo generateContent
        const response = await result.response;
        const text = response.text();
        const ids = JSON.parse(text);
        console.log("AI search results (IDs):", ids);
        return ids as number[];
    } catch (error) {
        console.error("Error during AI search:", error);
        return [];
    }
}

/**
 * Función de declaración para la IA
 * (Esta es tu función original)
 */
const verificarEstadoPedido: FunctionDeclaration = {
  name: 'verificarEstadoPedido',
  parameters: {
    type: Type.OBJECT,
    description: "Verifica el estado actual de un pedido...",
    properties: {
      nombreRestaurante: {
        type: Type.STRING,
        description: "El nombre del restaurante",
      },
    },
    required: ["nombreRestaurante"],
  },
};

/**
 * Sends a user's message to the Gemini API
 * (Esta es tu función original que el chat necesita)
 * (Adaptada de tu 'api.tsx.txt' original)
 */
export const obtenerRespuestaDeSoporte = async (chatHistory: { role: string; parts: { text: string }[] }[], userMessage: string): Promise<string> => {
    console.log("Getting support response from Gemini API...");
    
    const model = ai.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        // systemInstruction: "Tu instrucción de sistema...",
        // tools: [{ functionDeclarations: [verificarEstadoPedido] }],
    });

    const contents = [...chatHistory, { role: 'user', parts: [{ text: userMessage }] }];

    const result = await model.generateContent({
        contents: contents,
        // config: ... (tu config aquí)
        // tools: ... (tus tools aquí)
    });
    
    const response = await result.response;
    
    // Aquí iría tu lógica de 'functionCalls'

    return response.text();
};


/*
=================================================
 PARTE 2: NUEVO CÓDIGO DEL FORMULARIO (PARA RequestService)
=================================================
*/

// Interfaz para los datos que enviaremos
export interface ServiceRequestData {
  tariff: 'cénttrico' | 'plaza' | 'foráneos';
  origin: string;
  description: string;
}

// Nueva función para enviar la solicitud de servicio al backend
export const solicitarServicio = async (data: ServiceRequestData): Promise<{success: boolean}> => {
  
  const response = await fetch('/api/submit-service', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // Corregido a 'application/json'
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error('Error del API:', errorBody);
    throw new Error(errorBody.error || 'Falló al enviar la solicitud');
  }

  return response.json();
};
