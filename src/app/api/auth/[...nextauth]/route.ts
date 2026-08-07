import { handlers } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

const { GET: origGet, POST: origPost } = handlers;

async function rateLimitedPost(req: NextRequest) {
  const { allowed } = await rateLimit(req, {
    windowMs: 15 * 60 * 1000,
    max: 10,
  });
  if (!allowed)
    return NextResponse.json(
      { error: "Too many login attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  return origPost(req);
}

export const GET = origGet;
export const POST = rateLimitedPost;
