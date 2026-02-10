"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { resources } from "@/lib/db/schema";
import { buildAdminToastUrl } from "@/lib/admin/toast";

type AdminToastPayload = Parameters<typeof buildAdminToastUrl>[0];

const STATUS_VALUES = ["draft", "published", "archived"] as const;

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function normalizeStatus(value: FormDataEntryValue | null) {
  const status = normalizeText(value) as (typeof STATUS_VALUES)[number];
  return STATUS_VALUES.includes(status) ? status : null;
}

function getRedirectTo(formData: FormData) {
  const redirectTo = normalizeText(formData.get("redirect_to"));
  return redirectTo || "/admin/resources";
}

export async function createResource(formData: FormData) {
  const redirectTo = getRedirectTo(formData);
  const title = normalizeText(formData.get("title"));
  const url = normalizeText(formData.get("url"));
  const description = normalizeText(formData.get("description"));
  const category = normalizeText(formData.get("category"));
  const status = normalizeStatus(formData.get("status")) ?? "draft";

  if (!title || !url) {
    redirect(
      buildAdminToastUrl({
        path: redirectTo,
        type: "error",
        message: "Create failed",
        description: "Title and URL are required.",
      })
    );
  }

  let toast: AdminToastPayload = {
    path: redirectTo,
    type: "success",
    message: "Resource created",
  };

  try {
    await db.insert(resources).values({
      title,
      url,
      description: description || null,
      category: category || null,
      status,
    });

    revalidatePath("/admin/resources");
    revalidatePath("/resources");
  } catch (error) {
    toast = {
      path: redirectTo,
      type: "error",
      message: "Create failed",
      description: error instanceof Error ? error.message : "Unexpected error.",
    };
  }

  redirect(buildAdminToastUrl(toast));
}

export async function updateResource(formData: FormData) {
  const redirectTo = getRedirectTo(formData);
  const id = normalizeText(formData.get("id"));
  if (!id) {
    redirect(
      buildAdminToastUrl({
        path: redirectTo,
        type: "error",
        message: "Update failed",
        description: "Missing resource id.",
      })
    );
  }

  const title = normalizeText(formData.get("title"));
  const url = normalizeText(formData.get("url"));
  const description = normalizeText(formData.get("description"));
  const category = normalizeText(formData.get("category"));
  const status = normalizeStatus(formData.get("status"));

  if (!title || !url || !status) {
    redirect(
      buildAdminToastUrl({
        path: redirectTo,
        type: "error",
        message: "Update failed",
        description: "Title, URL, and status are required.",
      })
    );
  }

  let toast: AdminToastPayload = {
    path: redirectTo,
    type: "success",
    message: "Resource updated",
  };

  try {
    await db
      .update(resources)
      .set({
        title,
        url,
        description: description || null,
        category: category || null,
        status,
        updatedAt: new Date(),
      })
      .where(eq(resources.id, id));

    revalidatePath("/admin/resources");
    revalidatePath("/resources");
  } catch (error) {
    toast = {
      path: redirectTo,
      type: "error",
      message: "Update failed",
      description: error instanceof Error ? error.message : "Unexpected error.",
    };
  }

  redirect(buildAdminToastUrl(toast));
}

export async function updateResourceStatus(formData: FormData) {
  const redirectTo = getRedirectTo(formData);
  const id = normalizeText(formData.get("id"));
  const status = normalizeStatus(formData.get("status"));
  if (!id || !status) {
    redirect(
      buildAdminToastUrl({
        path: redirectTo,
        type: "error",
        message: "Status update failed",
        description: "Missing resource id or status.",
      })
    );
  }

  let toast: AdminToastPayload = {
    path: redirectTo,
    type: "success",
    message: `Status set to ${status}`,
  };

  try {
    await db
      .update(resources)
      .set({ status, updatedAt: new Date() })
      .where(eq(resources.id, id));

    revalidatePath("/admin/resources");
    revalidatePath("/resources");
  } catch (error) {
    toast = {
      path: redirectTo,
      type: "error",
      message: "Status update failed",
      description: error instanceof Error ? error.message : "Unexpected error.",
    };
  }

  redirect(buildAdminToastUrl(toast));
}

export async function deleteResource(formData: FormData) {
  const redirectTo = getRedirectTo(formData);
  const id = normalizeText(formData.get("id"));
  if (!id) {
    redirect(
      buildAdminToastUrl({
        path: redirectTo,
        type: "error",
        message: "Delete failed",
        description: "Missing resource id.",
      })
    );
  }

  let toast: AdminToastPayload = {
    path: redirectTo,
    type: "success",
    message: "Resource deleted",
  };

  try {
    await db.delete(resources).where(eq(resources.id, id));

    revalidatePath("/admin/resources");
    revalidatePath("/resources");
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
