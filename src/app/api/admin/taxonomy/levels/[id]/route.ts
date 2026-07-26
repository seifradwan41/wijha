import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rate-limit';

export const DELETE = withRateLimit(async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.level.delete({ where: { id } });
  return NextResponse.json({ ok: true });
});
