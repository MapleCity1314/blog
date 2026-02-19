import "server-only";

import { desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { aiInviteCodes, aiUsageLedger } from "@/lib/db/schema";

export type AdminAiInviteItem = {
  id: string;
  label: string | null;
  status: "active" | "disabled";
  tokenQuota: number;
  tokensConsumed: number;
  remainingTokens: number;
  notes: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminAiOverview = {
  totalCodes: number;
  activeCodes: number;
  disabledCodes: number;
  totalQuota: number;
  totalConsumed: number;
  ledgerEntries: number;
};

export async function getAdminAiDashboardData(): Promise<{
  overview: AdminAiOverview;
  invites: AdminAiInviteItem[];
}> {
  const [overviewRow, inviteRows, ledgerRow] = await Promise.all([
    db
      .select({
        totalCodes: sql<number>`count(*)::int`,
        activeCodes:
          sql<number>`count(*) filter (where ${aiInviteCodes.status} = 'active')::int`,
        disabledCodes:
          sql<number>`count(*) filter (where ${aiInviteCodes.status} = 'disabled')::int`,
        totalQuota: sql<number>`coalesce(sum(${aiInviteCodes.tokenQuota}), 0)::int`,
        totalConsumed: sql<number>`coalesce(sum(${aiInviteCodes.tokensConsumed}), 0)::int`,
      })
      .from(aiInviteCodes),
    db
      .select({
        id: aiInviteCodes.id,
        label: aiInviteCodes.label,
        status: aiInviteCodes.status,
        tokenQuota: aiInviteCodes.tokenQuota,
        tokensConsumed: aiInviteCodes.tokensConsumed,
        notes: aiInviteCodes.notes,
        lastUsedAt: aiInviteCodes.lastUsedAt,
        createdAt: aiInviteCodes.createdAt,
        updatedAt: aiInviteCodes.updatedAt,
      })
      .from(aiInviteCodes)
      .orderBy(desc(aiInviteCodes.updatedAt)),
    db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(aiUsageLedger),
  ]);

  const stats = overviewRow[0];
  const ledgerCount = Number(ledgerRow[0]?.count ?? 0);

  return {
    overview: {
      totalCodes: Number(stats?.totalCodes ?? 0),
      activeCodes: Number(stats?.activeCodes ?? 0),
      disabledCodes: Number(stats?.disabledCodes ?? 0),
      totalQuota: Number(stats?.totalQuota ?? 0),
      totalConsumed: Number(stats?.totalConsumed ?? 0),
      ledgerEntries: ledgerCount,
    },
    invites: inviteRows.map((row) => {
      const tokenQuota = Number(row.tokenQuota ?? 0);
      const tokensConsumed = Number(row.tokensConsumed ?? 0);
      return {
        id: row.id,
        label: row.label ?? null,
        status: row.status,
        tokenQuota,
        tokensConsumed,
        remainingTokens: Math.max(tokenQuota - tokensConsumed, 0),
        notes: row.notes ?? null,
        lastUsedAt: row.lastUsedAt ? row.lastUsedAt.toISOString() : null,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      };
    }),
  };
}

