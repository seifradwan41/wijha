'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function PublicNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  if (pathname.startsWith('/dashboard') || pathname === '/login') return null;

  const user = session?.user as Record<string, unknown> | undefined;
  const role = user?.role as string | undefined;

  const dashboardHref = role === 'admin' || role === 'admin_assistant'
    ? '/dashboard/admin'
    : role === 'community_collaborator'
    ? '/dashboard/collaborator'
    : '/dashboard/teacher';

  return (
    <>
      <nav className="public-nav">
        <Link href="/" className="brand"><span className="mark">و</span>Wijha</Link>
        <div className="navlinks">
          <Link href="/category/SAT">SAT</Link>
          <Link href="/category/ACT">ACT</Link>
          <Link href="/search">Teachers</Link>
          {session ? (
            <Link href={dashboardHref} className="cta">Dashboard</Link>
          ) : (
            <Link href="/search" className="cta">Find a course</Link>
          )}
        </div>
        <button className="nav-toggle" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          &#9776;
        </button>
      </nav>

      {mobileOpen && (
        <div className="nav-mobile-overlay">
          <button className="close-btn" onClick={() => setMobileOpen(false)} aria-label="Close menu">&times;</button>
          <Link href="/category/SAT" onClick={() => setMobileOpen(false)}>SAT</Link>
          <Link href="/category/ACT" onClick={() => setMobileOpen(false)}>ACT</Link>
          <Link href="/search" onClick={() => setMobileOpen(false)}>Teachers</Link>
          {session ? (
            <Link href={dashboardHref} onClick={() => setMobileOpen(false)}>Dashboard</Link>
          ) : (
            <Link href="/search" onClick={() => setMobileOpen(false)} style={{ background: 'var(--blue)', padding: '12px 28px', borderRadius: 100 }}>Find a course</Link>
          )}
        </div>
      )}
    </>
  );
}
