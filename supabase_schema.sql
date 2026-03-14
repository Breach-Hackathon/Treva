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
