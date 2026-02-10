import { AlertCircle, Globe, Link2, Mail, Shield } from "lucide-react";
import { getFriendRequests } from "@/lib/friends/store";
import ActionButton from "./action-button";
import { approveFriendRequest, rejectFriendRequest } from "./actions";

const formatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value?: Date | null) {
  if (!value) return "—";
  return formatter.format(value);
}

export default async function AdminFriendsPage() {
  const requests = await getFriendRequests();
  const pending = requests.filter((request) => request.status === "pending");
  const pendingAccess = pending.filter(
    (request) => !request.name && !request.url
  );
  const pendingFriends = pending.filter(
    (request) => request.name && request.url
  );
  const history = requests
    .filter((request) => request.status !== "pending")
    .slice()
    .reverse();

  return (
    <div className="max-w-5xl space-y-10">
      <div className="bg-primary/5 border border-primary/20 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-mono font-bold text-primary uppercase mb-1">
            Network_Approvals
          </h2>
          <p className="text-xs text-muted-foreground">
            Review access tokens and friend submissions before they go live.
          </p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono uppercase text-muted-foreground">
          <span>Pending: {pending.length}</span>
          <span>History: {history.length}</span>
        </div>
      </div>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Shield size={16} />
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest">
              Pending_Access_Tokens
            </h3>
          </div>
          <span className="text-[10px] font-mono uppercase text-muted-foreground/60">
            {pendingAccess.length} waiting
          </span>
        </header>

        {pendingAccess.length === 0 ? (
          <div className="border border-dashed border-border/60 bg-background/20 p-6 text-xs text-muted-foreground">
            No access requests waiting for approval.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingAccess.map((request) => (
              <div
                key={request.id}
                className="flex flex-col gap-4 border border-border/60 bg-background/30 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="font-mono uppercase text-foreground">
                    Token: {request.token}
                  </p>
                  <p>Requested: {formatDate(request.createdAt)}</p>
                  <p>Expires: {formatDate(request.expiresAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <form action={approveFriendRequest}>
                    <input type="hidden" name="id" value={request.id} />
                    <ActionButton label="Approve" />
                  </form>
                  <form action={rejectFriendRequest}>
                    <input type="hidden" name="id" value={request.id} />
                    <ActionButton label="Reject" variant="reject" />
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Mail size={16} />
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest">
              Pending_Friend_Requests
            </h3>
          </div>
          <span className="text-[10px] font-mono uppercase text-muted-foreground/60">
            {pendingFriends.length} waiting
          </span>
        </header>

        {pendingFriends.length === 0 ? (
          <div className="border border-dashed border-border/60 bg-background/20 p-6 text-xs text-muted-foreground">
            No friend submissions waiting for review.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingFriends.map((request) => (
              <div
                key={request.id}
                className="flex flex-col gap-4 border border-border/60 bg-background/30 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-muted flex items-center justify-center">
                    <Globe size={18} className="text-muted-foreground/50" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold uppercase italic">
                        {request.name}
                      </span>
                      {request.color ? (
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-border"
                          style={{ backgroundColor: request.color }}
                          aria-hidden
                        />
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                      <Link2 size={10} />
                      {request.url ? (
                        <a
                          href={request.url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-primary"
                        >
                          {request.url}
                        </a>
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {request.role ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {request.desc ?? "—"}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground/60 uppercase">
                      Submitted: {formatDate(request.usedAt ?? request.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <form action={approveFriendRequest}>
                    <input type="hidden" name="id" value={request.id} />
                    <ActionButton label="Approve" />
                  </form>
                  <form action={rejectFriendRequest}>
                    <input type="hidden" name="id" value={request.id} />
                    <ActionButton label="Reject" variant="reject" />
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <header className="flex items-center gap-3 text-muted-foreground">
          <AlertCircle size={16} />
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest">
            Review_History
          </h3>
        </header>

        {history.length === 0 ? (
          <div className="border border-dashed border-border/60 bg-background/20 p-6 text-xs text-muted-foreground">
            No approvals or rejections recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((request) => (
              <div
                key={request.id}
                className="flex flex-col gap-2 border border-border/60 bg-background/20 p-4 text-xs text-muted-foreground"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono uppercase text-foreground">
                    {request.name ?? "Access_Token"}
                  </span>
                  <span className="text-[10px] font-mono uppercase">
                    {request.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-[10px] font-mono uppercase text-muted-foreground/60">
                  <span>Requested: {formatDate(request.createdAt)}</span>
                  <span>Reviewed: {formatDate(request.reviewedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
