-- Add short_id column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS short_id TEXT;

-- Update existing orders to have a short_id (using first 8 chars of UUID)
UPDATE orders SET short_id = SUBSTRING(id::text FROM 1 FOR 8) WHERE short_id IS NULL;

-- Create a trigger to automatically set short_id on new orders
CREATE OR REPLACE FUNCTION set_short_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.short_id := SUBSTRING(NEW.id::text FROM 1 FOR 8);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_short_id_trigger
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION set_short_id();

-- Index for faster lookup
CREATE INDEX IF NOT EXISTS idx_orders_short_id ON orders(short_id);
