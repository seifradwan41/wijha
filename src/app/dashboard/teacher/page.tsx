import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function TeacherDashboardPage() {
  const session = await auth();
  const userId = (session?.user as Record<string, unknown>)?.userId as string;
  const userName = session?.user?.name || 'Teacher';

  let courseCount = 0;
  let publishedCount = 0;
  let draftCount = 0;
  let eventCount = 0;
  let pendingCount = 0;

  if (userId) {
    courseCount = await prisma.course.count({ where: { teacherId: userId } });
    publishedCount = await prisma.course.count({ where: { teacherId: userId, status: 'published' } });
    draftCount = await prisma.course.count({ where: { teacherId: userId, status: 'draft' } });
    eventCount = await prisma.eventNews.count({ where: { teacherId: userId } });
    pendingCount = await prisma.eventNews.count({ where: { teacherId: userId, status: 'pending_review' } });
  }

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 30, fontWeight: 600, marginBottom: 6 }}>Welcome back, {userName}</h1>
        <p style={{ fontSize: 15, color: 'var(--text-mute)' }}>Here&apos;s an overview of your teaching activity on Wijha.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 36 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(27,31,42,0.06)' }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-mute)', marginBottom: 8 }}>Total Courses</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 600, color: 'var(--text-dark)' }}>{courseCount}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(27,31,42,0.06)' }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-mute)', marginBottom: 8 }}>Published</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 600, color: '#16a34a' }}>{publishedCount}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(27,31,42,0.06)' }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-mute)', marginBottom: 8 }}>Drafts</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 600, color: '#a16207' }}>{draftCount}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, padding: '20px 22px', border: '1px solid rgba(27,31,42,0.06)' }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-mute)', marginBottom: 8 }}>Pending Review</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 600, color: '#2563eb' }}>{pendingCount}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 36 }}>
        <Link href="/dashboard/teacher/courses" style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(27,31,42,0.06)', padding: 28, textDecoration: 'none', display: 'flex', alignItems: 'flex-start', gap: 18, transition: 'box-shadow 0.3s, transform 0.3s' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(47,111,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>▦</div>
          <div>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, color: 'var(--text-dark)', margin: '0 0 6px' }}>Manage Courses</h3>
            <p style={{ fontSize: 13, color: 'var(--text-mute)', margin: 0, lineHeight: 1.5 }}>Create new courses, edit existing ones, and toggle between draft and published status.</p>
          </div>
        </Link>

        <Link href="/dashboard/teacher/events" style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(27,31,42,0.06)', padding: 28, textDecoration: 'none', display: 'flex', alignItems: 'flex-start', gap: 18, transition: 'box-shadow 0.3s, transform 0.3s' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(234,179,8,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>◎</div>
          <div>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, color: 'var(--text-dark)', margin: '0 0 6px' }}>Events &amp; News</h3>
            <p style={{ fontSize: 13, color: 'var(--text-mute)', margin: 0, lineHeight: 1.5 }}>Create events and news items, then submit them for admin review before going live.</p>
          </div>
        </Link>
      </div>

      <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(27,31,42,0.06)', padding: 28 }}>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/dashboard/teacher/profile" className="btn-primary" style={{ fontSize: 13 }}>Edit Profile</Link>
          <Link href="/dashboard/teacher/courses" className="btn-ghost" style={{ fontSize: 13, color: 'var(--text-dark)', borderColor: 'rgba(27,31,42,0.15)' }}>New Course</Link>
          <Link href="/" className="btn-ghost" style={{ fontSize: 13, color: 'var(--text-dark)', borderColor: 'rgba(27,31,42,0.15)' }}>View Public Site</Link>
        </div>
      </div>
    </div>
  );
}
