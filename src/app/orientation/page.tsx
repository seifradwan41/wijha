'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const sections = [
  {
    title: 'What this platform is',
    body: `Wijha is a directory connecting students to SAT, ACT, and other tutoring courses across the Middle East. It replaces the old system of searching through scattered WhatsApp groups.

Guests can browse freely without an account — they can explore categories, read teacher profiles, and view courses. Behind the scenes, Teachers, Community Collaborators, and the Admin team manage the content that students see.`,
  },
  {
    title: 'What a Teacher account can do',
    body: `Teachers manage their own presence on the platform:

• Edit their profile — add a bio, teaching style, specialties, and profile photo. A preview is available before publishing.
• Create and publish courses — they control the draft → published toggle themselves. Courses appear publicly once published.
• Create events and news — but these require Admin or Admin Assistant approval before they go live. Teachers submit a draft; you review it.`,
  },
  {
    title: 'What a Community Collaborator can do',
    body: `Community Collaborators help surface courses, events, and news they've found in the community. They can submit requests for new content, but:

• Everything a Collaborator submits requires review by an Admin or Admin Assistant before it goes live.
• They never publish directly — you are the gatekeeper for all collaborator-sourced content.
• They can track the status of their submissions and receive notifications when approved or rejected.`,
  },
  {
    title: 'What YOU (Admin Assistant) can do',
    body: `This is your daily workflow on Wijha:

• Review and approve or reject event/news submissions from Teachers and Community Collaborators. Provide a reason when rejecting.
• Manage Teacher and Collaborator accounts — suspend or delete accounts when needed. A reason is always required.
• View and moderate any course on the platform — unpublish or delete content that violates guidelines.
• Send notifications to Teachers and Collaborators to flag issues or share updates.
• Use the Admin ↔ Assistant chat to coordinate internally. You can attach screenshots and link messages to specific courses or requests.

What you cannot do (Admin-only):
• Manage taxonomy — adding or editing categories, levels, grades, and exam dates.
• Manage other Admin Assistant accounts — only full Admins can create or suspend assistants.`,
  },
];

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--paper)',
  padding: '100px 24px 60px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 18,
  padding: '40px 36px',
  maxWidth: 700,
  width: '100%',
  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
};

export default function OrientationPage() {
  const { update } = useSession();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleDismiss = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/orientation/complete', { method: 'POST' });
      if (!res.ok) { setSaving(false); return; }
      await update({ orientationSeenAt: new Date().toISOString() });
      window.location.href = '/dashboard/admin';
    } catch {
      setSaving(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 600, margin: '0 0 6px', color: 'var(--ink-900)' }}>
          Welcome to Wijha
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-mute)', margin: '0 0 32px', lineHeight: 1.6 }}>
          Here&apos;s a quick overview of how the platform works and what you&apos;ll be doing. Take a few minutes to read through it — you&apos;ll only see this once.
        </p>

        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: i < sections.length - 1 ? 32 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%', background: 'var(--blue)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 13, color: '#fff', flexShrink: 0,
              }}>{i + 1}</span>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, margin: 0, color: 'var(--ink-900)' }}>
                {s.title}
              </h2>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-dark)', lineHeight: 1.7, margin: '0 0 0 40px', whiteSpace: 'pre-line' }}>
              {s.body}
            </p>
          </div>
        ))}

        <div style={{ marginTop: 36, paddingTop: 24, borderTop: '1px solid rgba(27,31,42,0.07)', textAlign: 'right' }}>
          <button onClick={handleDismiss} disabled={saving} style={{
            padding: '12px 28px', borderRadius: 10, border: 'none', background: 'var(--blue)', color: '#fff',
            fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.5 : 1,
          }}>
            {saving ? 'One moment…' : 'Got it, take me to my dashboard'}
          </button>
        </div>
      </div>
    </div>
  );
}
