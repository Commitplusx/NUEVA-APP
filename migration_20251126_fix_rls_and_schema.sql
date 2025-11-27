-- 1. Ensure driver_id exists in orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES auth.users(id);

-- 2. Fix Profiles RLS (Allow public read so customers can see driver info)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;

CREATE POLICY "Allow public read access to profiles"
ON public.profiles FOR SELECT USING (true);

-- 3. Fix Orders RLS for Drivers
DROP POLICY IF EXISTS "Drivers can view available or assigned orders" ON public.orders;

CREATE POLICY "Drivers can view available or assigned orders"
ON public.orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'driver'
  )
  AND
  (driver_id = auth.uid() OR (driver_id IS NULL AND status = 'pending'))
);

-- 4. Allow Drivers to update orders (e.g. to accept them or change status)
DROP POLICY IF EXISTS "Drivers can update assigned orders" ON public.orders;

CREATE POLICY "Drivers can update assigned orders"
ON public.orders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'driver'
  )
  AND
  (driver_id = auth.uid() OR (driver_id IS NULL AND status = 'pending'))
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'driver'
  )
);
