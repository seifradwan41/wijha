import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rate-limit';

export const POST = withRateLimit(async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin' && role !== 'admin_assistant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();

  const thread = await prisma.chatThread.findUnique({ where: { id } });
  if (!thread) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const messages = JSON.parse(thread.messages || '[]');
  messages.push({ sender: 'admin', text: body.text || '', imageAttachment: body.imageAttachment || null, timestamp: new Date().toISOString() });

  await prisma.chatThread.update({
    where: { id },
    data: { messages: JSON.stringify(messages) },
  });

  return NextResponse.json({ ok: true });
});

export const PATCH = withRateLimit(async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin' && role !== 'admin_assistant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  await prisma.chatThread.update({ where: { id }, data: { status: body.status } });
  return NextResponse.json({ ok: true });
});
