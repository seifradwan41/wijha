'use client';
import { useEffect, useState } from 'react';

interface Submission {
  id: string;
  type: string;
  status: string;
  rejectionReason: string | null;
  payload: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/collaborator/submissions').then(r => r.json()).then((data: Submission[]) => {
      setSubmissions(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p style={{ color: 'var(--ink-500)' }}>Loading...</p>;

  if (!submissions.length) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>&#128203;</div>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, color: 'var(--ink-900)', marginBottom: 8 }}>No submissions yet</h2>
        <p style={{ color: 'var(--ink-500)' }}>Submit your first course, event, or news item from the Submit Content page.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 8 }}>My Submissions</h1>
      <p style={{ color: 'var(--ink-500)', fontSize: 15, marginBottom: 32 }}>Track the status of your submitted content.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {submissions.map(s => {
          let payload: Record<string, string> = {};
          try { payload = JSON.parse(s.payload); } catch {}
          const title = payload.title || payload.courseTitle || s.type;

          return (
            <div key={s.id} style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>
                  <span style={{ textTransform: 'capitalize' }}>{s.type}</span> &middot; {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              {s.status === 'rejected' && s.rejectionReason && (
                <div style={{ fontSize: 12, color: '#ef4444', maxWidth: 240, textAlign: 'right' }}>Reason: {s.rejectionReason}</div>
              )}
              <div style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: `${statusColors[s.status] || 'var(--ink-200)'}15`, color: statusColors[s.status] || 'var(--ink-500)', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                {s.status === 'pending' ? 'Pending Review' : s.status}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
