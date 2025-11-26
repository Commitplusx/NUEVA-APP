# Configuración de Notificaciones Automáticas (Supabase + Firebase V1)

Para que las notificaciones se envíen automáticamente cuando cambia el estado de un pedido, necesitas realizar estos pasos en tu proyecto de Supabase.

## Paso 1: Actualizar Base de Datos

1.  Ve a tu **Dashboard de Supabase** > **SQL Editor**.
2.  Copia el contenido del archivo `migration_20251126_add_fcm_token.sql` (está en la raíz de tu proyecto).
3.  Pégalo en el editor SQL y dale a **RUN**.
    *   Esto agregará la columna `fcm_token` a la tabla `profiles`.

## Paso 2: Obtener "Cuenta de Servicio" (Service Account)

Como estamos usando la API V1 (más segura), necesitamos un archivo de credenciales.

1.  Ve a **Firebase Console** > **Configuración del proyecto** > **Cuentas de servicio**.
2.  Haz clic en el botón azul **"Generar nueva clave privada"**.
3.  Se descargará un archivo `.json` en tu computadora.
4.  **Abre ese archivo** con el bloc de notas y **copia todo su contenido**.
    *   *Debe empezar con `{ "type": "service_account", ... }`*

## Paso 3: Desplegar la Edge Function

Necesitas tener instalada la [Supabase CLI](https://supabase.com/docs/guides/cli).

1.  Inicia sesión en la CLI:
    ```bash
    npx supabase login
    ```
2.  Despliega la función:
    ```bash
    npx supabase functions deploy push-notifications --no-verify-jwt
    ```

## Paso 4: Configurar el Secreto

Ahora guardaremos el contenido del JSON que copiaste en Supabase.
**IMPORTANTE**: Como el JSON tiene comillas, es mejor hacerlo desde el Dashboard de Supabase para evitar errores de formato en la terminal.

1.  Ve a **Supabase Dashboard** > **Edge Functions** > **push-notifications**.
2.  Busca la sección de **Secrets** o **Environment Variables**.
3.  Agrega un nuevo secreto:
    *   **Name**: `FIREBASE_SERVICE_ACCOUNT`
    *   **Value**: (Pega aquí todo el contenido del archivo JSON que descargaste).
4.  Guarda los cambios.

## Paso 5: Crear el Trigger (Disparador)

Para que la función se ejecute automáticamente cuando cambia un pedido, necesitas un **Database Webhook**.

1.  Ve a **Supabase Dashboard** > **Database** > **Webhooks**.
2.  Crea un nuevo webhook:
    *   **Name**: `order-status-change`
    *   **Table**: `orders`
    *   **Events**: `UPDATE`
    *   **Type**: `HTTP Request`
    *   **URL**: La URL de tu función desplegada (ej: `https://tu-proyecto.supabase.co/functions/v1/push-notifications`)
    *   **Method**: `POST`
    *   **Headers**: `Content-Type: application/json`
3.  Guarda el webhook.

¡Listo! Ahora tu sistema usa la API V1 moderna de Firebase.
