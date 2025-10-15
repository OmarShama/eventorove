-- Create the schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS eventorove_dev;

-- Grant permissions to the postgres user
GRANT ALL PRIVILEGES ON SCHEMA eventorove_dev TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA eventorove_dev TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA eventorove_dev TO postgres;

-- Set the default schema for the database
ALTER DATABASE eventorove SET search_path TO eventorove_dev, public;
