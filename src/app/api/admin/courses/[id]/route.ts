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
  const course = await prisma.course.update({ where: { id }, data: { status: body.status } });

  if (body.status === 'unpublished') {
    await prisma.notification.create({
      data: {
        recipientId: course.teacherId,
        sentBy: (session.user as Record<string, unknown>)?.userId as string,
        message: `Your course "${course.title}" has been unpublished.`,
      },
    });
  }

  return NextResponse.json(course);
});

export const DELETE = withRateLimit(async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin' && role !== 'admin_assistant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.course.delete({ where: { id } });
  return NextResponse.json({ ok: true });
});
