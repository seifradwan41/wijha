import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const protectedRoutes: Record<string, string[]> = {
  '/dashboard/teacher': ['teacher'],
  '/dashboard/admin': ['admin', 'admin_assistant'],
  '/dashboard/collaborator': ['community_collaborator'],
};

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Block suspended users from all API routes
  if (pathname.startsWith('/api/')) {
    if (session) {
      const suspended = (session.user as Record<string, unknown>)?._suspended as boolean;
      if (suspended) {
        return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
      }
    }
    return NextResponse.next();
  }

  for (const [route, roles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      if (!session) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }

      const userRole = (session.user as Record<string, unknown>)?.role as string;
      const suspended = (session.user as Record<string, unknown>)?._suspended as boolean;
      const onboardingCompleted = (session.user as Record<string, unknown>)?._onboardingCompleted as boolean;

      if (!roles.includes(userRole) || suspended) {
        return NextResponse.redirect(new URL('/', req.url));
      }

      if (!onboardingCompleted) {
        return NextResponse.redirect(new URL('/onboarding', req.url));
      }
    }
  }

  if (pathname === '/onboarding') {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    const onboardingCompleted = (session.user as Record<string, unknown>)?._onboardingCompleted as boolean;
    if (onboardingCompleted) {
      const userRole = (session.user as Record<string, unknown>)?.role as string;
      const dashboardMap: Record<string, string> = {
        teacher: '/dashboard/teacher',
        admin: '/dashboard/admin',
        admin_assistant: '/dashboard/admin',
        community_collaborator: '/dashboard/collaborator',
      };
      return NextResponse.redirect(new URL(dashboardMap[userRole] || '/dashboard', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding', '/api/:path*'],
};
