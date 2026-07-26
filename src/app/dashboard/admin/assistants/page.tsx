'use client';
import { useEffect, useState } from 'react';

interface Assistant {
  id: string; name: string; username: string; status: string; lastLoginAt: string | null; lastActiveAt: string | null; birthdayModeActive: boolean;
}

export default function AssistantsPage() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', password: '' });

  const load = () => {
    fetch('/api/admin/assistants').then(r => r.json()).then((data: Assistant[]) => { setAssistants(data); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    await fetch('/api/admin/assistants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setCreateModal(false); setForm({ name: '', username: '', password: '' }); load();
  };

  const handleSuspend = async (id: string) => {
    await fetch('/api/admin/assistants/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'suspended' }) });
    load();
  };

  const handleUnsuspend = async (id: string) => {
    await fetch('/api/admin/assistants/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this assistant?')) return;
    await fetch('/api/admin/assistants/' + id, { method: 'DELETE' });
    load();
  };

  const handleToggleBirthday = async (id: string) => {
    const a = assistants.find(a => a.id === id);
    if (!a) return;
    await fetch('/api/admin/assistants/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ birthdayModeActive: !a.birthdayModeActive }) });
    load();
  };

  const isOnline = (lastActiveAt: string | null) => {
    if (!lastActiveAt) return false;
    const diff = Date.now() - new Date(lastActiveAt).getTime();
    return diff < 60 * 1000; // online if active within last 60s
  };

  if (loading) return <p style={{ color: 'var(--ink-500)' }}>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 8 }}>Admin Assistants</h1>
          <p style={{ color: 'var(--ink-500)', fontSize: 15 }}>Manage admin assistant accounts and birthday mode.</p>
        </div>
        <button onClick={() => setCreateModal(true)} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>+ New Assistant</button>
      </div>

      {createModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 440, maxWidth: '90vw' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, marginBottom: 16 }}>Create Assistant Account</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14 }} />
              <input placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14 }} />
              <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14 }} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={() => setCreateModal(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--ink-200)', background: '#fff', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
              <button onClick={handleCreate} disabled={!form.name || !form.username || !form.password} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14, opacity: (!form.name || !form.username || !form.password) ? 0.5 : 1 }}>Create</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {assistants.length === 0 ? (
          <p style={{ color: 'var(--ink-400)', textAlign: 'center', padding: '40px 0' }}>No admin assistants yet.</p>
        ) : assistants.map(a => (
          <div key={a.id} style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #dc2626, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 14, color: '#fff' }}>
              {a.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-900)' }}>{a.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-400)' }}>@{a.username}</div>
            </div>
            <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: a.status === 'active' ? '#dcfce7' : '#fef3c7', color: a.status === 'active' ? '#166534' : '#92400e', textTransform: 'capitalize' }}>{a.status}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: isOnline(a.lastActiveAt) ? '#22c55e' : '#d1d5db' }} />
              <span style={{ fontSize: 11, color: isOnline(a.lastActiveAt) ? '#166534' : 'var(--ink-400)', fontFamily: 'IBM Plex Mono, monospace' }}>{isOnline(a.lastActiveAt) ? 'Online' : 'Offline'}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button onClick={() => handleToggleBirthday(a.id)} style={{ padding: '4px 12px', borderRadius: 6, border: a.birthdayModeActive ? '1px solid var(--blue)' : '1px solid var(--ink-200)', background: a.birthdayModeActive ? 'rgba(47,111,237,0.1)' : '#fff', color: a.birthdayModeActive ? 'var(--blue)' : 'var(--ink-600)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>🎂 Birthday</button>
              {a.status === 'active' ? (
                <button onClick={() => handleSuspend(a.id)} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #f59e0b', background: '#fff', color: '#f59e0b', fontSize: 12, cursor: 'pointer' }}>Suspend</button>
              ) : (
                <button onClick={() => handleUnsuspend(a.id)} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #10b981', background: '#fff', color: '#10b981', fontSize: 12, cursor: 'pointer' }}>Activate</button>
              )}
              <button onClick={() => handleDelete(a.id)} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #ef4444', background: '#fff', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
