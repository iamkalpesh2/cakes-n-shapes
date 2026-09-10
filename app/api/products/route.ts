import { NextResponse } from 'next/server';
import { catalogRepository } from '../../../lib/data/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    return NextResponse.json(await catalogRepository.listProducts());
  } catch (error) {
    console.error('Catalog read failed', error);
    return NextResponse.json({ error: 'Unable to load the catalog.' }, { status: 500 });
  }
}
