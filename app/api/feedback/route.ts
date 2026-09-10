import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminClient } from '../../../lib/data/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const feedbackSchema = z.object({
  customerName: z.string().trim().min(2).max(80),
  message: z.string().trim().min(10).max(1000),
  rating: z.number().int().min(1).max(5),
});

export async function GET() {
  try {
    const { data, error } = await getAdminClient().from('feedback').select('id, customer_name, message, rating, created_at').eq('is_published', true).order('created_at', { ascending: false }).limit(12);
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error('Published feedback read failed', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const input = feedbackSchema.parse(await request.json());
    const { error } = await getAdminClient().from('feedback').insert({ customer_name: input.customerName, message: input.message, rating: input.rating, is_published: false });
    if (error) throw error;
    return NextResponse.json({ message: 'Thank you. Your feedback will appear after review.' }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Please provide a name, a message, and a rating from 1 to 5.' }, { status: 400 });
    console.error('Feedback submission failed', error);
    return NextResponse.json({ error: 'Unable to submit feedback right now.' }, { status: 500 });
  }
}
