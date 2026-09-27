-- =========================================================================
-- Azam Market Online — 03: Vendors, products, catalogues, shop customization
-- =========================================================================

create table vendors (
  id               uuid primary key default gen_random_uuid(),
  -- linked to Supabase Auth once a vendor account exists (magic-link login)
  user_id          uuid unique references auth.users(id) on delete set null,
  market_id        uuid not null references markets(id) on delete restrict,
  tier_id          text not null default 't-basic' references subscription_tiers(id),
  slug             text not null unique,
  shop_name        text not null,
  stall_number     text,
  description      text,
  logo_url         text,
  cover_url        text,
  whatsapp         text,
  email            text not null unique,
  website          text,
  tags             text[] not null default '{}',
  is_verified      boolean not null default false,
  is_featured      boolean not null default false,
  status           vendor_status not null default 'pending',
  profile_views    integer not null default 0,
  whatsapp_clicks  integer not null default 0,
  email_clicks     integer not null default 0,
  call_clicks      integer not null default 0,
  message_clicks   integer not null default 0,
  onboarded_by     text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_vendors_market_id on vendors (market_id);
create index idx_vendors_tier_id on vendors (tier_id);
create index idx_vendors_status on vendors (status);
create index idx_vendors_slug on vendors (slug);

-- Many-to-many: a vendor can list under several fabric categories
create table vendor_categories (
  vendor_id    uuid not null references vendors(id) on delete cascade,
  category_id  uuid not null references categories(id) on delete cascade,
  primary key (vendor_id, category_id)
);

create table products (
  id            uuid primary key default gen_random_uuid(),
  vendor_id     uuid not null references vendors(id) on delete cascade,
  name          text not null,
  description   text,
  fabric_type   text,
  price_range   text,       -- e.g. '₨800–1200/m'
  moq           text,       -- e.g. '50 metres'
  image_url     text,
  is_active     boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

create index idx_products_vendor_id on products (vendor_id);

create table catalogues (
  id               uuid primary key default gen_random_uuid(),
  vendor_id        uuid not null references vendors(id) on delete cascade,
  title            text not null,
  description      text,
  pdf_url          text not null,
  file_size_mb     numeric(10, 2),
  season           text,       -- e.g. 'Summer 2026'
  download_count   integer not null default 0,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

create index idx_catalogues_vendor_id on catalogues (vendor_id);

-- One-to-one storefront customization/theme record per vendor.
-- Nested/variable-shape blocks (whatsapp_button, bank_details, faqs, blocks[], etc.)
-- are stored as jsonb rather than exploded into columns, matching the flexible
-- ShopCustomization shape in src/types.ts.
create table shop_customizations (
  vendor_id                 uuid primary key references vendors(id) on delete cascade,
  is_published               boolean not null default true,
  published_at               timestamptz,
  last_saved_at               timestamptz,

  theme_color                 text not null default '#0F5C3A',
  accent_color                 text not null default '#C9952A',
  background_tone              text not null default 'white',
  font_style                   text not null default 'classic_serif',

  header_layout                text not null default 'standard',
  show_announcement             boolean not null default true,
  announcement_text             text,
  show_market_badge             boolean not null default true,
  logo_shape                    text not null default 'rounded',
  logo_url                      text,

  hero_layout                   text not null default 'banner_overlay',
  hero_headline                 text,
  hero_tagline                  text,
  hero_cover_url                 text,
  hero_show_whatsapp             boolean not null default true,
  hero_show_phone                boolean not null default true,
  hero_show_catalogue_btn        boolean not null default true,
  hero_badge_text                text,
  verification_badge_url         text,
  video_url                      text,

  whatsapp_button                jsonb not null default '{}'::jsonb,
  phone_button                   jsonb not null default '{}'::jsonb,
  product_pricing                 jsonb not null default '{}'::jsonb,
  show_stats                      boolean not null default true,
  stats_display                    jsonb not null default '{}'::jsonb,
  bank_details                     jsonb not null default '{}'::jsonb,
  faqs                             jsonb not null default '[]'::jsonb,
  blocks                           jsonb not null default '[]'::jsonb,

  updated_at                       timestamptz not null default now()
);
