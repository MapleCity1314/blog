import { convertToModelMessages, streamText } from "ai";
import { resolveChatModel } from "@/lib/ai/models";
import { persistChatTurn } from "@/lib/ai/chat/persistence";
import type { AuthorizedChatContext, PreparedChatRequest } from "@/lib/ai/chat/types";

/**
 * Stream assistant output and persist the completed turn on finish.
 */
export async function streamChatResponse(input: {
  request: PreparedChatRequest;
  auth: AuthorizedChatContext;
}) {
  const { request, auth } = input;
  const modelMessages = await convertToModelMessages(
    request.messages.map(({ id: _id, ...rest }) => rest)
  );

  const result = streamText({
    model: resolveChatModel(request.modelAlias),
    messages: modelMessages,
    onFinish: async (event) => {
      try {
        await persistChatTurn({
          chatId: request.chatId,
          modelAlias: request.modelAlias,
          providerModel: request.providerModel,
          sessionId: auth.session.sessionId,
          inviteCodeId: auth.session.inviteCodeId,
          latestUserMessage: request.latestUserMessage,
          assistantText: event.text,
          usage: event.totalUsage,
        });
      } catch (error) {
        console.error("Failed to persist chat turn:", error);
      }
    },
  });

  return result.toUIMessageStreamResponse({
    headers: {
      "x-chat-id": request.chatId,
      "x-model-alias": request.modelAlias,
    },
  });
}
