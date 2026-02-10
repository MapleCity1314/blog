import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  isAdminSessionValid,
} from "@/lib/admin-auth";
import {
  deletePostImage,
  getAdminPostBySlug,
  listPostImages,
  renamePostImage,
  savePostImage,
} from "@/lib/admin/posts";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

async function ensureAdminAuth() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? null;
  return isAdminSessionValid(sessionValue);
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

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing image file." }, { status: 400 });
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Unsupported image type." }, { status: 400 });
  }

  const uploaded = await savePostImage(slug, file);
  return NextResponse.json({
    ok: true,
    url: uploaded.markdownPath,
    markdown: `![](${uploaded.markdownPath})`,
  });
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

  const assets = await listPostImages(slug);
  return NextResponse.json({ assets });
}

export async function PATCH(
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

  const body = (await request.json()) as { oldName?: string; newName?: string };
  const renamed = await renamePostImage(
    slug,
    String(body.oldName ?? ""),
    String(body.newName ?? "")
  );
  if (!renamed) {
    return NextResponse.json({ error: "Rename failed." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, ...renamed });
}

export async function DELETE(
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

  const body = (await request.json()) as { name?: string };
  await deletePostImage(slug, String(body.name ?? ""));
  return NextResponse.json({ ok: true });
}
