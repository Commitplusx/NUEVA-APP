-- Función para asignar rol automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el email contiene '@repartidor', asignar rol 'driver'
  IF NEW.email LIKE '%@repartidor%' THEN
    NEW.role := 'driver';
  -- Si el email contiene '@admin.com', asignar rol 'admin'
  ELSIF NEW.email LIKE '%@admin.com%' THEN
    NEW.role := 'admin';
  -- Si no tiene rol asignado, asignar 'user' por defecto
  ELSIF NEW.role IS NULL THEN
    NEW.role := 'user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se ejecuta ANTES de insertar o actualizar en profiles
DROP TRIGGER IF EXISTS on_profile_role_check ON public.profiles;
CREATE TRIGGER on_profile_role_check
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_role();

-- Actualizar usuarios existentes que cumplan la condición
UPDATE public.profiles
SET role = 'driver'
WHERE email LIKE '%@repartidor%' AND role != 'driver';
