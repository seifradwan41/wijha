import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { sanitizeCssUrl } from '@/lib/url-utils';
import { displaySub } from '@/lib/subcategory-utils';

export default async function TeacherProfilePage({ params }: { params: Promise<{ teacherId: string }> }) {
  const { teacherId } = await params;
  const teacher = await prisma.user.findUnique({
    where: { id: teacherId, role: 'teacher' },
    include: { courses: { where: { status: 'published' }, orderBy: { createdAt: 'desc' } } },
  });

  if (!teacher) {
    return <div style={{ padding: '120px 48px', textAlign: 'center', color: 'var(--text-mute)' }}>Teacher not found.</div>;
  }

  const initials = teacher.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('');

  return (
    <>
      <div className="page-header" style={{ background: sanitizeCssUrl(teacher.bannerPhoto) ? `url(${sanitizeCssUrl(teacher.bannerPhoto)}) center/cover` : 'linear-gradient(135deg, #1E2A45, #2F6FED)', paddingBottom: 80, position: 'relative' }}>
        {teacher.bannerPhoto && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(30,42,69,0.7), rgba(47,111,237,0.5))' }} />}
        <div className="breadcrumb" style={{ position: 'relative' }}>
          <Link href="/">Home</Link> / <span>{teacher.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 20, position: 'relative' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: sanitizeCssUrl(teacher.avatarPhoto) ? `url(${sanitizeCssUrl(teacher.avatarPhoto)}) center/cover` : 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 28, color: '#fff' }}>
            {!teacher.avatarPhoto && initials}
          </div>
          <div>
            <h1 style={{ margin: 0 }}>{teacher.name}</h1>
            <p style={{ margin: '4px 0 0' }}>{teacher.categories.join(' · ')}</p>
          </div>
        </div>
      </div>

      <section className="block">
        <div className="two-col">
          <div className="sidebar">
            <div className="fact-panel">
              {teacher.whatsappContact && (
                <a href={`https://wa.me/${teacher.whatsappContact.replace(/[^0-9]/g, '')}`} className="btn-whatsapp" style={{ width: '100%', textAlign: 'center', marginBottom: 24, display: 'block' }}>
                  Chat on WhatsApp
                </a>
              )}

              {teacher.description && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 14, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-mute)', margin: '0 0 8px' }}>About</h3>
                  <p style={{ color: 'var(--text-dark)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{teacher.description}</p>
                </div>
              )}

              {teacher.teachingStyle && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 14, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-mute)', margin: '0 0 8px' }}>Teaching Style</h3>
                  <p style={{ color: 'var(--text-dark)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{teacher.teachingStyle}</p>
                </div>
              )}

              {teacher.specialties.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 14, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-mute)', margin: '0 0 8px' }}>Specialties</h3>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {teacher.specialties.map((s: string) => (
                      <span key={s} className="mono" style={{ fontSize: 11, padding: '4px 10px', borderRadius: 100, background: 'var(--paper)', color: 'var(--text-mute)' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {teacher.subcategories.length > 0 && (
                <div>
                  <h3 style={{ fontSize: 14, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-mute)', margin: '0 0 8px' }}>Subcategories</h3>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {teacher.subcategories.map((s: string) => (
                      <span key={s} className="mono" style={{ fontSize: 11, padding: '4px 10px', borderRadius: 100, background: 'var(--paper)', color: 'var(--text-mute)' }}>{displaySub(s)}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="main-col">
            <h2 style={{ fontSize: 22, margin: '0 0 24px' }}>Courses by {teacher.name}</h2>
            {teacher.courses.length === 0 ? (
              <p style={{ color: 'var(--text-mute)' }}>No courses available yet.</p>
            ) : (
              <div className="scroll-row">
                {teacher.courses.map((c) => (
                  <Link key={c.id} href={`/course/${c.id}`} className="course-card" style={{ flex: '0 0 280px' }}>
                    <span className={`tag ${c.category.toLowerCase()}`}>{c.category}</span>
                    <h4>{c.title}</h4>
                    <div className="meta">{c.level} · {c.schedule}</div>
                    <div className="cta-row">
                      <span className="mono" style={{ fontSize: 12, color: 'var(--text-mute)' }}>View details</span>
                      <span className="whatsapp">WhatsApp →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
