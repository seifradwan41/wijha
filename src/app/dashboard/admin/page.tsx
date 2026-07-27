'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Submission {
  id: string; type: string; status: string; rejectionReason: string | null;
  payload: string; createdAt: string;
  submitter: { id: string; name: string; contact: string | null };
}

interface Stats {
  pendingSubmissions: number;
  totalTeachers: number;
  totalCollaborators: number;
  totalCourses: number;
  totalEvents: number;
}

const quickActions = [
  { label: 'New Account', href: '/dashboard/admin/accounts', icon: '＋', desc: 'Create teacher or collaborator accounts' },
  { label: 'Taxonomy', href: '/dashboard/admin/taxonomy', icon: '🏷️', desc: 'Manage categories, subjects, levels' },
  { label: 'Settings', href: '/dashboard/admin/settings', icon: '⚙️', desc: 'WhatsApp number & platform config' },
  { label: 'Teacher Manager', href: '/dashboard/admin/teacher-manager', icon: '👤', desc: 'Manage courses and events for teachers' },
];

const commonActions = [
  { label: 'New Account', href: '/dashboard/admin/accounts', icon: '＋', desc: 'Create teacher or collaborator accounts' },
  { label: 'Taxonomy', href: '/dashboard/admin/taxonomy', icon: '🏷️', desc: 'Manage categories, subjects, levels' },
  { label: 'Teacher Manager', href: '/dashboard/admin/teacher-manager', icon: '👤', desc: 'Manage courses and events for teachers' },
];

export default function AdminDashboardHome() {
  const { data: session } = useSession();
  const user = session?.user as Record<string, unknown> | undefined;
  const name = (user?.name as string) || 'Admin';
  const role = user?.role as string;
  const isAdmin = role === 'admin';
  const roleLabel = 'Admin';
  const actions = isAdmin ? quickActions : commonActions;

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<Stats>({ pendingSubmissions: 0, totalTeachers: 0, totalCollaborators: 0, totalCourses: 0, totalEvents: 0 });
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [firstVisit, setFirstVisit] = useState(false);

  useEffect(() => {
    const key = 'visited_dashboard';
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, '1');
      setFirstVisit(true);
    }
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/submissions').then(r => r.json()),
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/admin/courses').then(r => r.json()),
      fetch('/api/admin/events').then(r => r.json()),
    ]).then(([subs, users, courses, events]) => {
      setSubmissions(subs);
      setStats({
        pendingSubmissions: subs.filter((s: Submission) => s.status === 'pending').length,
        totalTeachers: users.filter((u: { role: string }) => u.role === 'teacher').length,
        totalCollaborators: users.filter((u: { role: string }) => u.role === 'community_collaborator').length,
        totalCourses: courses.length,
        totalEvents: events.length,
      });
      setLoading(false);
    });
  }, []);

  const load = () => {
    fetch('/api/admin/submissions').then(r => r.json()).then((data: Submission[]) => { setSubmissions(data); });
  };

  const handleAction = async (id: string, status: string, reason?: string) => {
    await fetch(`/api/admin/submissions/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, rejectionReason: reason }) });
    setRejectModal(null); setRejectReason(''); load();
  };

  const pending = submissions.filter(s => s.status === 'pending');

  const statCards = [
    { label: 'Pending Review', value: stats.pendingSubmissions, color: '#f59e0b', href: '/dashboard/admin' },
    { label: 'Teachers', value: stats.totalTeachers, color: '#2F6FED', href: '/dashboard/admin/accounts' },
    { label: 'Courses', value: stats.totalCourses, color: '#10b981', href: '/dashboard/admin/courses' },
    { label: 'Events & News', value: stats.totalEvents, color: '#8b5cf6', href: '/dashboard/admin/events' },
    { label: 'Collaborators', value: stats.totalCollaborators, color: '#06b6d4', href: '/dashboard/admin/accounts' },
  ];

  if (loading) return <div style={{ padding: 40, color: 'var(--text-mute)' }}>Loading...</div>;

  return (
    <div>
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 28, width: 420, maxWidth: '100%', border: '1px solid rgba(27,31,42,0.07)' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, marginBottom: 12 }}>Reject Submission</h3>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection..." style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 10, border: '1px solid rgba(27,31,42,0.12)', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(27,31,42,0.12)', background: '#fff', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
              <button onClick={() => handleAction(rejectModal, 'rejected', rejectReason)} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 600, margin: '0 0 4px' }}>
          {firstVisit ? `Welcome, ${name.split(' ')[0]} to Wijha` : `Welcome back, ${name.split(' ')[0]}`} 👋
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-mute)', margin: 0 }}>
          You are logged in as <strong>{roleLabel}</strong>. Here is your overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 12,
        marginBottom: 28,
      }}>
        {statCards.map(s => (
          <Link key={s.label} href={s.href} style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid rgba(27,31,42,0.07)',
            padding: '18px 16px',
            textDecoration: 'none',
            transition: 'box-shadow 0.2s',
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-mute)', fontWeight: 500 }}>{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 style={{ fontSize: 16, fontWeight: 600, fontFamily: 'Fraunces, serif', margin: '0 0 12px' }}>Quick Actions</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 10,
        marginBottom: 32,
      }}>
        {actions.map(a => (
          <Link key={a.label} href={a.href} style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid rgba(27,31,42,0.07)',
            padding: '16px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            transition: 'border-color 0.2s',
          }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{a.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 2 }}>{a.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-mute)', lineHeight: 1.3 }}>{a.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pending Submissions */}
      <div data-tour="review-queue">
        <h2 style={{ fontSize: 16, fontWeight: 600, fontFamily: 'Fraunces, serif', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          Pending Review
          {pending.length > 0 && (
            <span style={{ fontSize: 11, background: '#f59e0b', color: '#fff', borderRadius: 100, padding: '2px 8px', fontFamily: 'IBM Plex Mono, monospace' }}>{pending.length}</span>
          )}
        </h2>

        {pending.length === 0 ? (
          <div style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid rgba(27,31,42,0.07)',
            padding: '32px 24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px', fontFamily: 'Fraunces, serif' }}>All caught up</h3>
            <p style={{ fontSize: 13, color: 'var(--text-mute)', margin: 0 }}>No submissions to review right now.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pending.map(s => {
              let payload: Record<string, string> = {}; try { payload = JSON.parse(s.payload); } catch {}
              return (
                <div key={s.id} style={{
                  background: '#fff', borderRadius: 14, border: '1px solid rgba(27,31,42,0.07)', padding: '16px 20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span className={`type-badge ${s.type}`}>{s.type}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-mute)' }}>by {s.submitter.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-mute)', marginLeft: 'auto', fontFamily: 'IBM Plex Mono, monospace' }}>
                      {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4 }}>{payload.title || 'Untitled'}</div>
                  <p style={{ fontSize: 13, color: 'var(--text-mute)', lineHeight: 1.5, margin: '0 0 12px' }}>{payload.description?.slice(0, 200) || 'No description'}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleAction(s.id, 'approved')} style={{ padding: '7px 18px', borderRadius: 8, border: 'none', background: '#10b981', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Approve</button>
                    <button onClick={() => setRejectModal(s.id)} style={{ padding: '7px 18px', borderRadius: 8, border: '1px solid #ef4444', background: '#fff', color: '#ef4444', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Reject</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
