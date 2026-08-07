import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withRateLimit } from "@/lib/rate-limit";

export const GET = withRateLimit(async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json([], { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== "admin" && role !== "admin_assistant")
    return NextResponse.json([], { status: 403 });

  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get("teacherId");
  if (!teacherId)
    return NextResponse.json({ error: "teacherId required" }, { status: 400 });

  const courses = await prisma.course.findMany({
    where: { teacherId },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          whatsappContact: true,
          avatarPhoto: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(courses);
});

export const POST = withRateLimit(async function POST(req: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== "admin" && role !== "admin_assistant")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const userId = (session.user as Record<string, unknown>)?.userId as string;
  const body = await req.json();
  if (!body.teacherId)
    return NextResponse.json({ error: "teacherId required" }, { status: 400 });

  const course = await prisma.course.create({
    data: {
      teacherId: body.teacherId,
      title: body.title,
      description: body.description || "",
      category: body.category,
      subcategory: body.subcategory,
      level: body.level,
      targetGrades: body.targetGrades || [],
      targetExamDate: body.targetExamDate || null,
      schedule: body.schedule || "",
      estimatedGroupSize: body.estimatedGroupSize || 6,
      sessionCount: body.sessionCount || 20,
      price: body.price || null,
      contactForPrice: body.contactForPrice || false,
      status: body.status || "draft",
      createdBy: userId,
    },
  });
  return NextResponse.json(course);
});

export const PATCH = withRateLimit(async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== "admin" && role !== "admin_assistant")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const {
    id,
    title,
    description,
    category,
    subcategory,
    level,
    targetGrades,
    targetExamDate,
    schedule,
    estimatedGroupSize,
    sessionCount,
    price,
    contactForPrice,
    status,
  } = body;
  const course = await prisma.course.update({
    where: { id },
    data: {
      title,
      description,
      category,
      subcategory,
      level,
      targetGrades,
      targetExamDate,
      schedule,
      estimatedGroupSize,
      sessionCount,
      price,
      contactForPrice,
      status,
    },
  });
  return NextResponse.json(course);
});

export const DELETE = withRateLimit(async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as Record<string, unknown>)?.role as string;
  if (role !== "admin" && role !== "admin_assistant")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  await prisma.course.delete({ where: { id: body.id } });
  return NextResponse.json({ ok: true });
});
