import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rate-limit';

export const POST = withRateLimit(async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as Record<string, unknown>)?.userId as string;
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin_assistant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.user.update({
    where: { id: userId },
    data: { orientationSeenAt: new Date() },
  });

  return NextResponse.json({ ok: true });
});
