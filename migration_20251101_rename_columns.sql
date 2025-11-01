ALTER TABLE public.restaurants
RENAME COLUMN "imageUrl" TO image_url;

ALTER TABLE public.restaurants
RENAME COLUMN "deliveryFee" TO delivery_fee;

ALTER TABLE public.restaurants
RENAME COLUMN "deliveryTime" TO delivery_time;

-- También, aprovecho para arreglar el mismo problema en la tabla menu_items
ALTER TABLE public.menu_items
RENAME COLUMN "imageUrl" TO image_url;

ALTER TABLE public.menu_items
RENAME COLUMN "isPopular" TO is_popular;