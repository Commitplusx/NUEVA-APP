-- Agrega la columna driver_id a la tabla service_requests
ALTER TABLE public.service_requests
ADD COLUMN IF NOT EXISTS driver_id uuid REFERENCES auth.users(id);

-- Crea una política para que los repartidores puedan "tomar" un pedido
-- (Permite actualizar solo si el pedido está 'pending' y aún no tiene driver)
DROP POLICY IF EXISTS "Drivers can accept pending requests" ON public.service_requests;
CREATE POLICY "Drivers can accept pending requests"
ON public.service_requests
FOR UPDATE
USING (status = 'pending' AND driver_id IS NULL)
WITH CHECK (driver_id = auth.uid() AND status = 'accepted');

-- Permitir que los drivers vean los pedidos pendientes (y los suyos propios)
DROP POLICY IF EXISTS "Drivers can view pending requests" ON public.service_requests;
CREATE POLICY "Drivers can view pending requests"
ON public.service_requests
FOR SELECT
TO authenticated
USING (status = 'pending' OR driver_id = auth.uid());
