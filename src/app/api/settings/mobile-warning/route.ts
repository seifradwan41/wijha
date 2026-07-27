import { NextResponse } from 'next/server';
import { getSetting } from '@/lib/platform-settings';

export async function GET() {
  const enabled = await getSetting('mobile_warning_enabled');
  return NextResponse.json({ enabled: enabled === 'true' });
}
