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
  const user = await prisma.user.update({ where: { id }, data: { status: body.status, suspendedReason: body.suspendedReason || null } });

  if (body.status === 'suspended' && body.suspendedReason) {
    await prisma.notification.create({
      data: {
        recipientId: id,
        sentBy: (session.user as Record<string, unknown>)?.userId as string,
        message: `Your account has been suspended. Reason: ${body.suspendedReason}`,
      },
    });
  }

  return NextResponse.json(user);
});

export const DELETE = withRateLimit(async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin' && role !== 'admin_assistant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Assistants can only delete teachers and collaborators
  if (role === 'admin_assistant') {
    const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!target || (target.role !== 'teacher' && target.role !== 'community_collaborator')) {
      return NextResponse.json({ error: 'Assistants can only delete teacher or collaborator accounts' }, { status: 403 });
    }
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
});
