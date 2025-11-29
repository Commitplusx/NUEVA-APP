-- Script para crear un usuario admin
-- En este sistema, los admins se identifican por su email que termina en @admin.com

-- IMPORTANTE: No necesitas modificar la base de datos
-- Solo crea un usuario con un email que termine en @admin.com

-- Ejemplos de emails de admin válidos:
-- admin@admin.com
-- tu-nombre@admin.com
-- cualquier-cosa@admin.com

-- Para crear un usuario admin:
-- 1. Ve a tu panel de Supabase
-- 2. Authentication > Users > Add User
-- 3. Usa un email que termine en @admin.com
-- 4. O simplemente regístrate en la app con un email @admin.com

-- Para verificar usuarios admin existentes:
SELECT id, email
FROM auth.users
WHERE email LIKE '%@admin.com';

-- NOTA: Los usuarios con email que contenga '@repartidor' son drivers
SELECT id, email
FROM auth.users
WHERE email LIKE '%@repartidor%';
