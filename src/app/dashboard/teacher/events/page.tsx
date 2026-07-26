'use client';
import { useState, useEffect } from 'react';
import ImageUpload from '@/components/ImageUpload';
import PreviewModal from '@/components/PreviewModal';
import EventPreview from '@/components/EventPreview';
import { sanitizeCssUrl } from '@/lib/url-utils';

interface EventNews {
  id: string; type: string; title: string; description: string; status: string; createdAt: string; relatedAction: string; photo: string | null;
  teacher: { id: string; name: string; avatarPhoto: string | null };
}

export default function TeacherEventsPage() {
  const [events, setEvents] = useState<EventNews[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'event', title: '', description: '', relatedAction: '', photo: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewEvent, setPreviewEvent] = useState<EventNews | null>(null);

  useEffect(() => { fetch('/api/teacher/events').then(r => r.json()).then(d => { setEvents(d); setLoading(false); }); }, []);

  async function handleCreate() {
    setSaving(true);
    await fetch('/api/teacher/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const updated = await fetch('/api/teacher/events').then(r => r.json());
    setEvents(updated);
    setSaving(false);
    setShowForm(false);
    setForm({ type: 'event', title: '', description: '', relatedAction: '', photo: '' });
  }

  async function handleSubmitForReview(id: string) {
    await fetch('/api/teacher/events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'pending_review' }),
    });
    setEvents(events.map(e => e.id === id ? { ...e, status: 'pending_review' } : e));
  }

  async function deleteEvent(id: string) {
    if (!confirm('Delete this item?')) return;
    await fetch('/api/teacher/events', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setEvents(events.filter(e => e.id !== id));
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(27,31,42,0.12)', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box', background: '#fff' };
  const labelStyle: React.CSSProperties = { display: 'block', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-mute)', marginBottom: 7 };

  const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
    draft: { bg: 'rgba(234,179,8,0.1)', color: '#a16207', label: 'Draft' },
    pending_review: { bg: 'rgba(59,130,246,0.1)', color: '#2563eb', label: 'Pending Review' },
    published: { bg: 'rgba(34,197,94,0.1)', color: '#16a34a', label: 'Published' },
    rejected: { bg: 'rgba(239,68,68,0.1)', color: '#dc2626', label: 'Rejected' },
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 600, marginBottom: 6 }}>Events &amp; News</h1>
          <p style={{ fontSize: 14, color: 'var(--text-mute)' }}>Create events and news items. Submit for review to go live on the public site.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ fontSize: 13 }}>
          {showForm ? 'Cancel' : '+ New Item'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(27,31,42,0.06)', padding: 28, marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Create New Item</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Type</label>
                <select style={inputStyle} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="event">Event</option>
                  <option value="news">News</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Title</label>
                <input style={inputStyle} value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Event or news title" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' as const }} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the event or news..." />
            </div>
            <div>
              <label style={labelStyle}>Action Link (WhatsApp URL)</label>
              <input style={inputStyle} value={form.relatedAction} onChange={e => setForm({...form, relatedAction: e.target.value})} placeholder="https://wa.me/..." />
            </div>
            <ImageUpload
              label="Photo"
              currentImage={form.photo}
              onUpload={url => setForm({...form, photo: url})}
            />
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            <button onClick={handleCreate} disabled={saving || !form.title} className="btn-primary" style={{ fontSize: 13, opacity: saving || !form.title ? 0.6 : 1 }}>
              {saving ? 'Creating...' : 'Create as Draft'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(27,31,42,0.12)', background: '#fff', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: 'var(--text-mute)', textAlign: 'center', padding: 40 }}>Loading...</div>
      ) : events.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(27,31,42,0.06)', padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>◎</div>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, marginBottom: 8 }}>No events or news yet</h3>
          <p style={{ fontSize: 14, color: 'var(--text-mute)', marginBottom: 20 }}>Create your first item to get started.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary" style={{ fontSize: 13 }}>+ Create Item</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {events.map(e => {
            const sc = statusConfig[e.status] || statusConfig.draft;
            return (
              <div key={e.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(27,31,42,0.06)', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {e.photo && sanitizeCssUrl(e.photo) && <div style={{ width: 48, height: 48, borderRadius: 8, background: `url(${sanitizeCssUrl(e.photo)}) center/cover`, flexShrink: 0, marginRight: 14 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 600, margin: 0 }}>{e.title}</h3>
                    <span className={`tag ${e.type === 'event' ? 'sat' : 'act'}`} style={{ fontSize: 10 }}>{e.type}</span>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, padding: '2px 8px', borderRadius: 100, background: sc.bg, color: sc.color, fontWeight: 500 }}>{sc.label}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-mute)', margin: 0 }}>
                    Created {new Date(e.createdAt).toLocaleDateString()}
                    {e.description && <> · {e.description.slice(0, 80)}{e.description.length > 80 ? '...' : ''}</>}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 16 }}>
                  <button onClick={() => setPreviewEvent(e)} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(27,31,42,0.12)', background: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer', color: 'var(--ink-700)' }}>
                    Preview
                  </button>
                  {(e.status === 'draft' || e.status === 'rejected') && (
                    <button onClick={() => handleSubmitForReview(e.id)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: 'var(--blue)', color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                      {e.status === 'rejected' ? 'Resubmit' : 'Submit for Review'}
                    </button>
                  )}
                  <button onClick={() => deleteEvent(e.id)} style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)', background: 'transparent', fontSize: 12, cursor: 'pointer', color: '#dc2626' }}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PreviewModal open={!!previewEvent} onClose={() => setPreviewEvent(null)} title={previewEvent?.title || ''}>
        {previewEvent && <EventPreview event={{ ...previewEvent, createdAt: previewEvent.createdAt }} />}
      </PreviewModal>
    </div>
  );
}
