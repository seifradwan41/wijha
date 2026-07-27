import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rate-limit';

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

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: body.name,
      description: body.description,
      teachingStyle: body.teachingStyle,
      specialties: body.specialties,
      categories: body.categories,
      subcategories: body.subcategories,
      whatsappContact: body.whatsappContact,
      avatarPhoto: body.avatarPhoto,
      bannerPhoto: body.bannerPhoto,
      profileStatus: body.profileStatus || 'draft',
    },
  });

  return NextResponse.json({ ok: true });
});
