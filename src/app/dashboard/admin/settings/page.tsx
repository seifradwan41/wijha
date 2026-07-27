'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const [number, setNumber] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings/support-whatsapp')
      .then(r => r.json())
      .then(d => { setNumber(d.number); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/admin/settings/support-whatsapp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, margin: '0 0 24px' }}>Platform Settings</h2>

      <div className="fact-panel" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>Support WhatsApp Number</h3>
        <p style={{ fontSize: 13, color: 'var(--text-mute)', margin: '0 0 16px' }}>
          This number appears across the public site (fund page, terms, privacy) as the contact method. Visitors will be linked to <strong>wa.me/{number || '...'}</strong>
        </p>

        <input
          type="text"
          placeholder="e.g. 966501234567"
          value={number}
          onChange={e => setNumber(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            fontSize: 15,
            fontFamily: 'IBM Plex Mono, monospace',
            boxSizing: 'border-box',
          }}
        />
        <div style={{ fontSize: 12, color: 'var(--text-mute)', marginTop: 6 }}>
          International format, no + or spaces. Example: <strong>966501234567</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
            style={{ padding: '8px 24px' }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          {saved && <span style={{ fontSize: 13, color: 'var(--teal)' }}>Saved</span>}
        </div>
      </div>
    </div>
  );
}
