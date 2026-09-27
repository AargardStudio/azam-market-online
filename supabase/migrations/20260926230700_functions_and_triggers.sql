-- =========================================================================
-- Azam Market Online — 08: Functions & triggers
-- =========================================================================

-- Generic updated_at bumper
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_vendors_updated_at
  before update on vendors
  for each row execute function set_updated_at();

create trigger trg_shop_customizations_updated_at
  before update on shop_customizations
  for each row execute function set_updated_at();

create trigger trg_payment_gateways_updated_at
  before update on payment_gateways
  for each row execute function set_updated_at();

create trigger trg_erp_config_updated_at
  before update on erp_config
  for each row execute function set_updated_at();

create trigger trg_ceo_profile_updated_at
  before update on ceo_profile
  for each row execute function set_updated_at();

-- Keep categories.vendor_count in sync with vendor_categories, counting only
-- vendors that are actually live in the public directory.
create or replace function refresh_category_vendor_count(p_category_id uuid)
returns void
language sql
as $$
  update categories
  set vendor_count = (
    select count(*)
    from vendor_categories vc
    join vendors v on v.id = vc.vendor_id
    where vc.category_id = p_category_id
      and v.status = 'active'
  )
  where id = p_category_id;
$$;

create or replace function trg_vendor_categories_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    perform refresh_category_vendor_count(new.category_id);
  elsif tg_op = 'DELETE' then
    perform refresh_category_vendor_count(old.category_id);
  end if;
  return null;
end;
$$;

create trigger trg_vendor_categories_ai
  after insert or delete on vendor_categories
  for each row execute function trg_vendor_categories_count();

-- Recount affected categories whenever a vendor's status flips
-- (e.g. pending -> active on admin approval).
create or replace function trg_vendors_status_recount()
returns trigger
language plpgsql
as $$
begin
  if old.status is distinct from new.status then
    perform refresh_category_vendor_count(vc.category_id)
    from vendor_categories vc
    where vc.vendor_id = new.id;
  end if;
  return new;
end;
$$;

create trigger trg_vendors_status_recount
  after update on vendors
  for each row execute function trg_vendors_status_recount();

-- Auto-create a blank shop_customizations row whenever a vendor is created,
-- so the app can always assume one exists.
create or replace function trg_vendors_create_customization()
returns trigger
language plpgsql
as $$
begin
  insert into shop_customizations (vendor_id)
  values (new.id)
  on conflict (vendor_id) do nothing;
  return new;
end;
$$;

create trigger trg_vendors_ai_customization
  after insert on vendors
  for each row execute function trg_vendors_create_customization();
