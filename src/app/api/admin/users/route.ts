import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { withRateLimit } from '@/lib/rate-limit';

export const GET = withRateLimit(async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json([], { status: 401 });

  const role = (session.user as unknown as { role?: string })?.role;
  if (role !== 'admin' && role !== 'admin_assistant') return NextResponse.json([], { status: 403 });

  const users = await prisma.user.findMany({
    select: { id: true, name: true, username: true, contact: true, role: true, status: true, suspendedReason: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(users);
});

export const POST = withRateLimit(async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (session.user as unknown as { role?: string })?.role;
  if (role !== 'admin' && role !== 'admin_assistant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { name, username, password, role: newRole } = body;

  if (!name || !username || !password) {
    return NextResponse.json({ error: 'Name, username, and password are required' }, { status: 400 });
  }

  const existing = await prisma.user.findFirst({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: 'A user with this username already exists' }, { status: 400 });
  }

  // Assistants can only create teachers and collaborators
  if (role === 'admin_assistant' && newRole !== 'teacher' && newRole !== 'community_collaborator') {
    return NextResponse.json({ error: 'Assistants can only create teacher or collaborator accounts' }, { status: 403 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = (session.user as unknown as { userId?: string })?.userId;

  const user = await prisma.user.create({
    data: {
      name,
      username,
      role: newRole || 'teacher',
      status: 'active',
      createdBy: userId,
      password: hashedPassword,
      passwordIsTemporary: true,
    },
  });

  return NextResponse.json(user);
});
