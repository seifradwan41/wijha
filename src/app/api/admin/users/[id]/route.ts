import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rate-limit';
import bcrypt from 'bcryptjs';

export const PATCH = withRateLimit(async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin' && role !== 'admin_assistant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();

  if (body.password) {
    const hashed = await bcrypt.hash(body.password, 10);
    await prisma.user.update({ where: { id }, data: { password: hashed, passwordIsTemporary: false } });
    return NextResponse.json({ ok: true });
  }

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

  const myId = (session.user as Record<string, unknown>)?.userId as string;
  if (id === myId) return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });

  if (role === 'admin_assistant') {
    const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!target || (target.role !== 'teacher' && target.role !== 'community_collaborator')) {
      return NextResponse.json({ error: 'Assistants can only delete teacher or collaborator accounts' }, { status: 403 });
    }
  }

  await prisma.$transaction([
    prisma.course.deleteMany({ where: { teacherId: id } }),
    prisma.eventNews.deleteMany({ where: { teacherId: id } }),
    prisma.notification.deleteMany({ where: { OR: [{ recipientId: id }, { sentBy: id }] } }),
    prisma.communityCollaboratorSubmission.deleteMany({ where: { submittedBy: id } }),
    prisma.chatThread.deleteMany({ where: { OR: [{ openedBy: id }, { assignedTo: id }] } }),
    prisma.adminAssistantMessage.deleteMany({ where: { OR: [{ senderId: id }, { recipientId: id }] } }),
    prisma.watchWordHit.deleteMany({ where: { adminAssistantId: id } }),
    prisma.termsAcceptance.deleteMany({ where: { userId: id } }),
    prisma.user.delete({ where: { id } }),
  ]);
  return NextResponse.json({ ok: true });
});
