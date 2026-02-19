"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { InviteSessionApiResponse } from "@/lib/ai/types";

type RequestState = "idle" | "loading";

export default function PreviewInviteEntry() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSubmitting = requestState === "loading";

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
      if (payload.ok) {
        setInviteCode("");
        router.push(`/c/${crypto.randomUUID()}`);
        return;
      }

      setErrorMessage(payload.error.message);
    } catch {
      setErrorMessage("Failed to verify invite code.");
    } finally {
      setRequestState("idle");
    }
  }

  return (
    <section className="relative z-30 mt-10 w-full max-w-xl px-6">
      <form
        className="rounded-xl border border-border/60 bg-background/70 p-4 backdrop-blur"
        onSubmit={submitInviteCode}
      >
        <label htmlFor="previewInviteCode" className="mb-2 block text-xs text-muted-foreground">
          Invite code
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="previewInviteCode"
            name="inviteCode"
            type="text"
            inputMode="text"
            autoComplete="off"
            value={inviteCode}
            onChange={(event) => setInviteCode(event.target.value)}
            placeholder="e.g. u0-invite-2026…"
            className="min-h-11 flex-1 rounded-md border border-border bg-background px-3 py-2 text-base outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
            disabled={isSubmitting}
            aria-invalid={Boolean(errorMessage)}
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Verifying…" : "Enter Chat"}
          </button>
        </div>
        {errorMessage ? (
          <p className="mt-2 text-sm text-destructive" role="alert" aria-live="polite">
            {errorMessage}
          </p>
        ) : null}
      </form>
    </section>
  );
}

