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

  if (loading) return <p style={{ color: 'var(--text-mute)', fontFamily: 'IBM Plex Mono, monospace', fontSize: 13 }}>Loading...</p>;

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1>All Courses</h1>
          <div className="dash-header-sub">View, unpublish, or delete any course across all teachers.</div>
        </div>
      </div>

      <div className="filter-row">
        {['all', 'published', 'draft', 'unpublished'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`filter-pill${filter === s ? ' active' : ''}`}>
            {s} {s !== 'all' && `(${courses.filter(c => c.status === s).length})`}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(c => (
          <div key={c.id} className="dash-card" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="dash-card-title">{c.title}</div>
              <div className="dash-card-meta">{c.teacher.name} · {c.category} · {c.subcategory} · {c.level}</div>
            </div>
            <span className={`status-pill ${c.status}`}>{c.status}</span>
            <div className="dash-card-actions">
              <button onClick={() => setPreviewCourse(c)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(27,31,42,0.12)', background: '#fff', color: 'var(--text-mute)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Preview</button>
              {c.status === 'published' ? (
                <button onClick={() => handleStatus(c.id, 'unpublished')} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #f59e0b', background: '#fff', color: '#f59e0b', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Unpublish</button>
              ) : (
                <button onClick={() => handleStatus(c.id, 'published')} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #10b981', background: '#fff', color: '#10b981', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Publish</button>
              )}
              <button onClick={() => handleDelete(c.id)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #ef4444', background: '#fff', color: '#ef4444', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="dash-empty">
            <div className="dash-empty-icon">▦</div>
            <h3>No courses found</h3>
            <p>No courses match this filter.</p>
          </div>
        )}
      </div>

      <PreviewModal open={!!previewCourse} onClose={() => setPreviewCourse(null)} title={previewCourse?.title || ''}>
        {previewCourse && <CoursePreview course={previewCourse as never} />}
      </PreviewModal>
    </div>
  );
}
