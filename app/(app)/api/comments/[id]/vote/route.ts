import { NextRequest, NextResponse } from "next/server";
import { voteCommentById, type CommentVoteAction } from "@/lib/post-engagement";

function isAction(value: unknown): value is CommentVoteAction {
  return value === "like" || value === "dislike";
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const payload = (await request.json().catch(() => null)) as
    | { action?: string }
    | null;
  const action = payload?.action;

  if (!isAction(action)) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const updated = await voteCommentById(id, action);
  if (!updated) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }

  return NextResponse.json({ id, ...updated });
}

