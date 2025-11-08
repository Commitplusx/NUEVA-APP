ALTER TABLE public.profiles
ADD COLUMN avatar_url text;

-- Opcional: Si quieres que los avatares existentes tengan un valor por defecto o sean nulos
-- ALTER TABLE public.profiles ALTER COLUMN avatar_url SET DEFAULT 'default_avatar.png';
-- ALTER TABLE public.profiles ALTER COLUMN avatar_url DROP NOT NULL;
