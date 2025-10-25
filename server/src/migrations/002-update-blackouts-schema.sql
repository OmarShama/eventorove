-- Migration to update blackouts table from date-based to day/time-based structure
-- This handles existing data by dropping and recreating the table

-- First, drop the existing blackouts table (this will also drop any existing data)
-- If you need to preserve existing data, you would need to export it first
DROP TABLE IF EXISTS blackouts CASCADE;

-- Recreate the blackouts table with the new schema
CREATE TABLE blackouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_blackouts_venue_day ON blackouts(venue_id, day_of_week);
