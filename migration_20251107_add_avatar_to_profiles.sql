-- --------------------------------------------------------
-- Add avatar_url to profiles table
-- --------------------------------------------------------

ALTER TABLE public.profiles
ADD COLUMN avatar_url TEXT;

-- --------------------------------------------------------
-- Create storage bucket for avatars
-- --------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------
-- Add policies for avatars bucket
-- --------------------------------------------------------

-- Allow public read access to avatars
CREATE POLICY "Allow public read access to avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Allow individual insert for avatars"
ON storage.objects
FOR INSERT
WITH CHECK (auth.uid() = owner AND bucket_id = 'avatars');

-- Allow authenticated users to update their own avatar
CREATE POLICY "Allow individual update for avatars"
ON storage.objects
FOR UPDATE
USING (auth.uid() = owner AND bucket_id = 'avatars');

-- Allow authenticated users to delete their own avatar
CREATE POLICY "Allow individual delete for avatars"
ON storage.objects
FOR DELETE
USING (auth.uid() = owner AND bucket_id = 'avatars');
