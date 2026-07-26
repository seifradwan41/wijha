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

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/collaborator/submissions').then(r => r.json()).then((data: Submission[]) => {
      setSubmissions(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p style={{ color: 'var(--text-mute)', fontFamily: 'IBM Plex Mono, monospace', fontSize: 13 }}>Loading...</p>;

  if (!submissions.length) {
    return (
      <div className="dash-empty">
        <div className="dash-empty-icon">&#128203;</div>
        <h3>No submissions yet</h3>
        <p>Submit your first course, event, or news item from the Submit Content page.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1>My Submissions</h1>
          <div className="dash-header-sub">Track the status of your submitted content.</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {submissions.map(s => {
          let payload: Record<string, string> = {};
          try { payload = JSON.parse(s.payload); } catch {}
          const title = payload.title || payload.courseTitle || s.type;

          return (
            <div key={s.id} className="dash-card" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="dash-card-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
                <div className="dash-card-meta">
                  <span style={{ textTransform: 'capitalize' }}>{s.type}</span> · {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              {s.status === 'rejected' && s.rejectionReason && (
                <div style={{ fontSize: 12, color: '#dc2626', fontFamily: 'IBM Plex Mono, monospace', maxWidth: 200 }}>Reason: {s.rejectionReason}</div>
              )}
              <span className={`status-pill ${s.status}`}>
                {s.status === 'pending' ? 'Pending Review' : s.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
