-- =========================================================================
-- Azam Market Online — 09: Row Level Security
-- =========================================================================
-- Model:
--   * "public" (anon + authenticated, unauthenticated buyers browsing the
--     directory) can read active/published records only.
--   * A vendor (authenticated, vendors.user_id = auth.uid()) can manage
--     their own shop, products, catalogues, customization and tickets.
--   * An admin (authenticated, present in admin_users) can read/write
--     everything through these policies.
--   * The service_role key (used by trusted server code / edge functions)
--     bypasses RLS entirely — that's where payment inserts, ERP secrets and
--     bulk admin operations should actually happen.

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from admin_users a
    where a.user_id = auth.uid()
  );
$$;

create or replace function owns_vendor(p_vendor_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from vendors v
    where v.id = p_vendor_id
      and v.user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------- markets
alter table markets enable row level security;

create policy "markets_public_read" on markets
  for select using (is_active or is_admin());

create policy "markets_admin_write" on markets
  for all using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------- categories
alter table categories enable row level security;

create policy "categories_public_read" on categories
  for select using (true);

create policy "categories_admin_write" on categories
  for all using (is_admin()) with check (is_admin());

-- ------------------------------------------------------- subscription_tiers
alter table subscription_tiers enable row level security;

create policy "tiers_public_read" on subscription_tiers
  for select using (true);

create policy "tiers_admin_write" on subscription_tiers
  for all using (is_admin()) with check (is_admin());

-- -------------------------------------------------------- payment_gateways
alter table payment_gateways enable row level security;

create policy "gateways_public_read" on payment_gateways
  for select using (is_enabled or is_admin());

create policy "gateways_admin_write" on payment_gateways
  for all using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------------ vendors
alter table vendors enable row level security;

create policy "vendors_public_read_active" on vendors
  for select using (status = 'active' or is_admin() or user_id = auth.uid());

create policy "vendors_public_insert_onboarding" on vendors
  -- anyone can submit a new stall for approval; it lands as 'pending'
  for insert with check (status = 'pending');

create policy "vendors_owner_update" on vendors
  for update using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

create policy "vendors_admin_delete" on vendors
  for delete using (is_admin());

-- ---------------------------------------------------------- vendor_categories
alter table vendor_categories enable row level security;

create policy "vendor_categories_public_read" on vendor_categories
  for select using (true);

create policy "vendor_categories_owner_write" on vendor_categories
  for all using (owns_vendor(vendor_id) or is_admin())
  with check (owns_vendor(vendor_id) or is_admin());

-- ------------------------------------------------------------------ products
alter table products enable row level security;

create policy "products_public_read" on products
  for select using (
    is_active
    and exists (select 1 from vendors v where v.id = vendor_id and v.status = 'active')
    or owns_vendor(vendor_id)
    or is_admin()
  );

create policy "products_owner_write" on products
  for all using (owns_vendor(vendor_id) or is_admin())
  with check (owns_vendor(vendor_id) or is_admin());

-- ----------------------------------------------------------------- catalogues
alter table catalogues enable row level security;

create policy "catalogues_public_read" on catalogues
  for select using (
    is_active
    and exists (select 1 from vendors v where v.id = vendor_id and v.status = 'active')
    or owns_vendor(vendor_id)
    or is_admin()
  );

create policy "catalogues_owner_write" on catalogues
  for all using (owns_vendor(vendor_id) or is_admin())
  with check (owns_vendor(vendor_id) or is_admin());

-- ---------------------------------------------------------- shop_customizations
alter table shop_customizations enable row level security;

create policy "shop_customizations_public_read" on shop_customizations
  for select using (
    is_published
    and exists (select 1 from vendors v where v.id = vendor_id and v.status = 'active')
    or owns_vendor(vendor_id)
    or is_admin()
  );

create policy "shop_customizations_owner_write" on shop_customizations
  for all using (owns_vendor(vendor_id) or is_admin())
  with check (owns_vendor(vendor_id) or is_admin());

-- ------------------------------------------------------------------ inquiry_logs
alter table inquiry_logs enable row level security;

-- Public/anon may log an inquiry event (WhatsApp click, catalogue download, etc.)
create policy "inquiry_logs_public_insert" on inquiry_logs
  for insert with check (true);

create policy "inquiry_logs_owner_read" on inquiry_logs
  for select using (owns_vendor(vendor_id) or is_admin());

-- ------------------------------------------------------------------- admin_users
alter table admin_users enable row level security;

create policy "admin_users_self_read" on admin_users
  for select using (user_id = auth.uid() or is_admin());

create policy "admin_users_super_admin_write" on admin_users
  for all using (
    exists (select 1 from admin_users a where a.user_id = auth.uid() and a.role = 'super_admin')
  )
  with check (
    exists (select 1 from admin_users a where a.user_id = auth.uid() and a.role = 'super_admin')
  );

-- --------------------------------------------------- vendor_assistance_requests
alter table vendor_assistance_requests enable row level security;

create policy "assistance_owner_read" on vendor_assistance_requests
  for select using (owns_vendor(vendor_id) or is_admin());

create policy "assistance_owner_insert" on vendor_assistance_requests
  for insert with check (owns_vendor(vendor_id) or is_admin());

create policy "assistance_admin_update" on vendor_assistance_requests
  for update using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------- payment_transactions
alter table payment_transactions enable row level security;

-- No INSERT/UPDATE policy for anon/authenticated on purpose: real payment
-- writes must go through a trusted server (edge function) using the
-- service_role key, which bypasses RLS. Clients may only read their own.
create policy "payment_tx_owner_read" on payment_transactions
  for select using (owns_vendor(vendor_id) or is_admin());

-- ------------------------------------------------------------------------- erp_*
-- ERP tables hold secrets (token hashes, webhook signing secrets, internal
-- sync logs) and are intentionally service_role-only: no policies are
-- created for anon/authenticated, so RLS denies all client access by
-- default while service_role (used by your backend) still has full access.
alter table erp_config enable row level security;
alter table erp_api_keys enable row level security;
alter table erp_webhooks enable row level security;
alter table erp_sync_logs enable row level security;

create policy "erp_config_admin_read" on erp_config
  for select using (is_admin());

-- ------------------------------------------------------------------- ceo_profile
alter table ceo_profile enable row level security;

create policy "ceo_profile_public_read" on ceo_profile
  for select using (true);

create policy "ceo_profile_admin_write" on ceo_profile
  for update using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------- aargard_updates
alter table aargard_updates enable row level security;

create policy "aargard_updates_public_read" on aargard_updates
  for select using (is_published or is_admin());

create policy "aargard_updates_admin_write" on aargard_updates
  for all using (is_admin()) with check (is_admin());

-- --------------------------------------------------------------- aargard_services
alter table aargard_services enable row level security;

create policy "aargard_services_public_read" on aargard_services
  for select using (is_active or is_admin());

create policy "aargard_services_admin_write" on aargard_services
  for all using (is_admin()) with check (is_admin());
