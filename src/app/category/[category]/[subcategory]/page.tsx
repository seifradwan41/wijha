import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import SubcategoryTeacherList from './SubcategoryTeacherList';

export const dynamic = 'force-dynamic';

export default async function SubcategoryPage({ params }: { params: Promise<{ category: string; subcategory: string }> }) {
  const { category: rawCategory, subcategory: rawSubcategory } = await params;
  const category = decodeURIComponent(rawCategory);
  const subcategory = decodeURIComponent(rawSubcategory);

  const [cat, teachers] = await Promise.all([
    prisma.category.findUnique({
      where: { name: category },
      include: { subcategories: true },
    }),
    prisma.user.findMany({
      where: {
        role: 'teacher',
        status: 'active',
        profileStatus: 'published',
        categories: { has: category },
        subcategories: { has: subcategory },
      },
      include: {
        courses: {
          where: { status: 'published', subcategory },
          orderBy: { createdAt: 'desc' },
        },
        eventsNews: {
          where: { status: 'published' },
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
  ]);

  const teacherData = teachers.map(t => ({
    id: t.id,
    name: t.name,
    avatarPhoto: t.avatarPhoto,
    description: t.description,
    teachingStyle: t.teachingStyle,
    specialties: t.specialties,
    subcategories: t.subcategories,
    whatsappContact: t.whatsappContact,
    courses: t.courses.map(c => ({
      id: c.id,
      title: c.title,
      level: c.level,
      schedule: c.schedule,
      price: c.price,
      contactForPrice: c.contactForPrice,
      category: c.category,
    })),
    events: t.eventsNews.map(e => ({
      id: e.id,
      title: e.title,
      type: e.type,
      description: e.description,
      relatedAction: e.relatedAction,
      createdAt: e.createdAt.toISOString(),
    })),
  }));

  return (
    <>
      <div className="page-header">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / <Link href={`/category/${encodeURIComponent(category)}`}>{category}</Link> / <span>{subcategory}</span>
        </div>
        <h1>{category} — {subcategory}</h1>
        <p>Browse teachers offering {subcategory} courses. Click a card to see their teaching style, courses, and upcoming events.</p>
      </div>

      <section className="block">
        <SubcategoryTeacherList teachers={teacherData} />
      </section>
    </>
  );
}
