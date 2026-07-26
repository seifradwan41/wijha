'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CollaboratorOverview() {
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });

  useEffect(() => {
    fetch('/api/collaborator/submissions').then(r => r.json()).then((items: { status: string }[]) => {
      setStats({
        pending: items.filter(i => i.status === 'pending').length,
        approved: items.filter(i => i.status === 'approved').length,
        rejected: items.filter(i => i.status === 'rejected').length,
        total: items.length,
      });
    });
  }, []);

  const cards = [
    { label: 'Pending', value: stats.pending, color: '#f59e0b' },
    { label: 'Approved', value: stats.approved, color: '#10b981' },
    { label: 'Rejected', value: stats.rejected, color: '#ef4444' },
    { label: 'Total', value: stats.total, color: 'var(--blue)' },
  ];

  return (
    <div>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 8 }}>Welcome back!</h1>
      <p style={{ color: 'var(--ink-500)', fontSize: 15, marginBottom: 32 }}>Submit courses, events, or news you&apos;ve found in WhatsApp groups for the Wijha team to review and publish.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 14, padding: '24px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{c.label}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Link href="/dashboard/collaborator/submit" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 24px', borderRadius: 12, background: 'var(--blue)', color: '#fff', fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
          + Submit New Content
        </Link>
        <Link href="/dashboard/collaborator/submissions" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 24px', borderRadius: 12, background: '#fff', color: 'var(--ink-900)', fontWeight: 600, fontSize: 15, textDecoration: 'none', border: '1px solid var(--ink-200)' }}>
          View My Submissions
        </Link>
      </div>
    </div>
  );
}
