import Link from 'next/link';
import { getSetting } from '@/lib/platform-settings';

export default async function PrivacyPage() {
  const wa = await getSetting('support_whatsapp');
  return (
    <>
      <div className="page-header">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / <span>Privacy Policy</span>
        </div>
        <h1>Privacy Policy</h1>
      </div>

      <section className="block" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ padding: '14px 20px', borderRadius: 10, background: '#fef3c7', color: '#92400e', fontSize: 13, fontWeight: 500, marginBottom: 32 }}>
          Draft — pending legal review, not final.
        </div>

        <div className="fact-panel" style={{ lineHeight: 1.8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div>
              <h2 style={{ fontSize: 18, margin: '0 0 12px' }}>1. What data is collected</h2>
              <div style={{ color: 'var(--text-dark)', fontSize: 15, margin: 0 }}>
                <p style={{ margin: '0 0 8px' }}><strong>Guests:</strong> No personal data required to browse the platform. No account or login is needed to view public pages.</p>
                <p style={{ margin: '0 0 8px' }}><strong>Teachers:</strong> Name, contact/WhatsApp number, bio, photos, course details, and profile information.</p>
                <p style={{ margin: '0 0 8px' }}><strong>Community Collaborators:</strong> Name, contact information, and submitted content.</p>
                <p style={{ margin: '0 0 8px' }}><strong>Admin and Admin Assistant:</strong> Name, contact information, and login activity (last login, login history).</p>
                <p style={{ margin: 0 }}><strong>Automatically:</strong> Basic technical data (IP address, browser type) may be collected for rate limiting and security purposes.</p>
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: 18, margin: '0 0 12px' }}>2. Why data is collected</h2>
              <p style={{ color: 'var(--text-dark)', fontSize: 15, margin: 0 }}>Data is collected to operate the directory (display teacher profiles and courses), allow account management, and send in-platform notifications.</p>
            </div>
            <div>
              <h2 style={{ fontSize: 18, margin: '0 0 12px' }}>3. Who can see what</h2>
              <div style={{ color: 'var(--text-dark)', fontSize: 15, margin: 0 }}>
                <p style={{ margin: '0 0 8px' }}>Teacher profiles, photos, and contact information are <strong>public by design</strong> — visible to any visitor to the platform.</p>
                <p style={{ margin: 0 }}>Admin and Assistant-facing data (watch-word logs, chat threads, login history) is internal-only and not publicly visible.</p>
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: 18, margin: '0 0 12px' }}>4. Minors&apos; data</h2>
              <p style={{ color: 'var(--text-dark)', fontSize: 15, margin: 0 }}>The platform&apos;s target audience includes students in grades 9–12 (approximately ages 14–18). Legal review should determine what disclosures or safeguards are required under applicable data protection laws, given that accounts are admin-created rather than self-registered by minors.</p>
            </div>
            <div>
              <h2 style={{ fontSize: 18, margin: '0 0 12px' }}>5. Data storage and security</h2>
              <div style={{ color: 'var(--text-dark)', fontSize: 15, margin: 0 }}>
                <p style={{ margin: '0 0 8px' }}>Data is hosted on Neon (PostgreSQL database) and Cloudinary (image hosting).</p>
                <p style={{ margin: '0 0 8px' }}>Security measures include: password hashing with bcrypt, rate limiting on authentication and API routes, role-based access control, and server-side input validation.</p>
                <p style={{ margin: 0 }}>All data is transmitted over HTTPS.</p>
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: 18, margin: '0 0 12px' }}>6. Data retention and deletion</h2>
              <p style={{ color: 'var(--text-dark)', fontSize: 15, margin: 0 }}>Data is retained for as long as an account is active. Teachers and collaborators may request data removal by contacting us on <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener" style={{ fontWeight: 600, color: 'var(--blue)' }}>WhatsApp</a>. Requests will be routed to the Admin for processing.</p>
            </div>
            <div>
              <h2 style={{ fontSize: 18, margin: '0 0 12px' }}>7. Third parties</h2>
              <div style={{ color: 'var(--text-dark)', fontSize: 15, margin: 0 }}>
                <p style={{ margin: '0 0 8px' }}><strong>Cloudinary</strong> — image hosting for teacher photos and event images.</p>
                <p style={{ margin: 0 }}><strong>Neon</strong> — PostgreSQL database hosting.</p>
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: 18, margin: '0 0 12px' }}>8. User rights</h2>
              <p style={{ color: 'var(--text-dark)', fontSize: 15, margin: 0 }}>Users have the right to access, correct, or request deletion of their personal data. To exercise these rights, contact us on <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener" style={{ fontWeight: 600, color: 'var(--blue)' }}>WhatsApp</a>.</p>
            </div>
            <div>
              <h2 style={{ fontSize: 18, margin: '0 0 12px' }}>9. Cookies</h2>
              <p style={{ color: 'var(--text-dark)', fontSize: 15, margin: 0 }}>Session cookies are used for login authentication. No tracking or analytics cookies are currently in use.</p>
            </div>
            <div>
              <h2 style={{ fontSize: 18, margin: '0 0 12px' }}>10. Contact</h2>
              <p style={{ color: 'var(--text-dark)', fontSize: 15, margin: 0 }}>For questions about this privacy policy, contact us on <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener" style={{ fontWeight: 600, color: 'var(--blue)' }}>WhatsApp</a>.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
