import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withRateLimit } from '@/lib/rate-limit';

// GET: fetch all messages between this user and the other party
export const GET = withRateLimit(async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json([]);
  const userId = (session.user as Record<string, unknown>)?.userId as string;
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin' && role !== 'admin_assistant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let messages;
  if (role === 'admin') {
    // Admin sees messages with all assistants
    messages = await prisma.adminAssistantMessage.findMany({
      where: { senderId: userId },
      include: { recipient: { select: { id: true, name: true } } },
      orderBy: { timestamp: 'asc' },
    });
    const received = await prisma.adminAssistantMessage.findMany({
      where: { recipientId: userId },
      include: { sender: { select: { id: true, name: true } } },
      orderBy: { timestamp: 'asc' },
    });
    messages = [...messages, ...received].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  } else {
    // Assistant sees messages with admin only
    messages = await prisma.adminAssistantMessage.findMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientId: userId },
        ],
      },
      orderBy: { timestamp: 'asc' },
    });
  }

  return NextResponse.json(messages);
});

// POST: send a message
export const POST = withRateLimit(async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as Record<string, unknown>)?.userId as string;
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin' && role !== 'admin_assistant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { recipientId, text, imageAttachment } = await req.json();

  let targetRecipientId = recipientId;
  if (!targetRecipientId) {
    const adminUser = await prisma.user.findFirst({ where: { role: 'admin' }, select: { id: true } });
    if (!adminUser) return NextResponse.json({ error: 'No admin found' }, { status: 400 });
    targetRecipientId = adminUser.id;
  }

  const message = await prisma.adminAssistantMessage.create({
    data: {
      senderId: userId,
      recipientId: targetRecipientId,
      text: text || null,
      imageAttachment: imageAttachment || null,
    },
  });

  return NextResponse.json(message);
});
