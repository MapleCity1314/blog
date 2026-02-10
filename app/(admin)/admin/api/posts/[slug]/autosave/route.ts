import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  isAdminSessionValid,
} from "@/lib/admin-auth";
import {
  getAdminPostBySlug,
  readPostAutosave,
  writePostAutosave,
  type AdminPostMetadata,
} from "@/lib/admin/posts";

async function ensureAdminAuth() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? null;
  return isAdminSessionValid(sessionValue);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authorized = await ensureAdminAuth();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const post = await getAdminPostBySlug(slug);
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const snapshot = await readPostAutosave(slug);
  return NextResponse.json({ snapshot });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authorized = await ensureAdminAuth();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const post = await getAdminPostBySlug(slug);
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const body = (await request.json()) as {
    metadata?: AdminPostMetadata;
    content?: string;
  };

  if (!body.metadata || typeof body.content !== "string") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  await writePostAutosave(slug, {
    metadata: body.metadata,
    content: body.content,
    savedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
