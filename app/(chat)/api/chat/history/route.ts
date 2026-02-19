import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getConversationAccessStateBySession,
  getConversationMessages,
} from "@/lib/ai/chat/history";
import { verifyConversationShareToken } from "@/lib/ai/chat/share";
import { getInviteSessionAuthContext, getInviteSessionCookieName } from "@/lib/ai/invite-session";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const chatId = String(url.searchParams.get("chatId") ?? "").trim();
  const shareToken = String(url.searchParams.get("share") ?? "").trim();

  if (!UUID_RE.test(chatId)) {
    return NextResponse.json(
      {
        code: "INVALID_REQUEST",
        error: "chatId must be a UUID.",
      },
      { status: 400 }
    );
  }

  const hasValidShare = shareToken
    ? verifyConversationShareToken({ chatId, token: shareToken })
    : false;

  if (!hasValidShare) {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(getInviteSessionCookieName())?.value ?? null;
    const session = await getInviteSessionAuthContext(sessionToken);
    if (!session) {
      return NextResponse.json(
        {
          code: "UNAUTHORIZED",
          error: "Invite session is required.",
        },
        { status: 401 }
      );
    }

    const accessState = await getConversationAccessStateBySession({
      chatId,
      sessionId: session.sessionId,
    });
    if (accessState === "forbidden") {
      return NextResponse.json(
        {
          code: "UNAUTHORIZED",
          error: "Conversation does not belong to current session.",
        },
        { status: 403 }
      );
    }
  }

  const messages = await getConversationMessages(chatId);
  return NextResponse.json({
    chatId,
    shared: hasValidShare,
    messages,
  });
}
