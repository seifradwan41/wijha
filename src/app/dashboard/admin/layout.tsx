'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import HeartbeatPing from '@/components/HeartbeatPing';
import TermsCheck from '@/components/TermsCheck';
import DashboardTour, { TourStep } from '@/components/DashboardTour';

const adminTourSteps: TourStep[] = [
  { target: '[data-tour="review-queue"]', title: 'Review Queue', description: 'This is where you approve or reject submissions from community collaborators. Check new content here daily.' },
  { target: '[data-tour="accounts"]', title: 'Accounts', description: 'Manage all user accounts. Create new teachers, assistants, or collaborators. Suspend or change passwords here.' },
  { target: '[data-tour="teacher-manager"]', title: 'Teacher Manager', description: 'Manage any teacher\'s courses and events on their behalf. Create, edit, or publish content for them.' },
  { target: '[data-tour="user-chat"]', title: 'User Chat', description: 'Chat directly with teachers and collaborators. Respond to their questions and requests.' },
  { target: '[data-tour="assistant-chat"]', title: 'Assistant Chat', description: 'Private chat with your admin assistants. Your private chat channel with the admin team.' },
  { target: '[data-tour="sign-out"]', title: 'Sign Out', description: 'Click here to securely sign out when you\'re done.' },
];

const assistantTourSteps: TourStep[] = [
  { target: '[data-tour="review-queue"]', title: 'Review Queue', description: 'Review pending submissions from collaborators. Approve good content or reject with a reason.' },
  { target: '[data-tour="teacher-manager"]', title: 'Teacher Manager', description: 'Help teachers manage their courses and events. You can create and edit on their behalf.' },
  { target: '[data-tour="user-chat"]', title: 'User Chat', description: 'Chat with teachers and collaborators to support them.' },
  { target: '[data-tour="chat-admin"]', title: 'Chat with Admin', description: 'Your direct line to the admin. Ask questions or report issues here.' },
  { target: '[data-tour="sign-out"]', title: 'Sign Out', description: 'Sign out when you\'re finished.' },
];

const adminSections = [
  { label: 'Moderation', items: [
    { href: '/dashboard/admin', label: 'Review Queue' },
    { href: '/dashboard/admin/courses', label: 'All Courses' },
    { href: '/dashboard/admin/events', label: 'Events & News' },
  ]},
  { label: 'People', items: [
    { href: '/dashboard/admin/accounts', label: 'Accounts' },
    { href: '/dashboard/admin/assistants', label: 'Admin Assistants' },
    { href: '/dashboard/admin/teacher-manager', label: 'Teacher Manager' },
  ]},
  { label: 'Content', items: [
    { href: '/dashboard/admin/taxonomy', label: 'Taxonomy' },
    { href: '/dashboard/admin/terms', label: 'Terms & Conditions' },
  ]},
  { label: 'Communication', items: [
    { href: '/dashboard/admin/notifications', label: 'Notifications' },
    { href: '/dashboard/admin/chat', label: 'User Chat' },
    { href: '/dashboard/admin/assistant-chat', label: 'Assistant Chat' },
  ]},
];

const assistantSections = [
  { label: 'Moderation', items: [
    { href: '/dashboard/admin', label: 'Review Queue' },
    { href: '/dashboard/admin/courses', label: 'All Courses' },
    { href: '/dashboard/admin/events', label: 'Events & News' },
  ]},
  { label: 'People', items: [
    { href: '/dashboard/admin/accounts', label: 'Accounts' },
    { href: '/dashboard/admin/teacher-manager', label: 'Teacher Manager' },
  ]},
  { label: 'Content', items: [
    { href: '/dashboard/admin/taxonomy', label: 'Taxonomy' },
    { href: '/dashboard/admin/terms', label: 'Terms & Conditions' },
  ]},
  { label: 'Communication', items: [
    { href: '/dashboard/admin/notifications', label: 'Notifications' },
    { href: '/dashboard/admin/chat', label: 'User Chat' },
    { href: '/dashboard/admin/assistant-chat', label: 'Chat with Admin' },
  ]},
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as Record<string, unknown> | undefined;
  const name = (user?.name as string) || 'Admin';
  const role = user?.role as string;
  const isAdmin = role === 'admin';
  const navSections = isAdmin ? adminSections : assistantSections;
  const tourSteps = isAdmin ? adminTourSteps : assistantTourSteps;
  const initials = name.split(' ').map((w: string) => w[0]).slice(0, 2).join('');

  const tourTargets: Record<string, string> = {
    '/dashboard/admin': 'review-queue',
    '/dashboard/admin/accounts': 'accounts',
    '/dashboard/admin/teacher-manager': 'teacher-manager',
    '/dashboard/admin/chat': 'user-chat',
    '/dashboard/admin/assistant-chat': isAdmin ? 'assistant-chat' : 'chat-admin',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--paper)' }}>
      <HeartbeatPing />
      <TermsCheck />
      <DashboardTour steps={tourSteps} storageKey="tour_admin" />
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo" style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <a href="/" style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, color: 'var(--text-on-ink)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px solid var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--blue)', fontFamily: 'IBM Plex Mono, monospace' }}>و</span>
            Wijha
          </a>
        </div>

        <div className="sidebar-user" style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #dc2626, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 14, color: '#fff', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-on-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-on-ink-mute)', fontFamily: 'IBM Plex Mono, monospace' }}>{isAdmin ? 'Admin' : 'Admin Assistant'}</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section) => (
            <div key={section.label} className="sidebar-section">
              <div className="sidebar-section-label">{section.label}</div>
              {section.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} data-tour={tourTargets[item.href]} className={`sidebar-link${active ? ' active' : ''}`}>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button data-tour="sign-out" onClick={() => signOut({ callbackUrl: '/' })} className="sidebar-signout">
            Sign out
          </button>
        </div>
      </aside>

      <main className="dashboard-main" style={{ marginLeft: 256, flex: 1, padding: '32px 40px' }}>
        {children}
      </main>
    </div>
  );
}
