export interface CakeProduct {
  id: string;
  title: string;
  slug: string;
  price: number; // e.g., "Price on Request" or Base Price
  category: 'custom-shapes' | 'birthdays' | 'wedding-anniversary' | 'cupcakes-hampers';
  image: string; // URL from Sanity / Instagram Asset
  description: string;
  flavors: string[];
}