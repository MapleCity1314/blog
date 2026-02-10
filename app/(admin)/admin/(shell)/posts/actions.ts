"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearPostAutosave,
  deleteAdminPost,
  getAdminPostBySlug,
  renameAdminPost,
  setAdminPostPublished,
  writeAdminPost,
  type AdminPostMetadata,
} from "@/lib/admin/posts";

export type PostActionState = {
  error?: string;
};

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function parseTags(value: string) {
  if (!value) return [];
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parsePublished(formData: FormData) {
  const intent = normalizeText(formData.get("intent"));
  if (intent === "publish") return true;
  if (intent === "draft") return false;
  return formData.get("published") === "on";
}

function buildMetadata(formData: FormData): AdminPostMetadata {
  const title = normalizeText(formData.get("title"));
  const date =
    normalizeText(formData.get("date")) || new Date().toISOString().split("T")[0];
  const description = normalizeText(formData.get("description"));
  const tags = parseTags(normalizeText(formData.get("tags")));
  const cover = normalizeText(formData.get("cover"));

  return {
    title,
    date,
    description,
    tags,
    published: parsePublished(formData),
    cover: cover || undefined,
  };
}

export async function createDraft(
  _prevState: PostActionState,
  formData: FormData
): Promise<PostActionState> {
  const title = normalizeText(formData.get("title"));
  const slugRaw = normalizeText(formData.get("slug"));
  const slug = slugify(slugRaw || title);

  if (!title) {
    return { error: "Title is required." };
  }
  if (!slug) {
    return { error: "Slug is required." };
  }

  const existing = await getAdminPostBySlug(slug);
  if (existing) {
    return { error: "Slug already exists. Choose a different one." };
  }

  const metadata: AdminPostMetadata = {
    title,
    date: new Date().toISOString().split("T")[0],
    description: "",
    tags: [],
    published: false,
  };
  await writeAdminPost(slug, metadata, "Write your post...\n");

  revalidatePath("/posts");
  revalidatePath("/");
  redirect(`/admin/posts/${slug}`);
}

export async function updatePost(
  _prevState: PostActionState,
  formData: FormData
): Promise<PostActionState> {
  const originalSlug = normalizeText(formData.get("original_slug"));
  const slugRaw = normalizeText(formData.get("slug"));
  const slug = slugify(slugRaw || originalSlug);
  const content = String(formData.get("content") ?? "");

  if (!originalSlug) {
    return { error: "Missing original slug." };
  }
  if (!slug) {
    return { error: "Slug is required." };
  }

  if (slug !== originalSlug) {
    const existing = await getAdminPostBySlug(slug);
    if (existing) {
      return { error: "Slug already exists. Choose a different one." };
    }
    await renameAdminPost(originalSlug, slug);
  }

  const metadata = buildMetadata(formData);
  await writeAdminPost(slug, metadata, content);
  await clearPostAutosave(slug);

  revalidatePath("/posts");
  revalidatePath(`/posts/${slug}`);
  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${slug}`);
  redirect(`/admin/posts/${slug}`);
}

export async function removePost(formData: FormData) {
  const slug = normalizeText(formData.get("slug"));
  if (!slug) return;

  await deleteAdminPost(slug);
  await clearPostAutosave(slug);
  revalidatePath("/posts");
  revalidatePath("/");
  revalidatePath("/admin/posts");
}

export async function publishPost(formData: FormData) {
  const slug = normalizeText(formData.get("slug"));
  if (!slug) return;
  await setAdminPostPublished(slug, true);
  revalidatePath("/posts");
  revalidatePath(`/posts/${slug}`);
  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${slug}`);
}

export async function unpublishPost(formData: FormData) {
  const slug = normalizeText(formData.get("slug"));
  if (!slug) return;
  await setAdminPostPublished(slug, false);
  revalidatePath("/posts");
  revalidatePath(`/posts/${slug}`);
  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${slug}`);
}
