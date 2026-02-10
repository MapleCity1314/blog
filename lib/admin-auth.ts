import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth/password";

export const ADMIN_SESSION_COOKIE = "blog_session";

const SESSION_SECRET = "mock-blog-session-secret";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;
const DEFAULT_NEXT_PATH = "/admin/dashboard";

export type AdminAuthState = {
  error?: string;
};

export function sanitizeNextPath(value?: string | null) {
  if (!value) {
    return DEFAULT_NEXT_PATH;
  }

  if (value.startsWith("/admin")) {
    return value;
  }

  return DEFAULT_NEXT_PATH;
}

export async function verifyAdminCredentials(
  username: string,
  password: string
) {
  if (!username || !password) {
    return { ok: false, reason: "missing_fields" as const };
  }

  const record = await db
    .select({
      id: users.id,
      username: users.username,
      passwordHash: users.passwordHash,
      status: users.status,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  const user = record[0];
  if (!user || user.status !== "active" || !user.passwordHash) {
    return { ok: false as const, reason: "invalid_credentials" as const };
  }

  const isValid = verifyPassword(password, user.passwordHash);
  return isValid
    ? { ok: true as const }
    : { ok: false as const, reason: "invalid_credentials" as const };
}

export function createAdminSession(username: string) {
  const issuedAt = Date.now();
  const payload = `${username}:${issuedAt}`;
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function isAdminSessionValid(sessionValue?: string | null) {
  if (!sessionValue) {
    return false;
  }

  const [payload, signature] = sessionValue.split(".");
  if (!payload || !signature) {
    return false;
  }

  if (signPayload(payload) !== signature) {
    return false;
  }

  const [, issuedAtRaw] = payload.split(":");
  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt)) {
    return false;
  }

  const ageSeconds = (Date.now() - issuedAt) / 1000;
  return ageSeconds <= SESSION_MAX_AGE_SECONDS;
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  };
}

function signPayload(payload: string) {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("base64url");
}
