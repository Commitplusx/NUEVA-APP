-- --------------------------------------------------------
-- Tabla: profiles
-- Almacena información pública del perfil de los usuarios.
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  address text,
  lat numeric,
  lng numeric,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver su propio perfil.
CREATE POLICY "Allow individual read access for profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Los usuarios pueden crear y actualizar su propio perfil.
CREATE POLICY "Allow individual insert and update for profiles"
ON public.profiles
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Esta función se dispara cada vez que un nuevo usuario se registra.
-- Crea una entrada correspondiente en la tabla `public.profiles`.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparador que llama a la función `handle_new_user` después de cada inserción en `auth.users`.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
