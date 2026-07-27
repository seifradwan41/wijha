import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const teachers = await prisma.user.findMany({
    where: { role: 'teacher', status: 'active', profileStatus: 'published' },
    select: { name: true, categories: true, subcategories: true, avatarPhoto: true },
    orderBy: { createdAt: 'desc' },
  });

  const categoryColors: Record<string, string> = {
    SAT: 'var(--blue)',
    ACT: 'var(--teal)',
    Other: 'var(--slate)',
  };

  const grouped: Record<string, { name: string; subject: string; color: string }[]> = {};

  for (const t of teachers) {
    const cats = t.categories.length > 0 ? t.categories : ['Other'];
    for (const cat of cats) {
      const rawKey = ['SAT', 'ACT'].includes(cat) ? cat : 'Other';
      const key = rawKey.toLowerCase();
      if (!grouped[key]) grouped[key] = [];
      if (!grouped[key].some(e => e.name === t.name)) {
        grouped[key].push({
          name: t.name,
          subject: t.subcategories.join(' · ') || 'All levels',
          color: categoryColors[rawKey] || 'var(--slate)',
        });
      }
    }
  }

  return NextResponse.json(grouped);
}
