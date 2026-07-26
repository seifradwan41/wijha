import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rate-limit';

const teacherSelect = { id: true, name: true, avatarPhoto: true };

export const GET = withRateLimit(async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json([], { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin' && role !== 'admin_assistant') return NextResponse.json([], { status: 403 });

  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get('teacherId');
  if (!teacherId) return NextResponse.json({ error: 'teacherId required' }, { status: 400 });

  const events = await prisma.eventNews.findMany({
    where: { teacherId },
    include: { teacher: { select: teacherSelect } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(events);
});

export const POST = withRateLimit(async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin' && role !== 'admin_assistant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  if (!body.teacherId) return NextResponse.json({ error: 'teacherId required' }, { status: 400 });

  const event = await prisma.eventNews.create({
    data: {
      teacherId: body.teacherId,
      type: body.type,
      title: body.title,
      description: body.description,
      relatedAction: body.relatedAction || null,
      photo: body.photo || null,
      status: body.status || 'draft',
    },
  });
  return NextResponse.json(event);
});

export const PATCH = withRateLimit(async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin' && role !== 'admin_assistant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { id, ...data } = body;
  const event = await prisma.eventNews.update({ where: { id }, data });
  return NextResponse.json(event);
});

export const DELETE = withRateLimit(async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin' && role !== 'admin_assistant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  await prisma.eventNews.delete({ where: { id: body.id } });
  return NextResponse.json({ ok: true });
});
