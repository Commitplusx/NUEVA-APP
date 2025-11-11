import type { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';

// Expected environment variables set in Vercel project settings
const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_MESSAGING_SERVICE_SID,
  TWILIO_FROM_NUMBER,
  TWILIO_WHATSAPP_FROM,
} = process.env as Record<string, string | undefined>;

const requireEnv = (keys: string[]) => {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
};

const client = (() => {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return null as any;
  return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
})();

// Basic status to message templates
function buildMessage(params: {
  status: 'confirmed' | 'canceled' | 'out_for_delivery' | 'delivered' | string;
  orderId: string | number;
  name?: string;
  eta?: string;
  reason?: string;
  driverName?: string;
  driverPhone?: string;
}) {
  const { status, orderId, name, eta, reason, driverName, driverPhone } = params;
  switch (status) {
    case 'confirmed':
      return `Hola${name ? ` ${name}` : ''}, tu pedido #${orderId} ha sido confirmado. Tiempo estimado: ${eta ?? 'N/A'}.`;
    case 'canceled':
      return `Hola${name ? ` ${name}` : ''}, tu pedido #${orderId} fue cancelado.${reason ? ` Motivo: ${reason}.` : ''}`;
    case 'out_for_delivery':
      return `Tu pedido #${orderId} ya va en camino.${driverName ? ` Repartidor: ${driverName}.` : ''}${driverPhone ? ` Tel: ${driverPhone}.` : ''}`;
    case 'delivered':
      return `Tu pedido #${orderId} ha sido entregado. ¡Buen provecho!`;
    default:
      return `Actualización de tu pedido #${orderId}: ${status}`;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!client) {
      requireEnv(['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN']);
    }

    const {
      to,
      channel = 'sms', // 'sms' | 'whatsapp'
      status,
      orderId,
      name,
      eta,
      reason,
      driverName,
      driverPhone,
      message, // optional custom message
    } = req.body || {};

    if (!to) return res.status(400).json({ error: 'Missing "to" phone number in E.164 format' });
    if (!status && !message) return res.status(400).json({ error: 'Missing status or message' });

    const body = message ?? buildMessage({ status, orderId, name, eta, reason, driverName, driverPhone });

    let from: string | undefined;
    let messagingServiceSid: string | undefined = TWILIO_MESSAGING_SERVICE_SID;

    if (channel === 'whatsapp') {
      if (!TWILIO_WHATSAPP_FROM) {
        return res.status(400).json({ error: 'TWILIO_WHATSAPP_FROM not configured for WhatsApp' });
      }
      from = `whatsapp:${TWILIO_WHATSAPP_FROM}`;
    } else {
      // SMS
      if (TWILIO_FROM_NUMBER) from = TWILIO_FROM_NUMBER;
      // If Messaging Service SID is configured, prefer it over from number
      if (!from && !messagingServiceSid) {
        return res.status(400).json({ error: 'Configure TWILIO_FROM_NUMBER or TWILIO_MESSAGING_SERVICE_SID' });
      }
    }

    const toFormatted = channel === 'whatsapp' ? (to.startsWith('whatsapp:') ? to : `whatsapp:${to}`) : to;

    const sendParams: any = {
      body,
      to: toFormatted,
    };

    if (messagingServiceSid && channel !== 'whatsapp') {
      sendParams.messagingServiceSid = messagingServiceSid;
    } else if (from) {
      sendParams.from = from;
    }

    const result = await client.messages.create(sendParams);

    return res.status(200).json({ sid: result.sid, status: result.status });
  } catch (err: any) {
    console.error('Twilio notify error:', err);
    return res.status(500).json({ error: err?.message ?? 'Internal Server Error' });
  }
}
