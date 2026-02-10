import "server-only";

import crypto from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { friendRequests, friends } from "@/lib/db/schema";
import type { Friend, FriendInput } from "@/lib/friends/types";

type AccessRecord = {
  token: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
};

const ACCESS_TTL_MS = 1000 * 60 * 30;

export async function getFriends(): Promise<Friend[]> {
  const rows = await db
    .select({
      id: friends.id,
      name: friends.name,
      avatar: friends.avatar,
      role: friends.role,
      url: friends.url,
      desc: friends.desc,
      color: friends.color,
      createdAt: friends.createdAt,
    })
    .from(friends)
    .where(eq(friends.status, "active"))
    .orderBy(friends.createdAt);

  return rows
    .map((row) => ({
      id: row.id,
      name: row.name,
      avatar: row.avatar ?? "",
      role: row.role ?? "",
      url: row.url,
      desc: row.desc ?? "",
      color: row.color ?? "",
      createdAt: row.createdAt.toISOString(),
    }))
    .reverse();
}

export async function addFriend(input: FriendInput): Promise<Friend> {
  const createdAt = new Date();
  const inserted = await db
    .insert(friends)
    .values({
      name: input.name,
      avatar: input.avatar,
      role: input.role,
      url: input.url,
      desc: input.desc,
      color: input.color,
      status: "active",
      createdAt,
      updatedAt: createdAt,
    })
    .returning({
      id: friends.id,
      name: friends.name,
      avatar: friends.avatar,
      role: friends.role,
      url: friends.url,
      desc: friends.desc,
      color: friends.color,
      createdAt: friends.createdAt,
    });

  const row = inserted[0];
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar ?? "",
    role: row.role ?? "",
    url: row.url,
    desc: row.desc ?? "",
    color: row.color ?? "",
    createdAt: row.createdAt.toISOString(),
  };
}

export type FriendRequestRecord = {
  id: string;
  name: string | null;
  url: string | null;
  avatar: string | null;
  role: string | null;
  desc: string | null;
  color: string | null;
  email: string | null;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  token: string;
  createdAt: Date;
  reviewedAt: Date | null;
  expiresAt: Date;
  usedAt: Date | null;
};

export async function getFriendRequests(): Promise<FriendRequestRecord[]> {
  return db
    .select({
      id: friendRequests.id,
      name: friendRequests.name,
      url: friendRequests.url,
      avatar: friendRequests.avatar,
      role: friendRequests.role,
      desc: friendRequests.desc,
      color: friendRequests.color,
      email: friendRequests.email,
      message: friendRequests.message,
      status: friendRequests.status,
      token: friendRequests.token,
      createdAt: friendRequests.createdAt,
      reviewedAt: friendRequests.reviewedAt,
      expiresAt: friendRequests.expiresAt,
      usedAt: friendRequests.usedAt,
    })
    .from(friendRequests)
    .orderBy(friendRequests.createdAt);
}

export async function createAccessRequest(): Promise<AccessRecord> {
  const token = crypto.randomUUID();
  const createdAt = new Date();
  const expiresAt = new Date(Date.now() + ACCESS_TTL_MS);

  await db.insert(friendRequests).values({
    token,
    status: "pending",
    createdAt,
    expiresAt,
  });

  return {
    token,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

export async function verifyAccessToken(token: string) {
  const records = await db
    .select({
      id: friendRequests.id,
      token: friendRequests.token,
      status: friendRequests.status,
      createdAt: friendRequests.createdAt,
      expiresAt: friendRequests.expiresAt,
      usedAt: friendRequests.usedAt,
    })
    .from(friendRequests)
    .where(eq(friendRequests.token, token))
    .limit(1);

  const record = records[0];
  if (!record) {
    return { ok: false, reason: "not_found" as const };
  }
  if (record.usedAt) {
    return { ok: false, reason: "used" as const };
  }
  if (record.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired" as const };
  }
  if (record.status !== "approved") {
    return { ok: false, reason: "invalid" as const };
  }

  return {
    ok: true,
    record: {
      token: record.token,
      createdAt: record.createdAt.toISOString(),
      expiresAt: record.expiresAt.toISOString(),
      usedAt: undefined,
    },
  };
}

export async function verifyPendingAccessToken(token: string) {
  const records = await db
    .select({
      id: friendRequests.id,
      token: friendRequests.token,
      status: friendRequests.status,
      createdAt: friendRequests.createdAt,
      expiresAt: friendRequests.expiresAt,
      usedAt: friendRequests.usedAt,
      name: friendRequests.name,
      url: friendRequests.url,
    })
    .from(friendRequests)
    .where(eq(friendRequests.token, token))
    .limit(1);

  const record = records[0];
  if (!record) {
    return { ok: false, reason: "not_found" as const };
  }
  if (record.usedAt) {
    return { ok: false, reason: "used" as const };
  }
  if (record.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired" as const };
  }
  if (record.status !== "pending") {
    return { ok: false, reason: "invalid" as const };
  }
  if (record.name || record.url) {
    return { ok: false, reason: "already_submitted" as const };
  }

  return {
    ok: true,
    record: {
      token: record.token,
      createdAt: record.createdAt.toISOString(),
      expiresAt: record.expiresAt.toISOString(),
      usedAt: undefined,
    },
  };
}

export async function approveAccessToken(token: string) {
  const updated = await db
    .update(friendRequests)
    .set({ status: "approved", reviewedAt: new Date() })
    .where(
      and(
        eq(friendRequests.token, token),
        eq(friendRequests.status, "pending"),
        isNull(friendRequests.name),
        isNull(friendRequests.url)
      )
    )
    .returning({ token: friendRequests.token });

  return updated.length > 0;
}

export async function submitFriendRequest(
  token: string,
  input: FriendInput
) {
  const updated = await db
    .update(friendRequests)
    .set({
      name: input.name,
      avatar: input.avatar,
      role: input.role,
      url: input.url,
      desc: input.desc,
      color: input.color,
      status: "pending",
      reviewedAt: null,
      usedAt: new Date(),
    })
    .where(
      and(
        eq(friendRequests.token, token),
        eq(friendRequests.status, "approved"),
        isNull(friendRequests.usedAt)
      )
    )
    .returning({ id: friendRequests.id });

  return updated.length > 0 ? updated[0].id : null;
}

export async function approveFriendRequestById(id: string) {
  return db.transaction(async (tx) => {
    const records = await tx
      .select({
        id: friendRequests.id,
        name: friendRequests.name,
        url: friendRequests.url,
        avatar: friendRequests.avatar,
        role: friendRequests.role,
        desc: friendRequests.desc,
        color: friendRequests.color,
        status: friendRequests.status,
      })
      .from(friendRequests)
      .where(eq(friendRequests.id, id))
      .limit(1);

    const record = records[0];
    if (!record) {
      return { ok: false as const, reason: "not_found" as const };
    }
    if (record.status !== "pending") {
      return { ok: false as const, reason: "invalid_status" as const };
    }

    const now = new Date();
    const shouldCreateFriend = Boolean(record.name && record.url);
    if (shouldCreateFriend) {
      await tx.insert(friends).values({
        name: record.name ?? "",
        url: record.url ?? "",
        avatar: record.avatar ?? "",
        role: record.role ?? "",
        desc: record.desc ?? "",
        color: record.color ?? "",
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
    }

    await tx
      .update(friendRequests)
      .set({ status: "approved", reviewedAt: now })
      .where(eq(friendRequests.id, id));

    return { ok: true as const, createdFriend: shouldCreateFriend };
  });
}

export async function rejectFriendRequestById(id: string) {
  const updated = await db
    .update(friendRequests)
    .set({ status: "rejected", reviewedAt: new Date() })
    .where(eq(friendRequests.id, id))
    .returning({ id: friendRequests.id });

  return updated.length > 0;
}

export async function updateFriendById(
  id: string,
  input: FriendInput
) {
  const updated = await db
    .update(friends)
    .set({
      name: input.name,
      avatar: input.avatar,
      role: input.role,
      url: input.url,
      desc: input.desc,
      color: input.color,
      updatedAt: new Date(),
    })
    .where(eq(friends.id, id))
    .returning({ id: friends.id });

  return updated.length > 0;
}
