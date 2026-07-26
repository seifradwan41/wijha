import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as Record<string, unknown>)?.userId as string;
  const { text } = await req.json();
  const thread = await prisma.chatThread.findUnique({ where: { id: threadId } });
  if (!thread || thread.openedBy !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const msgs = JSON.parse(thread.messages || '[]');
  msgs.push({ sender: 'collaborator', text, timestamp: new Date().toISOString() });
  await prisma.chatThread.update({ where: { id: threadId }, data: { messages: JSON.stringify(msgs) } });
  return NextResponse.json({ ok: true });
}
