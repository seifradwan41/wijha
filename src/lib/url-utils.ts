const SAFE_PROTOCOLS = ['http:', 'https:', 'whatsapp:'];

export function isSafeUrl(url: string | null): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return SAFE_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function sanitizeHref(url: string | null): string | undefined {
  if (!url) return undefined;
  return isSafeUrl(url) ? url : undefined;
}

export function sanitizeCssUrl(url: string | null | undefined): string | undefined {
  if (!url || !isSafeUrl(url)) return undefined;
  if (/[;{}()]/.test(url)) return undefined;
  return url;
}
