import type { Product, ProductSize } from '../catalog';

export type CatalogRepository = {
  listProducts(): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
};

export type OrderInput = {
  customer: { name: string; phone: string; requiredDate: string; address: string; notes?: string };
  items: { slug: string; size: string; quantity: number }[];
};

export type OrderReceipt = {
  id: string;
  reference: string;
  total: number;
  items: { product: string; size: ProductSize; quantity: number }[];
};

export type OrderRepository = {
  createPendingOrder(input: OrderInput): Promise<OrderReceipt>;
};
