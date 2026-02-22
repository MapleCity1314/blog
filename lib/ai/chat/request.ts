import { randomUUID } from "node:crypto";
import type { UIMessage } from "ai";
import { ChatApiError } from "@/lib/ai/chat/errors";
import type { ChatRequestPayload, PreparedChatRequest } from "@/lib/ai/chat/types";
import { getProviderModelIdByAlias, resolveChatModelAlias } from "@/lib/ai/models";

/**
 * Parse and validate raw request JSON payload.
 */
export function parseChatRequestPayload(raw: unknown): ChatRequestPayload {
  if (!raw || typeof raw !== "object") {
    throw new ChatApiError("INVALID_REQUEST", 400, "Invalid request payload.");
  }

  return raw as ChatRequestPayload;
}

/**
 * Normalize request payload into an internal form used by streaming/persistence.
 */
export function prepareChatRequest(payload: ChatRequestPayload): PreparedChatRequest {
  const messages = Array.isArray(payload.messages) ? payload.messages : [];
  if (messages.length === 0) {
    throw new ChatApiError("INVALID_REQUEST", 400, "At least one UIMessage is required.");
  }

  const modelAlias = resolveChatModelAlias(payload.model);

  return {
    chatId: normalizeChatId(payload.chatId),
    messages,
    latestUserMessage: findLatestUserMessage(messages),
    modelAlias,
    providerModel: getProviderModelIdByAlias(modelAlias),
    webSearchEnabled: Boolean(payload.webSearchEnabled),
  };
}

/**
 * Parse `Request.json()` and produce validated chat payload.
 */
export async function readChatPayload(request: Request): Promise<ChatRequestPayload> {
  try {
    const raw = await request.json();
    return parseChatRequestPayload(raw);
  } catch {
    throw new ChatApiError("INVALID_REQUEST", 400, "Invalid request payload.");
  }
}

function findLatestUserMessage(messages: UIMessage[]) {
  return [...messages].reverse().find((item) => item.role === "user");
}

function normalizeChatId(value: string | null | undefined) {
  const candidate = (value ?? "").trim();
  if (!candidate) {
    return randomUUID();
  }

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(candidate)) {
    return candidate;
  }

  return randomUUID();
}
