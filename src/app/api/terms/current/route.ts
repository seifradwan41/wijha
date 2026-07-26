import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');

  if (!role) {
    return NextResponse.json({ error: 'Role is required' }, { status: 400 });
  }

  const terms = await prisma.termsVersion.findFirst({
    where: { roleScope: role },
    orderBy: { publishedAt: 'desc' },
  });

  if (!terms) {
    return NextResponse.json({ content: null, versionNumber: null });
  }

  return NextResponse.json({ id: terms.id, content: terms.content, versionNumber: terms.versionNumber });
}
