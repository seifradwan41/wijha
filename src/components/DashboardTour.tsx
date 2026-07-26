'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface TourStep {
  target: string;
  title: string;
  description: string;
  placement?: 'right' | 'bottom' | 'left' | 'top';
}

interface Props {
  steps: TourStep[];
  storageKey: string;
}

export default function DashboardTour({ steps, storageKey }: Props) {
  const { data: session } = useSession();
  const userId = (session?.user as Record<string, unknown>)?.userId as string;
  const [active, setActive] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [highlight, setHighlight] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const fullKey = userId ? `${storageKey}_${userId}` : storageKey;

  useEffect(() => {
    if (!userId) return;
    const seen = localStorage.getItem(fullKey);
    if (!seen) {
      const t = setTimeout(() => setActive(true), 800);
      return () => clearTimeout(t);
    }
  }, [fullKey, userId]);

  const positionHighlight = useCallback(() => {
    if (!active || stepIdx >= steps.length) return;
    const sel = steps[stepIdx].target;
    const el = document.querySelector(sel) as HTMLElement | null;
    if (!el) { setHighlight(null); return; }
    const r = el.getBoundingClientRect();
    setHighlight({ top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height });
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [active, stepIdx, steps]);

  useEffect(() => { positionHighlight(); }, [positionHighlight]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
      if (e.key === 'ArrowRight' || e.key === 'Enter') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const finish = () => { setActive(false); localStorage.setItem(fullKey, '1'); };
  const next = () => { if (stepIdx < steps.length - 1) setStepIdx(stepIdx + 1); else finish(); };
  const prev = () => { if (stepIdx > 0) setStepIdx(stepIdx - 1); };

  const restart = () => { localStorage.removeItem(fullKey); setStepIdx(0); setActive(true); };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__restartTour = restart;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return () => { delete (window as any).__restartTour; };
  });

  if (!active || stepIdx >= steps.length) return null;

  const step = steps[stepIdx];
  const placement = step.placement || 'right';

  const getTooltipStyle = (): React.CSSProperties => {
    if (!highlight) return { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 10001 };
    const gap = 16;
    const base: React.CSSProperties = { position: 'absolute', zIndex: 10001, maxWidth: 320, width: 300 };
    switch (placement) {
      case 'right': return { ...base, top: highlight.top, left: highlight.left + highlight.width + gap };
      case 'left': return { ...base, top: highlight.top, left: highlight.left - 300 - gap };
      case 'bottom': return { ...base, top: highlight.top + highlight.height + gap, left: highlight.left };
      case 'top': return { ...base, top: highlight.top - 160 - gap, left: highlight.left };
    }
  };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000 }} onClick={finish} />
      {highlight && (
        <div style={{ position: 'absolute', top: highlight.top - 4, left: highlight.left - 4, width: highlight.width + 8, height: highlight.height + 8, border: '3px solid var(--blue)', borderRadius: 10, zIndex: 10000, pointerEvents: 'none', boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' }} />
      )}
      <div ref={tooltipRef} style={{ ...getTooltipStyle(), background: '#fff', borderRadius: 14, boxShadow: '0 8px 30px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Step {stepIdx + 1} of {steps.length}
            </span>
            <button onClick={finish} style={{ background: 'none', border: 'none', fontSize: 18, color: 'var(--ink-400)', cursor: 'pointer', lineHeight: 1, padding: 0 }}>&times;</button>
          </div>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 600, color: 'var(--ink-900)', margin: '0 0 6px' }}>{step.title}</h3>
          <p style={{ fontSize: 14, color: 'var(--ink-500)', lineHeight: 1.6, margin: 0 }}>{step.description}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', borderTop: '1px solid var(--ink-100)', background: 'var(--ink-50, #fafafa)' }}>
          <button onClick={prev} disabled={stepIdx === 0} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--ink-200)', background: '#fff', fontSize: 13, cursor: stepIdx === 0 ? 'default' : 'pointer', opacity: stepIdx === 0 ? 0.4 : 1 }}>Back</button>
          <div style={{ display: 'flex', gap: 6 }}>
            {steps.map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i === stepIdx ? 'var(--blue)' : 'var(--ink-200)' }} />
            ))}
          </div>
          <button onClick={next} style={{ padding: '6px 16px', borderRadius: 8, border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            {stepIdx === steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </>
  );
}
