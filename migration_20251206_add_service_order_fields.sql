-- migration_20251206_add_service_order_fields.sql
-- Adds fields needed for service orders (mandaditos) and makes delivery_address nullable for drafts

-- Add new columns for service orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'food';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS recipient_phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS description TEXT;

-- Make delivery_address nullable to allow partial drafts
ALTER TABLE orders ALTER COLUMN delivery_address DROP NOT NULL;

-- Add comment to explain order_type
COMMENT ON COLUMN orders.order_type IS 'Type of order: "food" for restaurant orders, "service" for mandaditos/deliveries';
COMMENT ON COLUMN orders.pickup_address IS 'Pickup location for service orders (mandaditos)';
COMMENT ON COLUMN orders.recipient_phone IS 'Phone number of the recipient for service orders';
COMMENT ON COLUMN orders.description IS 'Description of the service/package for mandaditos';
