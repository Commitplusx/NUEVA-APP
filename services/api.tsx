// services/api.tsx (Código Completo y Corregido)

import { CartItem, Restaurant } from '../App';
// Importa los tipos de Gemini que tu código original necesita
import { GoogleGenerativeAI, Part, FunctionDeclaration } from "@google/genai";

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
// CUIDADO: Esta clave está expuesta al cliente.
// Moveremos esto al backend después.
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Searches for restaurants using a natural language query powered by Gemini.
 * (Esta es tu función original)
 */
export const buscarRestaurantesConIA = async (query: string, restaurants: Restaurant[]): Promise<number[]> => {
    console.log(`Searching with AI for: "${query}"`);
    
    // Simplify data to reduce token usage
    const simplifiedRestaurants = restaurants.map(r => ({
        id: r.id,
        name: r.name,
        category: r.category,
        menu: r.menu.map(m => ({ name: m.name, description: m.description }))
    }));

    // NOTA: Asegúrate de que el modelo "gemini-pro" esté disponible para tu clave
    const model = ai.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `You are a smart restaurant search assistant... (tu prompt aquí) ... User query: "${query}". Restaurant data: ${JSON.stringify(simplifiedRestaurants)}`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Asumiendo que la IA devuelve un JSON [1, 4]
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
  // ... (Aquí va la definición completa de tu función)
  parameters: {
    type: "OBJECT",
    properties: {
      nombreRestaurante: {
        type: "STRING",
        description: "El nombre del restaurante",
      },
    },
    required: ["nombreRestaurante"],
  },
};

/**
 * Sends a user's message to the Gemini API
 * (Esta es tu función original que el chat necesita)
 */
export const obtenerRespuestaDeSoporte = async (chatHistory: Part[], userMessage: string): Promise<string> => {
    console.log("Getting support response from Gemini API...");
    
    const model = ai.getGenerativeModel({ 
        model: "gemini-pro",
        // systemInstruction: "Tu instrucción de sistema...",
        // tools: [{ functionDeclarations: [verificarEstadoPedido] }],
    });

    const chat = model.startChat({
        history: chatHistory,
    });
    
    const result = await chat.sendMessage(userMessage);
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
  
  // Llamamos a nuestra API en /api/submit-service
  const response = await fetch('/api/submit-service', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    // Si el backend responde con un error
    const errorBody = await response.json();
    console.error('Error del API:', errorBody);
    throw new Error(errorBody.error || 'Falló al enviar la solicitud');
  }

  return response.json(); // Devuelve { success: true, orderId: ... }
};
