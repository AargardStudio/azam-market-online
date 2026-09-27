-- =========================================================================
-- Azam Market Online — 07: Aargard CEO memoir, platform updates, services
-- =========================================================================

-- Singleton row, same pattern as erp_config.
create table ceo_profile (
  id                 boolean primary key default true check (id),
  ceo_name           text,
  ceo_title          text,
  organization       text,
  avatar_url         text,
  signature_text     text,
  founded_year       integer,
  banner_image_url   text,
  memoir_title       text,
  memoir_subtitle    text,
  memoir_paragraphs  text[] not null default '{}',
  core_quote         text,
  quote_author       text,
  quote_subtext      text,
  vision_pillars     jsonb not null default '[]'::jsonb,
  milestones         jsonb not null default '[]'::jsonb,
  social_links       jsonb not null default '{}'::jsonb,
  updated_at         timestamptz not null default now()
);

insert into ceo_profile (id) values (true);

create table aargard_updates (
  id              uuid primary key default gen_random_uuid(),
  version         text,
  title           text not null,
  date            date not null default current_date,
  category        update_category not null default 'feature',
  badge           text,
  summary         text,
  details         text[] not null default '{}',
  vendor_impact   text,
  action_label    text,
  action_url      text,
  is_published    boolean not null default true,
  importance      update_importance not null default 'normal',
  created_at      timestamptz not null default now()
);

create table aargard_services (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null,
  tagline            text,
  category           service_category not null,
  description        text,
  features           text[] not null default '{}',
  turnaround_time    text,
  pricing_tier       text,
  icon               text,
  is_active          boolean not null default true,
  is_featured        boolean not null default false,
  contact_whatsapp   text,
  sort_order         integer not null default 0
);
