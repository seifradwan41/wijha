import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin' && role !== 'admin_assistant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const birthdayAssistant = await prisma.user.findFirst({ where: { role: 'admin_assistant', birthdayModeActive: true }, select: { name: true } });
  return NextResponse.json({ active: !!birthdayAssistant, name: birthdayAssistant?.name || null });
}
