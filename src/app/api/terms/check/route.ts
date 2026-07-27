import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ needsAcceptance: false }, { status: 401 });

  const userId = (session.user as Record<string, unknown>)?.userId as string;
  const role = (session.user as Record<string, unknown>)?.role as string;

  // Check if the user still exists in the database
  const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!userExists) {
    return NextResponse.json({ needsAcceptance: false, userNotFound: true });
  }

  const latestTerms = await prisma.termsVersion.findFirst({
    where: { roleScope: role },
    orderBy: { publishedAt: 'desc' },
  });

  if (!latestTerms) return NextResponse.json({ needsAcceptance: false, hasTerms: false });

  const acceptance = await prisma.termsAcceptance.findFirst({
    where: { userId, termsVersionId: latestTerms.id },
  });

  return NextResponse.json({
    needsAcceptance: !acceptance,
    hasTerms: true,
    versionNumber: latestTerms.versionNumber,
  });
}
