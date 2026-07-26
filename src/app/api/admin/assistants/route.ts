import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { withRateLimit } from '@/lib/rate-limit';

export const GET = withRateLimit(async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json([], { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin') return NextResponse.json([], { status: 403 });

  const assistants = await prisma.user.findMany({
    where: { role: 'admin_assistant' },
    select: { id: true, name: true, username: true, status: true, lastLoginAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(assistants);
});

export const POST = withRateLimit(async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const hashedPassword = await bcrypt.hash(body.password, 10);
  const userId = (session.user as Record<string, unknown>)?.userId as string;

  const assistant = await prisma.user.create({
    data: {
      role: 'admin_assistant', name: body.name, username: body.username,
      password: hashedPassword, status: 'active', createdBy: userId,
      passwordIsTemporary: true,
    },
  });

  return NextResponse.json(assistant);
});
