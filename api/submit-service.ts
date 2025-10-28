// api/submit-service.ts (Versión Corregida)
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // Obtenemos los datos que envía el formulario simple
    const { tariff, origin, description } = req.body;

    // Validación simple
    if (!tariff || !origin || !description) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Insertamos en la tabla 'service_requests'
    const { data, error } = await supabase
      .from('service_requests')
      .insert({
        tariff,
        origin,
        description, // 'destination' y 'scheduled_at' ya no se envían
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
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
