import "server-only";

import crypto from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { aiChatSessions, aiInviteCodes } from "@/lib/db/schema";

const INVITE_SESSION_COOKIE = "ai_invite_session";
const INVITE_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;
const INVITE_CODE_SECRET = process.env.AI_INVITE_CODE_SECRET ?? "blog-ai-invite-code-secret";
const INVITE_SESSION_SECRET =
  process.env.AI_INVITE_SESSION_SECRET ?? "blog-ai-invite-session-secret";

type InviteSessionRecord = {
  expiresAt: Date;
  inviteLabel: string | null;
};
export type InviteSessionAuthContext = {
  sessionId: string;
  inviteCodeId: string;
  expiresAt: Date;
  inviteLabel: string | null;
  tokenQuota: number;
  tokensConsumed: number;
};

type VerifyInviteSuccess = { ok: true; inviteCodeId: string };
type VerifyInviteFailure = {
  ok: false;
  reason: "invalid_invite_code" | "invite_code_disabled" | "invite_code_exhausted";
};
type VerifyInviteResult = VerifyInviteSuccess | VerifyInviteFailure;

export type CreateInviteSessionResult =
  | {
      ok: true;
      sessionToken: string;
      expiresAt: Date;
      inviteLabel: string | null;
    }
  | VerifyInviteFailure;

/**
 * Validate invite session token and return public-safe session details.
 */
export async function getInviteSessionByToken(
  sessionToken?: string | null
): Promise<InviteSessionRecord | null> {
  const row = await loadInviteSessionRow(sessionToken);
  if (!row) {
    return null;
  }

  return {
    expiresAt: row.expiresAt,
    inviteLabel: row.inviteLabel ?? null,
  };
}

/**
 * Validate invite session token and return internal auth context for protected APIs.
 */
export async function getInviteSessionAuthContext(
  sessionToken?: string | null
): Promise<InviteSessionAuthContext | null> {
  const row = await loadInviteSessionRow(sessionToken);
  if (!row) {
    return null;
  }

  return {
    sessionId: row.sessionId,
    inviteCodeId: row.inviteCodeId,
    expiresAt: row.expiresAt,
    inviteLabel: row.inviteLabel ?? null,
    tokenQuota: Number(row.tokenQuota),
    tokensConsumed: Number(row.tokensConsumed),
  };
}

/**
 * Verify invite code and create a new 24-hour invite session.
 */
export async function createInviteSession(
  inviteCode: string,
  previousSessionToken?: string | null
): Promise<CreateInviteSessionResult> {
  const verification = await verifyInviteCode(inviteCode);
  if (!verification.ok) {
    return verification;
  }

  const sessionToken = createSessionToken();
  const sessionTokenHash = hashSessionToken(sessionToken);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + INVITE_SESSION_MAX_AGE_SECONDS * 1000);
  const previousSessionTokenHash = previousSessionToken
    ? hashSessionToken(previousSessionToken)
    : null;

  const created = await db.transaction(async (tx) => {
    if (previousSessionTokenHash) {
      await tx
        .update(aiChatSessions)
        .set({
          revokedAt: now,
          updatedAt: now,
        })
        .where(
          and(
            eq(aiChatSessions.sessionTokenHash, previousSessionTokenHash),
            isNull(aiChatSessions.revokedAt)
          )
        );
    }

    await tx
      .insert(aiChatSessions)
      .values({
        inviteCodeId: verification.inviteCodeId,
        sessionTokenHash,
        expiresAt,
      });

    const updatedInviteCode = await tx
      .update(aiInviteCodes)
      .set({
        lastUsedAt: now,
        updatedAt: now,
      })
      .where(eq(aiInviteCodes.id, verification.inviteCodeId))
      .returning({
        label: aiInviteCodes.label,
      });

    return updatedInviteCode[0]?.label ?? null;
  });

  return {
    ok: true,
    sessionToken,
    expiresAt,
    inviteLabel: created,
  };
}

/**
 * Revoke a previously issued invite session token.
 */
export async function revokeInviteSession(sessionToken?: string | null) {
  if (!sessionToken) {
    return;
  }

  const sessionTokenHash = hashSessionToken(sessionToken);
  const now = new Date();
  await db
    .update(aiChatSessions)
    .set({
      revokedAt: now,
      updatedAt: now,
    })
    .where(
      and(
        eq(aiChatSessions.sessionTokenHash, sessionTokenHash),
        isNull(aiChatSessions.revokedAt)
      )
    );
}

/**
 * Name of the HTTP-only cookie used for invite session auth.
 */
export function getInviteSessionCookieName() {
  return INVITE_SESSION_COOKIE;
}

/**
 * Cookie options for an active invite session.
 */
export function getInviteSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: INVITE_SESSION_MAX_AGE_SECONDS,
    path: "/",
  };
}

/**
 * Cookie options that clear the invite session in the browser.
 */
export function getClearedInviteSessionCookieOptions() {
  return {
    ...getInviteSessionCookieOptions(),
    maxAge: 0,
  };
}

async function verifyInviteCode(inviteCode: string): Promise<VerifyInviteResult> {
  const normalizedCode = normalizeInviteCode(inviteCode);
  if (!normalizedCode) {
    return { ok: false, reason: "invalid_invite_code" };
  }

  const inviteCodeHash = hashInviteCode(normalizedCode);
  const rows = await db
    .select({
      id: aiInviteCodes.id,
      codeHash: aiInviteCodes.codeHash,
      status: aiInviteCodes.status,
      tokenQuota: aiInviteCodes.tokenQuota,
      tokensConsumed: aiInviteCodes.tokensConsumed,
    })
    .from(aiInviteCodes)
    .where(eq(aiInviteCodes.codeHash, inviteCodeHash))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return { ok: false, reason: "invalid_invite_code" };
  }

  if (!timingSafeEquals(row.codeHash, inviteCodeHash)) {
    return { ok: false, reason: "invalid_invite_code" };
  }

  if (row.status !== "active") {
    return { ok: false, reason: "invite_code_disabled" };
  }

  const remaining = Number(row.tokenQuota) - Number(row.tokensConsumed);
  if (remaining <= 0) {
    return { ok: false, reason: "invite_code_exhausted" };
  }

  return { ok: true, inviteCodeId: row.id };
}

function normalizeInviteCode(value: string) {
  return value.trim();
}

export function hashInviteCode(inviteCode: string) {
  return crypto.createHmac("sha256", INVITE_CODE_SECRET).update(inviteCode).digest("hex");
}

function hashSessionToken(sessionToken: string) {
  return crypto
    .createHmac("sha256", INVITE_SESSION_SECRET)
    .update(sessionToken)
    .digest("hex");
}

function createSessionToken() {
  return crypto.randomBytes(32).toString("base64url");
}

function timingSafeEquals(left: string, right: string) {
  const leftHash = crypto.createHash("sha256").update(left).digest();
  const rightHash = crypto.createHash("sha256").update(right).digest();
  return crypto.timingSafeEqual(leftHash, rightHash);
}

/**
 * Resolve caller IP from common reverse proxy headers.
 */
export function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

async function loadInviteSessionRow(sessionToken?: string | null) {
  if (!sessionToken) {
    return null;
  }

  const sessionTokenHash = hashSessionToken(sessionToken);
  const now = new Date();

  const rows = await db
    .select({
      sessionId: aiChatSessions.id,
      inviteCodeId: aiInviteCodes.id,
      expiresAt: aiChatSessions.expiresAt,
      inviteLabel: aiInviteCodes.label,
      tokenQuota: aiInviteCodes.tokenQuota,
      tokensConsumed: aiInviteCodes.tokensConsumed,
    })
    .from(aiChatSessions)
    .innerJoin(aiInviteCodes, eq(aiChatSessions.inviteCodeId, aiInviteCodes.id))
    .where(
      and(
        eq(aiChatSessions.sessionTokenHash, sessionTokenHash),
        isNull(aiChatSessions.revokedAt),
        gt(aiChatSessions.expiresAt, now),
        eq(aiInviteCodes.status, "active")
      )
    )
    .limit(1);

  const row = rows[0];
  if (!row) {
    return null;
  }

  await db
    .update(aiChatSessions)
    .set({
      lastSeenAt: now,
      updatedAt: now,
    })
    .where(eq(aiChatSessions.id, row.sessionId));

  return row;
}
