'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const [step, setStep] = useState<'welcome' | 'username' | 'password' | 'terms'>('welcome');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsContent, setTermsContent] = useState('');
  const [termsVersion, setTermsVersion] = useState('');
  const [termsId, setTermsId] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const role = (session?.user as Record<string, unknown>)?.role as string;
  const userId = (session?.user as Record<string, unknown>)?.userId as string;

  useEffect(() => {
    const initUsername = (session?.user as Record<string, unknown>)?.name as string || '';
    setUsername(initUsername.toLowerCase().replace(/\s+/g, ''));

    if (role) {
      fetch(`/api/terms/current?role=${role}`)
        .then(r => r.json())
        .then(data => {
          if (data.content) {
            setTermsContent(data.content);
            setTermsVersion(data.versionNumber || '');
            setTermsId(data.id || '');
          }
        })
        .catch(() => {});
    }
  }, [session, role]);

  const handleUsernameChange = async () => {
    if (!username.trim()) { setError('Username is required'); return false; }
    if (username.length < 3) { setError('Username must be at least 3 characters'); return false; }
    setLoading(true); setError('');
    const res = await fetch('/api/onboarding/username', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim() }),
    });
    let data: Record<string, string> = {};
    try { data = await res.json(); } catch { /* empty response */ }
    setLoading(false);
    if (!res.ok) { setError(data.error || 'Failed to update username'); return false; }
    return true;
  };

  const handlePasswordChange = async () => {
    if (!newPassword) { setError('Password is required'); return false; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return false; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return false; }
    setLoading(true); setError('');
    const res = await fetch('/api/onboarding/password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    });
    let pdata: Record<string, string> = {};
    try { pdata = await res.json(); } catch { /* empty response */ }
    setLoading(false);
    if (!res.ok) { setError(pdata.error || 'Failed to update password'); return false; }
    return true;
  };

  const handleAcceptTerms = async () => {
    if (!accepted) { setError('You must accept the terms to proceed'); return; }
    setLoading(true); setError('');
    const res = await fetch('/api/onboarding/complete', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ termsVersion, termsId }),
    });
    let adata: Record<string, string> = {};
    try { adata = await res.json(); } catch { /* empty response */ }
    setLoading(false);
    if (!res.ok) { setError(adata.error || 'Failed to complete onboarding'); return; }
    const dashboardPath = role === 'teacher' ? '/dashboard/teacher'
      : role === 'community_collaborator' ? '/dashboard/collaborator'
      : '/dashboard/admin';
    await signOut({ redirect: false });
    window.location.href = `/login?callbackUrl=${encodeURIComponent(dashboardPath)}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 520, maxWidth: '90vw', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        {error && <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</div>}

        {step === 'welcome' && (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 12 }}>Welcome to Wijha!</h1>
            <p style={{ color: 'var(--ink-500)', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
              We&apos;re glad to have you on board. Let&apos;s get your account set up — this will only take a minute.
            </p>
            <button onClick={() => setStep('username')} style={{ padding: '12px 32px', borderRadius: 10, border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Get Started</button>
          </div>
        )}

        {step === 'username' && (
          <div>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Choose Your Username</h2>
            <p style={{ color: 'var(--ink-500)', fontSize: 14, marginBottom: 20 }}>This is how you&apos;ll log in. You can keep the one we assigned or pick something easier to remember.</p>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14, marginBottom: 20, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={async () => { const ok = await handleUsernameChange(); if (ok) setStep('password'); }} disabled={loading} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>{loading ? 'Saving...' : 'Continue'}</button>
            </div>
          </div>
        )}

        {step === 'password' && (
          <div>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Set Your Password</h2>
            <p style={{ color: 'var(--ink-500)', fontSize: 14, marginBottom: 20 }}>If you want to change the temporary password your admin set, do it now. You can skip this if you prefer.</p>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password (min 6 characters)" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} />
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14, marginBottom: 20, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setStep('terms')} style={{ padding: '10px 24px', borderRadius: 10, border: '1px solid var(--ink-200)', background: '#fff', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>Skip</button>
              <button onClick={async () => { const ok = await handlePasswordChange(); if (ok) setStep('terms'); }} disabled={loading} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>{loading ? 'Saving...' : 'Continue'}</button>
            </div>
          </div>
        )}

        {step === 'terms' && (
          <div>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Terms & Conditions</h2>
            <p style={{ color: 'var(--ink-500)', fontSize: 14, marginBottom: 16 }}>Please review and accept the terms below to continue.</p>
            <div style={{ background: 'var(--paper)', borderRadius: 10, padding: 16, maxHeight: 280, overflow: 'auto', fontSize: 14, lineHeight: 1.7, color: 'var(--ink-700)', marginBottom: 16, whiteSpace: 'pre-wrap' }}>
              {termsContent || 'No terms content available. You may proceed.'}
            </div>

            <div style={{ background: 'rgba(47,111,237,0.08)', border: '1px solid rgba(47,111,237,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: 'var(--ink-700)', lineHeight: 1.6 }}>
              <strong>🔵 Beta Notice:</strong> Wijha is still in beta.{' '}
              {role === 'admin_assistant'
                ? 'If you face any issues or have suggestions, please contact the admin directly.'
                : 'If you face any issues or have suggestions, please reach out via the Chat on your dashboard.'}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer', marginBottom: 20 }}>
              <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} style={{ width: 18, height: 18 }} />
              I have read and accept the terms & conditions
            </label>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={handleAcceptTerms} disabled={loading || !accepted} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: loading || !accepted ? 0.5 : 1 }}>{loading ? 'Saving...' : 'Accept & Continue'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
