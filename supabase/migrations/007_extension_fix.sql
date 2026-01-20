-- Move extensions to a dedicated schema
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- Update search path to include extensions
ALTER DATABASE postgres SET search_path TO "$user", public, extensions;
