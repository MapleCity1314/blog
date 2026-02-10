"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildAdminToastUrl } from "@/lib/admin/toast";
import { updateCommentStatusById } from "@/lib/admin/comments";

type AdminToastPayload = Parameters<typeof buildAdminToastUrl>[0];

function getRedirectTo(formData: FormData) {
  const redirectTo = String(formData.get("redirect_to") ?? "").trim();
  return redirectTo || "/admin/comments";
}

function getStatus(formData: FormData) {
  const status = String(formData.get("status") ?? "").trim();
  if (status === "visible" || status === "hidden" || status === "deleted") {
    return status;
  }
  return null;
}

export async function updateCommentStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const status = getStatus(formData);
  const redirectTo = getRedirectTo(formData);

  if (!id || !status) {
    redirect(
      buildAdminToastUrl({
        path: redirectTo,
        type: "error",
        message: "Update failed",
        description: "Missing comment id or status.",
      })
    );
  }

  let toast: AdminToastPayload = {
    path: redirectTo,
    type: "success",
    message: "Comment updated",
  };

  try {
    const ok = await updateCommentStatusById(id, status);
    if (!ok) {
      toast = {
        path: redirectTo,
        type: "error",
        message: "Update failed",
        description: "Comment not found.",
      };
    } else {
      revalidatePath("/admin/comments");
      revalidatePath("/admin/dashboard");
    }
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

