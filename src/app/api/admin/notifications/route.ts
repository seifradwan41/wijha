import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rate-limit';

export const GET = withRateLimit(async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json([], { status: 401 });
  const userId = (session.user as Record<string, unknown>)?.userId as string;

  const notifications = await prisma.notification.findMany({
    where: { recipientId: userId },
    include: { recipient: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(notifications);
});

export const POST = withRateLimit(async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin' && role !== 'admin_assistant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const userId = (session.user as Record<string, unknown>)?.userId as string;

  const notification = await prisma.notification.create({
    data: { recipientId: body.recipientId, sentBy: userId, message: body.message },
  });

  return NextResponse.json(notification);
});
