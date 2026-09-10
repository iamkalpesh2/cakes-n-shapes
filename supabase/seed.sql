insert into public.products (slug, name, category, tag, description, details, image_url) values
('chocolate-truffle-cake', 'Chocolate Truffle Cake', 'cakes', 'Bestseller', 'Rich chocolate sponge, ganache and a classic celebration finish.', 'A deeply chocolatey celebration cake with soft sponge, silky ganache and a polished finish.', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=85'),
('red-velvet-cake', 'Red Velvet Cake', 'cakes', 'Popular', 'Soft red velvet layers with creamy frosting for elegant celebrations.', 'Velvety cocoa sponge balanced with smooth cream cheese frosting.', 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=1000&q=85'),
('custom-theme-cake', 'Custom Theme Cake', 'cakes', 'Custom', 'Your theme, colours and ideas turned into an edible centrepiece.', 'Share your theme, reference images, colours and occasion for a tailored design.', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1000&q=85'),
('bento-cake', 'Bento Cake', 'cakes', 'Cute', 'Small celebration cakes made for intimate moments and gifting.', 'A petite, personalised cake for two to four people.', 'https://images.unsplash.com/photo-1557925923-cd4648e211a0?auto=format&fit=crop&w=1000&q=85'),
('assorted-cupcakes', 'Assorted Cupcakes', 'cupcakes', 'Party Pick', 'A box of pretty, shareable cupcakes in your preferred flavours.', 'A colourful box for parties, return gifts and office celebrations.', 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=1000&q=85'),
('chocolate-jar-cake', 'Chocolate Jar Cake', 'jar-cakes', 'Favourite', 'Layers of cake, cream and chocolate packed into a convenient jar.', 'Layered chocolate cake and cream in a giftable jar.', 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=1000&q=85'),
('fudgy-chocolate-brownie', 'Fudgy Chocolate Brownie', 'brownies', 'Rich & Fudgy', 'Deep chocolate brownies made for gifting, sharing or keeping all to yourself.', 'Dense, fudgy brownies with a rich chocolate centre.', 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=1000&q=85'),
('cake-popsicles', 'Cake Popsicles', 'popsicles', 'Fun', 'Cute cake popsicles that add a playful touch to any celebration.', 'Playful cake popsicles decorated to suit your theme.', 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=1000&q=85'),
('celebration-hamper', 'Celebration Hamper', 'hampers', 'Gift Ready', 'A curated mix of sweet treats for birthdays, festivals and gifting.', 'A personalised mix of cakes, brownies and small treats.', 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1000&q=85'),
('brownie-treat-box', 'Brownie & Treat Box', 'hampers', 'Giftable', 'A thoughtful box combining brownies and bite-sized treats.', 'A compact gift box with fudgy brownies and assorted treats.', 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=1000&q=85')
on conflict (slug) do update set updated_at = now();

with prices(slug, label, price_minor) as (values
  ('chocolate-truffle-cake','500 g',900),('chocolate-truffle-cake','1 kg',1600),('chocolate-truffle-cake','1.5 kg',2300),
  ('red-velvet-cake','500 g',950),('red-velvet-cake','1 kg',1700),('red-velvet-cake','1.5 kg',2450),
  ('custom-theme-cake','1 kg',1800),('custom-theme-cake','1.5 kg',2600),('custom-theme-cake','2 kg',3400),
  ('bento-cake','Single',450),('bento-cake','Bento + cupcakes',700),
  ('assorted-cupcakes','Box of 6',600),('assorted-cupcakes','Box of 12',1100),
  ('chocolate-jar-cake','Single jar',250),('chocolate-jar-cake','Box of 4',900),
  ('fudgy-chocolate-brownie','Box of 4',350),('fudgy-chocolate-brownie','Box of 9',750),('fudgy-chocolate-brownie','Box of 16',1200),
  ('cake-popsicles','Box of 4',450),('cake-popsicles','Box of 8',850),
  ('celebration-hamper','Small',900),('celebration-hamper','Medium',1500),('celebration-hamper','Large',2200),
  ('brownie-treat-box','Small box',650),('brownie-treat-box','Large box',1100)
)
insert into public.product_sizes (product_id, label, price_minor)
select p.id, prices.label, prices.price_minor from prices join public.products p on p.slug = prices.slug
on conflict (product_id, label) do update set price_minor = excluded.price_minor, is_active = true;
