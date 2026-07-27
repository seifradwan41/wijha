import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import SearchContent from './SearchContent';

export const dynamic = 'force-dynamic';

export default async function SearchPage() {
  const [courses, teachers, categories, levels, examDates] = await Promise.all([
    prisma.course.findMany({
      where: { status: 'published' },
      include: { teacher: { select: { id: true, name: true, whatsappContact: true, avatarPhoto: true, categories: true, specialties: true, subcategories: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: { role: 'teacher', status: 'active', profileStatus: 'published' },
      select: { id: true, name: true, categories: true, specialties: true, avatarPhoto: true, whatsappContact: true, subcategories: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({ include: { subcategories: true } }),
    prisma.level.findMany(),
    prisma.targetExamDate.findMany(),
  ]);

  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-400)' }}>Loading search...</div>}>
      <SearchContent courses={courses as never} teachers={teachers as never} categories={categories} levels={levels} examDates={examDates} />
    </Suspense>
  );
}
