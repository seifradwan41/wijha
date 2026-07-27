'use client';
import { useState } from 'react';
import Link from 'next/link';

interface TeacherData {
  id: string;
  name: string;
  avatarPhoto: string | null;
  description: string | null;
  teachingStyle: string | null;
  specialties: string[];
  subcategories: string[];
  whatsappContact: string | null;
  courses: { id: string; title: string; level: string; schedule: string; price: number | null; contactForPrice: boolean; category: string }[];
  events: { id: string; title: string; type: string; description: string; relatedAction: string | null; createdAt: string }[];
}

const accentColors = ['blue', 'teal', 'slate'] as const;
const colorMap: Record<string, { bg: string; text: string; border: string; tagBg: string; tagText: string; tagBorder: string }> = {
  blue: { bg: 'rgba(47,111,237,0.1)', text: '#2F6FED', border: 'rgba(47,111,237,0.2)', tagBg: 'rgba(47,111,237,0.08)', tagText: '#2F6FED', tagBorder: 'rgba(47,111,237,0.15)' },
  teal: { bg: 'rgba(46,125,140,0.1)', text: '#2E7D8C', border: 'rgba(46,125,140,0.2)', tagBg: 'rgba(46,125,140,0.08)', tagText: '#2E7D8C', tagBorder: 'rgba(46,125,140,0.15)' },
  slate: { bg: 'rgba(91,127,166,0.1)', text: '#5B7FA6', border: 'rgba(91,127,166,0.2)', tagBg: 'rgba(91,127,166,0.08)', tagText: '#5B7FA6', tagBorder: 'rgba(91,127,166,0.15)' },
};

function TeacherCard({ teacher, index }: { teacher: TeacherData; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const c = colorMap[accentColors[index % accentColors.length]];
  const initials = teacher.name.split(' ').map((w) => w[0]).slice(0, 2).join('');

  return (
    <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(27,31,42,0.07)', overflow: 'hidden', transition: 'box-shadow 0.3s ease' }}>
      <button onClick={() => setExpanded(!expanded)} style={{ width: '100%', textAlign: 'left', padding: '20px 24px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: teacher.avatarPhoto ? `url(${teacher.avatarPhoto}) center/cover` : c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 20, color: c.text }}>
            {!teacher.avatarPhoto && initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 17, color: 'var(--text-dark)', margin: 0 }}>{teacher.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-mute)', margin: '2px 0 0' }}>{teacher.specialties.join(', ')}</p>
              </div>
              <span style={{ flexShrink: 0, marginTop: 4, transition: 'transform 0.3s ease', transform: expanded ? 'rotate(180deg)' : 'rotate(0)', color: 'var(--text-mute)' }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-mute)', marginTop: 4, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: expanded ? 'normal' : 'nowrap' }}>{teacher.description || 'No description available.'}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {teacher.subcategories.map((s) => (
                <span key={s} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: c.tagBg, color: c.tagText, border: `1px solid ${c.tagBorder}` }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </button>

      <div style={{ maxHeight: expanded ? 1200 : 0, opacity: expanded ? 1 : 0, overflow: 'hidden', transition: 'max-height 0.4s ease, opacity 0.3s ease' }}>
        <div style={{ padding: '0 24px 24px', borderTop: '1px solid rgba(27,31,42,0.06)', paddingTop: 16 }}>
          {teacher.teachingStyle && (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-mute)', margin: '0 0 6px' }}>Teaching Style</h4>
              <p style={{ fontSize: 13, color: 'var(--text-dark)', lineHeight: 1.6, margin: 0 }}>{teacher.teachingStyle}</p>
            </div>
          )}

          {teacher.whatsappContact && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <a href={`https://wa.me/${teacher.whatsappContact.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25D366', color: '#fff', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                Contact via WhatsApp
              </a>
              <Link href={`/teacher/${teacher.id}`} style={{ fontSize: 14, color: c.tagText, fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Full Profile <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          )}

          {teacher.courses.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-mute)', margin: '0 0 10px' }}>Available Courses ({teacher.courses.length})</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {teacher.courses.map((course) => (
                  <Link key={course.id} href={`/course/${course.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(245,242,234,0.5)', borderRadius: 8, border: '1px solid rgba(27,31,42,0.05)', padding: '10px 14px', textDecoration: 'none', transition: 'border-color 0.2s' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dark)', margin: 0 }}>{course.title}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-mute)', margin: '3px 0 0', fontFamily: 'IBM Plex Mono, monospace' }}>{course.level} · {course.schedule}</p>
                    </div>
                    <svg width="16" height="16" fill="none" stroke="var(--text-mute)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {teacher.events.length > 0 && (
            <div>
              <h4 style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-mute)', margin: '0 0 10px' }}>Events &amp; News</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {teacher.events.map((ev) => (
                  <Link key={ev.id} href={`/event/${ev.id}`} style={{ display: 'flex', gap: 12, background: 'rgba(255,247,230,0.6)', borderRadius: 8, border: '1px solid rgba(234,179,8,0.15)', padding: '10px 14px', textDecoration: 'none' }}>
                    <span style={{ fontSize: 18, lineHeight: 1 }}>{ev.type === 'event' ? '📅' : '📰'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dark)', margin: 0 }}>{ev.title}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-mute)', margin: '2px 0 0' }}>{ev.type === 'event' ? 'Event' : 'News'} · {new Date(ev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {teacher.courses.length === 0 && teacher.events.length === 0 && (
            <p style={{ color: 'var(--text-mute)', fontSize: 13 }}>No courses or events listed yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SubcategoryTeacherList({ teachers }: { teachers: TeacherData[] }) {
  if (teachers.length === 0) {
    return <p style={{ color: 'var(--text-mute)', textAlign: 'center', padding: '40px 0' }}>No teachers available yet. Check back soon!</p>;
  }

  return (
    <div className="teacher-grid">
      {teachers.map((t, i) => (
        <TeacherCard key={t.id} teacher={t} index={i} />
      ))}
    </div>
  );
}
