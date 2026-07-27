import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getSetting, setSetting } from '@/lib/platform-settings';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin' && role !== 'admin_assistant') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const number = await getSetting('support_whatsapp');
  return NextResponse.json({ number });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin' && role !== 'admin_assistant') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json();
  // Support both { key, value } and { number } for backward compat
  const key = body.key || 'support_whatsapp';
  const value = body.value ?? body.number;
  if (typeof value !== 'string') {
    return NextResponse.json({ error: 'Invalid value' }, { status: 400 });
  }
  const saved = await setSetting(key, value);
  return NextResponse.json({ [key === 'support_whatsapp' ? 'number' : 'value']: saved });
}
