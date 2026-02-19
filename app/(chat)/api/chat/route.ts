import { cookies } from "next/headers";
import { authorizeChatRequest } from "@/lib/ai/chat/access";
import { toChatErrorResponse } from "@/lib/ai/chat/errors";
import { prepareChatRequest, readChatPayload } from "@/lib/ai/chat/request";
import { streamChatResponse } from "@/lib/ai/chat/stream";
import { getInviteSessionCookieName } from "@/lib/ai/invite-session";

/**
 * Stream chat completion for authenticated invite sessions.
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(getInviteSessionCookieName())?.value ?? null;
    const auth = await authorizeChatRequest(request, sessionToken);
    const payload = await readChatPayload(request);
    const prepared = prepareChatRequest(payload);
    return await streamChatResponse({ request: prepared, auth });
  } catch (error) {
    return toChatErrorResponse(error);
  }
}

