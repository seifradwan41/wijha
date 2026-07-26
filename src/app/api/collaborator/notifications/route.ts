import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json([]);
  const userId = (session.user as Record<string, unknown>)?.userId as string;
  const notifications = await prisma.notification.findMany({ where: { recipientId: userId }, include: { sender: { select: { name: true } } }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(notifications);
}
