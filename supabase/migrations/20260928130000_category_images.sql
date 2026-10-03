alter table categories add column if not exists image_url text;

update categories set image_url = '/categories/2pc-unstitched.jpg' where slug = '2pc-unstitched';
update categories set image_url = '/categories/3pc-unstitched.jpg' where slug = '3pc-unstitched';
update categories set image_url = '/categories/bases.jpg' where slug = 'bases';
update categories set image_url = '/categories/shawls-dupattas.jpg' where slug = 'shawls-dupattas';
update categories set image_url = '/categories/mens-wear.jpg' where slug = 'mens-wear';
update categories set image_url = '/categories/brands.jpg' where slug = 'brands';
