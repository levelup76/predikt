-- Add soft delete, retention, and audit columns to events
alter table events 
add column if not exists deleted_at timestamp with time zone;

-- Add audit log table
create table if not exists event_audit_logs (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  action text not null, -- 'delete', 'restore', 'visibility_change', etc.
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add notification table
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  event_id uuid references events(id) on delete cascade,
  message text not null,
  dismissed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Schedule permanent removal after 7 days (to be handled by backend or scheduled job)
-- Example: DELETE FROM events WHERE deleted_at IS NOT NULL AND deleted_at < now() - interval '7 days';

-- Add restore logic in admin dashboard (handled in application code)

-- Add visibility control in admin dashboard (handled in application code)

-- Add audit log viewing in admin dashboard (handled in application code)

-- Add notification logic for owners (handled in application code)
