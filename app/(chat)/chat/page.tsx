"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, KeyRoundIcon, ShieldCheckIcon } from "lucide-react";
import type { InviteSessionApiResponse } from "@/lib/ai/types";
import { Button } from "@/components/ui/button";

type RequestState = "idle" | "loading";

export default function ChatEntryPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionResponse, setSessionResponse] = useState<InviteSessionApiResponse>({
    ok: true,
    session: {
      authenticated: false,
      expiresAt: null,
      inviteLabel: null,
    },
  });

  useEffect(() => {
    void refreshSession();
  }, []);

  const isSubmitting = requestState === "loading";
  const session = sessionResponse.ok ? sessionResponse.session : null;
  const expiresAtText = useMemo(() => {
    if (!session?.expiresAt) {
      return null;
    }
    return new Date(session.expiresAt).toLocaleString();
  }, [session?.expiresAt]);

  async function refreshSession() {
    setRequestState("loading");
    setErrorMessage(null);
    try {
      const response = await fetch("/api/chat/session", {
        method: "GET",
        cache: "no-store",
      });
      const payload = (await response.json()) as InviteSessionApiResponse;
      setSessionResponse(payload);
      if (!payload.ok) {
        setErrorMessage(payload.error.message);
      }
    } catch {
      setErrorMessage("Failed to load session.");
    } finally {
      setRequestState("idle");
    }
  }

  async function submitInviteCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestState("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/chat/session", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ inviteCode }),
      });

      const payload = (await response.json()) as InviteSessionApiResponse;
      setSessionResponse(payload);
      if (payload.ok) {
        setInviteCode("");
        router.replace(`/c/${crypto.randomUUID()}`);
        return;
      }

      setErrorMessage(payload.error.message);
    } catch {
      setErrorMessage("Failed to verify invite code.");
    } finally {
      setRequestState("idle");
    }
  }

  async function clearSession() {
    setRequestState("loading");
    setErrorMessage(null);
    try {
      const response = await fetch("/api/chat/session", {
        method: "DELETE",
      });
      const payload = (await response.json()) as InviteSessionApiResponse;
      setSessionResponse(payload);
      if (!payload.ok) {
        setErrorMessage(payload.error.message);
      }
    } catch {
      setErrorMessage("Failed to clear session.");
    } finally {
      setRequestState("idle");
    }
  }

  function startNewConversation() {
    router.push(`/c/${crypto.randomUUID()}`);
  }

  return (
    <section className="mx-auto flex h-full w-full max-w-3xl items-center justify-center px-6 py-10">
      <div className="w-full rounded-2xl border border-border/70 bg-background/80 p-6 shadow-xl backdrop-blur md:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">AI Workspace Access</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your invite code to unlock chat. Sessions remain active for 24 hours.
            </p>
          </div>
          <ShieldCheckIcon className="mt-1 size-5 text-muted-foreground" />
        </div>

        <form className="space-y-3" onSubmit={submitInviteCode}>
          <label htmlFor="inviteCode" className="block text-xs font-medium text-muted-foreground">
            Invite Code
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <KeyRoundIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="inviteCode"
                name="inviteCode"
                type="text"
                inputMode="text"
                autoComplete="off"
                value={inviteCode}
                onChange={(event) => setInviteCode(event.target.value)}
                placeholder="e.g. u0-invite-2026-xxxxxx"
                className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-base outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                disabled={isSubmitting}
                aria-invalid={Boolean(errorMessage)}
                required
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="h-12 rounded-xl px-4">
              {isSubmitting ? "Verifying…" : "Continue"}
              <ArrowRightIcon className="ml-1 size-4" />
            </Button>
          </div>
        </form>

        {errorMessage ? (
          <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert" aria-live="polite">
            {errorMessage}
          </p>
        ) : null}

        {session?.authenticated ? (
          <div className="mt-6 rounded-xl border border-border/70 bg-muted/20 p-4">
            <p className="text-sm font-medium">
              Session active{session.inviteLabel ? ` (${session.inviteLabel})` : ""}.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Expires at: {expiresAtText ?? "-"}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" onClick={startNewConversation} className="h-10">
                Start New Chat
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={clearSession}
                disabled={isSubmitting}
                className="h-10"
              >
                Clear Session
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
