-- =========================================================================
-- Azam Market Online — 12: Business categories (replaces fabric-only list)
-- =========================================================================
-- Azam Cloth Market isn't only fabric-by-the-yard: it's a federation of
-- different kinds of trading businesses under one roof (wholesale fabric
-- rolls, ready-made/stitched garments, bridal specialists, embroidery/zari
-- workshops, trimmings & accessories sellers, tailoring & stitching units,
-- and mill/import-export agents). Vendors pick ONE of these when they set
-- up their shop, and buyers filter the directory by the same list.
--
-- Adds an Urdu display name per category (name_ur) for the language toggle.

alter table categories add column if not exists name_ur text;

-- Remove the old fabric-only seed list (safe: vendor_categories cascades,
-- and there are no demo vendors in this database per migration 10's note).
delete from categories
where slug in ('lawn', 'cotton', 'chiffon', 'khaddar', 'silk', 'boski', 'bridal', 'jacquard');

with m as (select id from markets where slug = 'azam-cloth-market')
insert into categories (name, name_ur, slug, icon, market_id)
select v.name, v.name_ur, v.slug, v.icon, m.id
from m, (values
  ('Wholesale Fabric & Textiles',   'ہول سیل کپڑا',            'wholesale-fabric',    'layers'),
  ('Ready-to-Wear & Garments',      'تیار ملبوسات',             'ready-to-wear',       'shirt'),
  ('Bridal & Wedding Wear',         'دلہن اور شادی کے ملبوسات', 'bridal-wedding-wear', 'heart'),
  ('Embroidery, Zari & Tilla Work', 'کڑھائی، زری اور تلہ ورک',  'embroidery-zari',     'sparkles'),
  ('Trimmings, Lace & Accessories', 'لیس اور دیگر لوازمات',     'trimmings-lace',      'ribbon'),
  ('Tailoring & Stitching Services','سلائی اور درزی خدمات',     'tailoring-stitching', 'scissors'),
  ('Import & Mill-Direct Trading',  'درآمد اور مل ڈائریکٹ',     'import-mill-direct',  'ship')
) as v(name, name_ur, slug, icon)
on conflict (slug) do update set name_ur = excluded.name_ur;
