import { NextResponse } from 'next/server';
import { getSetting } from '@/lib/platform-settings';

export async function GET() {
  const raw = await getSetting('broadcast_message');
  if (!raw) return NextResponse.json(null);
  try {
    const data = JSON.parse(raw);
    if (data.expiresAt && new Date(data.expiresAt) < new Date()) return NextResponse.json(null);
    return NextResponse.json({ message: data.message, roles: data.roles || [], id: data.id || '' });
  } catch {
    return NextResponse.json(null);
  }
}
