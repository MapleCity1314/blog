import { NextRequest, NextResponse } from "next/server";
import {
  getPostEngagementSnapshot,
  incrementPostEngagement,
  type EngagementAction,
} from "@/lib/post-engagement";

function isAction(value: unknown): value is EngagementAction {
  return value === "like" || value === "dislike" || value === "share";
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const engagement = await getPostEngagementSnapshot(slug);
  return NextResponse.json({ slug, engagement });
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

  const engagement = await incrementPostEngagement(slug, action);
  return NextResponse.json({ slug, engagement });
}

