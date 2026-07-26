'use client';
import { useState } from 'react';
import Link from 'next/link';
import { sanitizeCssUrl } from '@/lib/url-utils';

interface Item {
  id: string;
  title: string;
  description: string;
  type: string;
  createdAt: string;
  photo?: string | null;
}

function Carousel({ items, type }: { items: Item[]; type: 'event' | 'news' }) {
  const [idx, setIdx] = useState(0);
  if (items.length === 0) return (
    <div>
      <h3 style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dark)', margin: '0 0 12px' }}>
        {type === 'event' ? 'Events' : 'News'}
      </h3>
      <div style={{ borderRadius: 16, background: 'var(--paper-dim)', border: '1px solid rgba(27,31,42,0.07)', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-mute)', fontSize: 14 }}>
        No {type === 'event' ? 'events' : 'news'} yet.
      </div>
    </div>
  );
  const item = items[idx];

  return (
    <div>
      <h3 style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dark)', margin: '0 0 12px' }}>
        {type === 'event' ? 'Events' : 'News'}
      </h3>
      <Link href={`/event/${item.id}`} style={{ display: 'block', position: 'relative', overflow: 'hidden', borderRadius: 16, background: sanitizeCssUrl(item.photo) ? `url(${sanitizeCssUrl(item.photo)}) center/cover` : 'var(--paper-dim)', border: '1px solid rgba(27,31,42,0.07)', aspectRatio: '4/3' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(0,0,0,0.5), transparent)` }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 }}>
          <p style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 600, color: '#fff', margin: '0 0 2px' }}>{item.title}</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</p>
        </div>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 12 }}>
        <button onClick={() => setIdx((idx - 1 + items.length) % items.length)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(27,31,42,0.15)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-mute)' }} aria-label="Previous">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--text-mute)' }}>{idx + 1} / {items.length}</span>
        <button onClick={() => setIdx((idx + 1) % items.length)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(27,31,42,0.15)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-mute)' }} aria-label="Next">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}

export default function EventsNews({ events, news }: { events: Item[]; news: Item[] }) {
  return (
    <section className="block">
      <div className="section-head">
        <span className="eyebrow2">Stay updated</span>
        <h2>Events &amp; News</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, maxWidth: 900, margin: '0 auto' }}>
        <Carousel items={events} type="event" />
        <Carousel items={news} type="news" />
      </div>
    </section>
  );
}
