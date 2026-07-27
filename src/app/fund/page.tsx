import Link from 'next/link';
import { getSetting } from '@/lib/platform-settings';

export default async function FundPage() {
  const wa = await getSetting('support_whatsapp');
  return (
    <>
      <div className="page-header">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / <span>Fund Us</span>
        </div>
        <h1>Support Wijha</h1>
        <p>Help us keep the platform running and free for every student.</p>
      </div>

      <section className="block" style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className="fact-panel">
          <h2 style={{ fontSize: 20, margin: '0 0 16px' }}>Why contribute?</h2>
          <p style={{ color: 'var(--text-mute)', fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
            Wijha is built to help students find the right teacher without relying on scattered WhatsApp groups.
            Your contribution helps us maintain the platform, verify teachers, and keep the directory accurate
            and up to date.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-dark)' }}>
              <span style={{ color: 'var(--teal)' }}>&#10003;</span> Keep the platform running and free to use
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-dark)' }}>
              <span style={{ color: 'var(--teal)' }}>&#10003;</span> Support teacher verification and directory accuracy
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-dark)' }}>
              <span style={{ color: 'var(--teal)' }}>&#10003;</span> Fund new features like search filters and event tracking
            </div>
          </div>
          <div style={{ padding: '24px 28px', borderRadius: 12, background: 'linear-gradient(135deg, #065f46, #047857)', color: '#fff', textAlign: 'center' }}>
            <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 8px' }}>Want to help? Get in touch on WhatsApp</p>
            <p style={{ fontSize: 13, opacity: 0.85, margin: '0 0 16px' }}>
              Contribution options coming soon. For now, reach out to us directly and we&apos;ll coordinate with you.
            </p>
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noopener"
              style={{
                display: 'inline-block',
                padding: '10px 32px',
                borderRadius: 8,
                background: '#fff',
                color: '#065f46',
                fontWeight: 600,
                fontSize: 15,
                textDecoration: 'none',
              }}
            >
              Contact us on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
