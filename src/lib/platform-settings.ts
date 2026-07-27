import { prisma } from './prisma';

const cache = new Map<string, { value: string; ts: number }>();
const TTL = 30_000; // 30s

export async function getSetting(key: string): Promise<string> {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < TTL) return cached.value;
  const setting = await prisma.platformSetting.findUnique({ where: { key } });
  const value = setting?.value || '';
  cache.set(key, { value, ts: Date.now() });
  return value;
}

export async function setSetting(key: string, value: string): Promise<string> {
  const setting = await prisma.platformSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  cache.set(key, { value: setting.value, ts: Date.now() });
  return setting.value;
}
