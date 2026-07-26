import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rate-limit';

export const PATCH = withRateLimit(async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== 'admin' && role !== 'admin_assistant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { id, status, rejectionReason } = body;

  if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });

  const userId = (session.user as Record<string, unknown>)?.userId as string;

  const submission = await prisma.communityCollaboratorSubmission.update({
    where: { id },
    data: {
      status,
      reviewedBy: userId,
      rejectionReason: rejectionReason || null,
    },
  });

  if (status === 'approved') {
    let payload: Record<string, string> = {};
    try { payload = JSON.parse(submission.payload); } catch {}

    if (submission.type === 'course') {
      let teacherId = payload.teacherId;
      if (!teacherId) {
        const teacher = await prisma.user.create({
          data: {
            role: 'teacher',
            name: payload.teacherName || 'Unknown Teacher',
            contact: payload.contact || null,
            status: 'active',
            createdBy: userId,
          },
        });
        teacherId = teacher.id;
      }

      await prisma.course.create({
        data: {
          teacherId,
          title: payload.title || 'Untitled Course',
          description: payload.description || '',
          category: payload.category || 'SAT',
          subcategory: payload.subcategory || 'Other',
          level: payload.level || 'Beginner',
          targetGrades: [],
          schedule: payload.schedule || '',
          status: 'published',
          createdBy: submission.submittedBy,
        },
      });
    } else {
      let teacherId = payload.teacherId;
      if (!teacherId) {
        const teacher = await prisma.user.create({
          data: {
            role: 'teacher',
            name: payload.teacherName || 'Unknown Teacher',
            contact: payload.contact || null,
            status: 'active',
            createdBy: userId,
          },
        });
        teacherId = teacher.id;
      }

      await prisma.eventNews.create({
        data: {
          teacherId,
          type: submission.type === 'event' ? 'event' : 'news',
          title: payload.title || 'Untitled',
          description: payload.description || '',
          relatedAction: payload.relatedAction || null,
          status: 'published',
        },
      });
    }
  }

  return NextResponse.json(submission);
});
