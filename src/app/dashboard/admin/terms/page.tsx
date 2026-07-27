'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface TermsVersion {
  id: string;
  roleScope: string;
  content: string;
  versionNumber: string;
  publishedAt: string;
  _count: { acceptances: number };
}

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  admin_assistant: 'Admin',
  teacher: 'Teacher',
  community_collaborator: 'Community Collaborator',
};

export default function TermsAdminPage() {
  const { data: session } = useSession();
  const role = (session?.user as Record<string, unknown>)?.role as string;
  const isAdmin = role === 'admin';

  const [versions, setVersions] = useState<TermsVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ roleScope: 'teacher', versionNumber: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    fetch('/api/admin/terms').then(r => r.json()).then((data: TermsVersion[]) => {
      setVersions(data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.versionNumber || !form.content) {
      setError('Version number and content are required');
      return;
    }
    setSaving(true); setError('');
    const res = await fetch('/api/admin/terms', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || 'Failed to create'); return; }
    setShowCreate(false);
    setForm({ roleScope: 'teacher', versionNumber: '', content: '' });
    load();
  };

  if (!isAdmin) return <p style={{ color: 'var(--ink-500)' }}>Only admins can manage terms.</p>;
  if (loading) return <p style={{ color: 'var(--ink-500)' }}>Loading...</p>;

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1>Terms & Conditions</h1>
          <div className="dash-header-sub">Manage role-specific terms. Publishing a new version requires all users of that role to re-accept.</div>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ fontSize: 13, padding: '10px 18px', flexShrink: 0 }}>+ New Version</button>
      </div>

      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 600, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, marginBottom: 16 }}>Publish New Terms Version</h3>
            {error && <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-600)', marginBottom: 4, display: 'block' }}>Role</label>
                  <select value={form.roleScope} onChange={e => setForm({ ...form, roleScope: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14 }}>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                    <option value="admin_assistant">Admin</option>
                    <option value="community_collaborator">Community Collaborator</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-600)', marginBottom: 4, display: 'block' }}>Version Number</label>
                  <input value={form.versionNumber} onChange={e => setForm({ ...form, versionNumber: e.target.value })} placeholder="e.g. 1.1" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14 }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-600)', marginBottom: 4, display: 'block' }}>Content</label>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Terms & conditions content..." style={{ width: '100%', minHeight: 300, padding: 14, borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'IBM Plex Mono, monospace', lineHeight: 1.6 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => { setShowCreate(false); setError(''); }} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--ink-200)', background: '#fff', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.versionNumber || !form.content} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14, opacity: saving ? 0.5 : 1 }}>{saving ? 'Publishing...' : 'Publish'}</button>
            </div>
          </div>
        </div>
      )}

      {versions.length === 0 ? (
        <p style={{ color: 'var(--ink-500)', fontSize: 14 }}>No terms versions published yet.</p>
      ) : (
        <div className="admin-table-wrap" style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(27,31,42,0.07)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(27,31,42,0.07)' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--text-mute)', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--text-mute)', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Version</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--text-mute)', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Published</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--text-mute)', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acceptances</th>
              </tr>
            </thead>
            <tbody>
              {versions.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid rgba(27,31,42,0.07)' }}>
                  <td style={{ padding: '12px 16px' }}><span className="type-badge" style={{ textTransform: 'capitalize' }}>{roleLabels[v.roleScope] || v.roleScope}</span></td>
                  <td style={{ padding: '12px 16px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 13 }}>{v.versionNumber}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-mute)', fontSize: 13 }}>{new Date(v.publishedAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 16px' }}><span className="status-pill" style={{ background: '#dcfce7', color: '#166534' }}>{v._count.acceptances}</span></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mobile-cards">
            {versions.map(v => (
              <div key={v.id} className="dash-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div>
                    <div className="dash-card-title">Version {v.versionNumber}</div>
                    <div className="dash-card-meta">{roleLabels[v.roleScope] || v.roleScope} · Published {new Date(v.publishedAt).toLocaleDateString()}</div>
                  </div>
                  <span className="status-pill" style={{ background: '#dcfce7', color: '#166534' }}>{v._count.acceptances} acceptances</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
