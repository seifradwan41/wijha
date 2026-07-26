'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function PendingTermsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [termsContent, setTermsContent] = useState('');
  const [termsVersion, setTermsVersion] = useState('');
  const [termsId, setTermsId] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [needsAcceptance, setNeedsAcceptance] = useState(false);
  const role = (session?.user as Record<string, unknown>)?.role as string;

  useEffect(() => {
    fetch('/api/terms/check')
      .then(r => r.json())
      .then(data => {
        if (!data.needsAcceptance) {
          const dashboardMap: Record<string, string> = {
            teacher: '/dashboard/teacher',
            admin: '/dashboard/admin',
            admin_assistant: '/dashboard/admin',
            community_collaborator: '/dashboard/collaborator',
          };
          router.replace(dashboardMap[role] || '/dashboard');
          return;
        }
        setNeedsAcceptance(true);
        setLoading(false);
        return fetch(`/api/terms/current?role=${role}`);
      })
      .then(r => r?.json())
      .then(data => {
        if (data?.content) {
          setTermsContent(data.content);
          setTermsVersion(data.versionNumber || '');
          setTermsId(data.id || '');
        }
      })
      .catch(() => setLoading(false));
  }, [role, router]);

  const handleAccept = async () => {
    if (!accepted) { setError('You must accept the terms to proceed'); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/onboarding/complete', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ termsVersion, termsId }),
    });
    let data: Record<string, string> = {};
    try { data = await res.json(); } catch { /* empty response */ }
    setSaving(false);
    if (!res.ok) { setError(data.error || 'Failed to save'); return; }
    const dashboardMap: Record<string, string> = {
      teacher: '/dashboard/teacher',
      admin: '/dashboard/admin',
      admin_assistant: '/dashboard/admin',
      community_collaborator: '/dashboard/collaborator',
    };
    await update({ onboardingCompletedAt: new Date().toISOString() });
    window.location.href = dashboardMap[role] || '/dashboard';
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}><p style={{ color: 'var(--ink-500)' }}>Loading...</p></div>;
  if (!needsAcceptance) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 520, maxWidth: '90vw', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Updated Terms & Conditions</h2>
        <p style={{ color: 'var(--ink-500)', fontSize: 14, marginBottom: 16 }}>A new version of the terms has been published. Please review and accept to continue.</p>
        {error && <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <div style={{ background: 'var(--paper)', borderRadius: 10, padding: 16, maxHeight: 320, overflow: 'auto', fontSize: 14, lineHeight: 1.7, color: 'var(--ink-700)', marginBottom: 16, whiteSpace: 'pre-wrap' }}>
          {termsContent || 'No terms content available. You may proceed.'}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer', marginBottom: 20 }}>
          <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} style={{ width: 18, height: 18 }} />
          I have read and accept the updated terms & conditions
        </label>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleAccept} disabled={saving || !accepted} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: saving || !accepted ? 0.5 : 1 }}>{saving ? 'Saving...' : 'Accept & Continue'}</button>
        </div>
      </div>
    </div>
  );
}
