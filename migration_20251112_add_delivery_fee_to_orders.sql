-- migration_20251112_add_delivery_fee_to_orders.sql

-- Add delivery_fee column to the orders table
ALTER TABLE orders
ADD COLUMN delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00;

-- Update total_amount to include delivery_fee for existing orders (if any)
-- This is a placeholder. In a real scenario, you might need more complex logic
-- to calculate and backfill delivery fees for existing orders based on historical data.
-- For now, we'll assume new orders will correctly calculate this.

-- Add comment for the new column
COMMENT ON COLUMN orders.delivery_fee IS 'The delivery fee charged for the order.';
