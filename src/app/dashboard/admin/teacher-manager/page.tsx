'use client';
import { useEffect, useState } from 'react';
import PreviewModal from '@/components/PreviewModal';
import CoursePreview from '@/components/CoursePreview';
import EventPreview from '@/components/EventPreview';
import ImageUpload from '@/components/ImageUpload';
import { sanitizeCssUrl } from '@/lib/url-utils';

interface Teacher { id: string; name: string; role: string }
interface Course {
  id: string; title: string; description: string; category: string; subcategory: string; level: string;
  status: string; schedule: string; price: number | null; contactForPrice: boolean;
  targetGrades: string[]; targetExamDate: string | null;
  estimatedGroupSize: number | null; sessionCount: number | null; startDate: string | null;
  teacher: { id: string; name: string; whatsappContact: string | null; avatarPhoto: string | null };
}
interface EventNews {
  id: string; type: string; title: string; description: string; status: string; photo: string | null;
  relatedAction: string | null; createdAt: string;
  teacher: { id: string; name: string; avatarPhoto: string | null };
}

export default function TeacherManagerPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [tab, setTab] = useState<'courses' | 'events'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<EventNews[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [previewEvent, setPreviewEvent] = useState<EventNews | null>(null);

  const [courseForm, setCourseForm] = useState({ title: '', category: 'SAT', subcategory: 'Math', level: 'Intermediate', description: '', schedule: '', estimatedGroupSize: '6', sessionCount: '20', price: '', contactForPrice: false, targetGrades: '11,12', targetExamDate: '' });
  const [eventForm, setEventForm] = useState({ type: 'event', title: '', description: '', relatedAction: '', photo: '' });

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then((data: Teacher[]) => setTeachers(data.filter(u => u.role === 'teacher')));
  }, []);

  useEffect(() => {
    if (!selectedTeacher) { setCourses([]); setEvents([]); return; }
    setLoading(true);
    const base = tab === 'courses' ? '/api/admin/teacher-courses' : '/api/admin/teacher-events';
    fetch(`${base}?teacherId=${selectedTeacher}`).then(r => r.json()).then(d => {
      if (tab === 'courses') setCourses(d); else setEvents(d);
      setLoading(false);
    });
  }, [selectedTeacher, tab]);

  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(27,31,42,0.12)', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box', background: '#fff' };
  const labelStyle: React.CSSProperties = { display: 'block', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-mute)', marginBottom: 7 };

  async function handleCreateCourse() {
    await fetch('/api/admin/teacher-courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...courseForm, teacherId: selectedTeacher, price: courseForm.price ? parseFloat(courseForm.price) : null, estimatedGroupSize: parseInt(courseForm.estimatedGroupSize) || 6, sessionCount: parseInt(courseForm.sessionCount) || 20, targetGrades: courseForm.targetGrades.split(',').map(s => s.trim()).filter(Boolean) }) });
    const d = await fetch(`/api/admin/teacher-courses?teacherId=${selectedTeacher}`).then(r => r.json());
    setCourses(d); setShowCourseForm(false);
    setCourseForm({ title: '', category: 'SAT', subcategory: 'Math', level: 'Intermediate', description: '', schedule: '', estimatedGroupSize: '6', sessionCount: '20', price: '', contactForPrice: false, targetGrades: '11,12', targetExamDate: '' });
  }

  async function handleCreateEvent() {
    await fetch('/api/admin/teacher-events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...eventForm, teacherId: selectedTeacher }) });
    const d = await fetch(`/api/admin/teacher-events?teacherId=${selectedTeacher}`).then(r => r.json());
    setEvents(d); setShowEventForm(false);
    setEventForm({ type: 'event', title: '', description: '', relatedAction: '', photo: '' });
  }

  async function toggleCourseStatus(id: string, current: string) {
    const next = current === 'published' ? 'draft' : 'published';
    await fetch('/api/admin/teacher-courses', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: next }) });
    setCourses(courses.map(c => c.id === id ? { ...c, status: next } : c));
  }

  async function deleteCourse(id: string) {
    if (!confirm('Delete this course?')) return;
    setCourses(courses.filter(c => c.id !== id));
    await fetch('/api/admin/teacher-courses', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
  }

  async function toggleEventStatus(id: string, current: string) {
    const next = current === 'published' ? 'draft' : 'published';
    await fetch('/api/admin/teacher-events', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: next }) });
    setEvents(events.map(e => e.id === id ? { ...e, status: next } : e));
  }

  async function deleteEvent(id: string) {
    if (!confirm('Delete this event?')) return;
    setEvents(events.filter(e => e.id !== id));
    await fetch('/api/admin/teacher-events', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
  }

  const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
    draft: { bg: 'rgba(234,179,8,0.1)', color: '#a16207', label: 'Draft' },
    published: { bg: 'rgba(34,197,94,0.1)', color: '#16a34a', label: 'Published' },
    unpublished: { bg: 'rgba(107,114,128,0.1)', color: '#4b5563', label: 'Unpublished' },
    pending_review: { bg: 'rgba(59,130,246,0.1)', color: '#2563eb', label: 'Pending Review' },
  };

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1>Teacher Manager</h1>
          <div className="dash-header-sub">Select a teacher to view and manage their courses, events, and news.</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(27,31,42,0.12)', fontSize: 14, minWidth: 200, background: '#fff', flex: '1 1 auto', maxWidth: 300 }}>
          <option value="">Select a teacher...</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        {selectedTeacher && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setTab('courses')} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--ink-200)', background: tab === 'courses' ? 'var(--ink-900)' : '#fff', color: tab === 'courses' ? '#fff' : 'var(--ink-600)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Courses ({courses.length})</button>
            <button onClick={() => setTab('events')} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--ink-200)', background: tab === 'events' ? 'var(--ink-900)' : '#fff', color: tab === 'events' ? '#fff' : 'var(--ink-600)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Events & News ({events.length})</button>
          </div>
        )}
      </div>

      {!selectedTeacher && (
        <div className="dash-empty">
          <div className="dash-empty-icon">👤</div>
          <h3>Select a teacher</h3>
          <p>Choose a teacher above to manage their content.</p>
        </div>
      )}

      {selectedTeacher && tab === 'courses' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, margin: 0 }}>Courses</h2>
            <button onClick={() => setShowCourseForm(!showCourseForm)} className="btn-primary" style={{ fontSize: 13 }}>{showCourseForm ? 'Cancel' : '+ New Course'}</button>
          </div>

          {showCourseForm && (
            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(27,31,42,0.06)', padding: 28, marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Create Course</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Title</label><input style={inputStyle} value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} /></div>
                <div><label style={labelStyle}>Category</label><select style={inputStyle} value={courseForm.category} onChange={e => setCourseForm({...courseForm, category: e.target.value, subcategory: ''})}><option>SAT</option><option>ACT</option><option>Other</option></select></div>
                <div><label style={labelStyle}>Subcategory</label><select style={inputStyle} value={courseForm.subcategory} onChange={e => setCourseForm({...courseForm, subcategory: e.target.value})}><option value="">Select subcategory</option>{(courseForm.category === 'SAT' ? ['Math', 'English/RW'] : courseForm.category === 'ACT' ? ['Math', 'English', 'Science', 'Biology'] : ['Arabic']).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div><label style={labelStyle}>Level</label><select style={inputStyle} value={courseForm.level} onChange={e => setCourseForm({...courseForm, level: e.target.value})}><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Test-Prep</option></select></div>
                <div><label style={labelStyle}>Schedule</label><input style={inputStyle} value={courseForm.schedule} onChange={e => setCourseForm({...courseForm, schedule: e.target.value})} placeholder="Mon, Wed — 4:00 PM KSA" /></div>
                <div><label style={labelStyle}>Price ($)</label><input style={inputStyle} type="number" value={courseForm.price} onChange={e => setCourseForm({...courseForm, price: e.target.value})} /></div>
                <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Description</label><textarea style={{ ...inputStyle, minHeight: 80 }} value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} /></div>
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                <button onClick={handleCreateCourse} disabled={!courseForm.title} className="btn-primary" style={{ fontSize: 13, opacity: !courseForm.title ? 0.6 : 1 }}>Create</button>
                <button onClick={() => setShowCourseForm(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(27,31,42,0.12)', background: '#fff', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}

          {loading ? <p style={{ color: 'var(--text-mute)', fontFamily: 'IBM Plex Mono, monospace', fontSize: 13 }}>Loading...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {courses.map(c => {
                const sc = statusConfig[c.status] || statusConfig.draft;
                return (
                  <div key={c.id} className="dash-card" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span className="dash-card-title">{c.title}</span>
                        <span className={`type-badge ${c.category.toLowerCase()}`}>{c.category}</span>
                      </div>
                      <div className="dash-card-meta">{c.subcategory} · {c.level} · {c.schedule || 'No schedule'}</div>
                    </div>
                    <span className={`status-pill ${c.status}`}>{sc.label}</span>
                    <div className="dash-card-actions">
                      <button onClick={() => setPreviewCourse(c)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(27,31,42,0.12)', background: '#fff', color: 'var(--text-mute)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Preview</button>
                      <button onClick={() => toggleCourseStatus(c.id, c.status)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: c.status === 'published' ? 'rgba(234,179,8,0.12)' : 'var(--blue)', color: c.status === 'published' ? '#92400e' : '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>{c.status === 'published' ? 'Unpublish' : 'Publish'}</button>
                      <button onClick={() => deleteCourse(c.id)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)', background: '#fff', fontSize: 12, cursor: 'pointer', color: '#dc2626' }}>Delete</button>
                    </div>
                  </div>
                );
              })}
              {courses.length === 0 && <p style={{ color: 'var(--text-mute)', textAlign: 'center', padding: 30, fontFamily: 'IBM Plex Mono, monospace', fontSize: 13 }}>No courses yet.</p>}
            </div>
          )}
        </div>
      )}

      {selectedTeacher && tab === 'events' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, margin: 0 }}>Events & News</h2>
            <button onClick={() => setShowEventForm(!showEventForm)} className="btn-primary" style={{ fontSize: 13 }}>{showEventForm ? 'Cancel' : '+ New Item'}</button>
          </div>

          {showEventForm && (
            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(27,31,42,0.06)', padding: 28, marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Create Item</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
                  <div><label style={labelStyle}>Type</label><select style={inputStyle} value={eventForm.type} onChange={e => setEventForm({...eventForm, type: e.target.value})}><option value="event">Event</option><option value="news">News</option></select></div>
                  <div><label style={labelStyle}>Title</label><input style={inputStyle} value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} /></div>
                </div>
                <div><label style={labelStyle}>Description</label><textarea style={{ ...inputStyle, minHeight: 100 }} value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} /></div>
                <div><label style={labelStyle}>Action Link</label><input style={inputStyle} value={eventForm.relatedAction} onChange={e => setEventForm({...eventForm, relatedAction: e.target.value})} placeholder="https://wa.me/..." /></div>
                <ImageUpload label="Photo" currentImage={eventForm.photo} onUpload={url => setEventForm({...eventForm, photo: url})} />
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                <button onClick={handleCreateEvent} disabled={!eventForm.title} className="btn-primary" style={{ fontSize: 13, opacity: !eventForm.title ? 0.6 : 1 }}>Create</button>
                <button onClick={() => setShowEventForm(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(27,31,42,0.12)', background: '#fff', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}

          {loading ? <p style={{ color: 'var(--text-mute)', fontFamily: 'IBM Plex Mono, monospace', fontSize: 13 }}>Loading...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {events.map(e => {
                const sc = statusConfig[e.status] || statusConfig.draft;
                return (
                  <div key={e.id} className="dash-card" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    {e.photo && sanitizeCssUrl(e.photo) && <div style={{ width: 48, height: 48, borderRadius: 8, background: `url(${sanitizeCssUrl(e.photo)}) center/cover`, flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span className="dash-card-title">{e.title}</span>
                        <span className={`type-badge ${e.type === 'event' ? 'event' : 'news'}`}>{e.type}</span>
                      </div>
                      <div className="dash-card-meta">{new Date(e.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className={`status-pill ${e.status}`}>{sc.label}</span>
                    <div className="dash-card-actions">
                      <button onClick={() => setPreviewEvent(e)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(27,31,42,0.12)', background: '#fff', color: 'var(--text-mute)', fontSize: 12, cursor: 'pointer' }}>Preview</button>
                      <button onClick={() => toggleEventStatus(e.id, e.status)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: e.status === 'published' ? 'rgba(234,179,8,0.12)' : 'var(--blue)', color: e.status === 'published' ? '#92400e' : '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>{e.status === 'published' ? 'Unpublish' : 'Publish'}</button>
                      <button onClick={() => deleteEvent(e.id)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)', background: '#fff', fontSize: 12, cursor: 'pointer', color: '#dc2626' }}>Delete</button>
                    </div>
                  </div>
                );
              })}
              {events.length === 0 && <p style={{ color: 'var(--text-mute)', textAlign: 'center', padding: 30, fontFamily: 'IBM Plex Mono, monospace', fontSize: 13 }}>No events or news yet.</p>}
            </div>
          )}
        </div>
      )}

      <PreviewModal open={!!previewCourse} onClose={() => setPreviewCourse(null)} title={previewCourse?.title || ''}>
        {previewCourse && <CoursePreview course={previewCourse as never} />}
      </PreviewModal>
      <PreviewModal open={!!previewEvent} onClose={() => setPreviewEvent(null)} title={previewEvent?.title || ''}>
        {previewEvent && <EventPreview event={{ ...previewEvent, createdAt: previewEvent.createdAt }} />}
      </PreviewModal>
    </div>
  );
}
