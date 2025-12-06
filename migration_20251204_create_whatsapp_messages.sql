-- Create table for storing WhatsApp Chat History
create table if not exists public.whatsapp_messages (
  id uuid default gen_random_uuid() primary key,
  phone text not null, -- The customer's phone number (acts as Chat ID)
  body text,
  direction text check (direction in ('inbound', 'outbound')), -- inbound: Customer->Us, outbound: Us->Customer
  status text default 'sent', -- sent, delivered, read, failed
  created_at timestamptz default now()
);

-- Index for fast lookups by phone (Chat View)
create index if not exists idx_whatsapp_messages_phone on public.whatsapp_messages(phone);
create index if not exists idx_whatsapp_messages_created_at on public.whatsapp_messages(created_at);

-- Enable RLS (Service Role will bypass, but good practice)
alter table public.whatsapp_messages enable row level security;

-- Enable Realtime for this table so the App updates instantly
alter publication supabase_realtime add table public.whatsapp_messages;

-- Policy: Allow authenticated users (Admins/Drivers) to view messages?
-- For now, we'll allow all authenticated users to read/insert for simplicity in this private app.
create policy "Enable read access for authenticated users" on public.whatsapp_messages for select using (auth.role() = 'authenticated');
create policy "Enable insert access for authenticated users" on public.whatsapp_messages for insert with check (auth.role() = 'authenticated');
