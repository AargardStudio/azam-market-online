-- =========================================================================
-- Azam Market Online — 06: ERP integration bridge
-- =========================================================================
-- These tables back the Aargard admin "ERP Integration Manager". They are
-- service-role-only (see RLS in migration 09) — no anon/authenticated
-- client should ever read api_keys.token_hash or webhooks.secret directly.

-- Singleton config row (id is always true, enforced by the check constraint).
create table erp_config (
  id                        boolean primary key default true check (id),
  is_enabled                boolean not null default false,
  system_name               text,
  system_version            text,
  sync_mode                 erp_sync_mode not null default 'manual',
  base_api_url              text,
  auto_sync_inventory       boolean not null default false,
  auto_sync_pricing         boolean not null default false,
  forward_whatsapp_leads    boolean not null default false,
  rate_limit_per_minute     integer not null default 60,
  ip_whitelist              text,
  last_successful_sync      timestamptz,
  updated_at                timestamptz not null default now()
);

insert into erp_config (id) values (true);

create table erp_api_keys (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  key_preview    text not null,       -- e.g. 'azm_live_98f4a1...' first chars, safe to display
  token_hash     text not null,       -- store a hash (e.g. sha256) of the real token, never the raw value
  permissions    erp_permission[] not null default '{}',
  created_at     timestamptz not null default now(),
  last_used_at   timestamptz,
  is_active      boolean not null default true
);

create table erp_webhooks (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  url                text not null,
  secret             text not null,   -- used to sign outbound payloads; keep server-side only
  events             erp_webhook_event[] not null default '{}',
  is_active          boolean not null default true,
  last_delivered_at  timestamptz,
  failure_count      integer not null default 0
);

create table erp_sync_logs (
  id               uuid primary key default gen_random_uuid(),
  "timestamp"      timestamptz not null default now(),
  event            text not null,
  direction        erp_sync_direction not null,
  status           erp_sync_status not null,
  records_count    integer not null default 0,
  message          text,
  payload_summary  text
);

create index idx_erp_sync_logs_timestamp on erp_sync_logs ("timestamp");
