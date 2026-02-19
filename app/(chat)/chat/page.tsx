"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { InviteSessionApiResponse } from "@/lib/ai/types";

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
    <section className="mx-auto flex h-full w-full max-w-2xl flex-col justify-center px-6 py-10">
      <h1 className="text-3xl font-light tracking-tight">AI Chat Access</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Enter an invite code to start chatting. A valid session is kept for 24 hours.
      </p>

      <form className="mt-8 space-y-3" onSubmit={submitInviteCode}>
        <label htmlFor="inviteCode" className="block text-sm">
          Invite code
        </label>
        <input
          id="inviteCode"
          name="inviteCode"
          type="text"
          inputMode="text"
          autoComplete="off"
          value={inviteCode}
          onChange={(event) => setInviteCode(event.target.value)}
          placeholder="e.g. u0-invite-2026…"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-base outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
          disabled={isSubmitting}
          aria-invalid={Boolean(errorMessage)}
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-11 items-center rounded-md bg-foreground px-4 py-2 text-sm text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Verifying…" : "Verify Invite Code"}
        </button>
      </form>

      {errorMessage ? (
        <p className="mt-4 text-sm text-destructive" role="alert" aria-live="polite">
          {errorMessage}
        </p>
      ) : null}

      {session?.authenticated ? (
        <div className="mt-8 rounded-lg border border-border p-4">
          <p className="text-sm">
            Session active
            {session.inviteLabel ? ` (${session.inviteLabel})` : ""}.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Expires at: {expiresAtText ?? "-"}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startNewConversation}
              className="inline-flex min-h-11 items-center rounded-md border border-border px-4 py-2 text-sm hover:bg-accent"
            >
              Start New Chat
            </button>
            <button
              type="button"
              onClick={clearSession}
              disabled={isSubmitting}
              className="inline-flex min-h-11 items-center rounded-md border border-border px-4 py-2 text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear Session
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

