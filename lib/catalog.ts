export type Filter = 'all' | 'cakes' | 'cupcakes' | 'jar-cakes' | 'brownies' | 'popsicles' | 'hampers';

export type ProductSize = {
  label: string;
  price: number;
};

export type Product = {
  slug: string;
  name: string;
  category: Exclude<Filter, 'all'>;
  tag: string;
  description: string;
  details: string;
  image: string;
  sizes: ProductSize[];
};

export const whatsappLink = 'https://wa.me/919869600561';

export const products: Product[] = [
  { slug: 'chocolate-truffle-cake', name: 'Chocolate Truffle Cake', category: 'cakes', tag: 'Bestseller', description: 'Rich chocolate sponge, ganache and a classic celebration finish.', details: 'A deeply chocolatey celebration cake with soft sponge, silky ganache and a polished finish. Add a custom message or design when you order.', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=85', sizes: [{ label: '500 g', price: 900 }, { label: '1 kg', price: 1600 }, { label: '1.5 kg', price: 2300 }] },
  { slug: 'red-velvet-cake', name: 'Red Velvet Cake', category: 'cakes', tag: 'Popular', description: 'Soft red velvet layers with creamy frosting for elegant celebrations.', details: 'Velvety cocoa sponge balanced with smooth cream cheese frosting. A thoughtful choice for birthdays, anniversaries and intimate celebrations.', image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=1000&q=85', sizes: [{ label: '500 g', price: 950 }, { label: '1 kg', price: 1700 }, { label: '1.5 kg', price: 2450 }] },
  { slug: 'custom-theme-cake', name: 'Custom Theme Cake', category: 'cakes', tag: 'Custom', description: 'Your theme, colours and ideas turned into an edible centrepiece.', details: 'Share your theme, reference images, colours and occasion. Rinku will suggest the right size, flavour and finish for your idea.', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1000&q=85', sizes: [{ label: '1 kg', price: 1800 }, { label: '1.5 kg', price: 2600 }, { label: '2 kg', price: 3400 }] },
  { slug: 'bento-cake', name: 'Bento Cake', category: 'cakes', tag: 'Cute', description: 'Small celebration cakes made for intimate moments and gifting.', details: 'A petite, personalised cake for two to four people. Choose a flavour and share your message or mini theme over WhatsApp.', image: 'https://images.unsplash.com/photo-1557925923-cd4648e211a0?auto=format&fit=crop&w=1000&q=85', sizes: [{ label: 'Single', price: 450 }, { label: 'Bento + cupcakes', price: 700 }] },
  { slug: 'assorted-cupcakes', name: 'Assorted Cupcakes', category: 'cupcakes', tag: 'Party Pick', description: 'A box of pretty, shareable cupcakes in your preferred flavours.', details: 'A colourful box for parties, return gifts and office celebrations. Flavours and decoration can be discussed based on your occasion.', image: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=1000&q=85', sizes: [{ label: 'Box of 6', price: 600 }, { label: 'Box of 12', price: 1100 }] },
  { slug: 'chocolate-jar-cake', name: 'Chocolate Jar Cake', category: 'jar-cakes', tag: 'Favourite', description: 'Layers of cake, cream and chocolate packed into a convenient jar.', details: 'Layered chocolate cake and cream in a giftable jar, perfect for a small celebration or a sweet surprise.', image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=1000&q=85', sizes: [{ label: 'Single jar', price: 250 }, { label: 'Box of 4', price: 900 }] },
  { slug: 'fudgy-chocolate-brownie', name: 'Fudgy Chocolate Brownie', category: 'brownies', tag: 'Rich & Fudgy', description: 'Deep chocolate brownies made for gifting, sharing or keeping all to yourself.', details: 'Dense, fudgy brownies with a rich chocolate centre. Add a gift box or note for thoughtful celebrations.', image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=1000&q=85', sizes: [{ label: 'Box of 4', price: 350 }, { label: 'Box of 9', price: 750 }, { label: 'Box of 16', price: 1200 }] },
  { slug: 'cake-popsicles', name: 'Cake Popsicles', category: 'popsicles', tag: 'Fun', description: 'Cute cake popsicles that add a playful touch to any celebration.', details: 'Playful cake popsicles decorated to suit your colour palette, party theme or gifting moment.', image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=1000&q=85', sizes: [{ label: 'Box of 4', price: 450 }, { label: 'Box of 8', price: 850 }] },
  { slug: 'celebration-hamper', name: 'Celebration Hamper', category: 'hampers', tag: 'Gift Ready', description: 'A curated mix of sweet treats for birthdays, festivals and gifting.', details: 'A personalised mix of cakes, brownies and small treats. The final selection can be tailored to your occasion and budget.', image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1000&q=85', sizes: [{ label: 'Small', price: 900 }, { label: 'Medium', price: 1500 }, { label: 'Large', price: 2200 }] },
  { slug: 'brownie-treat-box', name: 'Brownie & Treat Box', category: 'hampers', tag: 'Giftable', description: 'A thoughtful box combining brownies and bite-sized treats.', details: 'A compact gift box with fudgy brownies and assorted treats, packed for birthdays, thank-you gifting and festivals.', image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=1000&q=85', sizes: [{ label: 'Small box', price: 650 }, { label: 'Large box', price: 1100 }] },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function formatPrice(price: number) {
  return `₹${price.toLocaleString('en-IN')}`;
}
