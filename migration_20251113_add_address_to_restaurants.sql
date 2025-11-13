-- Add structured address columns and coordinates to the restaurants table
ALTER TABLE public.restaurants
ADD COLUMN street_address TEXT,
ADD COLUMN neighborhood TEXT,
ADD COLUMN city TEXT,
ADD COLUMN postal_code TEXT,
ADD COLUMN lat double precision,
ADD COLUMN lng double precision;

-- Add comments to describe the new fields
COMMENT ON COLUMN public.restaurants.street_address IS 'Street and number of the restaurant''s address.';
COMMENT ON COLUMN public.restaurants.neighborhood IS 'Neighborhood of the restaurant''s address.';
COMMENT ON COLUMN public.restaurants.city IS 'City of the restaurant''s address.';
COMMENT ON COLUMN public.restaurants.postal_code IS 'Postal code of the restaurant''s address.';
COMMENT ON COLUMN public.restaurants.lat IS 'Latitude of the restaurant''s location.';
COMMENT ON COLUMN public.restaurants.lng IS 'Longitude of the restaurant''s location.';

-- Ensure RLS is enabled for the table. This is a good practice.
-- If RLS is already enabled, this command will do nothing.
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- NOTE: After running this migration, you may need to update your Row Level Security (RLS) policies
-- in the Supabase dashboard to allow admins to update these new columns and for users to read them.
--
-- Example for allowing public read access:
-- CREATE POLICY "Allow public read access to restaurant addresses"
-- ON public.restaurants FOR SELECT
-- USING (true);
--
-- Example for allowing admins to manage restaurants:
-- CREATE POLICY "Allow admins to manage restaurants"
-- ON public.restaurants FOR ALL
-- USING ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin')
-- WITH CHECK ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin');
--
-- Please review and adjust your policies as per your application's security requirements.
