const SEP = '::';

export function qualifySub(category: string, subName: string): string {
  return `${category}${SEP}${subName}`;
}

export function parseQualified(qualified: string): { category: string; name: string } | null {
  const idx = qualified.indexOf(SEP);
  if (idx === -1) return null;
  return { category: qualified.slice(0, idx), name: qualified.slice(idx + SEP.length) };
}

export function displaySub(qualified: string): string {
  const p = parseQualified(qualified);
  return p ? p.name : qualified;
}

export function matchesSub(qualified: string, sub: string): boolean {
  return qualified === sub || qualified.endsWith(`${SEP}${sub}`);
}
