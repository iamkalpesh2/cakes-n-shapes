import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '../../../../lib/data/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const feedbackUpdate = z.object({ id: z.string().uuid(), is_published: z.boolean() });

export async function GET(request: Request) {
  try {
    const { client } = await requireAdmin(request);
    const { data, error } = await client.from('feedback').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
}

export async function PATCH(request: Request) {
  try {
    const input = feedbackUpdate.parse(await request.json());
    const { client } = await requireAdmin(request);
    const { error } = await client.from('feedback').update({ is_published: input.is_published }).eq('id', input.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error instanceof z.ZodError ? 'Invalid feedback update.' : 'Unable to update feedback.' }, { status: error instanceof z.ZodError ? 400 : 500 }); }
}
