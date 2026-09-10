import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createPendingOrder } from '../../../lib/data/supabase';

const orderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(100),
    phone: z.string().trim().min(7).max(20),
    requiredDate: z.string().date(),
    address: z.string().trim().min(3).max(500),
    notes: z.string().trim().max(1000).optional(),
  }),
  items: z.array(z.object({ slug: z.string().min(1).max(120), size: z.string().min(1).max(80), quantity: z.number().int().min(1).max(50) })).min(1).max(30),
});

export async function POST(request: Request) {
  try {
    const input = orderSchema.parse(await request.json());
    const receipt = await createPendingOrder(input);
    const summary = receipt.items.map((item) => `${item.product} (${item.size.label}) x ${item.quantity}`).join(', ');
    const whatsappMessage = `Hi Rinku! Order ${receipt.reference}: ${summary}. Total: ₹${receipt.total.toLocaleString('en-IN')}.`;
    return NextResponse.json({ ...receipt, whatsappMessage });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Please check the order details and try again.' }, { status: 400 });
    console.error('Order creation failed', error);
    return NextResponse.json({ error: 'Unable to save this order right now.' }, { status: 500 });
  }
}
