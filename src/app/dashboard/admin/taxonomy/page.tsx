'use client';
import { useEffect, useState } from 'react';

interface Category { id: string; name: string; subcategories: { id: string; name: string }[] }
interface Level { id: string; name: string }
interface TargetGrade { id: string; grade: string }
interface ExamDate { id: string; name: string }

export default function TaxonomyPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [grades, setGrades] = useState<TargetGrade[]>([]);
  const [examDates, setExamDates] = useState<ExamDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState('');
  const [newSub, setNewSub] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [newLevel, setNewLevel] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [newExam, setNewExam] = useState('');

  const load = () => {
    Promise.all([
      fetch('/api/admin/taxonomy/categories').then(r => r.json()),
      fetch('/api/admin/taxonomy/levels').then(r => r.json()),
      fetch('/api/admin/taxonomy/grades').then(r => r.json()),
      fetch('/api/admin/taxonomy/exam-dates').then(r => r.json()),
    ]).then(([c, l, g, e]) => { setCategories(c); setLevels(l); setGrades(g); setExamDates(e); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const add = async (url: string, body: Record<string, string>) => {
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    load();
  };

  const remove = async (url: string, type: 'category' | 'subcategory' | 'level' | 'grade' | 'examDate', id: string) => {
    if (type === 'category') setCategories(prev => prev.filter(c => c.id !== id));
    if (type === 'level') setLevels(prev => prev.filter(l => l.id !== id));
    if (type === 'grade') setGrades(prev => prev.filter(g => g.id !== id));
    if (type === 'examDate') setExamDates(prev => prev.filter(e => e.id !== id));
    await fetch(url, { method: 'DELETE' });
    load();
  };

  if (loading) return <p style={{ color: 'var(--ink-500)' }}>Loading...</p>;

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1>Taxonomy</h1>
          <div className="dash-header-sub">Manage categories, subcategories, levels, target grades, and exam dates.</div>
        </div>
      </div>

      <div className="taxonomy-grid">
        {/* Categories */}
        <div className="dash-card">
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Categories</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="New category..." style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--ink-200)', fontSize: 14 }} />
            <button onClick={() => { if (newCat) { add('/api/admin/taxonomy/categories', { name: newCat }); setNewCat(''); } }} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Add</button>
          </div>
          {categories.map(c => (
            <div key={c.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--ink-100)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 500 }}>{c.name}</span>
                <button onClick={() => remove(`/api/admin/taxonomy/categories/${c.id}`, 'category', c.id)} style={{ padding: '2px 8px', borderRadius: 4, border: '1px solid #ef4444', background: '#fff', color: '#ef4444', fontSize: 11, cursor: 'pointer' }}>Remove</button>
              </div>
              <div style={{ marginTop: 8, paddingLeft: 16 }}>
                {c.subcategories.map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                    <span style={{ fontSize: 13, color: 'var(--ink-500)' }}>{s.name}</span>
                    <button onClick={() => { setCategories(prev => prev.map(cat => cat.id === c.id ? { ...cat, subcategories: cat.subcategories.filter(sc => sc.id !== s.id) } : cat)); fetch(`/api/admin/taxonomy/subcategories/${s.id}`, { method: 'DELETE' }).then(load); }} style={{ padding: '1px 6px', borderRadius: 4, border: '1px solid #ef4444', background: '#fff', color: '#ef4444', fontSize: 10, cursor: 'pointer' }}>x</button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--ink-200)', fontSize: 12, display: selectedCat === c.id ? 'block' : 'none' }}>
                    <option value={c.id}>{c.name}</option>
                  </select>
                  <input value={selectedCat === c.id ? newSub : ''} onChange={e => { setSelectedCat(c.id); setNewSub(e.target.value); }} onFocus={() => setSelectedCat(c.id)} placeholder="New sub..." style={{ flex: 1, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--ink-200)', fontSize: 12 }} />
                  {selectedCat === c.id && newSub && (
                    <button onClick={() => { add('/api/admin/taxonomy/subcategories', { name: newSub, categoryId: c.id }); setNewSub(''); }} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: 'var(--blue)', color: '#fff', fontSize: 11, cursor: 'pointer' }}>+</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Levels */}
        <div className="dash-card">
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Levels</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input value={newLevel} onChange={e => setNewLevel(e.target.value)} placeholder="New level..." style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--ink-200)', fontSize: 14 }} />
            <button onClick={() => { if (newLevel) { add('/api/admin/taxonomy/levels', { name: newLevel }); setNewLevel(''); } }} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Add</button>
          </div>
          {levels.map(l => (
            <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--ink-100)' }}>
              <span style={{ fontSize: 14 }}>{l.name}</span>
              <button onClick={() => remove(`/api/admin/taxonomy/levels/${l.id}`, 'level', l.id)} style={{ padding: '2px 8px', borderRadius: 4, border: '1px solid #ef4444', background: '#fff', color: '#ef4444', fontSize: 11, cursor: 'pointer' }}>Remove</button>
            </div>
          ))}

          <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>Target Grades</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input value={newGrade} onChange={e => setNewGrade(e.target.value)} placeholder="e.g. 11" style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--ink-200)', fontSize: 14 }} />
            <button onClick={() => { if (newGrade) { add('/api/admin/taxonomy/grades', { grade: newGrade }); setNewGrade(''); } }} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Add</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {grades.map(g => (
              <span key={g.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: 'var(--ink-100)', fontSize: 13 }}>
                Grade {g.grade}
                <button onClick={() => remove(`/api/admin/taxonomy/grades/${g.id}`, 'grade', g.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 14, padding: 0 }}>&times;</button>
              </span>
            ))}
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>Exam Dates</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input value={newExam} onChange={e => setNewExam(e.target.value)} placeholder="e.g. December 2026 SAT" style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--ink-200)', fontSize: 14 }} />
            <button onClick={() => { if (newExam) { add('/api/admin/taxonomy/exam-dates', { name: newExam }); setNewExam(''); } }} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Add</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {examDates.map(e => (
              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                <span style={{ fontSize: 14 }}>{e.name}</span>
                <button onClick={() => remove(`/api/admin/taxonomy/exam-dates/${e.id}`, 'examDate', e.id)} style={{ padding: '2px 8px', borderRadius: 4, border: '1px solid #ef4444', background: '#fff', color: '#ef4444', fontSize: 11, cursor: 'pointer' }}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
