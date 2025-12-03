-- Fix RLS for order_items to allow drivers to view items
-- Created: 2025-12-02

DROP POLICY IF EXISTS "Drivers can view items of available or assigned orders" ON public.order_items;

CREATE POLICY "Drivers can view items of available or assigned orders"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND (
      orders.driver_id = auth.uid() 
      OR (orders.driver_id IS NULL AND orders.status = 'pending')
    )
  )
  AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'driver'
  )
);

-- Ensure menu_items is readable by everyone (if not already)
DROP POLICY IF EXISTS "Allow public read access to menu_items" ON public.menu_items;
CREATE POLICY "Allow public read access to menu_items"
ON public.menu_items FOR SELECT
USING (true);
