import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withRateLimit } from '@/lib/rate-limit';

// Heartbeat: assistant pings every 30s to signal online
export const POST = withRateLimit(async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as Record<string, unknown>)?.userId as string;
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin_assistant' && role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    await prisma.user.update({ where: { id: userId }, data: { lastActiveAt: new Date() } });
  } catch { /* user may have been deleted */ }
  return NextResponse.json({ ok: true });
});
