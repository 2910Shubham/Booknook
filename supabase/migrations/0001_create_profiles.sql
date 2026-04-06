create table if not exists public.profiles (
    id text primary key,
    email text,
    name text,
    avatar_url text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
