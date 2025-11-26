-- Función MEJORADA para asignar rol automáticamente
-- Esta versión busca el email en auth.users si no está en profiles
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
DECLARE
  user_email text;
BEGIN
  -- 1. Buscar el email real en la tabla de autenticación de Supabase
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = NEW.user_id;

  -- 2. Si no lo encuentra ahí, ver si viene en el insert (por si acaso)
  IF user_email IS NULL AND TG_OP = 'INSERT' THEN
    -- Intentar leer de la columna email si existe en NEW
    BEGIN
      user_email := NEW.email;
    EXCEPTION WHEN OTHERS THEN
      user_email := NULL;
    END;
  END IF;

  -- 3. Aplicar la lógica de roles
  IF user_email LIKE '%@repartidor%' THEN
    NEW.role := 'driver';
  ELSIF user_email LIKE '%@admin.com%' THEN
    NEW.role := 'admin';
  ELSIF NEW.role IS NULL THEN
    NEW.role := 'user';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- IMPORTANTE: Permite leer auth.users

-- Re-crear el trigger
DROP TRIGGER IF EXISTS on_profile_role_check ON public.profiles;
CREATE TRIGGER on_profile_role_check
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_role();

-- Actualizar usuarios existentes (Corrección masiva)
-- Esta consulta hace un JOIN con auth.users para asegurar que tenemos el email correcto
UPDATE public.profiles p
SET role = 'driver'
FROM auth.users u
WHERE p.user_id = u.id
AND u.email LIKE '%@repartidor%'
AND p.role != 'driver';
