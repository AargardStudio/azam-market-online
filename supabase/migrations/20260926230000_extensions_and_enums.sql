-- =========================================================================
-- Azam Market Online — 01: Extensions & Enums
-- =========================================================================

create extension if not exists pgcrypto;   -- gen_random_uuid()

-- ---- Enum types (mirrors src/types.ts unions) --------------------------

create type vendor_status as enum ('pending', 'active', 'suspended');

create type tier_name as enum ('basic', 'standard', 'premium');

create type inquiry_event_type as enum (
  'whatsapp_click',
  'email_click',
  'call_click',
  'message_click',
  'catalogue_download',
  'profile_view'
);

create type admin_role as enum ('super_admin', 'staff');

create type payment_gateway_id as enum ('jazzcash', 'payfast', 'keenu', 'stripe');

create type payment_purpose as enum (
  'subscription_upgrade',
  'subscription_renewal',
  'sample_booking_deposit',
  'wholesale_order'
);

create type payment_status as enum ('completed', 'pending', 'failed');

create type settlement_currency as enum ('PKR', 'USD');

create type erp_permission as enum (
  'read:vendors',
  'read:products',
  'write:products',
  'write:inventory',
  'read:leads',
  'admin:all'
);

create type erp_webhook_event as enum (
  'inquiry.created',
  'vendor.updated',
  'product.updated',
  'catalogue.downloaded'
);

create type erp_sync_direction as enum ('inbound', 'outbound');
create type erp_sync_status as enum ('success', 'failed', 'in_progress');
create type erp_sync_mode as enum ('realtime', 'batch_hourly', 'batch_nightly', 'manual');

create type update_category as enum (
  'feature', 'logistics', 'security', 'market_policy', 'payment', 'vendor_guide'
);
create type update_importance as enum ('normal', 'high', 'critical');

create type service_category as enum (
  'digitization', 'logistics', 'payments', 'media', 'enterprise', 'legal'
);

create type assistance_category as enum (
  'catalog_upload',
  'photography_session',
  'bilty_logistics',
  'payment_gateway',
  'erp_sync',
  'dispute_resolution',
  'general'
);
create type assistance_urgency as enum ('normal', 'high', 'urgent');
create type assistance_status as enum ('pending', 'in_progress', 'resolved');
