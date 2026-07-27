'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Broadcast {
  id: string;
  message: string;
  roles: string[];
}

export default function DashboardBanner() {
  const { data: session } = useSession();
  const role = (session?.user as Record<string, unknown> | undefined)?.role as string;

  const [mobileWarn, setMobileWarn] = useState(false);
  const [broadcast, setBroadcast] = useState<Broadcast | null>(null);
  const [dismissedWarn, setDismissedWarn] = useState(true);
  const [dismissedBc, setDismissedBc] = useState(true);

  useEffect(() => {
    // Mobile warning
    fetch('/api/settings/mobile-warning')
      .then(r => r.json())
      .then(data => {
        if (data.enabled && window.innerWidth < 768) {
          const key = 'dismissed_mobile_warning';
          const ts = localStorage.getItem(key);
          // Re-show after 24h
          if (!ts || Date.now() - Number(ts) > 86400000) {
            setMobileWarn(true);
            setDismissedWarn(false);
          }
        }
      })
      .catch(() => {});

    // Broadcast
    fetch('/api/settings/broadcast')
      .then(r => r.json())
      .then((data: Broadcast | null) => {
        if (data && data.roles.includes(role)) {
          const key = `dismissed_broadcast_${data.id}`;
          if (!localStorage.getItem(key)) {
            setBroadcast(data);
            setDismissedBc(false);
          }
        }
      })
      .catch(() => {});
  }, [role]);

  const dismissWarn = () => {
    localStorage.setItem('dismissed_mobile_warning', String(Date.now()));
    setDismissedWarn(true);
  };

  const dismissBc = (id: string) => {
    localStorage.setItem(`dismissed_broadcast_${id}`, '1');
    setDismissedBc(true);
  };

  if (!dismissedWarn || !dismissedBc) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 0 }}>
        {mobileWarn && !dismissedWarn && (
          <div style={{ background: '#fef3c7', borderBottom: '1px solid #fde68a', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 13, color: '#92400e', flexWrap: 'wrap' }}>
            <span>📱 For the best experience, open this dashboard on a desktop or laptop computer.</span>
            <button onClick={dismissWarn} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#92400e', padding: '2px 6px', lineHeight: 1 }}>✕</button>
          </div>
        )}
        {broadcast && !dismissedBc && (
          <div style={{ background: '#dbeafe', borderBottom: '1px solid #bfdbfe', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 13, color: '#1e40af', flexWrap: 'wrap' }}>
            <span>📢 {broadcast.message}</span>
            <button onClick={() => dismissBc(broadcast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#1e40af', padding: '2px 6px', lineHeight: 1 }}>✕</button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
