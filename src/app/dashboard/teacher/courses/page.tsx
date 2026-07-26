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
    await fetch('/api/teacher/courses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setCourses(courses.filter(c => c.id !== id));
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(27,31,42,0.12)', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box', background: '#fff' };
  const labelStyle: React.CSSProperties = { display: 'block', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-mute)', marginBottom: 7 };

  const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
    draft: { bg: 'rgba(234,179,8,0.1)', color: '#a16207', label: 'Draft' },
    published: { bg: 'rgba(34,197,94,0.1)', color: '#16a34a', label: 'Published' },
    unpublished: { bg: 'rgba(107,114,128,0.1)', color: '#4b5563', label: 'Unpublished' },
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 600, marginBottom: 6 }}>Courses</h1>
          <p style={{ fontSize: 14, color: 'var(--text-mute)' }}>Create and manage your courses. Published courses appear on the public site.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ fontSize: 13 }}>
          {showForm ? 'Cancel' : '+ New Course'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(27,31,42,0.06)', padding: 28, marginBottom: 24 }}>
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
            <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(27,31,42,0.12)', background: '#fff', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: 'var(--text-mute)', textAlign: 'center', padding: 40 }}>Loading courses...</div>
      ) : courses.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(27,31,42,0.06)', padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>▦</div>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, marginBottom: 8 }}>No courses yet</h3>
          <p style={{ fontSize: 14, color: 'var(--text-mute)', marginBottom: 20 }}>Create your first course to get started.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary" style={{ fontSize: 13 }}>+ Create Course</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {courses.map(c => {
            const sc = statusConfig[c.status] || statusConfig.draft;
            return (
              <div key={c.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(27,31,42,0.06)', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'box-shadow 0.2s' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 600, margin: 0 }}>{c.title}</h3>
                    <span className={`tag ${c.category.toLowerCase()}`} style={{ fontSize: 10 }}>{c.category}</span>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, padding: '2px 8px', borderRadius: 100, background: sc.bg, color: sc.color, fontWeight: 500 }}>{sc.label}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-mute)', margin: 0, display: 'flex', gap: 12 }}>
                    <span>{c.subcategory}</span>
                    <span>·</span>
                    <span>{c.level}</span>
                    <span>·</span>
                    <span>{c.schedule || 'No schedule'}</span>
                    {c.price && <><span>·</span><span style={{ fontWeight: 500 }}>${c.price}</span></>}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 16 }}>
                  <button
                    onClick={() => setPreviewCourse(c)}
                    style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(27,31,42,0.12)', background: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer', color: 'var(--ink-700)' }}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => toggleStatus(c.id, c.status)}
                    style={{
                      padding: '7px 16px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      background: c.status === 'published' ? 'rgba(234,179,8,0.1)' : 'var(--blue)',
                      color: c.status === 'published' ? '#a16207' : '#fff',
                    }}
                  >
                    {c.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => deleteCourse(c.id)}
                    style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)', background: 'transparent', fontSize: 12, cursor: 'pointer', color: '#dc2626' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PreviewModal open={!!previewCourse} onClose={() => setPreviewCourse(null)} title={previewCourse?.title || ''}>
        {previewCourse && <CoursePreview course={previewCourse as never} />}
      </PreviewModal>
    </div>
  );
}
