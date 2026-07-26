'use client';
import { useEffect, useState } from 'react';
import PreviewModal from '@/components/PreviewModal';
import EventPreview from '@/components/EventPreview';
import { sanitizeCssUrl } from '@/lib/url-utils';

interface Event {
  id: string; title: string; type: string; status: string; description: string; rejectionReason: string | null;
  relatedAction: string | null; photo: string | null;
  teacher: { id: string; name: string; avatarPhoto: string | null };
  createdAt: string;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [previewEvent, setPreviewEvent] = useState<Event | null>(null);

  const load = () => {
    fetch('/api/admin/events').then(r => r.json()).then((data: Event[]) => { setEvents(data); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const handleApprove = async (id: string) => {
    await fetch('/api/admin/events/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'published' }) });
    load();
  };

  const handleReject = async (id: string) => {
    await fetch('/api/admin/events/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rejected', rejectionReason: rejectReason }) });
    setRejectModal(null); setRejectReason(''); load();
  };

  const filtered = filter === 'all' ? events : events.filter(e => e.status === filter);

  if (loading) return <p style={{ color: 'var(--ink-500)' }}>Loading...</p>;

  return (
    <div>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 8 }}>Events & News</h1>
      <p style={{ color: 'var(--ink-500)', fontSize: 15, marginBottom: 24 }}>Review teacher event/news publishing requests.</p>

      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 420, maxWidth: '90vw' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, marginBottom: 12 }}>Reject</h3>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason..." style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14, outline: 'none', resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--ink-200)', background: '#fff', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
              <button onClick={() => rejectModal && handleReject(rejectModal)} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Reject</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['all', 'pending_review', 'published', 'rejected', 'draft'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid var(--ink-200)', background: filter === s ? 'var(--ink-900)' : '#fff', color: filter === s ? '#fff' : 'var(--ink-600)', fontSize: 13, fontWeight: 500, cursor: 'pointer', textTransform: 'replace' }}>
            {s === 'all' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(e => (
          <div key={e.id} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 16 }}>
            {sanitizeCssUrl(e.photo) ? (
              <div style={{ width: 48, height: 48, borderRadius: 8, background: `url(${sanitizeCssUrl(e.photo)}) center/cover`, flexShrink: 0 }} />
            ) : (
              <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', background: e.type === 'event' ? '#e0e7ff' : '#fef3c7', color: e.type === 'event' ? '#3730a3' : '#92400e', flexShrink: 0 }}>{e.type}</span>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-900)' }}>{e.title}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-400)' }}>{e.teacher.name} · {new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            </div>
            <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: e.status === 'published' ? '#dcfce7' : e.status === 'pending_review' ? '#fef3c7' : '#fee2e2', color: e.status === 'published' ? '#166534' : e.status === 'pending_review' ? '#92400e' : '#991b1b', textTransform: 'capitalize' }}>
              {e.status.replace('_', ' ')}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setPreviewEvent(e)} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid var(--ink-200)', background: '#fff', color: 'var(--ink-600)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Preview</button>
              {e.status === 'pending_review' && (
                <>
                  <button onClick={() => handleApprove(e.id)} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #10b981', background: '#fff', color: '#10b981', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Approve</button>
                  <button onClick={() => setRejectModal(e.id)} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #ef4444', background: '#fff', color: '#ef4444', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Reject</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <PreviewModal open={!!previewEvent} onClose={() => setPreviewEvent(null)} title={previewEvent?.title || ''}>
        {previewEvent && <EventPreview event={{ ...previewEvent, createdAt: previewEvent.createdAt }} />}
      </PreviewModal>
    </div>
  );
}
