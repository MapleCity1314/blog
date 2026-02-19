import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { listSessionConversations } from "@/lib/ai/chat/history";
import { getInviteSessionAuthContext, getInviteSessionCookieName } from "@/lib/ai/invite-session";

export async function GET() {
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

  const conversations = await listSessionConversations(session.sessionId);
  return NextResponse.json({
    conversations,
  });
}

