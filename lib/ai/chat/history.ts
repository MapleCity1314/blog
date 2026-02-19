import "server-only";

import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { UIMessage } from "ai";
import { db } from "@/lib/db";
import { aiChatMessages } from "@/lib/db/schema";

export type ConversationSummary = {
  chatId: string;
  lastMessageAt: string;
  messageCount: number;
};

export async function listSessionConversations(
  sessionId: string
): Promise<ConversationSummary[]> {
  const rows = await db
    .select({
      chatId: aiChatMessages.chatId,
      lastMessageAt: sql<Date>`max(${aiChatMessages.createdAt})`,
      messageCount: sql<number>`count(*)::int`,
    })
    .from(aiChatMessages)
    .where(eq(aiChatMessages.sessionId, sessionId))
    .groupBy(aiChatMessages.chatId)
    .orderBy(desc(sql`max(${aiChatMessages.createdAt})`));

  return rows.map((row) => ({
    chatId: row.chatId,
    lastMessageAt:
      row.lastMessageAt instanceof Date
        ? row.lastMessageAt.toISOString()
        : new Date(row.lastMessageAt).toISOString(),
    messageCount: Number(row.messageCount),
  }));
}

export async function canAccessConversationBySession(input: {
  chatId: string;
  sessionId: string;
}) {
  const rows = await db
    .select({ id: aiChatMessages.id })
    .from(aiChatMessages)
    .where(
      and(
        eq(aiChatMessages.chatId, input.chatId),
        eq(aiChatMessages.sessionId, input.sessionId)
      )
    )
    .limit(1);

  return Boolean(rows[0]);
}

export async function getConversationMessages(chatId: string): Promise<UIMessage[]> {
  const rows = await db
    .select({
      uiMessage: aiChatMessages.uiMessage,
    })
    .from(aiChatMessages)
    .where(eq(aiChatMessages.chatId, chatId))
    .orderBy(asc(aiChatMessages.createdAt));

  return rows
    .map((row) => row.uiMessage as UIMessage | null)
    .filter((item): item is UIMessage => item !== null);
}
