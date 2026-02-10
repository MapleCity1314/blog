import { NextRequest, NextResponse } from "next/server";
import { createPostComment, listPostComments } from "@/lib/post-engagement";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const comments = await listPostComments(slug);
  return NextResponse.json({ slug, comments });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const payload = (await request.json().catch(() => null)) as
    | { author?: string; content?: string; parentId?: string | null }
    | null;

  const content = payload?.content?.trim() ?? "";
  if (!content) {
    return NextResponse.json({ error: "Comment content is required." }, { status: 400 });
  }

  try {
    const comment = await createPostComment({
      slug,
      content,
      author: payload?.author,
      parentId: payload?.parentId ?? null,
    });
    return NextResponse.json({ slug, comment }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create comment.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

