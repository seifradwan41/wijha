import Link from 'next/link';
import { getSetting } from '@/lib/platform-settings';

export default async function TermsPage() {
  const wa = await getSetting('support_whatsapp');
  return (
    <>
      <div className="page-header">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / <span>Terms &amp; Conditions</span>
        </div>
        <h1>Terms &amp; Conditions</h1>
      </div>

      <section className="block" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ padding: '14px 20px', borderRadius: 10, background: '#fef3c7', color: '#92400e', fontSize: 13, fontWeight: 500, marginBottom: 32 }}>
          Draft — pending legal review, not final.
        </div>

        <div className="fact-panel" style={{ lineHeight: 1.8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div>
              <h2 style={{ fontSize: 18, margin: '0 0 12px' }}>1. What Wijha is</h2>
              <p style={{ color: 'var(--text-dark)', fontSize: 15, margin: 0 }}>Wijha is a directory and discovery platform for SAT and ACT tutoring courses. It is not a party to any enrollment, payment, or teaching arrangement, which occur directly between students and teachers via WhatsApp.</p>
            </div>
            <div>
              <h2 style={{ fontSize: 18, margin: '0 0 12px' }}>2. Eligibility</h2>
              <p style={{ color: 'var(--text-dark)', fontSize: 15, margin: 0 }}>The platform is available to students, parents, and guardians seeking tutoring courses. Users under 18 should have parental or guardian awareness of their use of the platform. Account creation for teachers and community collaborators is admin-initiated rather than self-registered.</p>
            </div>
            <div>
              <h2 style={{ fontSize: 18, margin: '0 0 12px' }}>3. Accounts</h2>
              <p style={{ color: 'var(--text-dark)', fontSize: 15, margin: 0 }}>Teacher and Community Collaborator accounts are created only by an Admin or Admin Assistant. Account holders are responsible for the accuracy of information they submit, including course details, photos, and descriptions.</p>
            </div>
            <div>
              <h2 style={{ fontSize: 18, margin: '0 0 12px' }}>4. Content submitted by teachers and collaborators</h2>
              <p style={{ color: 'var(--text-dark)', fontSize: 15, margin: 0 }}>Teachers and collaborators are responsible for the accuracy of course details, photos, and descriptions they provide. Wijha may remove or unpublish content that violates these terms, contains misleading information, or is otherwise deemed inappropriate for the platform.</p>
            </div>
            <div>
              <h2 style={{ fontSize: 18, margin: '0 0 12px' }}>5. No liability for course quality, scheduling, refunds, or disputes</h2>
              <p style={{ color: 'var(--text-dark)', fontSize: 15, margin: 0 }}>Since enrollment happens off-platform (via WhatsApp), Wijha is not responsible for a teacher&apos;s conduct, a course&apos;s quality, cancellations, scheduling changes, or payment disputes between students and teachers.</p>
            </div>
            <div>
              <h2 style={{ fontSize: 18, margin: '0 0 12px' }}>6. Intellectual property</h2>
              <p style={{ color: 'var(--text-dark)', fontSize: 15, margin: 0 }}>Teacher photos and materials remain the property of the teacher or rights holder. Using the platform to submit content implies a license for Wijha to display it as part of the directory, not a transfer of ownership.</p>
            </div>
            <div>
              <h2 style={{ fontSize: 18, margin: '0 0 12px' }}>7. Suspension and termination</h2>
              <p style={{ color: 'var(--text-dark)', fontSize: 15, margin: 0 }}>Wijha may suspend or remove any account for violating these terms, providing false information, or misuse of the platform. Suspended accounts lose access to the platform immediately.</p>
            </div>
            <div>
              <h2 style={{ fontSize: 18, margin: '0 0 12px' }}>8. Governing law</h2>
              <p style={{ color: 'var(--text-dark)', fontSize: 15, margin: 0 }}>To be determined by legal review based on the operating entity&apos;s jurisdiction.</p>
            </div>
            <div>
              <h2 style={{ fontSize: 18, margin: '0 0 12px' }}>9. Changes to these terms</h2>
              <p style={{ color: 'var(--text-dark)', fontSize: 15, margin: 0 }}>Updates to these terms will be posted on this page. Continued use of the platform after changes are posted constitutes acceptance of the modified terms.</p>
            </div>
            <div>
              <h2 style={{ fontSize: 18, margin: '0 0 12px' }}>10. Contact</h2>
              <p style={{ color: 'var(--text-dark)', fontSize: 15, margin: 0 }}>For questions about these terms, contact us on <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener" style={{ fontWeight: 600, color: 'var(--blue)' }}>WhatsApp</a>.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
