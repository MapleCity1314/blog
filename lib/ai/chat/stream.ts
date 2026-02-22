import { convertToModelMessages, jsonSchema, streamText, tool } from "ai";
import { resolveChatModel } from "@/lib/ai/models";
import { persistChatTurn } from "@/lib/ai/chat/persistence";
import type { AuthorizedChatContext, PreparedChatRequest } from "@/lib/ai/chat/types";

type TavilySearchResponse = {
  answer?: string;
  results?: Array<{
    title?: string;
    url?: string;
    content?: string;
    score?: number;
  }>;
};

function createTavilySearchTool() {
  return tool({
    description:
      "Search the live web via Tavily. Use this when the user asks for recent facts, news, or external references.",
    inputSchema: jsonSchema<{ query: string; maxResults?: number }>({
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query keywords.",
        },
        maxResults: {
          type: "integer",
          minimum: 1,
          maximum: 10,
          description: "Maximum number of returned results.",
        },
      },
      required: ["query"],
      additionalProperties: false,
    } as const),
    execute: async (input) => {
      const query = typeof input.query === "string" ? input.query.trim() : "";
      const maxResults =
        typeof input.maxResults === "number" && Number.isFinite(input.maxResults)
          ? input.maxResults
          : 5;
      if (!query) {
        return {
          error: "Missing search query.",
        };
      }
      const apiKey = process.env.TAVILY_API_KEY?.trim() ?? "";
      if (!apiKey) {
        return {
          error: "TAVILY_API_KEY is not configured on the server.",
        };
      }

      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          api_key: apiKey,
          query,
          search_depth: "basic",
          max_results: Math.max(1, Math.min(10, Number(maxResults) || 5)),
          include_answer: true,
          include_raw_content: false,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        return {
          error: `Tavily request failed (${response.status}).`,
          details: body.slice(0, 400),
        };
      }

      const payload = (await response.json()) as TavilySearchResponse;
      return {
        answer: payload.answer ?? null,
        results: Array.isArray(payload.results)
          ? payload.results.slice(0, 10).map((item) => ({
              title: item.title ?? "",
              url: item.url ?? "",
              content: item.content ?? "",
              score: item.score ?? null,
            }))
          : [],
      };
    },
  });
}

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
    tools: request.webSearchEnabled
      ? {
          tavilySearch: createTavilySearchTool(),
        }
      : undefined,
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
      "x-web-search-enabled": request.webSearchEnabled ? "1" : "0",
    },
  });
}
