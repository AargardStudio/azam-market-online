-- =========================================================================
-- Azam Market Online — 04: Engagement logging, admin users, assistance tickets
-- =========================================================================

create table inquiry_logs (
  id            uuid primary key default gen_random_uuid(),
  vendor_id     uuid not null references vendors(id) on delete cascade,
  event_type    inquiry_event_type not null,
  catalogue_id  uuid references catalogues(id) on delete set null,
  ip_hash       text,
  created_at    timestamptz not null default now()
);

create index idx_inquiry_logs_vendor_id on inquiry_logs (vendor_id);
create index idx_inquiry_logs_created_at on inquiry_logs (created_at);

-- Platform staff/admins. user_id links to Supabase Auth for the admin login.
create table admin_users (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid unique references auth.users(id) on delete set null,
  name        text not null,
  email       text not null unique,
  role        admin_role not null default 'staff',
  created_at  timestamptz not null default now()
);

create table vendor_assistance_requests (
  id               uuid primary key default gen_random_uuid(),
  vendor_id        uuid not null references vendors(id) on delete cascade,
  vendor_name      text not null,
  stall_number     text,
  contact_person   text,
  whatsapp         text,
  category         assistance_category not null default 'general',
  subject          text not null,
  message          text,
  urgency          assistance_urgency not null default 'normal',
  status           assistance_status not null default 'pending',
  created_at       timestamptz not null default now(),
  admin_notes      text
);

create index idx_assistance_vendor_id on vendor_assistance_requests (vendor_id);
create index idx_assistance_status on vendor_assistance_requests (status);
