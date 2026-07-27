import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rate-limit';

export const POST = withRateLimit(async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as Record<string, unknown>)?.userId as string;
  const body = await req.json();
  const { username } = body;

  if (!username || username.trim().length < 3) {
    return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
  }

  const existing = await prisma.user.findFirst({ where: { username: username.trim(), NOT: { id: userId } } });
  if (existing) {
    return NextResponse.json({ error: 'This username is already taken' }, { status: 400 });
  }

  await prisma.user.update({ where: { id: userId }, data: { username: username.trim() } });
  return NextResponse.json({ ok: true });
});
