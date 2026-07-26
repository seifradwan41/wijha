import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';

export const metadata: Metadata = {
  title: 'Wijha — Every trusted SAT & ACT course, one destination',
  description: 'Find the best SAT and ACT tutors. Browse courses, teachers, events, and news.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <Providers>
          <PublicNav />
          <main>{children}</main>
          <PublicFooter />
        </Providers>
      </body>
    </html>
  );
}
