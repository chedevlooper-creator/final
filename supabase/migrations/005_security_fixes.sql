-- Security fixes for functions and views

-- Update search paths for existing functions to prevent search path hijacking
ALTER FUNCTION update_updated_at_column() SET search_path = public;
ALTER FUNCTION update_updated_at() SET search_path = public;

-- Ensure views use SECURITY INVOKER
-- (Note: If needy_card_summary was SECURITY DEFINER, we recreate it)
-- This is a placeholder since I don't have the original view definition,
-- but the summary says it was replaced.

-- Example of recreating a view with security invoker:
-- DROP VIEW IF EXISTS needy_card_summary;
-- CREATE VIEW needy_card_summary WITH (security_invoker = true) AS 
-- SELECT * FROM ...;
