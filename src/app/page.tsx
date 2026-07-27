import ConstellationHero from '@/components/ConstellationHero';
import CategoryPaths from '@/components/CategoryPaths';
import ScrollReveal from '@/components/ScrollReveal';
import EventsNews from '@/components/EventsNews';
import { prisma } from '@/lib/prisma';
import { sanitizeCssUrl } from '@/lib/url-utils';
import { displaySub } from '@/lib/subcategory-utils';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [teachers, eventsNews] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'teacher', status: 'active', profileStatus: 'published' },
      select: { id: true, name: true, categories: true, subcategories: true, avatarPhoto: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.eventNews.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, description: true, type: true, createdAt: true, photo: true },
    }),
  ]);

  const events = eventsNews.filter(e => e.type === 'event').map(e => ({
    id: e.id, title: e.title, description: e.description, type: e.type, createdAt: e.createdAt.toISOString(), photo: e.photo,
  }));
  const news = eventsNews.filter(e => e.type === 'news').map(e => ({
    id: e.id, title: e.title, description: e.description, type: e.type, createdAt: e.createdAt.toISOString(), photo: e.photo,
  }));

  return (
    <>
      <ConstellationHero />

      <CategoryPaths />

      <section className="block" id="teachers">
        <ScrollReveal>
          <div className="section-head">
            <span className="eyebrow2">Who&apos;s teaching</span>
            <h2>Real teachers you&apos;d otherwise find by chance</h2>
            <p>The instructors already running courses across the region — now searchable in one place, instead of one WhatsApp group at a time.</p>
          </div>
          <div className="teacher-row">
            {teachers.length === 0 ? (
              <p style={{ color: 'var(--text-mute)', textAlign: 'center', padding: '40px 0' }}>No teachers available yet.</p>
            ) : (
              teachers.map((t) => {
                const initials = t.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('');
                return (
                  <a key={t.id} href={`/teacher/${t.id}`} className="teacher-card" style={{ textDecoration: 'none' }}>
                    <div className="avatar" style={{ background: sanitizeCssUrl(t.avatarPhoto) ? `url(${sanitizeCssUrl(t.avatarPhoto)}) center/cover` : 'var(--blue)' }}>{!t.avatarPhoto && initials}</div>
                    <h4>{t.name}</h4>
                    <span>{t.subcategories.map(displaySub).join(' · ')}</span>
                  </a>
                );
              })
            )}
          </div>
        </ScrollReveal>
      </section>

      <EventsNews events={events} news={news} />

      <section className="block" id="mission">
        <ScrollReveal>
          <div className="mission">
            <div className="mission-visual">
              <svg viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="6" fill="#2F6FED" />
                <g stroke="#3A465E" strokeWidth="1">
                  <line x1="100" y1="100" x2="40" y2="50" />
                  <line x1="100" y1="100" x2="160" y2="46" />
                  <line x1="100" y1="100" x2="30" y2="130" />
                  <line x1="100" y1="100" x2="165" y2="140" />
                  <line x1="100" y1="100" x2="100" y2="24" />
                  <line x1="100" y1="100" x2="100" y2="176" />
                </g>
                <g fill="#5FA8B3">
                  <circle cx="40" cy="50" r="4" />
                  <circle cx="160" cy="46" r="4" />
                  <circle cx="30" cy="130" r="4" />
                  <circle cx="165" cy="140" r="4" />
                  <circle cx="100" cy="24" r="4" />
                  <circle cx="100" cy="176" r="4" />
                </g>
              </svg>
            </div>
            <div>
              <span className="eyebrow2">Our goal</span>
              <h2>Nobody should miss the right teacher because of the wrong group chat.</h2>
              <p>Wijha exists to close the gap between great teaching and the students who need it — before the clock on the next trial date runs out.</p>
              <div className="values">
                <div className="value"><div className="dot" /><div><b>Transparency</b><span>Level, schedule, format and exam window — stated clearly, not buried in a flyer.</span></div></div>
                <div className="value"><div className="dot" /><div><b>Trust</b><span>Every listed teacher is verified through the same network that already recommends them.</span></div></div>
                <div className="value"><div className="dot" /><div><b>Timing</b><span>Built around real SAT and ACT trial dates, so students find courses that finish in time — not after.</span></div></div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="block" id="search">
        <ScrollReveal>
          <div className="section-head">
            <span className="eyebrow2">Find a course</span>
            <h2>Search by subject, level and exam date</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            <a href="/search" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Open Search
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </a>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
