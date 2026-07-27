'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import TermsCheck from '@/components/TermsCheck';
import DashboardTour, { TourStep } from '@/components/DashboardTour';
import DashboardBanner from '@/components/DashboardBanner';

const tourSteps: TourStep[] = [
  { target: '[data-tour="overview"]', title: 'Overview', description: 'Your dashboard home. See your submission stats — pending, approved, and rejected counts.' },
  { target: '[data-tour="submit"]', title: 'Submit Content', description: 'Submit courses, events, or news you\'ve found. Fill in the details and send for admin review.' },
  { target: '[data-tour="submissions"]', title: 'My Submissions', description: 'Track all your past submissions and see their status. If rejected, you\'ll see the reason why.' },
  { target: '[data-tour="chat"]', title: 'Chat', description: 'Message the admin team directly. Ask questions or report issues.' },
  { target: '[data-tour="sign-out"]', title: 'Sign Out', description: 'Click here to securely sign out when you\'re done.' },
];

  const navItems = [
    { href: '/dashboard/collaborator', label: 'Overview', tour: 'overview' },
    { href: '/dashboard/collaborator/submit', label: 'Submit Content', tour: 'submit' },
    { href: '/dashboard/collaborator/submissions', label: 'My Submissions', tour: 'submissions' },
    { href: '/dashboard/collaborator/notifications', label: 'Notifications' },
    { href: '/dashboard/collaborator/chat', label: 'Chat', tour: 'chat' },
  ];

export default function CollaboratorDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as Record<string, unknown> | undefined;
  const name = (user?.name as string) || 'Collaborator';
  const initials = name.split(' ').map((w: string) => w[0]).slice(0, 2).join('');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--paper)' }}>
      <TermsCheck />
      <DashboardTour steps={tourSteps} storageKey="tour_collaborator" />
      <DashboardBanner />
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo" style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <a href="/" style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, color: 'var(--text-on-ink)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px solid var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--blue)', fontFamily: 'IBM Plex Mono, monospace' }}>و</span>
            Wijha
          </a>
        </div>

        <div className="sidebar-user" style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 14, color: '#fff', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-on-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-on-ink-mute)', fontFamily: 'IBM Plex Mono, monospace' }}>Collaborator</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} data-tour={item.tour} className={`sidebar-link${active ? ' active' : ''}`}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button data-tour="sign-out" onClick={() => signOut({ callbackUrl: '/' })} className="sidebar-signout">
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
