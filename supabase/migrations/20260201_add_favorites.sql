-- Add favorites_json column to predictions table
alter table predictions 
add column if not exists favorites_json jsonb default '{}'::jsonb;
