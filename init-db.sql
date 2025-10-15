-- Create the schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS stagea_local;

-- Grant permissions to the postgres user
GRANT ALL PRIVILEGES ON SCHEMA stagea_local TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA stagea_local TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA stagea_local TO postgres;

-- Set the default schema for the database
ALTER DATABASE stagea SET search_path TO stagea_local, public;
