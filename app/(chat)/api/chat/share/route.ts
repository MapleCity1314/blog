import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { canAccessConversationBySession } from "@/lib/ai/chat/history";
import { createConversationShareToken } from "@/lib/ai/chat/share";
import { getInviteSessionAuthContext, getInviteSessionCookieName } from "@/lib/ai/invite-session";
import { getSiteBaseUrl } from "@/lib/security";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
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

  let chatId = "";
  try {
    const body = (await request.json()) as { chatId?: string };
    chatId = String(body.chatId ?? "").trim();
  } catch {
    return NextResponse.json(
      {
        code: "INVALID_REQUEST",
        error: "Invalid request payload.",
      },
      { status: 400 }
    );
  }

  if (!UUID_RE.test(chatId)) {
    return NextResponse.json(
      {
        code: "INVALID_REQUEST",
        error: "chatId must be a UUID.",
      },
      { status: 400 }
    );
  }

  const canAccess = await canAccessConversationBySession({
    chatId,
    sessionId: session.sessionId,
  });
  if (!canAccess) {
    return NextResponse.json(
      {
        code: "UNAUTHORIZED",
        error: "Conversation does not belong to current session.",
      },
      { status: 403 }
    );
  }

  const shareToken = createConversationShareToken({ chatId });
  const baseUrl = getSiteBaseUrl();
  const shareUrl = `${baseUrl}/c/${chatId}?share=${encodeURIComponent(shareToken)}`;

  return NextResponse.json({
    chatId,
    shareUrl,
  });
}

