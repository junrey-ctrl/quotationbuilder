-- Skylar SalesDesk social integrations. Tokens are encrypted by the Vercel server.
create table if not exists public.social_connections (
 admin_email text not null,
 provider text not null check (provider in ('facebook','instagram','linkedin','google_business','ga4')),
 account_id text,
 account_label text not null,
 token_ciphertext jsonb not null,
 connected_at timestamptz not null default now(),
 last_synced_at timestamptz,
 last_error text,
 updated_at timestamptz not null default now(),
 primary key (admin_email, provider)
);
create table if not exists public.social_metrics (
 id bigint generated always as identity primary key,
 admin_email text not null,
 provider text not null check (provider in ('facebook','instagram','linkedin','google_business','ga4')),
 period_start date not null,
 followers bigint not null default 0 check (followers >= 0),
 reach bigint not null default 0 check (reach >= 0),
 impressions bigint not null default 0 check (impressions >= 0),
 engagements bigint not null default 0 check (engagements >= 0),
 clicks bigint not null default 0 check (clicks >= 0),
 leads bigint not null default 0 check (leads >= 0),
 raw_metrics jsonb not null default '{}'::jsonb,
 fetched_at timestamptz not null default now(),
 unique (admin_email, provider, period_start)
);
alter table public.social_connections enable row level security;
alter table public.social_metrics enable row level security;
-- No browser policies: only server API with service-role credentials can access these tables.
revoke all on public.social_connections from anon, authenticated;
revoke all on public.social_metrics from anon, authenticated;
grant all on public.social_connections to service_role;
grant all on public.social_metrics to service_role;