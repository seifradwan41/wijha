'use client';
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Course {
  id: string; title: string; category: string; subcategory: string; level: string;
  schedule: string; price: number | null; contactForPrice: boolean;
  targetGrades: string[]; targetExamDate: string | null;
  teacher: { id: string; name: string; whatsappContact: string | null; avatarPhoto: string | null };
}
interface Teacher { id: string; name: string; categories: string[]; specialties: string[]; subcategories: string[]; avatarPhoto: string | null; whatsappContact: string | null }
interface Category { id: string; name: string; subcategories: { id: string; name: string }[] }
interface Level { id: string; name: string }
interface ExamDate { id: string; name: string }

export default function SearchContent({ courses, teachers, categories, levels, examDates }: {
  courses: Course[]; teachers: Teacher[]; categories: Category[]; levels: Level[]; examDates: ExamDate[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('cat') || '');
  const [subject, setSubject] = useState(searchParams.get('sub') || '');
  const [level, setLevel] = useState(searchParams.get('level') || '');
  const [examDate, setExamDate] = useState(searchParams.get('exam') || '');
  const [teacherQuery, setTeacherQuery] = useState('');

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    router.replace(`/search?${params.toString()}`, { scroll: false });
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setSubject('');
    updateParam('cat', val);
    updateParam('sub', '');
  };

  const handleSubjectChange = (val: string) => {
    setSubject(val);
    updateParam('sub', val);
  };

  const handleLevelChange = (val: string) => {
    setLevel(val);
    updateParam('level', val);
  };

  const handleExamDateChange = (val: string) => {
    setExamDate(val);
    updateParam('exam', val);
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    updateParam('q', val);
  };

  const clearAll = () => {
    setQuery(''); setCategory(''); setSubject(''); setLevel(''); setExamDate('');
    router.replace('/search', { scroll: false });
  };

  const filteredCourses = useMemo(() => {
    const q = query.toLowerCase().trim();
    return courses.filter(c => {
      if (q && !c.title.toLowerCase().includes(q) && !c.teacher.name.toLowerCase().includes(q) && !c.subcategory.toLowerCase().includes(q) && !c.category.toLowerCase().includes(q)) return false;
      if (category && c.category !== category) return false;
      if (subject && c.subcategory !== subject) return false;
      if (level && c.level !== level) return false;
      if (examDate && c.targetExamDate !== examDate) return false;
      return true;
    });
  }, [courses, query, category, subject, level, examDate]);

  const filteredTeachers = useMemo(() => {
    const q = teacherQuery.toLowerCase().trim();
    const sub = subject || '';
    return teachers.filter(t => {
      if (q && !t.name.toLowerCase().includes(q) && !t.specialties.some(s => s.toLowerCase().includes(q))) return false;
      if (category && !t.categories.includes(category)) return false;
      if (sub && !t.subcategories.includes(sub)) return false;
      return true;
    });
  }, [teachers, teacherQuery, category, subject]);

  const filteredSubjects = useMemo(() => {
    if (!category) return categories.flatMap(c => c.subcategories.map(s => ({ id: s.id, name: s.name, parent: c.name })));
    const cat = categories.find(c => c.name === category);
    return cat ? cat.subcategories.map(s => ({ id: s.id, name: s.name, parent: cat.name })) : [];
  }, [categories, category]);

  const activeFilters = [category, subject, level, examDate, query].filter(Boolean).length;

  return (
    <>
      <div className="page-header">
        <h1>Search</h1>
        <p>Find courses, teachers, and events across all categories.</p>
      </div>

      <section className="block">
        <div className="search-panel">
          <div className="filter-search-row" style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <input
              type="text"
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              placeholder="Search by course name, subject, or teacher..."
              style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(27,31,42,0.12)', fontSize: 15, fontFamily: 'Inter, sans-serif', outline: 'none', background: 'var(--paper)' }}
            />
            {activeFilters > 0 && (
              <button onClick={clearAll} style={{ padding: '12px 20px', borderRadius: 12, border: '1px solid var(--ink-200)', background: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'var(--ink-500)', whiteSpace: 'nowrap' }}>
                Clear all ({activeFilters})
              </button>
            )}
          </div>

          <div className="filters">
            <div className="filter">
              <label>Category</label>
              <select value={category} onChange={e => handleCategoryChange(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="filter">
              <label>Subject</label>
              <select value={subject} onChange={e => handleSubjectChange(e.target.value)}>
                <option value="">All Subjects</option>
                {filteredSubjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="filter">
              <label>Level</label>
              <select value={level} onChange={e => handleLevelChange(e.target.value)}>
                <option value="">All Levels</option>
                {levels.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
              </select>
            </div>
            <div className="filter">
              <label>Exam window</label>
              <select value={examDate} onChange={e => handleExamDateChange(e.target.value)}>
                <option value="">All Dates</option>
                {examDates.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
              </select>
            </div>
          </div>

          <h3 style={{ fontSize: 18, fontFamily: 'Fraunces, serif', margin: '0 0 20px' }}>
            {activeFilters > 0 ? `Filtered Courses (${filteredCourses.length} of ${courses.length})` : `All Courses (${courses.length})`}
          </h3>
          <div className="results">
            {filteredCourses.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>
                <p style={{ color: 'var(--ink-400)', fontSize: 15, marginBottom: 12 }}>No courses match your filters.</p>
                <button onClick={clearAll} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--ink-200)', background: '#fff', fontSize: 13, cursor: 'pointer' }}>Clear filters</button>
              </div>
            ) : (
              filteredCourses.map(c => (
                <Link key={c.id} href={`/course/${c.id}`} className="course-card">
                  <span className={`tag ${c.category.toLowerCase()}`}>{c.category}</span>
                  <h4>{c.title}</h4>
                  <div className="meta">{c.teacher.name} · {c.level} · {c.subcategory}</div>
                  <div className="meta" style={{ marginTop: 4 }}>{c.schedule}</div>
                  {c.price != null && <div style={{ marginTop: 6, fontWeight: 600, fontSize: 14, color: 'var(--ink-900)' }}>${c.price}</div>}
                  {c.contactForPrice && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--ink-400)' }}>Contact for pricing</div>}
                  <div className="cta-row">
                    <span className="mono" style={{ fontSize: 12, color: 'var(--text-mute)' }}>View details</span>
                    {c.teacher.whatsappContact ? (
                      <span className="whatsapp" onClick={e => { e.preventDefault(); e.stopPropagation(); window.open(`https://wa.me/${c.teacher.whatsappContact!.replace(/[^0-9]/g, '')}?text=Hi!%20I'm%20interested%20in%20the%20course:%20${encodeURIComponent(c.title)}`, '_blank'); }}>WhatsApp →</span>
                    ) : (
                      <span className="whatsapp">WhatsApp →</span>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div style={{ marginTop: 64 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontFamily: 'Fraunces, serif', margin: 0 }}>
              {category || subject ? `Filtered Teachers (${filteredTeachers.length})` : `All Teachers (${teachers.length})`}
            </h2>
            <input
              type="text"
              value={teacherQuery}
              onChange={e => setTeacherQuery(e.target.value)}
              placeholder="Search teachers..."
              style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(27,31,42,0.12)', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', width: 260 }}
            />
          </div>
          <div className="search-teacher-grid">
            {filteredTeachers.length === 0 ? (
              <p style={{ color: 'var(--text-mute)', gridColumn: '1 / -1' }}>No teachers match your search.</p>
            ) : (
              filteredTeachers.map(t => {
                const initials = t.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('');
                return (
                  <Link key={t.id} href={`/teacher/${t.id}`} className="teacher-card">
                    {t.avatarPhoto ? (
                      <img src={t.avatarPhoto} alt={t.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div className="avatar" style={{ background: 'var(--blue)' }}>{initials}</div>
                    )}
                    <h4>{t.name}</h4>
                    <span>{t.categories.join(' · ')} · {t.specialties.join(', ')}</span>
                    {t.whatsappContact && (
                      <span onClick={e => { e.preventDefault(); e.stopPropagation(); window.open(`https://wa.me/${t.whatsappContact!.replace(/[^0-9]/g, '')}`, '_blank'); }} style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#25D366', color: '#fff', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                        WhatsApp
                      </span>
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>
    </>
  );
}
