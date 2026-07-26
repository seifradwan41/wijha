'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  id: string; name: string; username: string | null; contact: string | null; role: string; status: string;
  suspendedReason: string | null; createdAt: string;
}

export default function AccountsPage() {
  const { data: session } = useSession();
  const role = (session?.user as Record<string, unknown>)?.role as string;
  const myId = (session?.user as Record<string, unknown>)?.userId as string;
  const isAdmin = role === 'admin';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [suspendModal, setSuspendModal] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'teacher' });
  const [pwModal, setPwModal] = useState<{ id: string; name: string } | null>(null);
  const [newPw, setNewPw] = useState('');

  const load = () => {
    fetch('/api/admin/users').then(r => r.json()).then((data: User[]) => {
      if (!isAdmin) {
        setUsers(data.filter(u => u.role === 'teacher' || u.role === 'community_collaborator'));
      } else {
        setUsers(data);
      }
      setLoading(false);
    });
  };
  useEffect(() => { load(); }, [isAdmin]);

  const handleSuspend = async (id: string) => {
    await fetch('/api/admin/users/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'suspended', suspendedReason: suspendReason }) });
    setSuspendModal(null); setSuspendReason(''); load();
  };

  const handleUnsuspend = async (id: string) => {
    await fetch('/api/admin/users/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this account?')) return;
    await fetch('/api/admin/users/' + id, { method: 'DELETE' });
    load();
  };

  const handleCreate = async () => {
    await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setCreateModal(false); setForm({ name: '', username: '', password: '', role: 'teacher' }); load();
  };

  const handleChangePassword = async () => {
    if (!pwModal || !newPw) return;
    await fetch('/api/admin/users/' + pwModal.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: newPw }) });
    setPwModal(null); setNewPw('');
  };

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);
  const availableRoles = isAdmin
    ? ['teacher', 'community_collaborator', 'admin_assistant']
    : ['teacher', 'community_collaborator'];
  const filterRoles = isAdmin
    ? ['all', 'teacher', 'community_collaborator', 'admin_assistant']
    : ['all', 'teacher', 'community_collaborator'];

  if (loading) return <p style={{ color: 'var(--text-mute)', fontFamily: 'IBM Plex Mono, monospace', fontSize: 13 }}>Loading...</p>;

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1>Accounts</h1>
          <div className="dash-header-sub">{isAdmin ? 'Manage all accounts and their access.' : 'Manage teachers and collaborators.'}</div>
        </div>
        <button onClick={() => setCreateModal(true)} className="btn-primary" style={{ fontSize: 13, padding: '10px 18px', flexShrink: 0 }}>+ New Account</button>
      </div>

      {createModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 28, width: 440, maxWidth: '90vw', border: '1px solid rgba(27,31,42,0.07)' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, marginBottom: 16 }}>Create Account</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(27,31,42,0.12)', fontSize: 14, fontFamily: 'Inter, sans-serif' }} />
              <input placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(27,31,42,0.12)', fontSize: 14, fontFamily: 'Inter, sans-serif' }} />
              <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(27,31,42,0.12)', fontSize: 14, fontFamily: 'Inter, sans-serif' }} />
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(27,31,42,0.12)', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
                {availableRoles.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={() => setCreateModal(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(27,31,42,0.12)', background: '#fff', cursor: 'pointer', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Cancel</button>
              <button onClick={handleCreate} disabled={!form.name || !form.username || !form.password} className="btn-primary" style={{ fontSize: 14, padding: '10px 20px', opacity: (!form.name || !form.username || !form.password) ? 0.5 : 1 }}>Create</button>
            </div>
          </div>
        </div>
      )}

      {pwModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 28, width: 420, maxWidth: '90vw', border: '1px solid rgba(27,31,42,0.07)' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, marginBottom: 12 }}>Change Password</h3>
            <p style={{ fontSize: 13, color: 'var(--text-mute)', marginBottom: 12 }}>Set a new password for {pwModal.name}.</p>
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New password" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(27,31,42,0.12)', fontSize: 14, boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => { setPwModal(null); setNewPw(''); }} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(27,31,42,0.12)', background: '#fff', cursor: 'pointer', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Cancel</button>
              <button onClick={handleChangePassword} disabled={!newPw} className="btn-primary" style={{ fontSize: 14, padding: '10px 20px', opacity: !newPw ? 0.5 : 1 }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {suspendModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 28, width: 420, maxWidth: '90vw', border: '1px solid rgba(27,31,42,0.07)' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, marginBottom: 12 }}>Suspend Account</h3>
            <p style={{ fontSize: 13, color: 'var(--text-mute)', marginBottom: 12 }}>Provide a reason (the user will be notified).</p>
            <textarea value={suspendReason} onChange={e => setSuspendReason(e.target.value)} placeholder="Reason for suspension..." style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 10, border: '1px solid rgba(27,31,42,0.12)', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif' }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => { setSuspendModal(null); setSuspendReason(''); }} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(27,31,42,0.12)', background: '#fff', cursor: 'pointer', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Cancel</button>
              <button onClick={() => handleSuspend(suspendModal)} disabled={!suspendReason} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#f59e0b', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14, opacity: !suspendReason ? 0.5 : 1, fontFamily: 'Inter, sans-serif' }}>Suspend</button>
            </div>
          </div>
        </div>
      )}

      <div className="filter-row">
        {filterRoles.map(r => (
          <button key={r} onClick={() => setFilter(r)} className={`filter-pill${filter === r ? ' active' : ''}`}>
            {r === 'all' ? 'All' : r.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="admin-table-wrap" style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(27,31,42,0.07)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(27,31,42,0.07)' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--text-mute)', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--text-mute)', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--text-mute)', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--text-mute)', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 600, color: 'var(--text-mute)', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(27,31,42,0.07)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{u.name}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-mute)', fontFamily: 'IBM Plex Mono, monospace', fontSize: 13 }}>{u.username}</td>
                <td style={{ padding: '12px 16px' }}><span className="type-badge" style={{ textTransform: 'capitalize' }}>{u.role.replace('_', ' ')}</span></td>
                <td style={{ padding: '12px 16px' }}>
                  <span className={`status-pill ${u.status}`}>
                    {u.status}{u.suspendedReason ? ` (${u.suspendedReason})` : ''}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    {u.status === 'active' ? (
                      <button onClick={() => setSuspendModal(u.id)} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #f59e0b', background: '#fff', color: '#f59e0b', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Suspend</button>
                    ) : (
                      <button onClick={() => handleUnsuspend(u.id)} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #10b981', background: '#fff', color: '#10b981', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Activate</button>
                    )}
                    <button onClick={() => setPwModal({ id: u.id, name: u.name })} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid var(--blue)', background: '#fff', color: 'var(--blue)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Password</button>
                    {u.id !== myId && (
                      <button onClick={() => handleDelete(u.id)} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #ef4444', background: '#fff', color: '#ef4444', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mobile-cards">
          {filtered.map(u => (
            <div key={u.id} className="dash-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div className="dash-card-title">{u.name}</div>
                  <div className="dash-card-meta">{u.username}</div>
                </div>
                <span className={`status-pill ${u.status}`}>{u.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span className="type-badge" style={{ textTransform: 'capitalize' }}>{u.role.replace('_', ' ')}</span>
              </div>
              {u.suspendedReason && (
                <div style={{ fontSize: 12, color: '#dc2626', marginTop: 6, fontFamily: 'IBM Plex Mono, monospace' }}>{u.suspendedReason}</div>
              )}
              <div className="dash-card-actions">
                {u.status === 'active' ? (
                  <button onClick={() => setSuspendModal(u.id)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #f59e0b', background: '#fff', color: '#f59e0b', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Suspend</button>
                ) : (
                  <button onClick={() => handleUnsuspend(u.id)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #10b981', background: '#fff', color: '#10b981', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Activate</button>
                )}
                <button onClick={() => setPwModal({ id: u.id, name: u.name })} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--blue)', background: '#fff', color: 'var(--blue)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Password</button>
                {u.id !== myId && (
                  <button onClick={() => handleDelete(u.id)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #ef4444', background: '#fff', color: '#ef4444', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
