'use client';
import { useEffect, useState } from 'react';
import PreviewModal from '@/components/PreviewModal';
import CoursePreview from '@/components/CoursePreview';

interface Course {
  id: string; title: string; description: string; status: string; category: string; subcategory: string; level: string;
  schedule: string; price: number | null; contactForPrice: boolean;
  targetGrades: string[]; targetExamDate: string | null;
  estimatedGroupSize: number | null; sessionCount: number | null; startDate: string | null;
  teacher: { id: string; name: string; whatsappContact: string | null; avatarPhoto: string | null };
  createdAt: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);

  const load = () => {
    fetch('/api/admin/courses').then(r => r.json()).then((data: Course[]) => { setCourses(data); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const handleStatus = async (id: string, status: string) => {
    await fetch('/api/admin/courses/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this course?')) return;
    await fetch('/api/admin/courses/' + id, { method: 'DELETE' });
    load();
  };

  const filtered = filter === 'all' ? courses : courses.filter(c => c.status === filter);

  if (loading) return <p style={{ color: 'var(--ink-500)' }}>Loading...</p>;

  return (
    <div>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 8 }}>All Courses</h1>
      <p style={{ color: 'var(--ink-500)', fontSize: 15, marginBottom: 24 }}>View, unpublish, or delete any course across all teachers.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['all', 'published', 'draft', 'unpublished'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid var(--ink-200)', background: filter === s ? 'var(--ink-900)' : '#fff', color: filter === s ? '#fff' : 'var(--ink-600)', fontSize: 13, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize' }}>
            {s} {s !== 'all' && `(${courses.filter(c => c.status === s).length})`}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(c => (
          <div key={c.id} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 2 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-400)' }}>{c.teacher.name} · {c.category} · {c.subcategory} · {c.level}</div>
            </div>
            <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: c.status === 'published' ? '#dcfce7' : c.status === 'draft' ? '#e0e7ff' : '#fef3c7', color: c.status === 'published' ? '#166534' : c.status === 'draft' ? '#3730a3' : '#92400e', textTransform: 'capitalize' }}>
              {c.status}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setPreviewCourse(c)} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid var(--ink-200)', background: '#fff', color: 'var(--ink-600)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Preview</button>
              {c.status === 'published' && (
                <button onClick={() => handleStatus(c.id, 'unpublished')} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #f59e0b', background: '#fff', color: '#f59e0b', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Unpublish</button>
              )}
              {c.status !== 'published' && (
                <button onClick={() => handleStatus(c.id, 'published')} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #10b981', background: '#fff', color: '#10b981', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Publish</button>
              )}
              <button onClick={() => handleDelete(c.id)} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #ef4444', background: '#fff', color: '#ef4444', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <PreviewModal open={!!previewCourse} onClose={() => setPreviewCourse(null)} title={previewCourse?.title || ''}>
        {previewCourse && <CoursePreview course={previewCourse as never} />}
      </PreviewModal>
    </div>
  );
}
