'use client';
import { useEffect, useState } from 'react';

interface Notification {
  id: string; message: string; read: boolean; createdAt: string;
  recipient: { id: string; name: string };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [sendModal, setSendModal] = useState(false);
  const [form, setForm] = useState({ recipientId: '', message: '' });

  const load = () => {
    fetch('/api/admin/notifications').then(r => r.json()).then((data: Notification[]) => { setNotifications(data); setLoading(false); });
    fetch('/api/admin/users').then(r => r.json()).then((data: { id: string; name: string }[]) => setUsers(data));
  };
  useEffect(() => { load(); }, []);

  const handleSend = async () => {
    await fetch('/api/admin/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSendModal(false); setForm({ recipientId: '', message: '' }); load();
  };

  if (loading) return <p style={{ color: 'var(--ink-500)' }}>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 8 }}>Notifications</h1>
          <p style={{ color: 'var(--ink-500)', fontSize: 15 }}>Send notifications to teachers and collaborators.</p>
        </div>
        <button onClick={() => setSendModal(true)} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>+ Send Notification</button>
      </div>

      {sendModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 480, maxWidth: '90vw' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, marginBottom: 16 }}>Send Notification</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <select value={form.recipientId} onChange={e => setForm({ ...form, recipientId: e.target.value })} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14 }}>
                <option value="">Select recipient...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Notification message..." style={{ width: '100%', minHeight: 100, padding: 10, borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setSendModal(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--ink-200)', background: '#fff', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
              <button onClick={handleSend} disabled={!form.recipientId || !form.message} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14, opacity: (!form.recipientId || !form.message) ? 0.5 : 1 }}>Send</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {notifications.length === 0 ? (
          <p style={{ color: 'var(--ink-400)', textAlign: 'center', padding: '40px 0' }}>No notifications sent yet.</p>
        ) : notifications.map(n => (
          <div key={n.id} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.read ? 'var(--ink-200)' : 'var(--blue)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: 'var(--ink-900)' }}>{n.message}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-400)', marginTop: 4 }}>To: {n.recipient.name} · {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
