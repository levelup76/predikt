-- Add edited_at column to events table to track when event details were last modified
ALTER TABLE events ADD COLUMN IF NOT EXISTS edited_at timestamptz;
