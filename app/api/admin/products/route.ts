import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '../../../../lib/data/supabase';

const productUpdate = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2).max(120).optional(),
  is_active: z.boolean().optional(),
});
const sizeUpdate = z.object({
  sizeId: z.string().uuid(),
  label: z.string().trim().min(1).max(80).optional(),
  price_minor: z.number().int().min(0).max(10000000).optional(),
  is_active: z.boolean().optional(),
});
const productCreate = z.object({
  name: z.string().trim().min(2).max(120),
  category: z.enum(['cakes', 'cupcakes', 'jar-cakes', 'brownies', 'popsicles', 'hampers']),
  tag: z.string().trim().max(40).default('New'),
  description: z.string().trim().min(10).max(300),
  details: z.string().trim().min(10).max(1000),
  imageUrl: z.string().url().optional(),
  sizes: z.array(z.object({ label: z.string().trim().min(1).max(80), price: z.number().int().min(0).max(10000000) })).min(1).max(12),
});

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function GET(request: Request) {
  try {
    const { client } = await requireAdmin(request);
    const { data, error } = await client.from('products').select('id, slug, name, category, tag, is_active, product_sizes(id, label, price_minor, is_active)').order('created_at');
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error && error.message === 'Forbidden' ? 'Forbidden' : 'Unauthorized' }, { status: error instanceof Error && error.message === 'Forbidden' ? 403 : 401 });
  }
}

export async function POST(request: Request) {
  try {
    const { client } = await requireAdmin(request);
    const form = await request.formData();
    const image = form.get('image');
    const rawSizes = JSON.parse(String(form.get('sizes') ?? '[]'));
    const input = productCreate.parse({ name: form.get('name'), category: form.get('category'), tag: form.get('tag') || 'New', description: form.get('description'), details: form.get('details'), imageUrl: form.get('imageUrl') || undefined, sizes: rawSizes });
    let imageUrl = input.imageUrl;
    if (image instanceof File && image.size > 0) {
      if (!image.type.startsWith('image/') || image.size > 5_000_000) return NextResponse.json({ error: 'Photo must be an image smaller than 5 MB.' }, { status: 400 });
      const path = `${slugify(input.name)}-${Date.now()}.${image.type.split('/')[1]}`;
      const upload = await client.storage.from('product-images').upload(path, Buffer.from(await image.arrayBuffer()), { contentType: image.type, upsert: false });
      if (upload.error) throw upload.error;
      imageUrl = client.storage.from('product-images').getPublicUrl(path).data.publicUrl;
    }
    if (!imageUrl) return NextResponse.json({ error: 'Add a photo upload or image URL.' }, { status: 400 });
    const slug = slugify(input.name);
    const productInsert = await client.from('products').insert({ slug, name: input.name, category: input.category, tag: input.tag, description: input.description, details: input.details, image_url: imageUrl }).select('id').single();
    if (productInsert.error) throw productInsert.error;
    const sizesInsert = await client.from('product_sizes').insert(input.sizes.map((size) => ({ product_id: productInsert.data.id, label: size.label, price_minor: size.price })));
    if (sizesInsert.error) throw sizesInsert.error;
    return NextResponse.json({ ok: true, slug }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof z.ZodError ? 'Check the product details and sizes.' : 'Unable to create product. The slug may already exist.' }, { status: error instanceof z.ZodError ? 400 : 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { client } = await requireAdmin(request);
    if (body.sizeId) {
      const input = sizeUpdate.parse(body);
      const updates = { ...(input.label ? { label: input.label } : {}), ...(input.price_minor !== undefined ? { price_minor: input.price_minor } : {}), ...(input.is_active !== undefined ? { is_active: input.is_active } : {}) };
      const { error } = await client.from('product_sizes').update(updates).eq('id', input.sizeId);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }
    const input = productUpdate.parse(body);
    const updates = { ...(input.name ? { name: input.name } : {}), ...(input.is_active !== undefined ? { is_active: input.is_active } : {}), updated_at: new Date().toISOString() };
    const { error } = await client.from('products').update(updates).eq('id', input.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof z.ZodError ? 'Invalid product update.' : 'Unable to update product.' }, { status: error instanceof z.ZodError ? 400 : 500 });
  }
}
