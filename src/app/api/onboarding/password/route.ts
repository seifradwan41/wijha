import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { withRateLimit } from '@/lib/rate-limit';

export const POST = withRateLimit(async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as Record<string, unknown>)?.userId as string;
  const body = await req.json();
  const { password } = body;

  if (!password || password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword, passwordIsTemporary: false },
  });

  return NextResponse.json({ ok: true });
});
