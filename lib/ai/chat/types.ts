import type { LanguageModelUsage, UIMessage } from "ai";
import type { InviteSessionAuthContext } from "@/lib/ai/invite-session";
import type { ChatModelAlias } from "@/lib/ai/models";

/**
 * Stable error codes for the chat API.
 */
export type ChatApiErrorCode =
  | "UNAUTHORIZED"
  | "RATE_LIMITED"
  | "INVALID_REQUEST"
  | "INVITE_CODE_EXHAUSTED"
  | "PROVIDER_NOT_CONFIGURED"
  | "UPSTREAM_ERROR"
  | "INTERNAL_ERROR";

/**
 * Error payload returned by the chat API.
 */
export type ChatApiErrorBody = {
  code: ChatApiErrorCode;
  error: string;
};

/**
 * Request payload accepted by `/api/chat`.
 */
export type ChatRequestPayload = {
  messages?: UIMessage[];
  model?: string;
  chatId?: string;
  webSearchEnabled?: boolean;
};

/**
 * Validated and normalized chat request input.
 */
export type PreparedChatRequest = {
  chatId: string;
  messages: UIMessage[];
  latestUserMessage: UIMessage | undefined;
  modelAlias: ChatModelAlias;
  providerModel: string;
  webSearchEnabled: boolean;
};

/**
 * Input needed to persist one completed chat turn and usage settlement.
 */
export type PersistChatTurnInput = {
  chatId: string;
  modelAlias: ChatModelAlias;
  providerModel: string;
  sessionId: string;
  inviteCodeId: string;
  latestUserMessage: UIMessage | undefined;
  assistantText: string;
  usage: LanguageModelUsage;
};

/**
 * Authenticated context required for serving chat requests.
 */
export type AuthorizedChatContext = {
  session: InviteSessionAuthContext;
};
