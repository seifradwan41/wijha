import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withRateLimit } from '@/lib/rate-limit';

export const POST = withRateLimit(async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin' && role !== 'admin_assistant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { text, assistantId } = await req.json();
  if (!text || !assistantId) return NextResponse.json({ error: 'text and assistantId required' }, { status: 400 });

  const watchWords = await prisma.watchWord.findMany();
  const lowerText = text.toLowerCase();
  const matched: string[] = [];

  for (const ww of watchWords) {
    if (lowerText.includes(ww.word.toLowerCase())) {
      matched.push(ww.id);
    }
  }

  if (matched.length === 0) return NextResponse.json({ matches: [] });

  for (const wordId of matched) {
    await prisma.watchWordHit.create({
      data: { wordId, adminAssistantId: assistantId, fullMessageText: text },
    });
  }

  const words = await prisma.watchWord.findMany({
    where: { id: { in: matched } },
    select: { id: true, word: true },
  });

  return NextResponse.json({ matches: words });
});
