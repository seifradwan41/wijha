import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is required. Generate with: openssl rand -base64 32');
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        // Fallback: try lowercase if exact match fails
        const username = (credentials as Record<string, unknown>).username as string;
        let user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
          user = await prisma.user.findUnique({ where: { username: username.toLowerCase() } });
        }

        if (!user || user.status !== 'active') return null;

        const passwordField = user as unknown as { password?: string };
        if (!passwordField.password) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          passwordField.password
        );

        if (!passwordMatch) return null;

        // Fire-and-forget: update lastLoginAt/loginHistory
        const now = new Date().toISOString();
        prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            loginHistory: [...user.loginHistory.slice(-99), now],
          },
        }).catch(() => {});

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
          status: user.status,
          onboardingCompletedAt: user.onboardingCompletedAt,
          orientationSeenAt: user.orientationSeenAt,
        };
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 60 * 60 },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as unknown as { role?: string }).role;
        token.userId = user.id;
        token.status = (user as unknown as { status?: string }).status;
        token.username = (user as unknown as { username?: string }).username;
        token.onboardingCompletedAt = (user as unknown as { onboardingCompletedAt?: Date })?.onboardingCompletedAt?.toISOString() || null;
        token.orientationSeenAt = (user as unknown as { orientationSeenAt?: Date })?.orientationSeenAt?.toISOString() || null;
      }
      if (trigger === 'update') {
        const s = session as Record<string, unknown> | undefined;
        if (s?.onboardingCompletedAt) {
          token.onboardingCompletedAt = s.onboardingCompletedAt as string;
        }
        if (s?.orientationSeenAt) {
          token.orientationSeenAt = s.orientationSeenAt as string;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as { role?: string }).role = token.role as string;
        (session.user as unknown as { userId?: string }).userId = token.userId as string;
        (session.user as unknown as { _username?: string })._username = token.username as string;
        (session.user as unknown as { _suspended?: boolean })._suspended = token.status !== 'active';
        (session.user as unknown as { _onboardingCompleted?: boolean })._onboardingCompleted = !!token.onboardingCompletedAt;
        (session.user as unknown as { _orientationSeen?: boolean })._orientationSeen = !!token.orientationSeenAt;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
