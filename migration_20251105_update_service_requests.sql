-- Eliminar la restricción de clave externa y la columna tariff_id
ALTER TABLE public.service_requests DROP CONSTRAINT IF EXISTS service_requests_tariff_id_fkey;
ALTER TABLE public.service_requests DROP COLUMN IF EXISTS tariff_id;

-- Añadir nuevas columnas para el precio y la distancia
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS price numeric;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS distance numeric;
