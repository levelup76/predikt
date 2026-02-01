-- Add visibility column to events table
alter table events 
add column if not exists visibility text default 'public' check (visibility in ('public', 'private'));

-- Update RLS policy to only show public events in lists, but allow access by ID/Link if private
-- Note: 'Events are viewable by everyone.' policy currently allows select using (true).
-- We need to change this logic in the application query (filtering) or RLS.
-- Since direct link access is needed for private events, RLS 'true' is actually fine for reading,
-- we just need to filter them out in the public list query on the Homepage.
