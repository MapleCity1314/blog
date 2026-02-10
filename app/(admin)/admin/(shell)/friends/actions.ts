"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  approveFriendRequestById,
  updateFriendById,
  rejectFriendRequestById,
} from "@/lib/friends/store";
import { buildAdminToastUrl } from "@/lib/admin/toast";

type AdminToastPayload = Parameters<typeof buildAdminToastUrl>[0];

function getRedirectTo(formData: FormData) {
  const redirectTo = String(formData.get("redirect_to") ?? "").trim();
  return redirectTo || "/admin/friends";
}

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function approveFriendRequest(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const redirectTo = getRedirectTo(formData);
  if (!id) {
    redirect(
      buildAdminToastUrl({
        path: redirectTo,
        type: "error",
        message: "Approval failed",
        description: "Missing request id.",
      })
    );
  }

  let toast: AdminToastPayload = {
    path: redirectTo,
    type: "success",
    message: "Request approved",
  };

  try {
    await approveFriendRequestById(id);
    revalidatePath("/admin/friends");
    revalidatePath("/friends");
  } catch (error) {
    toast = {
      path: redirectTo,
      type: "error",
      message: "Approval failed",
      description: error instanceof Error ? error.message : "Unexpected error.",
    };
  }

  redirect(buildAdminToastUrl(toast));
}

export async function rejectFriendRequest(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const redirectTo = getRedirectTo(formData);
  if (!id) {
    redirect(
      buildAdminToastUrl({
        path: redirectTo,
        type: "error",
        message: "Rejection failed",
        description: "Missing request id.",
      })
    );
  }

  let toast: AdminToastPayload = {
    path: redirectTo,
    type: "success",
    message: "Request rejected",
  };

  try {
    await rejectFriendRequestById(id);
    revalidatePath("/admin/friends");
  } catch (error) {
    toast = {
      path: redirectTo,
      type: "error",
      message: "Rejection failed",
      description: error instanceof Error ? error.message : "Unexpected error.",
    };
  }

  redirect(buildAdminToastUrl(toast));
}

export async function updateFriend(formData: FormData) {
  const id = normalizeText(formData.get("id"));
  const redirectTo = getRedirectTo(formData);
  if (!id) {
    redirect(
      buildAdminToastUrl({
        path: redirectTo,
        type: "error",
        message: "Save failed",
        description: "Missing friend id.",
      })
    );
  }

  const payload = {
    name: normalizeText(formData.get("name")),
    avatar: normalizeText(formData.get("avatar")),
    role: normalizeText(formData.get("role")),
    url: normalizeText(formData.get("url")),
    desc: normalizeText(formData.get("desc")),
    color: normalizeText(formData.get("color")),
  };

  if (!payload.name || !payload.url || !payload.avatar) {
    redirect(
      buildAdminToastUrl({
        path: redirectTo,
        type: "error",
        message: "Save failed",
        description: "Name, URL and avatar are required.",
      })
    );
  }

  try {
    new URL(payload.url);
    new URL(payload.avatar);
  } catch {
    redirect(
      buildAdminToastUrl({
        path: redirectTo,
        type: "error",
        message: "Save failed",
        description: "URL format is invalid.",
      })
    );
  }

  let toast: AdminToastPayload = {
    path: redirectTo,
    type: "success",
    message: "Friend updated",
  };

  try {
    const ok = await updateFriendById(id, payload);
    if (!ok) {
      toast = {
        path: redirectTo,
        type: "error",
        message: "Save failed",
        description: "Friend not found.",
      };
    } else {
      revalidatePath("/admin/friends");
      revalidatePath("/friends");
    }
  } catch (error) {
    toast = {
      path: redirectTo,
      type: "error",
      message: "Save failed",
      description: error instanceof Error ? error.message : "Unexpected error.",
    };
  }

  redirect(buildAdminToastUrl(toast));
}
