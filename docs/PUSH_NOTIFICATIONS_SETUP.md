# Guía de Configuración de Notificaciones Push (Firebase + Capacitor)

Esta guía te ayudará a configurar las notificaciones push en tu aplicación Android utilizando Firebase Cloud Messaging (FCM).

## Paso 1: Crear Proyecto en Firebase

1.  Ve a la [Consola de Firebase](https://console.firebase.google.com/).
2.  Haz clic en **"Agregar proyecto"** y sigue los pasos (ponle un nombre, ej: "App Repartidor").
3.  Desactiva Google Analytics si no lo necesitas por ahora (simplifica el proceso).
4.  Haz clic en **"Crear proyecto"**.

## Paso 2: Registrar la App Android

1.  En la vista general del proyecto, haz clic en el icono de **Android** (el robotito).
2.  **Nombre del paquete de Android**: Debe coincidir EXACTAMENTE con el `appId` de tu `capacitor.config.ts`.
    *   Ve a tu archivo `capacitor.config.ts` y copia el valor de `appId`.
    *   Ejemplo: `estrella.app.shop` (Verifícalo en tu código).
3.  **Nombre de la app (opcional)**: "App Repartidor".
4.  Haz clic en **"Registrar app"**.

## Paso 3: Descargar `google-services.json`

1.  Descarga el archivo `google-services.json` que te ofrece Firebase.
2.  **IMPORTANTE**: Mueve este archivo a la carpeta `android/app/` de tu proyecto.
    *   Ruta final: `C:\Users\Kaleb\Desktop\app_repartidor\NUEVA-APP\android\app\google-services.json`

## Paso 4: Agregar Dependencia (Ya incluido en el plan)

El sistema agregará automáticamente el plugin `@capacitor/push-notifications` a tu `package.json`.
Solo necesitarás ejecutar:
```bash
npm install
npx cap update
```

## Paso 5: Sincronizar Proyecto Android

Una vez que tengas el `google-services.json` en su lugar y el plugin instalado:

1.  Ejecuta en la terminal:
    ```bash
    npx cap copy android
    npx cap sync android
    ```
2.  Abre el proyecto en Android Studio:
    ```bash
    npx cap open android
    ```
3.  Es posible que Android Studio te pida sincronizar Gradle. Acepta.

## Paso 6: Probar Notificaciones

1.  Ejecuta la app en tu dispositivo o emulador.
2.  Al abrirse, la app pedirá permiso para enviar notificaciones (gracias al nuevo hook que agregaremos). **Acepta**.
3.  En la consola de depuración (Chrome DevTools o terminal), verás un mensaje como:
    `Push registration success, token: <TOKEN_LARGO_AQUI>`
4.  Copia ese token.
5.  Ve a la Consola de Firebase -> **Messaging** (en el menú izquierdo, bajo "Ejecución").
6.  Haz clic en **"Crear tu primera campaña"** -> **"Mensajes de Firebase Notification"**.
7.  Escribe un título y texto de prueba.
8.  Haz clic en **"Enviar mensaje de prueba"**.
9.  Pega el token que copiaste y dale al botón de agregar (+).
10. Haz clic en **"Probar"**.

¡Deberías recibir la notificación en tu móvil!
