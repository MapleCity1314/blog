"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { resources } from "@/lib/db/schema";

const STATUS_VALUES = ["draft", "published", "archived"] as const;

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function normalizeStatus(value: FormDataEntryValue | null) {
  const status = normalizeText(value) as (typeof STATUS_VALUES)[number];
  return STATUS_VALUES.includes(status) ? status : null;
}

export async function createResource(formData: FormData) {
  const title = normalizeText(formData.get("title"));
  const url = normalizeText(formData.get("url"));
  const description = normalizeText(formData.get("description"));
  const category = normalizeText(formData.get("category"));
  const status = normalizeStatus(formData.get("status")) ?? "draft";

  if (!title || !url) {
    return;
  }

  await db.insert(resources).values({
    title,
    url,
    description: description || null,
    category: category || null,
    status,
  });

  revalidatePath("/admin/resources");
  revalidatePath("/resources");
}

export async function updateResource(formData: FormData) {
  const id = normalizeText(formData.get("id"));
  if (!id) return;

  const title = normalizeText(formData.get("title"));
  const url = normalizeText(formData.get("url"));
  const description = normalizeText(formData.get("description"));
  const category = normalizeText(formData.get("category"));
  const status = normalizeStatus(formData.get("status"));

  if (!title || !url || !status) {
    return;
  }

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
}

export async function updateResourceStatus(formData: FormData) {
  const id = normalizeText(formData.get("id"));
  const status = normalizeStatus(formData.get("status"));
  if (!id || !status) return;

  await db
    .update(resources)
    .set({ status, updatedAt: new Date() })
    .where(eq(resources.id, id));

  revalidatePath("/admin/resources");
  revalidatePath("/resources");
}

export async function deleteResource(formData: FormData) {
  const id = normalizeText(formData.get("id"));
  if (!id) return;

  await db.delete(resources).where(eq(resources.id, id));

  revalidatePath("/admin/resources");
  revalidatePath("/resources");
}
