-- Per-tier upload limits: images per product, per-image size, per-catalogue size.
alter table subscription_tiers
  add column if not exists max_images_per_product integer not null default 5,
  add column if not exists max_image_size_mb integer not null default 5,
  add column if not exists max_catalogue_size_mb integer not null default 50;

-- Starting (Basic) tier: 10 products, 5 PDF catalogues, 5 images/product,
-- 5MB per image, 50MB per catalogue.
update subscription_tiers set
  max_products = 10,
  max_catalogues = 5,
  max_images_per_product = 5,
  max_image_size_mb = 5,
  max_catalogue_size_mb = 50
where id = 't-basic';

-- Standard / Premium keep their existing product & catalogue counts, but get
-- sensible upload limits too (adjust later from the admin Tier Manager).
update subscription_tiers set
  max_images_per_product = 8,
  max_image_size_mb = 8,
  max_catalogue_size_mb = 100
where id = 't-standard';

update subscription_tiers set
  max_images_per_product = 10,
  max_image_size_mb = 10,
  max_catalogue_size_mb = 150
where id = 't-premium';

-- Product photo gallery: keep image_url as the cover photo for backward
-- compatibility with every existing display component, and add image_urls
-- for the full gallery (cover + up to max_images_per_product - 1 more).
alter table products
  add column if not exists image_urls text[] not null default '{}';
