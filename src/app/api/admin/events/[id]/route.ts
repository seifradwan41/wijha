import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rate-limit';

export const PATCH = withRateLimit(async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin' && role !== 'admin_assistant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const event = await prisma.eventNews.update({
    where: { id },
    data: { status: body.status, rejectionReason: body.rejectionReason || null },
  });

  const userId = (session.user as Record<string, unknown>)?.userId as string;
  const message = body.status === 'published'
    ? `Your ${event.type} "${event.title}" has been approved and published.`
    : `Your ${event.type} "${event.title}" was rejected. Reason: ${body.rejectionReason || 'No reason provided'}`;

  await prisma.notification.create({
    data: { recipientId: event.teacherId, sentBy: userId, message },
  });

  return NextResponse.json(event);
});
