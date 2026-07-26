import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rate-limit';

export const GET = withRateLimit(async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json([], { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin' && role !== 'admin_assistant') return NextResponse.json([], { status: 403 });

  const courses = await prisma.course.findMany({
    include: { teacher: { select: { id: true, name: true, whatsappContact: true, avatarPhoto: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(courses);
});
