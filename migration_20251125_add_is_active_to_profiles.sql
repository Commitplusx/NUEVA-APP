-- Add is_active column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;

-- Update existing profiles to be false by default (optional, handled by default above)
UPDATE public.profiles SET is_active = false WHERE is_active IS NULL;
