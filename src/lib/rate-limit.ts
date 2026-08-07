import { NextResponse } from "next/server";

// --- Upstash Redis (production on Vercel) ---
let upstashLimit:
  ((key: string) => Promise<{ allowed: boolean; remaining: number }>) | null =
  null;

if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  // Lazy import — only loads in prod when env vars exist
  import("@upstash/ratelimit").then(({ Ratelimit }) => {
    import("@upstash/redis").then(({ Redis }) => {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
      const rl = new Ratelimit({
        redis,
        limiter: Ratelimit.fixedWindow(10, "60 s"),
        analytics: false,
      });
      upstashLimit = async (key: string) => {
        const result = await rl.limit(key);
        return { allowed: result.success, remaining: result.remaining };
      };
    });
  });
}

// --- In-memory fallback (local dev only) ---
type Entry = { count: number; resetAt: number };
const memStore = new Map<string, Entry>();

if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const now = Date.now();
      memStore.forEach((e, k) => {
        if (now > e.resetAt) memStore.delete(k);
      });
    },
    5 * 60 * 1000
  );
}

function memLimit(
  key: string,
  max: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = memStore.get(key);
  if (!entry || now > entry.resetAt) {
    memStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }
  entry.count++;
  if (entry.count > max) return { allowed: false, remaining: 0 };
  return { allowed: true, remaining: max - entry.count };
}

// --- Shared ---
function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const ip = xff.split(",")[0].trim();
    if (/^[\d.:a-f]+$/.test(ip)) return ip;
  }
  return "127.0.0.1";
}

export async function rateLimit(
  req: Request,
  { windowMs, max }: { windowMs: number; max: number }
): Promise<{ allowed: boolean; remaining: number }> {
  const ip = getClientIp(req);
  if (upstashLimit) return upstashLimit(ip);
  return memLimit(ip, max, windowMs);
}

type AnyHandler = (...args: never[]) => Promise<NextResponse> | NextResponse;

export function withRateLimit<
  T extends (...args: never[]) => Promise<NextResponse> | NextResponse,
>(handler: T, opts: { windowMs?: number; max?: number } = {}): T {
  const windowMs = opts.windowMs ?? 60 * 1000;
  const max = opts.max ?? 10;
  const wrapped = async (...args: Parameters<T>) => {
    const req = args[0] as Request;
    const { allowed } = await rateLimit(req, { windowMs, max });
    if (!allowed)
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again shortly." },
        { status: 429 }
      );
    return handler(...args);
  };
  return wrapped as unknown as T;
}
