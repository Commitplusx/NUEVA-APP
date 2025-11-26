import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import jwt from 'npm:jsonwebtoken@9.0.2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper to get Google Access Token
async function getAccessToken(serviceAccount: any) {
    const now = Math.floor(Date.now() / 1000)
    const claim = {
        iss: serviceAccount.client_email,
        scope: "https://www.googleapis.com/auth/firebase.messaging",
        aud: "https://oauth2.googleapis.com/token",
        exp: now + 3600,
        iat: now,
    }

    const key = serviceAccount.private_key.replace(/\\n/g, '\n')

    // Sign JWT using npm:jsonwebtoken
    const token = jwt.sign(claim, key, { algorithm: 'RS256' })

    // Exchange JWT for Access Token
    const params = new URLSearchParams()
    params.append("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer")
    params.append("assertion", token)

    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
    })

    const data = await res.json()
    return data.access_token
}

serve(async (req) => {
    try {
        const { record, old_record, type } = await req.json()

        // --- HANDLE NEW ORDER (Notify Drivers) ---
        if (type === 'INSERT') {
            console.log('New order received:', record.id)

            // 1. Get all drivers with FCM tokens
            const { data: drivers, error: driversError } = await supabase
                .from('profiles')
                .select('fcm_token')
                .eq('role', 'driver')
                .not('fcm_token', 'is', null)

            if (driversError || !drivers || drivers.length === 0) {
                console.log('No drivers found to notify')
                return new Response(JSON.stringify({ message: 'No drivers found' }), { headers: { 'Content-Type': 'application/json' } })
            }

            console.log(`Found ${drivers.length} drivers to notify`)

            // 2. Get Service Account for DRIVER Project
            const serviceAccountStr = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_DRIVER')
            if (!serviceAccountStr) {
                throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_DRIVER secret')
            }
            const serviceAccount = JSON.parse(serviceAccountStr)

            // 3. Get Access Token
            const accessToken = await getAccessToken(serviceAccount)

            // 4. Send Notifications (Multicast manually)
            const projectId = serviceAccount.project_id
            const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`

            const notifications = drivers.map(async (driver) => {
                const message = {
                    message: {
                        token: driver.fcm_token,
                        notification: {
                            title: '🍕 ¡Nuevo Pedido Disponible!',
                            body: 'Entra a la app para ver los detalles y aceptarlo.',
                        },
                        android: {
                            priority: "high",
                            notification: {
                                channel_id: "custom_sound_channel",
                                sound: "notification_sound",
                                default_sound: false,
                                default_vibrate_timings: false,
                                vibrate_timings: ["0.0s", "0.2s", "0.1s", "0.2s"],
                                visibility: "PUBLIC"
                            }
                        },
                        data: {
                            orderId: record.id.toString(),
                            type: 'new_order'
                        }
                    }
                }

                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(message),
                    })
                    return await response.json()
                } catch (e) {
                    console.error('Error sending to driver:', e)
                    return { error: e.message }
                }
            })

            const results = await Promise.all(notifications)
            console.log('Notification results:', results)

            return new Response(JSON.stringify({ results }), { headers: { 'Content-Type': 'application/json' } })
        }

        // --- HANDLE ORDER STATUS UPDATE (Notify Customer) ---
        if (type === 'UPDATE' && record.status !== old_record.status) {
            const userId = record.user_id
            const newStatus = record.status

            // 1. Get User Token
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('fcm_token')
                .eq('user_id', userId)
                .single()

            if (error || !profile?.fcm_token) {
                console.log('No token found for user', userId)
                return new Response(JSON.stringify({ message: 'No token found' }), { headers: { 'Content-Type': 'application/json' } })
            }

            // 2. Get Service Account from Secrets
            const serviceAccountStr = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')
            if (!serviceAccountStr) {
                throw new Error('Missing FIREBASE_SERVICE_ACCOUNT secret')
            }
            const serviceAccount = JSON.parse(serviceAccountStr)

            // 3. Get Access Token
            const accessToken = await getAccessToken(serviceAccount)

            // 4. Send Notification (V1 API)
            const projectId = serviceAccount.project_id
            const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`

            // Status Messages Mapping
            const statusMessages: Record<string, { title: string, body: string }> = {
                'pending': { title: '⏳ Pedido Recibido', body: 'Estamos confirmando tu orden con el restaurante.' },
                'accepted': { title: '👨‍🍳 Pedido Aceptado', body: 'El restaurante está preparando tu comida.' },
                'preparing': { title: '🔥 Preparando tu comida', body: 'El restaurante está cocinando tus platillos.' },
                'ready': { title: '🥡 Pedido Listo', body: 'Tu comida está lista y esperando al repartidor.' },
                'picked_up': { title: '🛵 ¡Va en camino!', body: 'El repartidor ya tiene tu pedido.' },
                'on_way': { title: '🛵 ¡Va en camino!', body: 'El repartidor se dirige hacia ti.' },
                'delivered': { title: '✅ ¡Entregado!', body: 'Disfruta tu comida. ¡Gracias por tu preferencia!' },
                'cancelled': { title: '❌ Pedido Cancelado', body: 'Lo sentimos, tu pedido ha sido cancelado.' },
            }

            const normalizedStatus = newStatus.toLowerCase().trim();
            const notificationContent = statusMessages[normalizedStatus] || {
                title: 'Actualización de Pedido',
                body: `Tu pedido ahora está: ${newStatus}`
            }

            const message = {
                message: {
                    token: profile.fcm_token,
                    notification: {
                        title: notificationContent.title,
                        body: notificationContent.body,
                    },
                    android: {
                        notification: {
                            channel_id: "custom_sound_channel",
                            sound: "notification_sound",
                            default_sound: false,
                            default_vibrate_timings: false,
                            vibrate_timings: ["0.0s", "0.2s", "0.1s", "0.2s"]
                        }
                    },
                    data: {
                        orderId: record.id.toString(),
                        status: newStatus
                    }
                }
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message),
            })

            const result = await response.json()
            console.log('FCM V1 Result:', result)

            return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } })
        }

        return new Response(JSON.stringify({ message: 'No status change' }), { headers: { 'Content-Type': 'application/json' } })

    } catch (error) {
        console.error(error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
})
