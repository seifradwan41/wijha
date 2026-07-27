import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getSetting, setSetting } from '@/lib/platform-settings';

export async function GET(req: Request) {
  const token = await getToken({ req: req as any });
  if (!token || (token.role !== 'admin' && token.role !== 'admin_assistant')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const number = await getSetting('support_whatsapp');
  return NextResponse.json({ number });
}

export async function PUT(req: Request) {
  const token = await getToken({ req: req as any });
  if (!token || (token.role !== 'admin' && token.role !== 'admin_assistant')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { number } = await req.json();
  if (typeof number !== 'string') {
    return NextResponse.json({ error: 'Invalid number' }, { status: 400 });
  }
  const value = await setSetting('support_whatsapp', number);
  return NextResponse.json({ number: value });
}
