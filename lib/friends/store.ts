import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { Friend, FriendInput } from "@/lib/friends/types";

type AccessRecord = {
  token: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
};

type AccessStore = {
  records: AccessRecord[];
};

const FRIENDS_FILE = path.join(process.cwd(), "content", "friends.json");
const ACCESS_FILE = path.join(process.cwd(), "content", "friends-access.json");
const OUTBOX_FILE = path.join(process.cwd(), "content", "friends-access-outbox.json");
const ACCESS_TTL_MS = 1000 * 60 * 30;

async function ensureContentDir() {
  await fs.mkdir(path.join(process.cwd(), "content"), { recursive: true });
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile<T>(filePath: string, payload: T) {
  await ensureContentDir();
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2));
}

export async function getFriends(): Promise<Friend[]> {
  const friends = await readJsonFile<Friend[]>(FRIENDS_FILE, []);
  return friends.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addFriend(input: FriendInput): Promise<Friend> {
  const friends = await readJsonFile<Friend[]>(FRIENDS_FILE, []);
  const createdAt = new Date().toISOString();
  const nextFriend: Friend = {
    id: crypto.randomUUID(),
    ...input,
    createdAt,
  };
  friends.push(nextFriend);
  await writeJsonFile(FRIENDS_FILE, friends);
  return nextFriend;
}

export async function createAccessRequest() {
  const store = await readJsonFile<AccessStore>(ACCESS_FILE, { records: [] });
  const token = crypto.randomUUID();
  const record: AccessRecord = {
    token,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + ACCESS_TTL_MS).toISOString(),
  };
  store.records.push(record);
  await writeJsonFile(ACCESS_FILE, store);
  return record;
}

export async function verifyAccessToken(token: string) {
  const store = await readJsonFile<AccessStore>(ACCESS_FILE, { records: [] });
  const record = store.records.find((item) => item.token === token);
  if (!record) {
    return { ok: false, reason: "not_found" as const };
  }
  if (record.usedAt) {
    return { ok: false, reason: "used" as const };
  }
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    return { ok: false, reason: "expired" as const };
  }
  return { ok: true, record };
}

export async function consumeAccessToken(token: string) {
  const store = await readJsonFile<AccessStore>(ACCESS_FILE, { records: [] });
  const record = store.records.find((item) => item.token === token);
  if (!record) {
    return false;
  }
  record.usedAt = new Date().toISOString();
  await writeJsonFile(ACCESS_FILE, store);
  return true;
}

export async function writeAccessOutbox(payload: { to: string; confirmUrl: string; token: string }) {
  const outbox = await readJsonFile<
    { to: string; confirmUrl: string; token: string; createdAt: string }[]
  >(OUTBOX_FILE, []);
  outbox.push({ ...payload, createdAt: new Date().toISOString() });
  await writeJsonFile(OUTBOX_FILE, outbox);
}
