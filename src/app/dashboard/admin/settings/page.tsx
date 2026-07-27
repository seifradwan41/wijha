'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

const roles = [
  { value: 'teacher', label: 'Teachers' },
  { value: 'community_collaborator', label: 'Collaborators' },
  { value: 'admin_assistant', label: 'Admin Assistants' },
];

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const role = (session?.user as Record<string, unknown> | undefined)?.role as string;
  const isAdmin = role === 'admin';

  const [number, setNumber] = useState('');
  const [waSaved, setWaSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Mobile warning
  const [mobileWarn, setMobileWarn] = useState(false);
  const [mwSaving, setMwSaving] = useState(false);
  const [mwSaved, setMwSaved] = useState(false);

  // Broadcast
  const [bcMessage, setBcMessage] = useState('');
  const [bcRoles, setBcRoles] = useState<string[]>([]);
  const [bcExpiry, setBcExpiry] = useState('');
  const [bcEnabled, setBcEnabled] = useState(false);
  const [bcSaving, setBcSaving] = useState(false);
  const [bcSaved, setBcSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/settings/support-whatsapp').then(r => r.json()),
      fetch('/api/settings/mobile-warning').then(r => r.json()),
      fetch('/api/settings/broadcast').then(r => r.json()),
    ]).then(([wa, mw, bc]) => {
      setNumber(wa.number || '');
      setMobileWarn(mw.enabled);
      if (bc) {
        setBcMessage(bc.message || '');
        setBcRoles(bc.roles || []);
        setBcEnabled(true);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSaveWa = async () => {
    setSaving(true); setWaSaved(false);
    const res = await fetch('/api/admin/settings/support-whatsapp', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number }),
    });
    if (res.ok) setWaSaved(true);
    setSaving(false);
  };

  const handleSaveMw = async () => {
    setMwSaving(true); setMwSaved(false);
    const res = await fetch('/api/admin/settings/support-whatsapp', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'mobile_warning_enabled', value: String(mobileWarn) }),
    });
    if (res.ok) setMwSaved(true);
    setMwSaving(false);
  };

  const handleSaveBc = async () => {
    setBcSaving(true); setBcSaved(false);
    const data = {
      message: bcMessage,
      roles: bcRoles,
      expiresAt: bcExpiry || null,
      enabled: bcEnabled,
      id: Date.now().toString(),
    };
    // Store via generic upsert to PlatformSetting
    await fetch('/api/admin/settings/support-whatsapp', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'broadcast_message', value: JSON.stringify(data) }),
    });
    setBcSaved(true);
    setBcSaving(false);
  };

  const toggleBcRole = (r: string) => {
    setBcRoles(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
  };

  if (loading) return <div style={{ padding: 40, color: 'var(--text-mute)' }}>Loading...</div>;

  const bcActive = bcMessage && bcRoles.length > 0;

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, margin: '0 0 24px' }}>Platform Settings</h2>

      {/* WhatsApp */}
      <div className="fact-panel" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>Support WhatsApp Number</h3>
        <p style={{ fontSize: 13, color: 'var(--text-mute)', margin: '0 0 16px' }}>
          This number appears across the public site as the contact method.
        </p>
        <input type="text" placeholder="e.g. 966501234567" value={number}
          onChange={e => setNumber(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 15, fontFamily: 'IBM Plex Mono, monospace', boxSizing: 'border-box' }} />
        <div style={{ fontSize: 12, color: 'var(--text-mute)', marginTop: 6 }}>International format, no + or spaces.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
          <button onClick={handleSaveWa} disabled={saving} className="btn-primary" style={{ padding: '8px 24px' }}>{saving ? 'Saving...' : 'Save'}</button>
          {waSaved && <span style={{ fontSize: 13, color: 'var(--teal)' }}>Saved</span>}
        </div>
      </div>

      {/* Mobile Warning Toggle */}
      <div className="fact-panel" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>Mobile Warning Banner</h3>
            <p style={{ fontSize: 13, color: 'var(--text-mute)', margin: 0 }}>
              Show a dismissible notice on mobile devices warning that the dashboard is best viewed on desktop. Users can dismiss it for 24 hours.
            </p>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, flexShrink: 0, marginTop: 2 }}>
            <input type="checkbox" checked={mobileWarn} onChange={e => setMobileWarn(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }} />
            <span onClick={() => { setMwSaved(false); setMobileWarn(!mobileWarn); }}
              style={{ position: 'absolute', cursor: 'pointer', inset: 0, borderRadius: 24, background: mobileWarn ? '#10b981' : '#d1d5db', transition: 'background 0.2s' }}>
              <span style={{ position: 'absolute', top: 2, left: mobileWarn ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
            </span>
          </label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
          <button onClick={handleSaveMw} disabled={mwSaving} className="btn-primary" style={{ padding: '8px 24px' }}>{mwSaving ? 'Saving...' : 'Save'}</button>
          {mwSaved && <span style={{ fontSize: 13, color: 'var(--teal)' }}>Saved</span>}
        </div>
      </div>

      {/* Broadcast Message (admin only) */}
      {isAdmin && (
        <div className="fact-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>Broadcast Message</h3>
          <p style={{ fontSize: 13, color: 'var(--text-mute)', margin: '0 0 16px' }}>
            Send an app-wide message to selected user roles. Users see it as a banner and can dismiss it permanently.
          </p>

          <textarea value={bcMessage} onChange={e => setBcMessage(e.target.value)}
            placeholder="e.g. We are experiencing a temporary issue with course images. Please bear with us."
            style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, fontFamily: 'Inter, sans-serif', resize: 'vertical', boxSizing: 'border-box' }} />

          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mute)', display: 'block', marginBottom: 6 }}>Target roles</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {roles.map(r => (
                <button key={r.value} onClick={() => toggleBcRole(r.value)}
                  style={{ padding: '6px 14px', borderRadius: 100, border: '1px solid', fontSize: 13, cursor: 'pointer', background: bcRoles.includes(r.value) ? 'var(--blue)' : '#fff', color: bcRoles.includes(r.value) ? '#fff' : 'var(--ink-600)', borderColor: bcRoles.includes(r.value) ? 'var(--blue)' : 'var(--ink-200)' }}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mute)', display: 'block', marginBottom: 4 }}>Expiry (optional)</label>
            <input type="datetime-local" value={bcExpiry} onChange={e => setBcExpiry(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, fontFamily: 'Inter, sans-serif' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
            <button onClick={handleSaveBc} disabled={bcSaving} className="btn-primary" style={{ padding: '8px 24px' }}>{bcSaving ? 'Saving...' : 'Send Broadcast'}</button>
            {bcSaved && <span style={{ fontSize: 13, color: 'var(--teal)' }}>{bcActive ? 'Broadcast active' : 'Broadcast cleared'}</span>}
          </div>
          {bcActive && (
            <div style={{ fontSize: 12, color: 'var(--text-mute)', marginTop: 8 }}>
              Live preview: <strong style={{ color: '#1e40af' }}>📢 {bcMessage}</strong> → visible to {bcRoles.map(r => roles.find(x => x.value === r)?.label).join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
