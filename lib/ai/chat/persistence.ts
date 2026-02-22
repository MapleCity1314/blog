import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { aiChatMessages, aiInviteCodes, aiUsageLedger } from "@/lib/db/schema";
import type { PersistChatTurnInput } from "@/lib/ai/chat/types";

/**
 * Persist one completed assistant turn and settle usage atomically.
 *
 * Guarantees:
 * - Quota update, message persistence, and usage ledger insert share one transaction.
 * - Quota is guarded in SQL to avoid concurrent over-consumption.
 */
export async function persistChatTurn(input: PersistChatTurnInput) {
  const inputTokens = Number(input.usage.inputTokens ?? 0);
  const outputTokens = Number(input.usage.outputTokens ?? 0);
  const totalTokens = Number(input.usage.totalTokens ?? inputTokens + outputTokens);
  const now = new Date();

  await db.transaction(async (tx) => {
    const quotaUpdated = await tx
      .update(aiInviteCodes)
      .set({
        tokensConsumed: sql`${aiInviteCodes.tokensConsumed} + ${totalTokens}`,
        lastUsedAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(aiInviteCodes.id, input.inviteCodeId),
          sql`${aiInviteCodes.tokensConsumed} + ${totalTokens} <= ${aiInviteCodes.tokenQuota}`
        )
      )
      .returning({ id: aiInviteCodes.id });

    if (!quotaUpdated[0]) {
      throw new Error("Invite code quota exceeded during settlement.");
    }

    if (input.latestUserMessage) {
      await tx.insert(aiChatMessages).values({
        chatId: input.chatId,
        sessionId: input.sessionId,
        inviteCodeId: input.inviteCodeId,
        role: "user",
        modelAlias: input.modelAlias,
        providerModel: input.providerModel,
        uiMessage: input.latestUserMessage,
      });
    }

    const assistantMessage = {
      id: randomUUID(),
      role: "assistant",
      parts: [{ type: "text", text: input.assistantText }],
    };

    const insertedAssistant = await tx
      .insert(aiChatMessages)
      .values({
        chatId: input.chatId,
        sessionId: input.sessionId,
        inviteCodeId: input.inviteCodeId,
        role: "assistant",
        modelAlias: input.modelAlias,
        providerModel: input.providerModel,
        uiMessage: assistantMessage,
        inputTokens,
        outputTokens,
        totalTokens,
      })
      .returning({ id: aiChatMessages.id });

    await tx.insert(aiUsageLedger).values({
      inviteCodeId: input.inviteCodeId,
      sessionId: input.sessionId,
      chatId: input.chatId,
      messageId: insertedAssistant[0]?.id ?? null,
      entryType: "model_tokens",
      tokenDelta: totalTokens,
      inputTokens,
      outputTokens,
      totalTokens,
      modelAlias: input.modelAlias,
      providerModel: input.providerModel,
    });
  });
}

