-- Prairie Suites landing page schema.
-- Safe to re-run any time (idempotent) - use this as the source of truth for
-- what should exist in Supabase.

create extension if not exists "pgcrypto";

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  -- The form only ever submits 'tenant' now (the page is solely a groomer/
  -- tenant interest form, no more general "keep me updated" audience).
  -- 'updates' and 'other' are kept in the check constraint only so any
  -- pre-existing rows from before this change stay valid.
  interest_type text not null default 'tenant' check (interest_type in ('tenant', 'updates', 'other')),
  experience text,
  current_workplace text,
  portfolio_url text,
  timeline text,
  client_base text,
  services text[] not null default '{}',
  referral_source text,
  message text,
  created_at timestamptz not null default now()
);

-- Idempotent column additions for existing tables created before these
-- fields existed (e.g. already-deployed production databases).
alter table leads add column if not exists experience text;
alter table leads add column if not exists current_workplace text;
alter table leads add column if not exists portfolio_url text;
alter table leads add column if not exists timeline text;
alter table leads add column if not exists client_base text;
alter table leads add column if not exists services text[] not null default '{}';
alter table leads add column if not exists referral_source text;

create index if not exists leads_created_at_idx on leads (created_at desc);
create index if not exists leads_interest_type_idx on leads (interest_type);

-- Row Level Security: locked down by default. The landing page's form
-- submits through the /api/subscribe serverless function, which uses the
-- Supabase service role key (bypasses RLS), so no public insert policy is
-- needed here. Only read this table from the Supabase dashboard or another
-- service-role-authenticated context.
alter table leads enable row level security;
