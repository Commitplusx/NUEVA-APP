-- Add missing columns to menu_items table
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS category text DEFAULT 'Varios',
ADD COLUMN IF NOT EXISTS customization_options jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true;

-- Update existing rows to have default values if needed (though defaults handle new inserts)
UPDATE public.menu_items SET category = 'Varios' WHERE category IS NULL;
UPDATE public.menu_items SET customization_options = '[]'::jsonb WHERE customization_options IS NULL;
UPDATE public.menu_items SET is_available = true WHERE is_available IS NULL;
