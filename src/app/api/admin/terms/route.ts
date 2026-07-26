import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rate-limit';

export const GET = withRateLimit(async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json([], { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin') return NextResponse.json([], { status: 403 });

  const versions = await prisma.termsVersion.findMany({
    orderBy: { publishedAt: 'desc' },
    include: { _count: { select: { acceptances: true } } },
  });
  return NextResponse.json(versions);
});

export const POST = withRateLimit(async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { roleScope, content, versionNumber } = body;

  if (!roleScope || !content || !versionNumber) {
    return NextResponse.json({ error: 'Role, content, and version number are required' }, { status: 400 });
  }

  const validRoles = ['admin', 'admin_assistant', 'teacher', 'community_collaborator'];
  if (!validRoles.includes(roleScope)) {
    return NextResponse.json({ error: 'Invalid role scope' }, { status: 400 });
  }

  const existing = await prisma.termsVersion.findFirst({
    where: { roleScope, versionNumber },
  });
  if (existing) {
    return NextResponse.json({ error: 'A version with this number already exists for this role' }, { status: 400 });
  }

  const terms = await prisma.termsVersion.create({
    data: { roleScope, content, versionNumber, publishedAt: new Date() },
  });

  return NextResponse.json(terms);
});
