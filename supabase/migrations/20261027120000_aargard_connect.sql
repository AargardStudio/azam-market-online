-- =========================================================================
-- Aargard Connect V2.0 — admin API & integrations (additive, non-destructive)
-- Run once in the Supabase SQL Editor (project uopyehebqdlddcjykxwu).
-- All tables are service-role only: RLS on, no policies. Access happens
-- exclusively through the /api/connect* serverless functions.
-- =========================================================================

create table if not exists connect_api_keys (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null,
  environment            text not null default 'live' check (environment in ('live','test')),
  key_prefix             text not null,              -- first chars, safe to display
  key_hash               text not null unique,       -- sha256 of the raw key. Raw key is never stored.
  scopes                 text[] not null default '{}',
  rate_limit_per_minute  integer not null default 60 check (rate_limit_per_minute between 1 and 10000),
  is_active              boolean not null default true,
  expires_at             timestamptz,
  created_by             uuid,
  created_at             timestamptz not null default now(),
  last_used_at           timestamptz,
  revoked_at             timestamptz
);

create table if not exists connect_webhook_endpoints (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  url                text not null check (url ~* '^https://'),
  secret             text not null,   -- HMAC signing secret; must be recoverable server-side to sign. Shown once in UI.
  events             text[] not null default '{}',   -- '*' = all
  is_active          boolean not null default true,
  failure_count      integer not null default 0,
  last_delivered_at  timestamptz,
  created_at         timestamptz not null default now()
);

create table if not exists connect_webhook_deliveries (
  id               uuid primary key default gen_random_uuid(),
  endpoint_id      uuid not null references connect_webhook_endpoints(id) on delete cascade,
  event            text not null,
  payload          jsonb not null,
  status           text not null default 'pending' check (status in ('pending','delivered','failed')),
  attempts         integer not null default 0,
  next_attempt_at  timestamptz not null default now(),
  last_status_code integer,
  last_error       text,
  created_at       timestamptz not null default now(),
  delivered_at     timestamptz
);
create index if not exists idx_connect_deliveries_due on connect_webhook_deliveries (status, next_attempt_at);
create index if not exists idx_connect_deliveries_endpoint on connect_webhook_deliveries (endpoint_id, created_at desc);

create table if not exists connect_audit_log (
  id          bigint generated always as identity primary key,
  key_id      uuid,
  actor       text not null default 'api',     -- 'api' | 'admin:<email>'
  method      text,
  path        text,
  status      integer,
  ip_hash     text,
  detail      text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_connect_audit_created on connect_audit_log (created_at desc);

create table if not exists connect_rate_hits (
  key_id        uuid not null,
  window_start  timestamptz not null,
  hits          integer not null default 0,
  primary key (key_id, window_start)
);

alter table connect_api_keys             enable row level security;
alter table connect_webhook_endpoints    enable row level security;
alter table connect_webhook_deliveries   enable row level security;
alter table connect_audit_log            enable row level security;
alter table connect_rate_hits            enable row level security;

-- Atomic per-minute rate limiter. Returns true when the call is within the limit.
create or replace function connect_rate_hit(p_key uuid, p_limit integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare h integer;
begin
  insert into connect_rate_hits (key_id, window_start, hits)
  values (p_key, date_trunc('minute', now()), 1)
  on conflict (key_id, window_start) do update set hits = connect_rate_hits.hits + 1
  returning hits into h;
  return h <= p_limit;
end $$;
revoke all on function connect_rate_hit(uuid, integer) from public, anon, authenticated;

-- Queue an event for every active endpoint subscribed to it.
create or replace function connect_enqueue(p_event text, p_data jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into connect_webhook_deliveries (endpoint_id, event, payload)
  select e.id, p_event,
         jsonb_build_object('id', gen_random_uuid(), 'event', p_event, 'created_at', now(), 'data', p_data)
  from connect_webhook_endpoints e
  where e.is_active and ('*' = any(e.events) or p_event = any(e.events));
exception when others then
  null; -- webhook queueing must never break the business write
end $$;
revoke all on function connect_enqueue(text, jsonb) from public, anon, authenticated;

-- Event sources ---------------------------------------------------------
create or replace function connect_trg_vendor() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    perform connect_enqueue('vendor.created', jsonb_build_object('vendor_id', new.id, 'shop_name', new.shop_name, 'status', new.status));
  elsif old.status is distinct from new.status then
    perform connect_enqueue('vendor.status_changed', jsonb_build_object('vendor_id', new.id, 'shop_name', new.shop_name, 'from', old.status, 'to', new.status));
  end if;
  return new;
end $$;
drop trigger if exists connect_vendor_events on vendors;
create trigger connect_vendor_events after insert or update on vendors
  for each row execute function connect_trg_vendor();

create or replace function connect_trg_product() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform connect_enqueue(case tg_op when 'INSERT' then 'product.created' else 'product.updated' end,
    jsonb_build_object('product_id', new.id, 'vendor_id', new.vendor_id, 'name', new.name, 'is_active', new.is_active));
  return new;
end $$;
drop trigger if exists connect_product_events on products;
create trigger connect_product_events after insert or update on products
  for each row execute function connect_trg_product();

create or replace function connect_trg_inquiry() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.event_type <> 'profile_view' then   -- views are too noisy for webhooks
    perform connect_enqueue('inquiry.created',
      jsonb_build_object('inquiry_id', new.id, 'vendor_id', new.vendor_id, 'type', new.event_type));
  end if;
  return new;
end $$;
drop trigger if exists connect_inquiry_events on inquiry_logs;
create trigger connect_inquiry_events after insert on inquiry_logs
  for each row execute function connect_trg_inquiry();
