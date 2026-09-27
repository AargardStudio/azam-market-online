-- =========================================================================
-- Azam Market Online — 02: Reference / lookup tables
-- markets, categories, subscription_tiers, payment_gateways
-- =========================================================================

create table markets (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  city        text not null,
  country     text not null default 'Pakistan',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  icon          text not null,
  market_id     uuid references markets(id) on delete set null,
  -- cached count, kept in sync by trigger in 07_functions_and_triggers.sql
  vendor_count  integer not null default 0,
  created_at    timestamptz not null default now()
);

-- id matches the app's existing 't-basic' / 't-standard' / 't-premium' convention
create table subscription_tiers (
  id                       text primary key,
  name                     tier_name not null unique,
  display_name             text not null,
  price_pkr                numeric(12, 2) not null default 0,
  max_products             integer not null default 10,   -- -1 = unlimited
  max_catalogues           integer not null default 1,    -- -1 = unlimited
  has_analytics            boolean not null default false,
  has_verified_badge       boolean not null default false,
  has_featured_placement   boolean not null default false,
  stripe_price_id          text,
  created_at               timestamptz not null default now()
);

-- id matches the app's existing gateway ids
create table payment_gateways (
  id                  payment_gateway_id primary key,
  name                text not null,
  subtitle            text,
  badge               text,
  is_enabled          boolean not null default true,
  is_sandbox          boolean not null default true,
  merchant_id         text,
  supported_methods   text[] not null default '{}',
  settlement_currency settlement_currency not null default 'PKR',
  color               text,
  updated_at          timestamptz not null default now()
);

create index idx_categories_market_id on categories (market_id);
