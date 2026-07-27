import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rate-limit';

export const GET = withRateLimit(async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json([], { status: 401 });

  const userId = (session.user as Record<string, unknown>)?.userId as string;
  const courses = await prisma.course.findMany({
    where: { teacherId: userId },
    include: { teacher: { select: { id: true, name: true, whatsappContact: true, avatarPhoto: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(courses);
});

export const POST = withRateLimit(async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json([], { status: 401 });

  const userId = (session.user as Record<string, unknown>)?.userId as string;
  const body = await req.json();

  await prisma.course.create({
    data: {
      teacherId: userId,
      title: body.title,
      description: body.description || '',
      category: body.category,
      subcategory: body.subcategory,
      level: body.level,
      targetGrades: body.targetGrades || [],
      targetExamDate: body.targetExamDate || null,
      schedule: body.schedule || '',
      estimatedGroupSize: body.estimatedGroupSize || 6,
      sessionCount: body.sessionCount || 20,
      price: body.price || null,
      contactForPrice: body.contactForPrice || false,
      status: 'draft',
      createdBy: userId,
    },
  });

  const courses = await prisma.course.findMany({ where: { teacherId: userId }, include: { teacher: { select: { id: true, name: true, whatsappContact: true, avatarPhoto: true } } }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(courses);
});

export const PATCH = withRateLimit(async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json([], { status: 401 });

  const userId = (session.user as Record<string, unknown>)?.userId as string;
  const body = await req.json();

  await prisma.course.update({ where: { id: body.id }, data: { status: body.status } });

  const courses = await prisma.course.findMany({ where: { teacherId: userId }, include: { teacher: { select: { id: true, name: true, whatsappContact: true, avatarPhoto: true } } }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(courses);
});

export const DELETE = withRateLimit(async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json([], { status: 401 });

  const body = await req.json();
  await prisma.course.delete({ where: { id: body.id } });

  const userId = (session.user as Record<string, unknown>)?.userId as string;
  const courses = await prisma.course.findMany({ where: { teacherId: userId }, include: { teacher: { select: { id: true, name: true, whatsappContact: true, avatarPhoto: true } } }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(courses);
});
