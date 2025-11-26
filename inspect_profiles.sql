-- 1. Ver estructura de la tabla (columnas)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- 2. Ver los primeros 10 usuarios para ver qué datos tienen
SELECT * FROM profiles LIMIT 10;
