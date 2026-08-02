import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'healthy' });
  } catch {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Service temporarily unavailable' },
      { status: 503 }
    );
  }
}
