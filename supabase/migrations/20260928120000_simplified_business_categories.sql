-- =========================================================================
-- Azam Market Online — 18: Simplified business categories (replaces all)
-- =========================================================================
-- Replaces the previous 14-category list (an original 7 researched trade
-- types plus 7 more added later) with the 8 plain categories Azam Cloth
-- Market vendors and buyers actually use day to day. Safe to delete
-- outright: vendor_categories.category_id cascades on delete, and there
-- are no real vendors in this database yet.

delete from categories;

with m as (select id from markets where slug = 'azam-cloth-market')
insert into categories (name, name_ur, slug, icon, market_id)
select v.name, v.name_ur, v.slug, v.icon, m.id
from m, (values
  ('2 Pc Unstitched',    '2 پیس ان سلا',        '2pc-unstitched',    '👚'),
  ('3 Pc Unstitched',    '3 پیس ان سلا',        '3pc-unstitched',    '👗'),
  ('Bases',              'بیس کپڑا',            'bases',             '🧵'),
  ('Shawls / Dupattas',  'شالیں / دوپٹے',       'shawls-dupattas',   '🧣'),
  ('Home Textile',       'ہوم ٹیکسٹائل',        'home-textile',      '🛏️'),
  ('Men''s Wear',        'مردانہ ملبوسات',      'mens-wear',         '👔'),
  ('Brands',             'برانڈز',              'brands',            '🏷️'),
  ('Miscellaneous',      'متفرق',               'miscellaneous',     '🗂️')
) as v(name, name_ur, slug, icon);
