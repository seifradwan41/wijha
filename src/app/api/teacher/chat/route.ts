import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withRateLimit } from '@/lib/rate-limit';

export const GET = withRateLimit(async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json([]);
  const userId = (session.user as Record<string, unknown>)?.userId as string;
  const threads = await prisma.chatThread.findMany({ where: { openedBy: userId }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(threads);
});

export const POST = withRateLimit(async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as Record<string, unknown>)?.userId as string;
  const { text } = await req.json();
  const msg = JSON.stringify([{ sender: 'teacher', text, timestamp: new Date().toISOString() }]);
  const thread = await prisma.chatThread.create({ data: { openedBy: userId, messages: msg } });
  return NextResponse.json(thread);
});
