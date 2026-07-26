import Link from 'next/link';

export default function FundPage() {
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
          <div style={{ padding: '20px 24px', borderRadius: 12, background: 'var(--paper)', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--text-mute)', margin: 0 }}>
              Contribution options coming soon. For now, reach out to us at <strong>support@wijha.com</strong> to learn how you can help.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
