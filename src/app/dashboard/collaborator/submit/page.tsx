'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubmitContentPage() {
  const router = useRouter();
  const [type, setType] = useState<'course' | 'event' | 'news'>('course');
  const [submitted, setSubmitted] = useState(false);

  // Course fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('SAT');
  const [subcategory, setSubcategory] = useState('Math');
  const [level, setLevel] = useState('Beginner');
  const [teacherName, setTeacherName] = useState('');
  const [schedule, setSchedule] = useState('');
  const [contact, setContact] = useState('');

  // Event/News fields
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [relatedAction, setRelatedAction] = useState('');

  const handleSubmit = async () => {
    let payload: Record<string, string> = {};

    if (type === 'course') {
      payload = { title, description, category, subcategory, level, teacherName, schedule, contact };
    } else {
      payload = { title: eventTitle, description: eventDescription, relatedAction, type };
    }

    await fetch('/api/collaborator/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload }),
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>&#10003;</div>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, color: 'var(--ink-900)', marginBottom: 8 }}>Submission Sent!</h2>
        <p style={{ color: 'var(--ink-500)', marginBottom: 24 }}>Your {type} submission is now pending review. You&apos;ll see the status update here once our team reviews it.</p>
        <button onClick={() => { setSubmitted(false); setType('course'); setTitle(''); setDescription(''); setEventTitle(''); setEventDescription(''); }} style={{ padding: '12px 24px', borderRadius: 10, background: 'var(--blue)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 8 }}>Submit Content</h1>
      <p style={{ color: 'var(--ink-500)', fontSize: 15, marginBottom: 32 }}>Found a course, event, or news item in a WhatsApp group? Submit it here and we&apos;ll review it for publishing.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {(['course', 'event', 'news'] as const).map(t => (
          <button key={t} onClick={() => setType(t)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--ink-200)', background: type === t ? 'var(--blue)' : '#fff', color: type === t ? '#fff' : 'var(--ink-900)', fontWeight: 600, fontSize: 14, cursor: 'pointer', textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 14, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        {type === 'course' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={labelStyle}>Course Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. SAT Math Bootcamp" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Description *</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this course cover?" style={{ ...inputStyle, minHeight: 100 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Category</label>
                <select value={category} onChange={e => { setCategory(e.target.value); setSubcategory(''); }} style={inputStyle}>
                  <option>SAT</option><option>ACT</option><option>Other</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Subject</label>
                <select value={subcategory} onChange={e => setSubcategory(e.target.value)} style={inputStyle}>
                  <option value="">Select subcategory</option>
                  {(category === 'SAT' ? ['Math', 'English/RW'] : category === 'ACT' ? ['Math', 'English', 'Science', 'Biology'] : ['Arabic']).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Level</label>
                <select value={level} onChange={e => setLevel(e.target.value)} style={inputStyle}>
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Test-Prep</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Teacher Name (if known)</label>
                <input value={teacherName} onChange={e => setTeacherName(e.target.value)} placeholder="Leave blank if unknown" style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Schedule</label>
              <input value={schedule} onChange={e => setSchedule(e.target.value)} placeholder="e.g. Sun & Tue, 5-7 PM (GMT+3)" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Contact (WhatsApp/Phone)</label>
              <input value={contact} onChange={e => setContact(e.target.value)} placeholder="Phone number or WhatsApp link" style={inputStyle} />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={labelStyle}>{type === 'event' ? 'Event' : 'News'} Title *</label>
              <input value={eventTitle} onChange={e => setEventTitle(e.target.value)} placeholder={`e.g. ${type === 'event' ? 'SAT Prep Workshop' : 'New Test Date Announced'}`} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Description *</label>
              <textarea value={eventDescription} onChange={e => setEventDescription(e.target.value)} placeholder="Details, dates, what it's about..." style={{ ...inputStyle, minHeight: 120 }} />
            </div>
            <div>
              <label style={labelStyle}>Link (if any)</label>
              <input value={relatedAction} onChange={e => setRelatedAction(e.target.value)} placeholder="Registration or WhatsApp group link" style={inputStyle} />
            </div>
          </div>
        )}

        <button onClick={handleSubmit} disabled={!title && !eventTitle} style={{ marginTop: 28, padding: '14px 32px', borderRadius: 12, background: (title || eventTitle) ? 'var(--blue)' : 'var(--ink-200)', color: '#fff', border: 'none', fontWeight: 600, fontSize: 15, cursor: (title || eventTitle) ? 'pointer' : 'not-allowed' }}>
          Submit for Review
        </button>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-700)', marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none' };
