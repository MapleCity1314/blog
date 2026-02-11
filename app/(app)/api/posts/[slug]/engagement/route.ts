import { NextRequest, NextResponse } from "next/server";
import {
  getPostEngagementForViewer,
  incrementPostEngagement,
  type EngagementAction,
} from "@/lib/post-engagement";

function isAction(value: unknown): value is EngagementAction {
  return value === "like" || value === "dislike" || value === "share";
}

function getVoterIdentity(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    null
  );
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const voterIdentity = getVoterIdentity(request);
  const result = await getPostEngagementForViewer({ slug, voterIdentity });
  return NextResponse.json({ slug, ...result });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const payload = (await request.json().catch(() => null)) as
    | { action?: string }
    | null;
  const action = payload?.action;

  if (!isAction(action)) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const voterIdentity = getVoterIdentity(request);
  const result = await incrementPostEngagement(slug, action, voterIdentity);
  return NextResponse.json({ slug, ...result });
}
