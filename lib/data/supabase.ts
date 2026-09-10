import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { products as fallbackProducts, type Product } from '../catalog';
import type { CatalogRepository, OrderInput, OrderReceipt } from './contracts';

export function getAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server environment is not configured');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function requireAdmin(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) throw new Error('Unauthorized');
  const client = getAdminClient();
  const { data: authData, error: authError } = await client.auth.getUser(token);
  if (authError || !authData.user) throw new Error('Unauthorized');
  const { data: admin, error: adminError } = await client.from('admin_users').select('user_id, role').eq('user_id', authData.user.id).maybeSingle();
  if (adminError || !admin) throw new Error('Forbidden');
  return { client, user: authData.user, role: admin.role };
}

function mapProduct(row: any): Product {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    tag: row.tag ?? '',
    description: row.description,
    details: row.details,
    image: row.image_url,
    sizes: (row.product_sizes ?? []).map((size: any) => ({ label: size.label, price: Number(size.price_minor) })),
  };
}

export const supabaseCatalogRepository: CatalogRepository = {
  async listProducts() {
    const { data, error } = await getAdminClient().from('products').select('*, product_sizes(*)').eq('is_active', true).order('created_at');
    if (error) throw error;
    return (data ?? []).map(mapProduct);
  },
  async getProductBySlug(slug) {
    const { data, error } = await getAdminClient().from('products').select('*, product_sizes(*)').eq('slug', slug).eq('is_active', true).maybeSingle();
    if (error) throw error;
    return data ? mapProduct(data) : undefined;
  },
};

export const catalogRepository: CatalogRepository = {
  async listProducts() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !(process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)) return fallbackProducts;
    return supabaseCatalogRepository.listProducts();
  },
  async getProductBySlug(slug) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !(process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)) return fallbackProducts.find((product) => product.slug === slug);
    return supabaseCatalogRepository.getProductBySlug(slug);
  },
};

export async function createPendingOrder(input: OrderInput): Promise<OrderReceipt> {
  const client = getAdminClient();
  const productsBySlug = new Map((await catalogRepository.listProducts()).map((product) => [product.slug, product]));
  const resolved = input.items.map((item) => {
    const product = productsBySlug.get(item.slug);
    const size = product?.sizes.find((option) => option.label === item.size);
    if (!product || !size || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50) throw new Error('One or more cart items are no longer available');
    return { product, size, quantity: item.quantity };
  });
  const total = resolved.reduce((sum, item) => sum + item.size.price * item.quantity, 0);
  const reference = `CNS-${Date.now().toString(36).toUpperCase()}`;
  const { data: order, error } = await client.from('orders').insert({ reference, customer_name: input.customer.name, customer_phone: input.customer.phone, required_date: input.customer.requiredDate, delivery_address: input.customer.address, notes: input.customer.notes ?? null, status: 'pending', total_minor: total }).select('id, reference, total_minor').single();
  if (error) throw error;
  const { error: itemError } = await client.from('order_items').insert(resolved.map(({ product, size, quantity }) => ({ order_id: order.id, product_id: null, product_name: product.name, size_label: size.label, unit_price_minor: size.price, quantity })));
  if (itemError) throw itemError;
  return { id: order.id, reference: order.reference, total: Number(order.total_minor), items: resolved.map(({ product, size, quantity }) => ({ product: product.name, size, quantity })) };
}
