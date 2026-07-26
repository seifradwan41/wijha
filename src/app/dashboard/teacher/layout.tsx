'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import TermsCheck from '@/components/TermsCheck';

const navItems = [
  { href: '/dashboard/teacher', label: 'Overview' },
  { href: '/dashboard/teacher/profile', label: 'My Profile' },
  { href: '/dashboard/teacher/courses', label: 'Courses' },
  { href: '/dashboard/teacher/events', label: 'Events & News' },
  { href: '/dashboard/teacher/notifications', label: 'Notifications' },
  { href: '/dashboard/teacher/chat', label: 'Chat' },
];

export default function TeacherDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as Record<string, unknown> | undefined;
  const name = (user?.name as string) || 'Teacher';
  const initials = name.split(' ').map((w: string) => w[0]).slice(0, 2).join('');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--paper)' }}>
      <TermsCheck />
      <aside className="dashboard-sidebar" style={{ width: 240, background: 'var(--ink-900)', position: 'fixed', top: 0, left: 0, bottom: 0, overflowY: 'auto' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <a href="/" style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, color: 'var(--text-on-ink)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px solid var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--blue)', fontFamily: 'IBM Plex Mono, monospace' }}>و</span>
            Wijha
          </a>
        </div>

        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 14, color: '#fff', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-on-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-on-ink-mute)', fontFamily: 'IBM Plex Mono, monospace' }}>Teacher</div>
            </div>
          </div>
        </div>

        <nav style={{ padding: '12px 10px' }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{ display: 'block', padding: '10px 12px', borderRadius: 10, fontSize: 14, textDecoration: 'none', marginBottom: 2, color: active ? '#fff' : 'var(--text-on-ink-mute)', background: active ? 'rgba(47,111,237,0.2)' : 'transparent' }}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)', position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <button onClick={() => signOut({ callbackUrl: '/' })} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'var(--text-on-ink-mute)', fontSize: 13, cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="dashboard-main" style={{ marginLeft: 240, flex: 1, padding: '32px 40px' }}>
        {children}
      </main>
    </div>
  );
}
