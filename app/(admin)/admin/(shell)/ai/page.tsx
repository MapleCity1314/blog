import { createAiInviteCode, updateAiInviteQuota, updateAiInviteStatus } from "./actions";
import { getAdminAiDashboardData } from "@/lib/admin/ai";

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function AdminAiPage() {
  const { overview, invites } = await getAdminAiDashboardData();

  return (
    <div className="space-y-10">
      <section className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tighter italic">AI_Control</h2>
          <p className="text-xs text-muted-foreground">
            Manage AI invite codes, token quota, and usage snapshot.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono uppercase text-muted-foreground/70">
          <span>Total_Codes: {overview.totalCodes}</span>
          <span>Active: {overview.activeCodes}</span>
          <span>Disabled: {overview.disabledCodes}</span>
          <span>Quota: {overview.totalQuota}</span>
          <span>Consumed: {overview.totalConsumed}</span>
          <span>Ledger: {overview.ledgerEntries}</span>
        </div>
      </section>

      <section className="border border-border/60 bg-background/30 p-6">
        <h3 className="mb-4 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">
          Create_Invite_Code
        </h3>
        <form action={createAiInviteCode} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="redirect_to" value="/admin/ai" />
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-muted-foreground">Label</label>
            <input
              name="label"
              placeholder="e.g. internal test"
              className="w-full border border-border/60 bg-background/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-muted-foreground">
              Invite_Code (optional)
            </label>
            <input
              name="invite_code"
              placeholder="leave empty to auto-generate"
              className="w-full border border-border/60 bg-background/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-muted-foreground">
              Token_Quota
            </label>
            <input
              name="token_quota"
              type="number"
              min={0}
              step={1}
              defaultValue={500000}
              required
              className="w-full border border-border/60 bg-background/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-muted-foreground">Notes</label>
            <input
              name="notes"
              placeholder="team / use case / expiry policy"
              className="w-full border border-border/60 bg-background/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button className="inline-flex min-h-11 items-center rounded-md bg-foreground px-4 py-2 text-[11px] font-mono uppercase tracking-widest text-background transition hover:opacity-90">
              Create
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">
          Invite_Codes
        </h3>
        {invites.length === 0 ? (
          <div className="border border-dashed border-border/60 bg-background/20 p-6 text-xs text-muted-foreground">
            No invite code yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {invites.map((invite) => (
              <article key={invite.id} className="border border-border/60 bg-background/30 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{invite.label || "(No label)"}</p>
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">{invite.id}</p>
                  </div>
                  <span className="rounded-full border border-border/60 px-3 py-1 text-[10px] font-mono uppercase text-muted-foreground">
                    {invite.status}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                  <span>quota: {invite.tokenQuota}</span>
                  <span>consumed: {invite.tokensConsumed}</span>
                  <span>remaining: {invite.remainingTokens}</span>
                  <span>last_used: {formatDate(invite.lastUsedAt)}</span>
                  <span>updated: {formatDate(invite.updatedAt)}</span>
                </div>

                {invite.notes ? (
                  <p className="mt-3 text-xs text-muted-foreground">{invite.notes}</p>
                ) : null}

                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <form action={updateAiInviteStatus} className="flex items-center gap-2">
                    <input type="hidden" name="redirect_to" value="/admin/ai" />
                    <input type="hidden" name="id" value={invite.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={invite.status === "active" ? "disabled" : "active"}
                    />
                    <button className="inline-flex min-h-11 items-center rounded-md border border-border px-3 py-2 text-[11px] font-mono uppercase hover:bg-accent">
                      {invite.status === "active" ? "Disable" : "Activate"}
                    </button>
                  </form>

                  <form action={updateAiInviteQuota} className="flex items-end gap-2">
                    <input type="hidden" name="redirect_to" value="/admin/ai" />
                    <input type="hidden" name="id" value={invite.id} />
                    <div className="space-y-1">
                      <label
                        htmlFor={`quota-${invite.id}`}
                        className="text-[10px] font-mono uppercase text-muted-foreground"
                      >
                        Set_Quota
                      </label>
                      <input
                        id={`quota-${invite.id}`}
                        name="token_quota"
                        type="number"
                        min={0}
                        step={1}
                        defaultValue={invite.tokenQuota}
                        className="w-40 border border-border/60 bg-background/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
                      />
                    </div>
                    <button className="inline-flex min-h-11 items-center rounded-md border border-border px-3 py-2 text-[11px] font-mono uppercase hover:bg-accent">
                      Save
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

