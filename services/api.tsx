// --- (Pega esto al final de services/api.tsx) ---

// Interfaz para los datos que enviaremos
export interface ServiceRequestData {
  tariff: 'cénttrico' | 'plaza' | 'foráneos';
  origin: string;
  description: string;
}

// Nueva función para enviar la solicitud de servicio al backend
export const solicitarServicio = async (data: ServiceRequestData): Promise<{success: boolean}> => {

  // Llamamos a nuestra API en /api/submit-service
  // Esta ya no es una simulación, ¡es una llamada real!
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
