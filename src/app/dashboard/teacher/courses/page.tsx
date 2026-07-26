'use client';
import { useState, useEffect } from 'react';
import PreviewModal from '@/components/PreviewModal';
import CoursePreview from '@/components/CoursePreview';

interface Course {
  id: string; title: string; category: string; subcategory: string;
  level: string; status: string; schedule: string; price: number | null;
  contactForPrice: boolean; description: string; sessionCount: number;
  targetGrades: string[]; targetExamDate: string | null;
  estimatedGroupSize: number | null; startDate: string | null;
  teacher: { id: string; name: string; whatsappContact: string | null; avatarPhoto: string | null };
}

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'SAT', subcategory: 'Math', level: 'Intermediate', description: '', schedule: '', estimatedGroupSize: '6', sessionCount: '20', price: '', contactForPrice: false, targetGrades: '11,12', targetExamDate: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);

  useEffect(() => { fetch('/api/teacher/courses').then(r => r.json()).then(d => { setCourses(d); setLoading(false); }); }, []);

  async function handleCreate() {
    setSaving(true);
    await fetch('/api/teacher/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        price: form.price ? parseFloat(form.price) : null,
        estimatedGroupSize: parseInt(form.estimatedGroupSize) || 6,
        sessionCount: parseInt(form.sessionCount) || 20,
        targetGrades: form.targetGrades.split(',').map(s => s.trim()).filter(Boolean),
      }),
    });
    const updated = await fetch('/api/teacher/courses').then(r => r.json());
    setCourses(updated);
    setSaving(false);
    setShowForm(false);
    setForm({ title: '', category: 'SAT', subcategory: 'Math', level: 'Intermediate', description: '', schedule: '', estimatedGroupSize: '6', sessionCount: '20', price: '', contactForPrice: false, targetGrades: '11,12', targetExamDate: '' });
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    await fetch('/api/teacher/courses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    });
    setCourses(courses.map(c => c.id === id ? { ...c, status: newStatus } : c));
  }

  async function deleteCourse(id: string) {
    if (!confirm('Are you sure you want to delete this course?')) return;
    setCourses(courses.filter(c => c.id !== id));
    await fetch('/api/teacher/courses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(27,31,42,0.12)', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box', background: 'var(--paper)' };
  const labelStyle: React.CSSProperties = { display: 'block', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-mute)', marginBottom: 7 };

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1>Courses</h1>
          <div className="dash-header-sub">Create and manage your courses. Published courses appear on the public site.</div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ fontSize: 13, padding: '10px 18px', flexShrink: 0 }}>
          {showForm ? 'Cancel' : '+ New Course'}
        </button>
      </div>

      {showForm && (
        <div className="dash-card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Create New Course</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Course Title</label>
              <input style={inputStyle} value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. SAT Math Comprehensive" />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle} value={form.category} onChange={e => setForm({...form, category: e.target.value, subcategory: ''})}>
                <option>SAT</option><option>ACT</option><option>Other</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Subcategory</label>
              <select style={inputStyle} value={form.subcategory} onChange={e => setForm({...form, subcategory: e.target.value})}>
                <option value="">Select subcategory</option>
                {(form.category === 'SAT' ? ['Math', 'English/RW'] : form.category === 'ACT' ? ['Math', 'English', 'Science', 'Biology'] : ['Arabic']).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Level</label>
              <select style={inputStyle} value={form.level} onChange={e => setForm({...form, level: e.target.value})}>
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Test-Prep</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Schedule</label>
              <input style={inputStyle} value={form.schedule} onChange={e => setForm({...form, schedule: e.target.value})} placeholder="Mon, Wed — 4:00 PM KSA" />
            </div>
            <div>
              <label style={labelStyle}>Price ($)</label>
              <input style={inputStyle} type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0" />
            </div>
            <div>
              <label style={labelStyle}>Sessions</label>
              <input style={inputStyle} type="number" value={form.sessionCount} onChange={e => setForm({...form, sessionCount: e.target.value})} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Description</label>
              <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' as const }} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe what students will learn..." />
            </div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            <button onClick={handleCreate} disabled={saving || !form.title} className="btn-primary" style={{ fontSize: 13, opacity: saving || !form.title ? 0.6 : 1 }}>
              {saving ? 'Creating...' : 'Create as Draft'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(27,31,42,0.12)', background: '#fff', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: 'var(--text-mute)', textAlign: 'center', padding: 40, fontFamily: 'IBM Plex Mono, monospace', fontSize: 13 }}>Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty-icon">▦</div>
          <h3>No courses yet</h3>
          <p>Create your first course to get started.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary" style={{ fontSize: 13 }}>+ Create Course</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {courses.map(c => (
            <div key={c.id} className="dash-card" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span className="dash-card-title">{c.title}</span>
                  <span className={`type-badge ${c.category.toLowerCase()}`}>{c.category}</span>
                </div>
                <div className="dash-card-meta">{c.subcategory} · {c.level} · {c.schedule || 'No schedule'}{c.price ? ` · $${c.price}` : ''}</div>
              </div>
              <span className={`status-pill ${c.status}`}>{c.status}</span>
              <div className="dash-card-actions">
                <button onClick={() => setPreviewCourse(c)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(27,31,42,0.12)', background: '#fff', color: 'var(--text-mute)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Preview</button>
                <button onClick={() => toggleStatus(c.id, c.status)} style={{ padding: '5px 14px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer', background: c.status === 'published' ? 'rgba(234,179,8,0.12)' : 'var(--blue)', color: c.status === 'published' ? '#92400e' : '#fff' }}>
                  {c.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => deleteCourse(c.id)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)', background: 'transparent', fontSize: 12, cursor: 'pointer', color: '#dc2626' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PreviewModal open={!!previewCourse} onClose={() => setPreviewCourse(null)} title={previewCourse?.title || ''}>
        {previewCourse && <CoursePreview course={previewCourse as never} />}
      </PreviewModal>
    </div>
  );
}
