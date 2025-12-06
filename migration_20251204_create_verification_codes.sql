-- Create table for storing WhatsApp Verification Codes (OTP)
create table if not exists public.verification_codes (
  id uuid default gen_random_uuid() primary key,
  phone text not null,
  code text not null,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '5 minutes'),
  verified boolean default false
);

-- Index for fast lookups by phone
create index if not exists idx_verification_codes_phone on public.verification_codes(phone);

-- Enable RLS (though mostly accessed via Service Role in Edge Function)
alter table public.verification_codes enable row level security;

-- Policy: Only service role can do everything (default is deny all for anon/authenticated)
-- We don't need public access policies because the Edge Function will use the Service Role Key.
