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
        if (data.enabled && window.innerWidth < 1024) {
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

  const toastTop = broadcast && !dismissedBc ? 88 : 16;

  return (
    <>
      <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(calc(100% + 40px)); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* Mobile warning — toast notification */}
      {mobileWarn && !dismissedWarn && (
        <div style={{
          position: 'fixed',
          top: toastTop,
          right: 16,
          zIndex: 9999,
          maxWidth: 440,
          width: 'calc(100% - 32px)',
          background: '#fffbeb',
          borderLeft: '4px solid #f59e0b',
          borderRadius: 8,
          boxShadow: '0 8px 30px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
          fontFamily: 'Segoe UI, system-ui, -apple-system, sans-serif',
          animation: 'slideInRight 0.3s ease-out',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#d97706', marginBottom: 6 }}>
              Desktop Recommended
            </div>
            <div style={{ fontSize: 15, lineHeight: 1.6, color: '#92400e' }}>
              This dashboard is best viewed on a desktop or laptop computer. Some features may not work well on mobile devices and tablets.
            </div>
          </div>
          <button onClick={dismissWarn}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#d97706', padding: 0, lineHeight: 1, flexShrink: 0 }}>
            ✕
          </button>
        </div>
      )}

      {/* Broadcast — toast notification */}
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
    </>
  );
}
