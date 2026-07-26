import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withRateLimit } from '@/lib/rate-limit';

export const GET = withRateLimit(async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin' && role !== 'admin_assistant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const hits = await prisma.watchWordHit.findMany({
    orderBy: { timestamp: 'desc' },
    take: 50,
    include: { adminAssistant: { select: { id: true, name: true } }, word: { select: { id: true, word: true } } },
  });
  return NextResponse.json(hits);
});

export const POST = withRateLimit(async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin' && role !== 'admin_assistant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { text, assistantId } = await req.json();
  if (!text || !assistantId) return NextResponse.json({ error: 'text and assistantId required' }, { status: 400 });

  const watchWords = await prisma.watchWord.findMany();
  const lowerText = text.toLowerCase();
  const hits: string[] = [];

  for (const ww of watchWords) {
    if (lowerText.includes(ww.word.toLowerCase())) {
      hits.push(ww.id);
    }
  }

  if (hits.length === 0) return NextResponse.json({ hits: 0 });

  for (const wordId of hits) {
    await prisma.watchWordHit.create({
      data: { wordId, adminAssistantId: assistantId, fullMessageText: text },
    });
  }

  return NextResponse.json({ hits: hits.length });
});
