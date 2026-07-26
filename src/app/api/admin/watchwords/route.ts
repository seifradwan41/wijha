import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withRateLimit } from '@/lib/rate-limit';

export const GET = withRateLimit(async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin' && role !== 'admin_assistant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const words = await prisma.watchWord.findMany({ orderBy: { createdAt: 'desc' }, include: { _count: { select: { hits: true } } } });
  const result = words.map(w => ({ id: w.id, word: w.word, triggerCount: w._count.hits, createdAt: w.createdAt }));
  return NextResponse.json(result);
});

export const POST = withRateLimit(async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin' && role !== 'admin_assistant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { word } = await req.json();
  if (!word) return NextResponse.json({ error: 'Word required' }, { status: 400 });
  const existing = await prisma.watchWord.findFirst({ where: { word: word.toLowerCase() } });
  if (existing) return NextResponse.json({ error: 'Already exists' }, { status: 409 });
  const created = await prisma.watchWord.create({ data: { word: word.toLowerCase() } });
  return NextResponse.json(created);
});

export const DELETE = withRateLimit(async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin' && role !== 'admin_assistant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await req.json();
  try {
    await prisma.watchWordHit.deleteMany({ where: { wordId: id } });
    await prisma.watchWord.delete({ where: { id } });
  } catch { return NextResponse.json({ error: 'Failed to delete' }, { status: 500 }); }
  return NextResponse.json({ ok: true });
});
