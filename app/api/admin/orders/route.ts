import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '../../../../lib/data/supabase';

const statusSchema = z.object({ id: z.string().uuid(), status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']) });

export async function GET(request: Request) {
  try {
    const { client } = await requireAdmin(request);
    const { data, error } = await client.from('orders').select('id, reference, customer_name, customer_phone, required_date, delivery_address, notes, status, total_minor, created_at, order_items(product_name, size_label, unit_price_minor, quantity)').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
}

export async function PATCH(request: Request) {
  try {
    const input = statusSchema.parse(await request.json());
    const { client } = await requireAdmin(request);
    const { error } = await client.from('orders').update({ status: input.status, updated_at: new Date().toISOString() }).eq('id', input.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error instanceof z.ZodError ? 'Invalid order update.' : 'Unable to update order.' }, { status: error instanceof z.ZodError ? 400 : 500 }); }
}
