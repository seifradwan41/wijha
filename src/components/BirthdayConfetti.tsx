'use client';
import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number; left: number; delay: number; color: string; size: number; drift: number;
}

const COLORS = ['#2E7D8C', '#2F6FED', '#D4A843', '#E84855', '#F5A623', '#9B59B6'];

export default function BirthdayConfetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const items: ConfettiPiece[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 8,
      drift: (Math.random() - 0.5) * 40,
    }));
    setPieces(items);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.left}%`,
          top: -20,
          width: p.size,
          height: p.size * 0.6,
          background: p.color,
          borderRadius: 2,
          animation: `confettiFall ${3 + Math.random() * 2}s linear ${p.delay}s infinite`,
        }} />
      ))}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: '32px 48px',
        textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        fontFamily: 'Fraunces, serif', animation: 'confettiFall 0.5s ease-out',
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>&#127874;</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px', color: 'var(--ink-900)' }}>Happy Birthday!</h2>
        <p style={{ fontSize: 14, color: 'var(--ink-500)', margin: 0 }}>Wishing you an amazing day!</p>
      </div>
    </div>
  );
}
