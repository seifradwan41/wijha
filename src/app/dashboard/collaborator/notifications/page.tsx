'use client';
import { useEffect, useState } from 'react';

interface Notification {
  id: string; message: string; read: boolean; createdAt: string;
  sender: { name: string };
}

export default function CollaboratorNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/collaborator/notifications').then(r => r.json()).then(d => { setNotifications(d); setLoading(false); });
  }, []);

  const unread = notifications.filter(n => !n.read).length;

  if (loading) return <p style={{ color: 'var(--text-mute)' }}>Loading...</p>;

  return (
    <div>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 8 }}>Notifications</h1>
      <p style={{ color: 'var(--ink-500)', fontSize: 15, marginBottom: 24 }}>
        {unread > 0 ? `You have ${unread} unread notification${unread > 1 ? 's' : ''}.` : 'All caught up.'}
      </p>

      {notifications.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 14, padding: 48, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>&#128276;</div>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, marginBottom: 8 }}>No notifications yet</h3>
          <p style={{ fontSize: 14, color: 'var(--text-mute)' }}>You&apos;ll be notified when your submissions are reviewed.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map(n => (
            <div key={n.id} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'flex-start', gap: 14, borderLeft: n.read ? '3px solid transparent' : '3px solid var(--blue)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.read ? 'var(--ink-200)' : 'var(--blue)', marginTop: 6, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, color: 'var(--ink-900)', margin: 0, lineHeight: 1.5 }}>{n.message}</p>
                <p style={{ fontSize: 12, color: 'var(--ink-400)', margin: '6px 0 0' }}>
                  From: {n.sender.name} · {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
