-- Add restaurant_id to banners table
ALTER TABLE public.banners 
ADD COLUMN restaurant_id BIGINT REFERENCES public.restaurants(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_banners_restaurant_id ON public.banners(restaurant_id);
