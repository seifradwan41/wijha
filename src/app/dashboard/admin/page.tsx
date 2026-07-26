'use client';
import { useEffect, useState } from 'react';

interface Submission {
  id: string;
  type: string;
  status: string;
  rejectionReason: string | null;
  payload: string;
  createdAt: string;
  submitter: { id: string; name: string; contact: string | null };
}

export default function AdminReviewQueue() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = () => {
    fetch('/api/admin/submissions').then(r => r.json()).then((data: Submission[]) => { setSubmissions(data); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const handleAction = async (id: string, status: string, reason?: string) => {
    await fetch(`/api/admin/submissions/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, rejectionReason: reason }) });
    setRejectModal(null); setRejectReason(''); load();
  };

  const pending = submissions.filter(s => s.status === 'pending');
  const reviewed = submissions.filter(s => s.status !== 'pending');

  if (loading) return <p style={{ color: 'var(--text-mute)', fontFamily: 'IBM Plex Mono, monospace', fontSize: 13 }}>Loading...</p>;

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1>Review Queue</h1>
          <div className="dash-header-sub">Review and approve/reject community collaborator submissions.</div>
        </div>
      </div>

      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 28, width: 420, maxWidth: '90vw', border: '1px solid rgba(27,31,42,0.07)' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, marginBottom: 12 }}>Reject Submission</h3>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection..." style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 10, border: '1px solid rgba(27,31,42,0.12)', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(27,31,42,0.12)', background: '#fff', cursor: 'pointer', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Cancel</button>
              <button onClick={() => handleAction(rejectModal, 'rejected', rejectReason)} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Reject</button>
            </div>
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <>
          <h2 style={{ fontSize: 16, fontWeight: 600, fontFamily: 'Fraunces, serif', color: 'var(--text-dark)', marginBottom: 14 }}>Pending ({pending.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
            {pending.map(s => {
              let payload: Record<string, string> = {}; try { payload = JSON.parse(s.payload); } catch {}
              return (
                <div key={s.id} className="dash-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span className={`type-badge ${s.type}`}>{s.type}</span>
                    <span className="dash-card-meta">by {s.submitter.name}</span>
                    <span className="dash-card-meta" style={{ marginLeft: 'auto' }}>{new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="dash-card-title" style={{ fontSize: 16 }}>{payload.title || 'Untitled'}</div>
                  <p style={{ fontSize: 13, color: 'var(--text-mute)', lineHeight: 1.5, margin: '4px 0 0' }}>{payload.description?.slice(0, 200) || 'No description'}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                    <button onClick={() => handleAction(s.id, 'approved')} style={{ padding: '8px 20px', borderRadius: 10, border: 'none', background: '#10b981', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Approve</button>
                    <button onClick={() => setRejectModal(s.id)} style={{ padding: '8px 20px', borderRadius: 10, border: '1px solid #ef4444', background: '#fff', color: '#ef4444', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Reject</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {reviewed.length > 0 && (
        <>
          <h2 style={{ fontSize: 16, fontWeight: 600, fontFamily: 'Fraunces, serif', color: 'var(--text-dark)', marginBottom: 14 }}>Reviewed ({reviewed.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reviewed.map(s => {
              let payload: Record<string, string> = {}; try { payload = JSON.parse(s.payload); } catch {}
              return (
                <div key={s.id} className="dash-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span className={`type-badge ${s.type}`}>{s.type}</span>
                  <span className="dash-card-title" style={{ flex: 1, fontSize: 14 }}>{payload.title || 'Untitled'}</span>
                  <span className="dash-card-meta">by {s.submitter.name}</span>
                  <span className={`status-pill ${s.status}`}>{s.status}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {pending.length === 0 && reviewed.length === 0 && (
        <div className="dash-empty">
          <div className="dash-empty-icon">📋</div>
          <h3>All caught up</h3>
          <p>No submissions to review right now.</p>
        </div>
      )}
    </div>
  );
}
