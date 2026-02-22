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
import { buildAdminToastUrl } from "@/lib/admin/toast";

type AdminToastPayload = Parameters<typeof buildAdminToastUrl>[0];

export type PostActionState = {
  error?: string;
};

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function readFormField(
  formData: FormData,
  preferredName: string,
  fallbackName: string
) {
  const preferred = formData.get(preferredName);
  if (preferred !== null) {
    return normalizeText(preferred);
  }
  return normalizeText(formData.get(fallbackName));
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

  const explicit = normalizeText(formData.get("published")).toLowerCase();
  if (explicit === "on" || explicit === "true" || explicit === "1") return true;
  if (explicit === "off" || explicit === "false" || explicit === "0") return false;

  const current = normalizeText(formData.get("current_published")).toLowerCase();
  return current === "true" || current === "1" || current === "on";
}

function buildMetadata(formData: FormData): AdminPostMetadata {
  const title = readFormField(formData, "studio_title", "title");
  const date =
    readFormField(formData, "studio_date", "date") || new Date().toISOString().split("T")[0];
  const description = readFormField(formData, "studio_description", "description");
  const tags = parseTags(readFormField(formData, "studio_tags", "tags"));
  const cover = readFormField(formData, "studio_cover", "cover");

  return {
    title,
    date,
    description,
    tags,
    published: parsePublished(formData),
    cover: cover || undefined,
  };
}

function getRedirectTo(formData: FormData, fallback: string) {
  const redirectTo = normalizeText(formData.get("redirect_to"));
  return redirectTo || fallback;
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
  redirect(
    buildAdminToastUrl({
      path: `/admin/posts/${slug}`,
      type: "success",
      message: "Draft created",
    })
  );
}

export async function updatePost(
  _prevState: PostActionState,
  formData: FormData
): Promise<PostActionState> {
  const originalSlug = normalizeText(formData.get("original_slug"));
  const slugRaw = readFormField(formData, "studio_slug", "slug");
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
  redirect(
    buildAdminToastUrl({
      path: `/admin/posts/${slug}`,
      type: "success",
      message: metadata.published ? "Post published" : "Draft saved",
    })
  );
}

export async function removePost(formData: FormData) {
  const redirectTo = getRedirectTo(formData, "/admin/posts");
  const slug = normalizeText(formData.get("slug"));
  if (!slug) {
    redirect(
      buildAdminToastUrl({
        path: redirectTo,
        type: "error",
        message: "Delete failed",
        description: "Missing post slug.",
      })
    );
  }

  let toast: AdminToastPayload = {
    path: redirectTo,
    type: "success",
    message: "Post deleted",
  };

  try {
    await deleteAdminPost(slug);
    await clearPostAutosave(slug);
    revalidatePath("/posts");
    revalidatePath("/");
    revalidatePath("/admin/posts");
  } catch (error) {
    toast = {
      path: redirectTo,
      type: "error",
      message: "Delete failed",
      description: error instanceof Error ? error.message : "Unexpected error.",
    };
  }

  redirect(buildAdminToastUrl(toast));
}

export async function publishPost(formData: FormData) {
  const slug = normalizeText(formData.get("slug"));
  const redirectTo = getRedirectTo(formData, slug ? `/admin/posts/${slug}` : "/admin/posts");
  if (!slug) {
    redirect(
      buildAdminToastUrl({
        path: redirectTo,
        type: "error",
        message: "Publish failed",
        description: "Missing post slug.",
      })
    );
  }
  let toast: AdminToastPayload = {
    path: redirectTo,
    type: "success",
    message: "Post published",
  };

  try {
    await setAdminPostPublished(slug, true);
    revalidatePath("/posts");
    revalidatePath(`/posts/${slug}`);
    revalidatePath("/admin/posts");
    revalidatePath(`/admin/posts/${slug}`);
  } catch (error) {
    toast = {
      path: redirectTo,
      type: "error",
      message: "Publish failed",
      description: error instanceof Error ? error.message : "Unexpected error.",
    };
  }

  redirect(buildAdminToastUrl(toast));
}

export async function unpublishPost(formData: FormData) {
  const slug = normalizeText(formData.get("slug"));
  const redirectTo = getRedirectTo(formData, slug ? `/admin/posts/${slug}` : "/admin/posts");
  if (!slug) {
    redirect(
      buildAdminToastUrl({
        path: redirectTo,
        type: "error",
        message: "Unpublish failed",
        description: "Missing post slug.",
      })
    );
  }
  let toast: AdminToastPayload = {
    path: redirectTo,
    type: "success",
    message: "Post moved to draft",
  };

  try {
    await setAdminPostPublished(slug, false);
    revalidatePath("/posts");
    revalidatePath(`/posts/${slug}`);
    revalidatePath("/admin/posts");
    revalidatePath(`/admin/posts/${slug}`);
  } catch (error) {
    toast = {
      path: redirectTo,
      type: "error",
      message: "Unpublish failed",
      description: error instanceof Error ? error.message : "Unexpected error.",
    };
  }

  redirect(buildAdminToastUrl(toast));
}
