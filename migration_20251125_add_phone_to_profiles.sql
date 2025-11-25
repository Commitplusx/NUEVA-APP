-- Add phone and email columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS email text;

-- Optional: Add comments
COMMENT ON COLUMN public.profiles.phone IS 'Phone number of the user.';
COMMENT ON COLUMN public.profiles.email IS 'Email address of the user (optional, usually in auth.users).';
