-- =========================================================================
-- Azam Market Online — 13: More business categories + category icon fix
-- =========================================================================
-- Two things:
--
-- 1. Fix: migration 12 (20260927100100_business_categories.sql) set `icon`
--    to Lucide icon *names* (e.g. 'layers', 'shirt'). The UI
--    (CategoryGrid.tsx) renders `{cat.icon}` as raw text with no name ->
--    component lookup, so those would show up as literal broken text
--    ("layers") instead of a symbol. sampleData.ts's mock categories use
--    actual emoji characters, which is what the UI actually expects — so
--    we switch the 7 existing business categories over to emoji here.
--
-- 2. Add 7 more business categories, as requested, covering more of how
--    Azam Cloth Market vendors actually describe their own business.

update categories set icon = '🧵' where slug = 'wholesale-fabric';
update categories set icon = '👗' where slug = 'ready-to-wear';
update categories set icon = '👰' where slug = 'bridal-wedding-wear';
update categories set icon = '✨' where slug = 'embroidery-zari';
update categories set icon = '🎀' where slug = 'trimmings-lace';
update categories set icon = '✂️' where slug = 'tailoring-stitching';
update categories set icon = '🚢' where slug = 'import-mill-direct';

with m as (select id from markets where slug = 'azam-cloth-market')
insert into categories (name, name_ur, slug, icon, market_id)
select v.name, v.name_ur, v.slug, v.icon, m.id
from m, (values
  ('Shawl / Dupatta',                'شال / دوپٹہ',              'shawl-dupatta',        '🧣'),
  ('2pc / 3pc Suiting for Women',    'خواتین کے 2/3 پیس سوٹ',    'suiting-women',        '👚'),
  ('Men''s Wear',                    'مردانہ ملبوسات',           'mens-wear',            '👔'),
  ('Cloth Basis (Wholesale Rolls)',  'تھان / بیس کپڑا',          'cloth-basis',          '📦'),
  ('Cloth / By the Yard',            'کپڑا / گز کے حساب سے',     'cloth-by-the-yard',    '📏'),
  ('Clothing Brand',                 'کپڑوں کا برانڈ',           'clothing-brand',       '🏷️'),
  ('Stock Lots',                     'اسٹاک لاٹس',                'stock-lots',           '🗃️')
) as v(name, name_ur, slug, icon)
on conflict (slug) do update set name_ur = excluded.name_ur, icon = excluded.icon;
