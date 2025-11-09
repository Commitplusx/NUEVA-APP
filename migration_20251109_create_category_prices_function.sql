CREATE OR REPLACE FUNCTION get_category_starting_prices()
RETURNS TABLE(category_id BIGINT, starting_price NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS category_id,
    COALESCE(MIN(mi.price), 0) AS starting_price
  FROM
    categories c
  LEFT JOIN
    restaurant_categories rc ON c.id = rc.category_id
  LEFT JOIN
    menu_items mi ON rc.restaurant_id = mi.restaurant_id
  GROUP BY
    c.id;
END;
$$ LANGUAGE plpgsql;
