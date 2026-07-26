import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = await prisma.course.findUnique({
    where: { id: courseId, status: 'published' },
    include: { teacher: true },
  });

  if (!course) {
    return <div style={{ padding: '120px 48px', textAlign: 'center', color: 'var(--text-mute)' }}>Course not found.</div>;
  }

  const similarCourses = await prisma.course.findMany({
    where: { id: { not: course.id }, subcategory: course.subcategory, status: 'published' },
    include: { teacher: true },
    take: 3,
  });

  return (
    <>
      <div className="page-header">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / <Link href={`/category/${encodeURIComponent(course.category)}`}>{course.category}</Link> / <Link href={`/category/${encodeURIComponent(course.category)}/${encodeURIComponent(course.subcategory)}`}>{course.subcategory}</Link> / <span>{course.title}</span>
        </div>
        <h1>{course.title}</h1>
        <p>by <Link href={`/teacher/${course.teacherId}`} style={{ color: 'var(--blue-soft)' }}>{course.teacher.name}</Link></p>
      </div>

      <section className="block">
        <div className="two-col">
          <div className="main-col">
            <div className="fact-panel" style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, margin: '0 0 24px' }}>Course Details</h2>
              <div className="fact-grid">
                <div className="fact"><span className="fact-label">Category</span><span className="fact-value">{course.category}</span></div>
                <div className="fact"><span className="fact-label">Subcategory</span><span className="fact-value">{course.subcategory}</span></div>
                <div className="fact"><span className="fact-label">Level</span><span className="fact-value">{course.level}</span></div>
                {course.targetGrades.length > 0 && <div className="fact"><span className="fact-label">Target Grades</span><span className="fact-value">{course.targetGrades.join(', ')}</span></div>}
                {course.targetExamDate && <div className="fact"><span className="fact-label">Target Exam</span><span className="fact-value">{course.targetExamDate}</span></div>}
                <div className="fact"><span className="fact-label">Schedule</span><span className="fact-value">{course.schedule}</span></div>
                {course.estimatedGroupSize && <div className="fact"><span className="fact-label">Group Size</span><span className="fact-value">{course.estimatedGroupSize} students</span></div>}
                {course.sessionCount && <div className="fact"><span className="fact-label">Sessions</span><span className="fact-value">{course.sessionCount}</span></div>}
                {course.startDate && <div className="fact"><span className="fact-label">Start Date</span><span className="fact-value">{new Date(course.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>}
              </div>
            </div>

            <div className="fact-panel">
              <h2 style={{ fontSize: 18, margin: '0 0 16px' }}>Description</h2>
              <p style={{ color: 'var(--text-dark)', fontSize: 15, lineHeight: 1.8, margin: 0 }}>{course.description}</p>
            </div>
          </div>

          <div className="sidebar">
            <div className="fact-panel">
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 28, fontWeight: 600, color: 'var(--blue)', margin: '0 0 4px' }}>
                  {course.contactForPrice ? 'Contact for price' : course.price ? `$${course.price}` : 'Contact'}
                </p>
                <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--text-mute)', margin: 0 }}>per student</p>
              </div>

              {course.teacher.whatsappContact && (
                <a href={`https://wa.me/${course.teacher.whatsappContact.replace(/[^0-9]/g, '')}?text=Hi!%20I'm%20interested%20in%20the%20course:%20${encodeURIComponent(course.title)}`} className="btn-whatsapp" style={{ width: '100%', textAlign: 'center', display: 'block', marginBottom: 16 }}>
                  Enquire on WhatsApp
                </a>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-mute)' }}>
                  <span style={{ color: 'var(--teal)' }}>✓</span> Direct contact with teacher
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-mute)' }}>
                  <span style={{ color: 'var(--teal)' }}>✓</span> Customized schedule available
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-mute)' }}>
                  <span style={{ color: 'var(--teal)' }}>✓</span> Personalized learning plan
                </div>
              </div>
            </div>
          </div>
        </div>

        {similarCourses.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 22, margin: '0 0 24px' }}>Similar courses</h2>
            <div className="scroll-row">
              {similarCourses.map((c) => (
                <Link key={c.id} href={`/course/${c.id}`} className="course-card" style={{ flex: '0 0 280px' }}>
                  <span className={`tag ${c.category.toLowerCase()}`}>{c.category}</span>
                  <h4>{c.title}</h4>
                  <div className="meta">{c.teacher.name} · {c.level}</div>
                  <div className="cta-row">
                    <span className="mono" style={{ fontSize: 12, color: 'var(--text-mute)' }}>View details</span>
                    <span className="whatsapp">WhatsApp →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
