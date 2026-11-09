-- Vendor access, pricing and storage allowances.
-- The paid starting tier is Standard (Rs. 1,500/month). Basic remains
-- available only for legacy/complimentary accounts.

alter table public.subscription_tiers
  add column if not exists max_storage_mb integer not null default 1024
  check (max_storage_mb > 0);

alter table public.vendors
  add column if not exists storage_limit_override_mb integer
  check (storage_limit_override_mb is null or storage_limit_override_mb > 0);

update public.subscription_tiers set
  price_usd = 0,
  price_pkr = 1500,
  max_products = 10,
  max_catalogues = 5,
  max_images_per_product = 5,
  max_image_size_mb = 5,
  max_catalogue_size_mb = 25,
  max_storage_mb = 1024
where id = 't-standard';

update public.subscription_tiers set max_storage_mb = 1024
where id = 't-basic';

update public.subscription_tiers set max_storage_mb = 10240
where id = 't-premium';

-- Enforce catalogue count, file size and aggregate declared PDF storage at
-- the database boundary. Product/gallery limits are enforced by the companion
-- trigger below, so direct Data API writes cannot bypass the dashboard.
create or replace function public.enforce_vendor_catalogue_allowance()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  tier_row public.subscription_tiers%rowtype;
  vendor_limit_mb integer;
  existing_count integer;
  existing_mb numeric;
  product_image_bytes bigint;
begin
  select t.* into tier_row
  from public.vendors v
  join public.subscription_tiers t on t.id = v.tier_id
  where v.id = new.vendor_id;

  select coalesce(v.storage_limit_override_mb, t.max_storage_mb)
    into vendor_limit_mb
  from public.vendors v
  join public.subscription_tiers t on t.id = v.tier_id
  where v.id = new.vendor_id;

  select count(*), coalesce(sum(file_size_mb), 0)
    into existing_count, existing_mb
  from public.catalogues
  where vendor_id = new.vendor_id
    and (tg_op = 'INSERT' or id <> new.id);

  select coalesce(sum(
    case when image_value like 'data:image/%;base64,%'
      then length(split_part(image_value, ',', 2)) * 3 / 4
      else 0 end
  ), 0)::bigint into product_image_bytes
  from public.products p
  cross join lateral unnest(p.image_urls) image_value
  where p.vendor_id = new.vendor_id;

  if tier_row.max_catalogues <> -1 and existing_count >= tier_row.max_catalogues then
    raise exception 'Catalogue limit reached for this vendor tier';
  end if;
  if coalesce(new.file_size_mb, 0) > tier_row.max_catalogue_size_mb then
    raise exception 'PDF exceeds the % MB per-catalogue limit', tier_row.max_catalogue_size_mb;
  end if;
  if (existing_mb + coalesce(new.file_size_mb, 0)) * 1024 * 1024 + product_image_bytes > vendor_limit_mb::bigint * 1024 * 1024 then
    raise exception 'Vendor storage allowance of % MB exceeded', vendor_limit_mb;
  end if;
  return new;
end;
$$;

drop trigger if exists catalogues_enforce_vendor_allowance on public.catalogues;
create trigger catalogues_enforce_vendor_allowance
before insert or update of vendor_id, file_size_mb on public.catalogues
for each row execute function public.enforce_vendor_catalogue_allowance();

create or replace function public.enforce_vendor_product_allowance()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  tier_row public.subscription_tiers%rowtype;
  existing_count integer;
  image_value text;
  approx_bytes bigint := 0;
  new_images_bytes bigint := 0;
  existing_images_bytes bigint;
  catalogue_bytes bigint;
  vendor_limit_mb integer;
begin
  select t.* into tier_row
  from public.vendors v
  join public.subscription_tiers t on t.id = v.tier_id
  where v.id = new.vendor_id;

  select coalesce(v.storage_limit_override_mb, t.max_storage_mb)
    into vendor_limit_mb
  from public.vendors v
  join public.subscription_tiers t on t.id = v.tier_id
  where v.id = new.vendor_id;

  select count(*) into existing_count
  from public.products
  where vendor_id = new.vendor_id
    and (tg_op = 'INSERT' or id <> new.id);

  if tier_row.max_products <> -1 and existing_count >= tier_row.max_products then
    raise exception 'Product limit reached for this vendor tier';
  end if;
  if cardinality(new.image_urls) > tier_row.max_images_per_product then
    raise exception 'Product image limit is %', tier_row.max_images_per_product;
  end if;

  foreach image_value in array new.image_urls loop
    if image_value like 'data:image/%;base64,%' then
      approx_bytes := (length(split_part(image_value, ',', 2)) * 3 / 4);
      new_images_bytes := new_images_bytes + approx_bytes;
      if approx_bytes > tier_row.max_image_size_mb::bigint * 1024 * 1024 then
        raise exception 'Product image exceeds the % MB image limit', tier_row.max_image_size_mb;
      end if;
    end if;
  end loop;

  select coalesce(sum(
    case when image_value like 'data:image/%;base64,%'
      then length(split_part(image_value, ',', 2)) * 3 / 4
      else 0 end
  ), 0)::bigint into existing_images_bytes
  from public.products p
  cross join lateral unnest(p.image_urls) image_value
  where p.vendor_id = new.vendor_id
    and (tg_op = 'INSERT' or p.id <> new.id);

  select (coalesce(sum(file_size_mb), 0) * 1024 * 1024)::bigint
    into catalogue_bytes
  from public.catalogues
  where vendor_id = new.vendor_id;

  if existing_images_bytes + new_images_bytes + catalogue_bytes > vendor_limit_mb::bigint * 1024 * 1024 then
    raise exception 'Vendor storage allowance of % MB exceeded', vendor_limit_mb;
  end if;
  return new;
end;
$$;

drop trigger if exists products_enforce_vendor_allowance on public.products;
create trigger products_enforce_vendor_allowance
before insert or update of vendor_id, image_urls on public.products
for each row execute function public.enforce_vendor_product_allowance();
