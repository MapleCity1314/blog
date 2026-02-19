import { ChatApiError } from "@/lib/ai/chat/errors";
import type { AuthorizedChatContext } from "@/lib/ai/chat/types";
import { getClientIp, getInviteSessionAuthContext } from "@/lib/ai/invite-session";
import { hasProviderConfigForAlias, type ChatModelAlias } from "@/lib/ai/models";
import { checkRateLimit } from "@/lib/security";

const MIN_REMAINING_TOKENS_TO_START = 1;
const CHAT_RATE_LIMIT_MAX = 30;
const CHAT_RATE_LIMIT_WINDOW_MS = 1000 * 60 * 10;

/**
 * Ensure request passes rate limit, invite-session auth, quota, and provider config checks.
 */
export async function authorizeChatRequest(
  request: Request,
  inviteSessionToken?: string | null,
  modelAlias?: ChatModelAlias
): Promise<AuthorizedChatContext> {
  const clientIp = getClientIp(request);
  const rateKey = `chat-stream-post:${clientIp}`;
  const allowed = await checkRateLimit(
    rateKey,
    CHAT_RATE_LIMIT_MAX,
    CHAT_RATE_LIMIT_WINDOW_MS
  );
  if (!allowed) {
    throw new ChatApiError("RATE_LIMITED", 429, "Too many requests. Please try again later.");
  }

  const session = await getInviteSessionAuthContext(inviteSessionToken);
  if (!session) {
    throw new ChatApiError("UNAUTHORIZED", 401, "Invite session is required.");
  }

  const remaining = session.tokenQuota - session.tokensConsumed;
  if (remaining < MIN_REMAINING_TOKENS_TO_START) {
    throw new ChatApiError("INVITE_CODE_EXHAUSTED", 403, "Invite code quota exceeded.");
  }

  if (modelAlias && !hasProviderConfigForAlias(modelAlias)) {
    throw new ChatApiError(
      "PROVIDER_NOT_CONFIGURED",
      500,
      `Model provider is not configured for ${modelAlias}.`
    );
  }

  return { session };
}
