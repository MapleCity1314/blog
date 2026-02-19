import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  getConversationAccessStateBySession,
  getConversationMessages,
} from "@/lib/ai/chat/history";
import { verifyConversationShareToken } from "@/lib/ai/chat/share";
import { getInviteSessionAuthContext, getInviteSessionCookieName } from "@/lib/ai/invite-session";
import ChatThreadClient from "./chat-thread-client";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function ConversationPage({
  params,
  searchParams,
}: {
  params: Promise<{ chatId: string }>;
  searchParams: Promise<{ share?: string }>;
}) {
  const { chatId } = await params;
  const { share } = await searchParams;
  const shareToken = String(share ?? "").trim();

  if (!UUID_RE.test(chatId)) {
    notFound();
  }

  const hasValidShare = shareToken
    ? verifyConversationShareToken({ chatId, token: shareToken })
    : false;

  if (!hasValidShare) {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(getInviteSessionCookieName())?.value ?? null;
    const session = await getInviteSessionAuthContext(sessionToken);
    if (!session) {
      redirect("/chat");
    }

    const accessState = await getConversationAccessStateBySession({
      chatId,
      sessionId: session.sessionId,
    });
    if (accessState === "forbidden") {
      redirect("/chat");
    }
  }

  const initialMessages = await getConversationMessages(chatId);

  return (
    <ChatThreadClient
      chatId={chatId}
      initialMessages={initialMessages}
      isSharedReadonly={hasValidShare}
    />
  );
}
