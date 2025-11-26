-- Verificar datos del usuario específico
SELECT id, email, role, fcm_token 
FROM auth.users u
JOIN public.profiles p ON u.id = p.user_id
WHERE u.id = '6f6f7fcd-8ccd-4b66-ac54-f3515db9ada9';
