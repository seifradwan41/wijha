import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import CategoryTeachers from './CategoryTeachers';

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: rawCategory } = await params;
  const category = decodeURIComponent(rawCategory);
  const catKey = category.toLowerCase();

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
      },
      select: { id: true, name: true, categories: true, subcategories: true, avatarPhoto: true },
    }),
  ]);

  const subs = cat?.subcategories || [];

  return (
    <>
      <div className="page-header">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / <span>{category}</span>
        </div>
        <h1>{category} — Courses &amp; Teachers</h1>
        <p>Browse subcategories and teachers for {category} preparation.</p>
      </div>

      <section className="block">
        <div className="section-head">
          <span className="eyebrow2">Subcategories</span>
          <h2>Choose a subject</h2>
        </div>
        <div className="paths">
          {subs.map((sub) => (
            <Link key={sub.id} href={`/category/${encodeURIComponent(category)}/${encodeURIComponent(sub.name)}`} className={`path-card ${catKey}`} data-cat={catKey}>
              <div className="rot-photo-wrap"><div className="rot-photo" /></div>
              <span className="badge-pill">{category}</span>
              <h3>{sub.name}</h3>
              <p>{sub.name} courses under {category}</p>
              <div className="rot-caption"><div className="rot-name" /><div className="rot-spec" /></div>
              <div className="rot-dots" />
              <span className="go">View courses <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8H14M14 8L9 3M14 8L9 13" stroke="currentColor" strokeWidth="1.5" /></svg></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="block">
        <div className="section-head">
          <span className="eyebrow2">Teachers</span>
          <h2>Teachers in {category}</h2>
        </div>
        <div className="teacher-row">
          {teachers.length === 0 ? (
            <p style={{ color: 'var(--text-mute)', textAlign: 'center', padding: '40px 0' }}>No teachers available yet. Check back soon!</p>
          ) : (
            teachers.map((t) => {
              const initials = t.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('');
              return (
                <Link key={t.id} href={`/teacher/${t.id}`} className="teacher-card">
                  <div className="avatar" style={t.avatarPhoto ? { background: `url(${t.avatarPhoto}) center/cover` } : { background: 'var(--blue)' }}>{!t.avatarPhoto && initials}</div>
                  <h4>{t.name}</h4>
                  <span>{t.subcategories.join(' · ')}</span>
                </Link>
              );
            })
          )}
        </div>
      </section>

      <CategoryTeachers teachers={teachers} />
    </>
  );
}
