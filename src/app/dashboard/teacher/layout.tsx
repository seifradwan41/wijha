'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import TermsCheck from '@/components/TermsCheck';
import DashboardTour, { TourStep } from '@/components/DashboardTour';
import DashboardBanner from '@/components/DashboardBanner';

const tourSteps: TourStep[] = [
  { target: '[data-tour="overview"]', title: 'Overview', description: 'Your dashboard home. See your course stats, published content, and pending reviews at a glance.' },
  { target: '[data-tour="profile"]', title: 'My Profile', description: 'Set up your public profile. Add your name, bio, teaching style, specialties, and upload photos.' },
  { target: '[data-tour="courses"]', title: 'Courses', description: 'Create and manage your courses. Choose category (SAT/ACT/Other), set schedule, price, and target grades.' },
  { target: '[data-tour="events"]', title: 'Events & News', description: 'Post events and news for students. Add a photo and WhatsApp link, then submit for admin review.' },
  { target: '[data-tour="chat"]', title: 'Chat', description: 'Message the admin team directly. Ask questions or report issues.' },
  { target: '[data-tour="sign-out"]', title: 'Sign Out', description: 'Click here to securely sign out when you\'re done.' },
];

  const navItems = [
    { href: '/dashboard/teacher', label: 'Overview', tour: 'overview' },
    { href: '/dashboard/teacher/profile', label: 'My Profile', tour: 'profile' },
    { href: '/dashboard/teacher/courses', label: 'Courses', tour: 'courses' },
    { href: '/dashboard/teacher/events', label: 'Events & News', tour: 'events' },
    { href: '/dashboard/teacher/notifications', label: 'Notifications' },
    { href: '/dashboard/teacher/chat', label: 'Chat', tour: 'chat' },
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
      <DashboardTour steps={tourSteps} storageKey="tour_teacher" />
      <DashboardBanner />
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo" style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/" style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, color: 'var(--text-on-ink)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px solid var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--blue)', fontFamily: 'IBM Plex Mono, monospace' }}>و</span>
            Wijha
          </Link>
        </div>

        <div className="sidebar-user" style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
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
