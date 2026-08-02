import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const CreateSubmissionSchema = z.object({
  type: z.string().min(1).max(50),
  payload: z.record(z.string(), z.unknown()),
});

export const GET = withRateLimit(async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json([], { status: 401 });

  const userId = (session.user as Record<string, unknown>)?.userId as string;
  const submissions = await prisma.communityCollaboratorSubmission.findMany({
    where: { submittedBy: userId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(submissions);
});

export const POST = withRateLimit(async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as Record<string, unknown>)?.userId as string;
  const body = await req.json();

  const result = CreateSubmissionSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
  }

  const submission = await prisma.communityCollaboratorSubmission.create({
    data: {
      submittedBy: userId,
      type: result.data.type,
      payload: JSON.stringify(result.data.payload),
      status: 'pending',
    },
  });

  return NextResponse.json(submission);
});
