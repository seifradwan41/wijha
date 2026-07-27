import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rate-limit';

export const POST = withRateLimit(async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as Record<string, unknown>)?.userId as string;
  if (!userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const body = await req.json();
  const { termsVersion, termsId } = body;

  const now = new Date();

  const updateData: Record<string, unknown> = { onboardingCompletedAt: now };

  if (termsId) {
    const existingAcceptance = await prisma.termsAcceptance.findFirst({
      where: { userId, termsVersionId: termsId },
    });
    if (!existingAcceptance) {
      await prisma.termsAcceptance.create({
        data: { userId, termsVersionId: termsId, acceptedAt: now },
      });
    }
  } else if (termsVersion) {
    const existingTerms = await prisma.termsVersion.findFirst({
      where: { versionNumber: termsVersion },
    });
    if (existingTerms) {
      const existingAcceptance = await prisma.termsAcceptance.findFirst({
        where: { userId, termsVersionId: existingTerms.id },
      });
      if (!existingAcceptance) {
        await prisma.termsAcceptance.create({
          data: { userId, termsVersionId: existingTerms.id, acceptedAt: now },
        });
      }
    }
  }

  await prisma.user.update({ where: { id: userId }, data: updateData });

  return NextResponse.json({ ok: true });
});
