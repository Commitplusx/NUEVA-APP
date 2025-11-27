-- Enable RLS on critical tables
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_categories ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for Restaurants
DROP POLICY IF EXISTS "Allow public read access to restaurants" ON public.restaurants;
CREATE POLICY "Allow public read access to restaurants"
ON public.restaurants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admins to manage restaurants" ON public.restaurants;
CREATE POLICY "Allow admins to manage restaurants"
ON public.restaurants FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Policies for Categories
DROP POLICY IF EXISTS "Allow public read access to categories" ON public.categories;
CREATE POLICY "Allow public read access to categories"
ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admins to manage categories" ON public.categories;
CREATE POLICY "Allow admins to manage categories"
ON public.categories FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Policies for Menu Items
DROP POLICY IF EXISTS "Allow public read access to menu_items" ON public.menu_items;
CREATE POLICY "Allow public read access to menu_items"
ON public.menu_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admins to manage menu_items" ON public.menu_items;
CREATE POLICY "Allow admins to manage menu_items"
ON public.menu_items FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Policies for Tariffs
DROP POLICY IF EXISTS "Allow public read access to tariffs" ON public.tariffs;
CREATE POLICY "Allow public read access to tariffs"
ON public.tariffs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admins to manage tariffs" ON public.tariffs;
CREATE POLICY "Allow admins to manage tariffs"
ON public.tariffs FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Policies for Restaurant Categories
DROP POLICY IF EXISTS "Allow public read access to restaurant_categories" ON public.restaurant_categories;
CREATE POLICY "Allow public read access to restaurant_categories"
ON public.restaurant_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admins to manage restaurant_categories" ON public.restaurant_categories;
CREATE POLICY "Allow admins to manage restaurant_categories"
ON public.restaurant_categories FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());
