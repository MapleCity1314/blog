import { createGateway } from "@ai-sdk/gateway";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Public model aliases exposed to the client.
 */
export type ChatModelAlias = "u0-mini" | "u0-pro" | "u0-max";

const MODEL_ALIAS_MAP: Record<ChatModelAlias, string> = {
  "u0-mini": "openai/gpt-4.1-mini",
  "u0-pro": "moonshot-v1-8k",
  "u0-max": "openai/gpt-5",
};

const gatewayProvider = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? process.env.VERCEL_AI_GATEWAY_API_KEY,
});
const kimiBaseUrl = process.env.KIMI_BASE_URL?.trim() ?? "";
const kimiApiKey = process.env.KIMI_API_KEY?.trim() ?? "";
const kimiProvider =
  kimiBaseUrl && kimiApiKey
    ? createOpenAICompatible({
        name: "kimi",
        baseURL: kimiBaseUrl,
        apiKey: kimiApiKey,
      })
    : null;

export function resolveChatModelAlias(value: string | null | undefined): ChatModelAlias {
  if (value === "u0-pro" || value === "u0-max") {
    return value;
  }
  return "u0-mini";
}

/**
 * Resolve provider model id by public alias.
 */
export function getProviderModelIdByAlias(alias: ChatModelAlias) {
  return MODEL_ALIAS_MAP[alias];
}

/**
 * Check whether provider credentials are configured for the requested alias.
 */
export function hasProviderConfigForAlias(alias: ChatModelAlias) {
  if (alias === "u0-pro") {
    return Boolean(kimiProvider);
  }
  return Boolean(process.env.AI_GATEWAY_API_KEY ?? process.env.VERCEL_AI_GATEWAY_API_KEY);
}

/**
 * Resolve a language model instance from public alias.
 */
export function resolveChatModel(alias: ChatModelAlias) {
  if (alias === "u0-pro" && kimiProvider) {
    return kimiProvider.chatModel(getProviderModelIdByAlias(alias));
  }
  return gatewayProvider(getProviderModelIdByAlias(alias));
}
