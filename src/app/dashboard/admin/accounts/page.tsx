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
  const isAdmin = role === 'admin';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [suspendModal, setSuspendModal] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'teacher' });

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

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);
  const availableRoles = isAdmin
    ? ['teacher', 'community_collaborator', 'admin_assistant']
    : ['teacher', 'community_collaborator'];
  const filterRoles = isAdmin
    ? ['all', 'teacher', 'community_collaborator', 'admin_assistant']
    : ['all', 'teacher', 'community_collaborator'];

  if (loading) return <p style={{ color: 'var(--ink-500)' }}>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 8 }}>Accounts</h1>
          <p style={{ color: 'var(--ink-500)', fontSize: 15 }}>{isAdmin ? 'Manage all accounts and their access.' : 'Manage teachers and collaborators.'}</p>
        </div>
        <button onClick={() => setCreateModal(true)} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>+ New Account</button>
      </div>

      {createModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 440, maxWidth: '90vw' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, marginBottom: 16 }}>Create Account</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14 }} />
              <input placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14 }} />
              <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14 }} />
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14 }}>
                {availableRoles.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={() => setCreateModal(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--ink-200)', background: '#fff', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
              <button onClick={handleCreate} disabled={!form.name || !form.username || !form.password} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14, opacity: (!form.name || !form.username || !form.password) ? 0.5 : 1 }}>Create</button>
            </div>
          </div>
        </div>
      )}

      {suspendModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 420, maxWidth: '90vw' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, marginBottom: 12 }}>Suspend Account</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 12 }}>Provide a reason (the user will be notified).</p>
            <textarea value={suspendReason} onChange={e => setSuspendReason(e.target.value)} placeholder="Reason for suspension..." style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14, outline: 'none', resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => { setSuspendModal(null); setSuspendReason(''); }} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--ink-200)', background: '#fff', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
              <button onClick={() => handleSuspend(suspendModal)} disabled={!suspendReason} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#f59e0b', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14, opacity: !suspendReason ? 0.5 : 1 }}>Suspend</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {filterRoles.map(r => (
          <button key={r} onClick={() => setFilter(r)} style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid var(--ink-200)', background: filter === r ? 'var(--ink-900)' : '#fff', color: filter === r ? '#fff' : 'var(--ink-600)', fontSize: 13, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize' }}>
            {r === 'all' ? 'All' : r.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="admin-table-wrap" style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--ink-100)' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--ink-500)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--ink-500)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--ink-500)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--ink-500)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 600, color: 'var(--ink-500)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--ink-100)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{u.name}</td>
                <td style={{ padding: '12px 16px', color: 'var(--ink-500)' }}>{u.username}</td>
                <td style={{ padding: '12px 16px' }}><span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: 'var(--ink-100)', color: 'var(--ink-600)', textTransform: 'capitalize' }}>{u.role.replace('_', ' ')}</span></td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: u.status === 'active' ? '#dcfce7' : '#fef3c7', color: u.status === 'active' ? '#166534' : '#92400e', textTransform: 'capitalize' }}>
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
                    <button onClick={() => handleDelete(u.id)} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #ef4444', background: '#fff', color: '#ef4444', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
