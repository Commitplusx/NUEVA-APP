<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# App de Delivery

Esta es una aplicación de delivery completa construida con React, TypeScript, Vite y Supabase. Permite a los usuarios explorar restaurantes, ver menús, agregar productos al carrito y realizar pedidos. También incluye un panel de administración para gestionar los restaurantes.

## Requisitos

Para ejecutar la aplicación localmente, necesitarás lo siguiente:

- **Node.js:** Asegúrate de tener Node.js instalado. Puedes descargarlo desde [nodejs.org](https://nodejs.org/).
- **Cuenta de Supabase:** La aplicación utiliza Supabase como backend. Necesitarás una cuenta de Supabase y un proyecto creado. Puedes registrarte en [supabase.com](https://supabase.com/).

## Pasos para la Puesta en Marcha

1. **Clonar el Repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/tu-repositorio.git
   cd tu-repositorio
   ```

2. **Instalar Dependencias:**
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno:**
   - Crea un archivo `.env` en la raíz del proyecto.
   - Agrega las siguientes variables de entorno, reemplazando los valores con tus propias claves de Supabase:
     ```
     VITE_SUPABASE_URL=tu_url_de_supabase
     VITE_SUPABASE_ANON_KEY=tu_llave_anonima_de_supabase
     ```
   - Puedes encontrar estas claves en la configuración de tu proyecto de Supabase, en la sección de API.

4. **Configurar la Base de Datos:**
   - Ve a tu proyecto de Supabase y ejecuta el script SQL que se encuentra en `database_setup.sql`. Esto creará las tablas necesarias y algunos datos iniciales.

5. **Ejecutar la Aplicación:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:3000`.

## Notificaciones de estado con Twilio (Vercel)

Esta app puede enviar notificaciones SMS o WhatsApp con Twilio cuando el estado de un pedido cambia. Se implementó una función serverless en Vercel y un helper en el frontend.

### 1) Configurar Twilio
- Crea una cuenta en Twilio y obtiene tus credenciales.
- Habilita un número de envío (SMS) o sandbox de WhatsApp.

Variables de entorno (configurarlas en Vercel -> Project Settings -> Environment Variables):
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_MESSAGING_SERVICE_SID` (opcional si usas Messaging Service para SMS)
- `TWILIO_FROM_NUMBER` (opcional si no usas Messaging Service)
- `TWILIO_WHATSAPP_FROM` (si usarás WhatsApp, formato +1XXXXXXXXXX)

### 2) API Serverless en Vercel
- Endpoint: `/api/twilio-notify`
- Método: `POST`
- Body JSON:
  ```json
  {
    "to": "+519XXXXXXXX",
    "channel": "sms" | "whatsapp",
    "status": "confirmed" | "canceled" | "out_for_delivery" | "delivered",
    "orderId": 123,
    "name": "Juan",
    "eta": "35 min",
    "reason": "Sin stock",
    "driverName": "Carlos",
    "driverPhone": "+51987654321",
    "message": "(opcional) para override"
  }
  ```

### 3) Uso desde el frontend
Helpers en `services/notifications.ts`:
- `notifyOrderConfirmed(to, orderId, { name, eta, channel })`
- `notifyOrderCanceled(to, orderId, { name, reason, channel })`
- `notifyOutForDelivery(to, orderId, { driverName, driverPhone, channel })`
- `notifyDelivered(to, orderId, { channel })`

Ejemplo:
```ts
import { notifyOrderConfirmed } from './services/notifications';
await notifyOrderConfirmed('+519XXXXXXXX', 101, { name: 'Juan', eta: '30 min', channel: 'sms' });
```

Notas:
- En cuentas trial de Twilio solo puedes enviar a números verificados.
- Usa formato E.164 para números: +[código país][número].
- No expongas credenciales en el frontend; quedan en Vercel.
