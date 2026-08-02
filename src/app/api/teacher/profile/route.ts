import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  teachingStyle: z.string().max(200).optional(),
  specialties: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  subcategories: z.array(z.string()).optional(),
  whatsappContact: z.string().max(20).optional(),
  avatarPhoto: z.string().url().optional().nullable(),
  bannerPhoto: z.string().url().optional().nullable(),
  profileStatus: z.enum(['draft', 'published']).default('draft'),
});

export const GET = withRateLimit(async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json(null, { status: 401 });

  const userId = (session.user as Record<string, unknown>)?.userId as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return NextResponse.json(user);
});

export const PUT = withRateLimit(async function PUT(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json(null, { status: 401 });

  const userId = (session.user as Record<string, unknown>)?.userId as string;
  const body = await req.json();

  const result = UpdateProfileSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: result.data,
  });

  return NextResponse.json({ ok: true });
});
