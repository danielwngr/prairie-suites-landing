-- Prairie Suites landing page schema.
-- Safe to re-run any time (idempotent) - use this as the source of truth for
-- what should exist in Supabase.

create extension if not exists "pgcrypto";

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  interest_type text not null default 'other' check (interest_type in ('tenant', 'updates', 'other')),
  message text,
  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on leads (created_at desc);
create index if not exists leads_interest_type_idx on leads (interest_type);

-- Row Level Security: locked down by default. The landing page's form
-- submits through the /api/subscribe serverless function, which uses the
-- Supabase service role key (bypasses RLS), so no public insert policy is
-- needed here. Only read this table from the Supabase dashboard or another
-- service-role-authenticated context.
alter table leads enable row level security;
