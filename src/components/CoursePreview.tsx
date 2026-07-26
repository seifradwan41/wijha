'use client';

interface CourseData {
  id: string; title: string; description: string; category: string; subcategory: string;
  level: string; schedule: string; price: number | null; contactForPrice: boolean;
  targetGrades: string[]; targetExamDate: string | null;
  estimatedGroupSize: number | null; sessionCount: number | null; startDate: string | null;
  teacher: { id: string; name: string; whatsappContact: string | null; avatarPhoto: string | null };
}

export default function CoursePreview({ course }: { course: CourseData }) {
  const t = course.teacher;
  const initials = t.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('');

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span className={`tag ${course.category.toLowerCase()}`}>{course.category}</span>
        <span style={{ fontSize: 13, color: 'var(--ink-400)' }}>{course.subcategory} · {course.level}</span>
      </div>

      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 600, margin: '0 0 8px' }}>{course.title}</h2>
      <p style={{ fontSize: 14, color: 'var(--ink-500)', margin: '0 0 28px' }}>
        by <span style={{ color: 'var(--blue)', fontWeight: 500 }}>{t.name}</span>
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 28 }}>
        <div>
          <div style={{ background: 'var(--paper)', borderRadius: 14, padding: 22, marginBottom: 20 }}>
            <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>Course Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>
              {[
                ['Category', course.category],
                ['Subcategory', course.subcategory],
                ['Level', course.level],
                course.targetGrades.length > 0 && ['Target Grades', course.targetGrades.join(', ')],
                course.targetExamDate && ['Target Exam', course.targetExamDate],
                ['Schedule', course.schedule],
                course.estimatedGroupSize && ['Group Size', `${course.estimatedGroupSize} students`],
                course.sessionCount && ['Sessions', `${course.sessionCount}`],
                course.startDate && ['Start Date', new Date(course.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })],
              ].filter((x): x is [string, string] => !!x).map(([label, value]) => (
                <div key={String(label)}>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-400)', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--paper)', borderRadius: 14, padding: 22 }}>
            <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 600, margin: '0 0 12px' }}>Description</h4>
            <p style={{ fontSize: 14, lineHeight: 1.75, margin: 0, color: 'var(--ink-700)' }}>{course.description}</p>
          </div>
        </div>

        <div>
          <div style={{ background: 'var(--paper)', borderRadius: 14, padding: 22, textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 26, fontWeight: 600, color: 'var(--blue)', marginBottom: 4 }}>
              {course.contactForPrice ? 'Contact for price' : course.price ? `$${course.price}` : 'Contact'}
            </div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--ink-400)' }}>per student</div>
          </div>

          <div style={{ background: 'var(--paper)', borderRadius: 14, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              {t.avatarPhoto ? (
                <img src={t.avatarPhoto} alt={t.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: 14 }}>{initials}</div>
              )}
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-400)' }}>Instructor</div>
              </div>
            </div>
            {t.whatsappContact && (
              <div style={{ padding: '10px 0', background: '#25D366', color: '#fff', borderRadius: 8, textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
                Enquire on WhatsApp
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20, padding: '12px 16px', borderRadius: 8, background: 'rgba(47,111,237,0.06)', fontSize: 12, color: 'var(--ink-400)', textAlign: 'center' }}>
        This is how students see this course on the public site.
      </div>
    </div>
  );
}
