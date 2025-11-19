ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS origin_lat numeric;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS origin_lng numeric;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS destination_lat numeric;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS destination_lng numeric;
