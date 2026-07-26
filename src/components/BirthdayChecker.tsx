'use client';
import { useEffect, useState } from 'react';
import BirthdayConfetti from '@/components/BirthdayConfetti';

export default function BirthdayChecker() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    fetch('/api/birthday').then(r => r.json()).then(d => {
      if (d.active) setShow(true);
    });
  }, []);

  if (!show) return null;
  return <BirthdayConfetti />;
}
