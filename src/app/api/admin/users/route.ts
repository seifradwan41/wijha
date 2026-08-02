import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { withRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50)
    .regex(/^[a-z0-9_]+$/, 'Username must contain only lowercase letters, numbers, and underscores'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  role: z.enum(['teacher', 'community_collaborator']).optional(),
});

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

  const result = CreateUserSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
  }

  const { name, username, password, role: newRole } = result.data;

  const normalizedUsername = username.toLowerCase();

  const existing = await prisma.user.findFirst({ where: { username: normalizedUsername } });
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
      username: normalizedUsername,
      role: newRole || 'teacher',
      status: 'active',
      createdBy: userId,
      password: hashedPassword,
      passwordIsTemporary: true,
    },
  });

  return NextResponse.json(user);
});
