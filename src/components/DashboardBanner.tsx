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
    fetch('/api/settings/mobile-warning')
      .then(r => r.json())
      .then(data => {
        if (data.enabled && window.innerWidth < 768) {
          const key = 'dismissed_mobile_warning';
          const ts = localStorage.getItem(key);
          if (!ts || Date.now() - Number(ts) > 86400000) {
            setMobileWarn(true);
            setDismissedWarn(false);
          }
        }
      })
      .catch(() => {});

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

  return (
    <>
      {/* Mobile warning — inline banner at top */}
      {mobileWarn && !dismissedWarn && (
        <div style={{ background: '#fef3c7', borderBottom: '1px solid #fde68a', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 13, color: '#92400e', flexWrap: 'wrap' }}>
          <span>For the best experience, open this dashboard on a desktop or laptop computer.</span>
          <button onClick={dismissWarn} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#92400e', padding: '2px 6px', lineHeight: 1 }}>✕</button>
        </div>
      )}

      {/* Broadcast — Windows-style toast notification */}
      {broadcast && !dismissedBc && (
        <div style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 9999,
          maxWidth: 380,
          width: 'calc(100% - 32px)',
          background: '#fff',
          borderLeft: '4px solid #2563eb',
          borderRadius: 8,
          boxShadow: '0 8px 30px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          fontFamily: 'Segoe UI, system-ui, -apple-system, sans-serif',
          animation: 'slideInRight 0.3s ease-out',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#2563eb', marginBottom: 4 }}>
              Broadcast Message
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.5, color: '#1e293b' }}>
              {broadcast.message}
            </div>
          </div>
          <button onClick={() => dismissBc(broadcast.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94a3b8', padding: 0, lineHeight: 1, flexShrink: 0 }}>
            ✕
          </button>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(calc(100% + 40px)); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
