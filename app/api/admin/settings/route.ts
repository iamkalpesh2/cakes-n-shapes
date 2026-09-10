import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '../../../../lib/data/supabase';

const settingUpdate = z.object({ key: z.enum(['business', 'site_copy']), value: z.record(z.string(), z.string()) });

export async function GET(request: Request) {
  try {
    const { client } = await requireAdmin(request);
    const { data, error } = await client.from('settings').select('key, value, is_public').in('key', ['business', 'site_copy']);
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
}

export async function PATCH(request: Request) {
  try {
    const input = settingUpdate.parse(await request.json());
    const { client } = await requireAdmin(request);
    const { error } = await client.from('settings').update({ value: input.value, updated_at: new Date().toISOString() }).eq('key', input.key);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error instanceof z.ZodError ? 'Invalid setting.' : 'Unable to update setting.' }, { status: error instanceof z.ZodError ? 400 : 500 }); }
}
