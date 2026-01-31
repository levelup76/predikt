-- Users & Profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  is_admin boolean default false, -- SUPER ADMIN flag

  constraint username_length check (char_length(username) >= 3)
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Events table (User Generated)
create table events (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  creator_id uuid references auth.users(id) not null, -- KI HOZTA LÉTRE
  
  title text not null,
  slug text unique not null,
  description text,
  category text default 'other', -- sport, politics, awards, other
  
  cover_image text, -- URL to storage
  theme text default 'modern', -- modern, elegant, retro, neon
  source_url text, -- "Igazság forrása" link
  
  lock_at timestamp with time zone not null,
  reveal_at timestamp with time zone,
  
  is_featured boolean default false, -- Admin emelheti ki
  status text check (status in ('draft', 'open', 'locked', 'revealed')) default 'draft',
  
  result_json jsonb -- Official outcome saved by creator
);

alter table events enable row level security;

create policy "Events are viewable by everyone." on events for select using (true);

-- Create: Bárki létrehozhat eseményt, aki be van lépve
create policy "Authenticated users can create events." on events
  for insert with check (auth.uid() = creator_id);

-- Update: Csak a létrehozó (vagy admin) szerkesztheti
create policy "Users can update own events." on events
  for update using (auth.uid() = creator_id);

-- Markets (Questions)
create table markets (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade not null,
  question text not null,
  type text default 'select', -- select, boolean, range (későbbi bővíthetőség)
  options_json jsonb not null, -- pl. [{id: "1", label: "Real Madrid"}, {id: "2", label: "Barca"}]
  "order" int default 0
);

alter table markets enable row level security;

create policy "Markets are viewable by everyone." on markets for select using (true);

-- Piacokat csak az esemény létrehozója szerkesztheti
create policy "Creators can manage markets." on markets
  for all using (
    exists (
      select 1 from events
      where events.id = markets.event_id
      and events.creator_id = auth.uid()
    )
  );

-- Predictions (Tippek)
create table predictions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  event_id uuid references events(id) on delete cascade not null,
  
  picks_json jsonb not null, -- { "market_id": "option_id" }
  submitted_at timestamp with time zone,
  locked boolean default false,
  points int default 0, -- Kiszámolt pontszám
  
  unique(user_id, event_id)
);

alter table predictions enable row level security;

create policy "Predictions are viewable by everyone." on predictions for select using (true);
create policy "Users can create their own predictions." on predictions for insert with check (auth.uid() = user_id);
create policy "Users can update their own predictions if not locked." on predictions for update using (auth.uid() = user_id and locked = false);

-- Trigger: New user -> Profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, username)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'user_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid duplication errors on multiple runs
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
