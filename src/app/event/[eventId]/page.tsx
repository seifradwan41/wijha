import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { sanitizeHref, sanitizeCssUrl } from '@/lib/url-utils';

export default async function EventDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const event = await prisma.eventNews.findUnique({
    where: { id: eventId, status: 'published' },
    include: { teacher: true },
  });

  if (!event) {
    return <div style={{ padding: '120px 48px', textAlign: 'center', color: 'var(--text-mute)' }}>Event not found.</div>;
  }

  return (
    <>
      <div className="page-header">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / <span>{event.type === 'event' ? 'Events' : 'News'}</span> / <span>{event.title}</span>
        </div>
        <span className={`tag ${event.type === 'event' ? 'sat' : 'act'}`} style={{ marginBottom: 16, display: 'inline-block' }}>
          {event.type === 'event' ? 'Event' : 'News'}
        </span>
        <h1>{event.title}</h1>
        <p>By <Link href={`/teacher/${event.teacherId}`} style={{ color: 'var(--blue-soft)' }}>{event.teacher.name}</Link> · {new Date(event.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      <section className="block" style={{ maxWidth: 720, margin: '0 auto' }}>
        {sanitizeCssUrl(event.photo) && (
          <div style={{ width: '100%', height: 300, borderRadius: 16, background: `url(${sanitizeCssUrl(event.photo)}) center/cover`, marginBottom: 32 }} />
        )}
        <div className="fact-panel" style={{ marginBottom: 32 }}>
          <p style={{ color: 'var(--text-dark)', fontSize: 16, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' }}>{event.description}</p>
        </div>

        {event.relatedAction && sanitizeHref(event.relatedAction) && (
          <a href={sanitizeHref(event.relatedAction)} className="btn-primary" style={{ display: 'inline-block' }}>
            {event.type === 'event' ? 'Register on WhatsApp' : 'Learn More on WhatsApp'}
          </a>
        )}
      </section>
    </>
  );
}
