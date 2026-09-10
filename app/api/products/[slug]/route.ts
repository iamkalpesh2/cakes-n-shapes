import { NextResponse } from 'next/server';
import { catalogRepository } from '../../../../lib/data/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  try {
    const product = await catalogRepository.getProductBySlug(params.slug);
    return product ? NextResponse.json(product) : NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  } catch (error) {
    console.error('Product read failed', error);
    return NextResponse.json({ error: 'Unable to load this product.' }, { status: 500 });
  }
}
