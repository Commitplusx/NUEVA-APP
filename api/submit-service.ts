// api/submit-service.ts
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Inicializa Supabase (lee las variables de Vercel)
// Asegúrate de haber puesto VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en Vercel
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Función para combinar fecha (string) y hora (HH:MM)
const combineDateAndTime = (dateStr: string, timeStr: string): string | null => {
  try {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date(dateStr);
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toISOString();
  } catch (error) {
    console.error("Error combinando fecha:", error);
    return null;
  }
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Solo aceptamos peticiones POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // Obtenemos los datos que envía el frontend (RequestService.tsx)
    const { tariff, origin, destination, description, schedule } = req.body;

    // Validación simple
    if (!tariff || !origin || !destination) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Preparamos la fecha programada
    let scheduled_at = null;
    if (schedule && schedule.date && schedule.time) {
      scheduled_at = combineDateAndTime(schedule.date, schedule.time);
    }

    // Insertamos en la tabla 'service_requests' de Supabase
    const { data, error } = await supabase
      .from('service_requests')
      .insert({
        tariff,
        origin,
        destination,
        description,
        scheduled_at, // Esto será nulo o una fecha ISO
        status: 'pendiente'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error.message);
      throw error;
    }

    // ¡Éxito!
    return res.status(200).json({ success: true, orderId: data.id });

  } catch (error) {
    console.error('Error en el servidor:', error);
    return res.status(500).json({ error: 'Error interno del servidor'
                                });
  }
}
