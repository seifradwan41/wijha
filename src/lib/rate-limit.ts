type RateLimitEntry = { count: number; resetAt: number };

const store = new Map<string, RateLimitEntry>();

function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return '127.0.0.1';
}

export function rateLimit(req: Request, { windowMs, max }: { windowMs: number; max: number }): { allowed: boolean; remaining: number } {
  const ip = getClientIp(req);
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }

  entry.count++;
  if (entry.count > max) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: max - entry.count };
}

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
      if (now > entry.resetAt) store.delete(key);
    });
  }, 5 * 60 * 1000);
}

import { NextResponse } from 'next/server';

type AnyHandler = (...args: never[]) => Promise<NextResponse> | NextResponse;

export function withRateLimit<T extends (...args: never[]) => Promise<NextResponse> | NextResponse>(handler: T, opts: { windowMs?: number; max?: number } = {}): T {
  const windowMs = opts.windowMs ?? 60 * 1000;
  const max = opts.max ?? 60;
  const wrapped = (...args: Parameters<T>) => {
    const req = args[0] as Request;
    const { allowed } = rateLimit(req, { windowMs, max });
    if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded. Try again shortly.' }, { status: 429 });
    return handler(...args);
  };
  return wrapped as unknown as T;
}
