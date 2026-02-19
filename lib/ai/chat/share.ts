import "server-only";

import crypto from "node:crypto";

const DEFAULT_SHARE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const SHARE_SECRET = process.env.AI_CHAT_SHARE_SECRET ?? "blog-ai-chat-share-secret";

type SharePayload = {
  c: string;
  exp: number;
};

export function createConversationShareToken(input: {
  chatId: string;
  maxAgeSeconds?: number;
}) {
  const maxAgeSeconds = input.maxAgeSeconds ?? DEFAULT_SHARE_MAX_AGE_SECONDS;
  const payload: SharePayload = {
    c: input.chatId,
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifyConversationShareToken(input: { chatId: string; token: string }) {
  const [encoded, signature] = input.token.split(".");
  if (!encoded || !signature) {
    return false;
  }

  const expectedSignature = sign(encoded);
  if (!timingSafeEquals(expectedSignature, signature)) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as SharePayload;
    const now = Math.floor(Date.now() / 1000);
    if (!payload?.c || typeof payload.exp !== "number") {
      return false;
    }
    if (payload.exp <= now) {
      return false;
    }
    return payload.c === input.chatId;
  } catch {
    return false;
  }
}

function sign(encodedPayload: string) {
  return crypto.createHmac("sha256", SHARE_SECRET).update(encodedPayload).digest("base64url");
}

function timingSafeEquals(left: string, right: string) {
  const leftHash = crypto.createHash("sha256").update(left).digest();
  const rightHash = crypto.createHash("sha256").update(right).digest();
  return crypto.timingSafeEqual(leftHash, rightHash);
}

