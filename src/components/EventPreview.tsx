'use client';

import { isSafeUrl, sanitizeCssUrl } from '@/lib/url-utils';

interface EventData {
  id: string; type: string; title: string; description: string; photo: string | null;
  relatedAction: string | null; createdAt: string;
  teacher: { id: string; name: string; avatarPhoto: string | null };
}

export default function EventPreview({ event }: { event: EventData }) {
  const t = event.teacher;
  const initials = t.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('');
  const safePhoto = sanitizeCssUrl(event.photo);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 640, margin: '0 auto' }}>
      {safePhoto && (
        <div style={{ width: '100%', height: 240, borderRadius: 14, background: `url(${safePhoto}) center/cover`, marginBottom: 24 }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span className={`tag ${event.type === 'event' ? 'sat' : 'act'}`}>
          {event.type === 'event' ? 'Event' : 'News'}
        </span>
        <span style={{ fontSize: 13, color: 'var(--ink-400)' }}>
          {new Date(event.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 600, margin: '0 0 12px' }}>{event.title}</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        {t.avatarPhoto ? (
          <img src={t.avatarPhoto} alt={t.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: 11 }}>{initials}</div>
        )}
        <span style={{ fontSize: 14, color: 'var(--ink-500)' }}>By <span style={{ color: 'var(--blue)', fontWeight: 500 }}>{t.name}</span></span>
      </div>

      <div style={{ background: 'var(--paper)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <p style={{ fontSize: 15, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line', color: 'var(--ink-700)' }}>{event.description}</p>
      </div>

      {event.relatedAction && isSafeUrl(event.relatedAction) && (
        <div style={{ padding: '12px 0', background: event.type === 'event' ? 'var(--blue)' : 'var(--teal)', color: '#fff', borderRadius: 8, textAlign: 'center', fontSize: 14, fontWeight: 600 }}>
          {event.type === 'event' ? 'Register on WhatsApp' : 'Learn More on WhatsApp'}
        </div>
      )}

      <div style={{ marginTop: 20, padding: '12px 16px', borderRadius: 8, background: 'rgba(47,111,237,0.06)', fontSize: 12, color: 'var(--ink-400)', textAlign: 'center' }}>
        This is how students see this {event.type} on the public site.
      </div>
    </div>
  );
}
