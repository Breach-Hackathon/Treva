create table public.contact_requests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text not null,
  phone text,
  party text,
  dates text,
  notes text
);

-- Set up Row Level Security (RLS)
alter table public.contact_requests enable row level security;

-- Allow anyone to insert rows (so the public form works)
create policy "Allow public inserts" on public.contact_requests
  for insert
  to public
  with check (true);

-- Saved AI itineraries (wishlist)
create table if not exists public.wishlist_trips (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  destination text,
  estimated_budget text,
  prompt text,
  trip_data jsonb not null
);

alter table public.wishlist_trips enable row level security;

create policy "Users can read own wishlist" on public.wishlist_trips
  for select
  using (auth.uid() = user_id);

create policy "Users can insert into own wishlist" on public.wishlist_trips
  for insert
  with check (auth.uid() = user_id);

create policy "Users can delete from own wishlist" on public.wishlist_trips
  for delete
  using (auth.uid() = user_id);
