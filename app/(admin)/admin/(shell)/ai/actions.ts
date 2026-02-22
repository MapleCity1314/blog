"use server";

import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildAdminToastUrl } from "@/lib/admin/toast";
import { hashInviteCode } from "@/lib/ai/invite-session";
import { db } from "@/lib/db";
import { aiInviteCodes } from "@/lib/db/schema";

type AdminToastPayload = Parameters<typeof buildAdminToastUrl>[0];

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function getRedirectTo(formData: FormData) {
  const redirectTo = normalizeText(formData.get("redirect_to"));
  return redirectTo || "/admin/ai";
}

function parseTokenQuota(value: FormDataEntryValue | null) {
  const raw = normalizeText(value);
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return Math.max(0, Math.floor(parsed));
}

function createInviteCode() {
  return `u0-invite-${crypto.randomBytes(6).toString("hex")}`;
}

export type CreateAiInviteCodeState = {
  error?: string;
  createdCode?: string;
};

export async function createAiInviteCode(
  prevState: CreateAiInviteCodeState,
  formData: FormData
): Promise<CreateAiInviteCodeState> {
  void prevState;
  const inviteCode = normalizeText(formData.get("invite_code")) || createInviteCode();
  const label = normalizeText(formData.get("label")) || null;
  const notes = normalizeText(formData.get("notes")) || null;
  const tokenQuota = parseTokenQuota(formData.get("token_quota"));

  if (tokenQuota === null) {
    return { error: "Token quota must be a valid number." };
  }

  if (inviteCode.length < 8) {
    return { error: "Invite code must be at least 8 characters." };
  }

  try {
    await db.insert(aiInviteCodes).values({
      codeHash: hashInviteCode(inviteCode),
      label,
      notes,
      tokenQuota,
      tokensConsumed: 0,
      status: "active",
    });

    revalidatePath("/admin/ai");
    return { createdCode: inviteCode };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return {
      error: message.includes("ai_invite_codes_code_hash_unique")
        ? "Duplicate invite code."
        : message,
    };
  }
}

export async function updateAiInviteStatus(formData: FormData) {
  const redirectTo = getRedirectTo(formData);
  const id = normalizeText(formData.get("id"));
  const statusValue = normalizeText(formData.get("status"));
  const status = statusValue === "disabled" ? "disabled" : statusValue === "active" ? "active" : null;

  if (!id || !status) {
    redirect(
      buildAdminToastUrl({
        path: redirectTo,
        type: "error",
        message: "Status update failed",
        description: "Missing invite id or invalid status.",
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
      .update(aiInviteCodes)
      .set({
        status,
        disabledAt: status === "disabled" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(aiInviteCodes.id, id));

    revalidatePath("/admin/ai");
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

export async function updateAiInviteQuota(formData: FormData) {
  const redirectTo = getRedirectTo(formData);
  const id = normalizeText(formData.get("id"));
  const tokenQuota = parseTokenQuota(formData.get("token_quota"));

  if (!id || tokenQuota === null) {
    redirect(
      buildAdminToastUrl({
        path: redirectTo,
        type: "error",
        message: "Quota update failed",
        description: "Missing invite id or invalid token quota.",
      })
    );
  }

  let toast: AdminToastPayload = {
    path: redirectTo,
    type: "success",
    message: "Token quota updated",
  };

  try {
    await db
      .update(aiInviteCodes)
      .set({
        tokenQuota,
        updatedAt: new Date(),
      })
      .where(eq(aiInviteCodes.id, id));

    revalidatePath("/admin/ai");
  } catch (error) {
    toast = {
      path: redirectTo,
      type: "error",
      message: "Quota update failed",
      description: error instanceof Error ? error.message : "Unexpected error.",
    };
  }

  redirect(buildAdminToastUrl(toast));
}
