'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function TermsCheck() {
  const router = useRouter();
  const redirecting = useRef(false);

  useEffect(() => {
    if (redirecting.current) return;
    fetch('/api/terms/check')
      .then(r => r.json())
      .then(data => {
        if (data.needsAcceptance) {
          redirecting.current = true;
          router.replace('/terms/pending');
        }
      })
      .catch(() => {});
  }, [router]);

  return null;
}
