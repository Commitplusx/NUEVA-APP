type OrderStatus = 'confirmed' | 'canceled' | 'out_for_delivery' | 'delivered';

export interface OrderNotifyPayload {
  to: string; // E.164, e.g., +519XXXXXXXX
  channel?: 'sms' | 'whatsapp';
  status: OrderStatus;
  orderId: string | number;
  name?: string;
  eta?: string;
  reason?: string;
  driverName?: string;
  driverPhone?: string;
  message?: string; // override template
}

async function postTwilioNotify(payload: OrderNotifyPayload) {
  const res = await fetch('/api/twilio-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Error HTTP ${res.status}`);
  }
  return res.json();
}

export const sendOrderStatus = (payload: OrderNotifyPayload) => postTwilioNotify(payload);

export const notifyOrderConfirmed = (to: string, orderId: string | number, opts?: { name?: string; eta?: string; channel?: 'sms' | 'whatsapp' }) =>
  postTwilioNotify({ to, orderId, status: 'confirmed', name: opts?.name, eta: opts?.eta, channel: opts?.channel });

export const notifyOrderCanceled = (to: string, orderId: string | number, opts?: { name?: string; reason?: string; channel?: 'sms' | 'whatsapp' }) =>
  postTwilioNotify({ to, orderId, status: 'canceled', name: opts?.name, reason: opts?.reason, channel: opts?.channel });

export const notifyOutForDelivery = (to: string, orderId: string | number, opts?: { driverName?: string; driverPhone?: string; channel?: 'sms' | 'whatsapp' }) =>
  postTwilioNotify({ to, orderId, status: 'out_for_delivery', driverName: opts?.driverName, driverPhone: opts?.driverPhone, channel: opts?.channel });

export const notifyDelivered = (to: string, orderId: string | number, opts?: { channel?: 'sms' | 'whatsapp' }) =>
  postTwilioNotify({ to, orderId, status: 'delivered', channel: opts?.channel });
