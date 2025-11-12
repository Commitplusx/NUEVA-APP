-- Eliminar la columna de dirección antigua si ya no se necesita
ALTER TABLE public.profiles DROP COLUMN IF EXISTS address;

-- Añadir las nuevas columnas para la dirección estructurada
ALTER TABLE public.profiles
ADD COLUMN street_address text,
ADD COLUMN neighborhood text,
ADD COLUMN city text,
ADD COLUMN postal_code text,
ADD COLUMN address_details text;

-- Opcional: Añadir un comentario a la tabla para describir los nuevos campos
COMMENT ON COLUMN public.profiles.street_address IS 'Calle y número de la dirección del usuario.';
COMMENT ON COLUMN public.profiles.neighborhood IS 'Barrio o colonia de la dirección del usuario.';
COMMENT ON COLUMN public.profiles.city IS 'Ciudad de la dirección del usuario.';
COMMENT ON COLUMN public.profiles.postal_code IS 'Código postal de la dirección del usuario.';
COMMENT ON COLUMN public.profiles.address_details IS 'Detalles adicionales (ej. número de apartamento, referencias).';
