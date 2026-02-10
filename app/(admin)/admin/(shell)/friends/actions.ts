"use server";

import { revalidatePath } from "next/cache";
import {
  approveFriendRequestById,
  rejectFriendRequestById,
} from "@/lib/friends/store";

export async function approveFriendRequest(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return;
  }

  await approveFriendRequestById(id);
  revalidatePath("/admin/friends");
  revalidatePath("/friends");
}

export async function rejectFriendRequest(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return;
  }

  await rejectFriendRequestById(id);
  revalidatePath("/admin/friends");
}
