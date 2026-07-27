import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rate-limit';

const teacherSelect = { id: true, name: true, avatarPhoto: true };

export const GET = withRateLimit(async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json([], { status: 401 });

  const userId = (session.user as Record<string, unknown>)?.userId as string;
  const events = await prisma.eventNews.findMany({ where: { teacherId: userId }, include: { teacher: { select: teacherSelect } }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(events);
});

export const POST = withRateLimit(async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json([], { status: 401 });

  const userId = (session.user as Record<string, unknown>)?.userId as string;
  const body = await req.json();

  await prisma.eventNews.create({
    data: {
      teacherId: userId,
      type: body.type,
      title: body.title,
      description: body.description,
      relatedAction: body.relatedAction || null,
      photo: body.photo || null,
      status: 'draft',
    },
  });

  const events = await prisma.eventNews.findMany({ where: { teacherId: userId }, include: { teacher: { select: teacherSelect } }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(events);
});

export const PATCH = withRateLimit(async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json([], { status: 401 });

  const body = await req.json();
  await prisma.eventNews.update({ where: { id: body.id }, data: { status: body.status } });

  const userId = (session.user as Record<string, unknown>)?.userId as string;
  const events = await prisma.eventNews.findMany({ where: { teacherId: userId }, include: { teacher: { select: teacherSelect } }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(events);
});

export const DELETE = withRateLimit(async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json([], { status: 401 });

  const body = await req.json();
  await prisma.eventNews.delete({ where: { id: body.id } });

  const userId = (session.user as Record<string, unknown>)?.userId as string;
  const events = await prisma.eventNews.findMany({ where: { teacherId: userId }, include: { teacher: { select: teacherSelect } }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(events);
});
