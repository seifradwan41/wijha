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
    fetch('/api/admin/submissions').then(r => r.json()).then((data: Submission[]) => {
      setSubmissions(data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id: string, status: string, reason?: string) => {
    await fetch(`/api/admin/submissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, rejectionReason: reason }),
    });
    setRejectModal(null);
    setRejectReason('');
    load();
  };

  const pending = submissions.filter(s => s.status === 'pending');
  const reviewed = submissions.filter(s => s.status !== 'pending');

  if (loading) return <p style={{ color: 'var(--ink-500)' }}>Loading...</p>;

  return (
    <div>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 8 }}>Review Queue</h1>
      <p style={{ color: 'var(--ink-500)', fontSize: 15, marginBottom: 32 }}>Approve or reject community collaborator submissions.</p>

      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 420, maxWidth: '90vw' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, marginBottom: 12 }}>Reject Submission</h3>
            <p style={{ fontSize: 14, color: 'var(--ink-500)', marginBottom: 16 }}>Provide a reason for the collaborator to see.</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection..." style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--ink-200)', background: '#fff', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
              <button onClick={() => handleAction(rejectModal, 'rejected', rejectReason)} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Reject</button>
            </div>
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, color: 'var(--ink-900)', marginBottom: 16 }}>Pending ({pending.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
            {pending.map(s => {
              let payload: Record<string, string> = {};
              try { payload = JSON.parse(s.payload); } catch {}
              return (
                <div key={s.id} style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', background: 'var(--ink-100)', color: 'var(--ink-600)' }}>{s.type}</span>
                    <span style={{ fontSize: 13, color: 'var(--ink-500)' }}>by {s.submitter.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--ink-400)', marginLeft: 'auto' }}>{new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 4 }}>{payload.title || 'Untitled'}</h3>
                  <p style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 4, lineHeight: 1.5 }}>{payload.description?.slice(0, 200) || 'No description'}</p>
                  {payload.teacherName && <p style={{ fontSize: 12, color: 'var(--ink-400)' }}>Teacher: {payload.teacherName}</p>}
                  {payload.schedule && <p style={{ fontSize: 12, color: 'var(--ink-400)' }}>Schedule: {payload.schedule}</p>}
                  <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    <button onClick={() => handleAction(s.id, 'approved')} style={{ padding: '8px 20px', borderRadius: 10, border: 'none', background: '#10b981', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Approve</button>
                    <button onClick={() => { setRejectModal(s.id); setRejectReason(''); }} style={{ padding: '8px 20px', borderRadius: 10, border: '1px solid #ef4444', background: '#fff', color: '#ef4444', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Reject</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {reviewed.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, color: 'var(--ink-900)', marginBottom: 16 }}>Reviewed ({reviewed.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviewed.map(s => {
              let payload: Record<string, string> = {};
              try { payload = JSON.parse(s.payload); } catch {}
              const color = s.status === 'approved' ? '#10b981' : '#ef4444';
              return (
                <div key={s.id} style={{ background: '#fff', borderRadius: 14, padding: '16px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', background: 'var(--ink-100)', color: 'var(--ink-600)' }}>{s.type}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-900)', flex: 1 }}>{payload.title || 'Untitled'}</span>
                  <span style={{ fontSize: 12, color: 'var(--ink-400)' }}>by {s.submitter.name}</span>
                  {s.rejectionReason && <span style={{ fontSize: 12, color: '#ef4444', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Reason: {s.rejectionReason}</span>}
                  <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: `${color}15`, color, textTransform: 'capitalize' }}>{s.status}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
