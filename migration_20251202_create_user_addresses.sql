-- Crear tabla de direcciones de usuario
create table if not exists public.user_addresses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null, -- Ej: "Casa", "Trabajo"
  address text not null, -- Dirección legible
  details text, -- Referencias, apto, etc
  lat double precision,
  lng double precision,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- Habilitar RLS
alter table public.user_addresses enable row level security;

-- Políticas de seguridad
create policy "Usuarios pueden ver sus propias direcciones"
  on public.user_addresses for select
  using (auth.uid() = user_id);

create policy "Usuarios pueden insertar sus propias direcciones"
  on public.user_addresses for insert
  with check (auth.uid() = user_id);

create policy "Usuarios pueden actualizar sus propias direcciones"
  on public.user_addresses for update
  using (auth.uid() = user_id);

create policy "Usuarios pueden eliminar sus propias direcciones"
  on public.user_addresses for delete
  using (auth.uid() = user_id);

-- Índices
create index if not exists user_addresses_user_id_idx on public.user_addresses(user_id);
