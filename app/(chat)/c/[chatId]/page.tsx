"use client";

import type { UIMessage } from "ai";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useParams, useSearchParams } from "next/navigation";

type RequestState = "idle" | "loading";

function getMessageText(message: UIMessage) {
  const parts = Array.isArray(message.parts) ? message.parts : [];
  return parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

export default function ConversationPage() {
  const params = useParams<{ chatId: string }>();
  const searchParams = useSearchParams();
  const chatId = String(params.chatId ?? "");
  const shareToken = String(searchParams.get("share") ?? "");
  const isSharedReadonly = shareToken.length > 0;

  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [text, setText] = useState("");
  const [model, setModel] = useState("u0-mini");
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const canSend = requestState === "idle" && text.trim().length > 0 && !isSharedReadonly;

  const historyUrl = useMemo(() => {
    const qs = new URLSearchParams({ chatId });
    if (shareToken) {
      qs.set("share", shareToken);
    }
    return `/api/chat/history?${qs.toString()}`;
  }, [chatId, shareToken]);

  useEffect(() => {
    let disposed = false;
    async function loadHistory() {
      setRequestState("loading");
      setErrorMessage(null);
      try {
        const response = await fetch(historyUrl, {
          cache: "no-store",
        });
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          if (!disposed) {
            setErrorMessage(payload?.error ?? "Failed to load conversation.");
            setMessages([]);
          }
          return;
        }
        const payload = (await response.json()) as { messages?: UIMessage[] };
        if (!disposed) {
          setMessages(Array.isArray(payload.messages) ? payload.messages : []);
        }
      } catch {
        if (!disposed) {
          setErrorMessage("Failed to load conversation.");
          setMessages([]);
        }
      } finally {
        if (!disposed) {
          setRequestState("idle");
        }
      }
    }

    void loadHistory();
    return () => {
      disposed = true;
    };
  }, [historyUrl]);

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isSharedReadonly) {
      return;
    }

    const userMessage: UIMessage = {
      id: crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", text: trimmed }],
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setText("");
    setRequestState("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          model,
          messages: nextMessages,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setErrorMessage(payload?.error ?? "Failed to send message.");
        setMessages(messages);
        return;
      }

      // We currently rely on persisted messages as source-of-truth.
      await response.text();
      const refresh = await fetch(`/api/chat/history?chatId=${encodeURIComponent(chatId)}`, {
        cache: "no-store",
      });
      if (refresh.ok) {
        const payload = (await refresh.json()) as { messages?: UIMessage[] };
        setMessages(Array.isArray(payload.messages) ? payload.messages : nextMessages);
      }
    } catch {
      setErrorMessage("Failed to send message.");
      setMessages(messages);
    } finally {
      setRequestState("idle");
    }
  }

  async function shareConversation() {
    setErrorMessage(null);
    setShareUrl(null);
    try {
      const response = await fetch("/api/chat/share", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ chatId }),
      });
      const payload = (await response.json()) as { shareUrl?: string; error?: string };
      if (!response.ok || !payload.shareUrl) {
        setErrorMessage(payload.error ?? "Failed to create share link.");
        return;
      }
      setShareUrl(payload.shareUrl);
      await navigator.clipboard.writeText(payload.shareUrl);
    } catch {
      setErrorMessage("Failed to create share link.");
    }
  }

  return (
    <section className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h1 className="text-sm font-medium">Conversation</h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{chatId}</p>
        </div>
        <div className="flex items-center gap-2">
          {!isSharedReadonly ? (
            <button
              type="button"
              onClick={shareConversation}
              className="inline-flex min-h-11 items-center rounded-md border border-border px-3 text-xs hover:bg-accent"
            >
              Share
            </button>
          ) : null}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No messages yet. Send your first message to start this conversation.
          </p>
        ) : (
          <ol className="space-y-3">
            {messages.map((message) => (
              <li key={message.id} className="rounded-md border border-border p-3">
                <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                  {message.role}
                </p>
                <p className="whitespace-pre-wrap text-sm">
                  {getMessageText(message) || "[Unsupported message part]"}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>

      {shareUrl ? (
        <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground" aria-live="polite">
          Share link copied: {shareUrl}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="border-t border-border px-4 py-2 text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {!isSharedReadonly ? (
        <form onSubmit={submitMessage} className="border-t border-border px-4 py-3">
          <div className="mb-2 flex items-center gap-2">
            <label htmlFor="model" className="text-xs text-muted-foreground">
              Model
            </label>
            <select
              id="model"
              name="model"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              className="h-9 rounded-md border border-border bg-background px-2 text-sm"
            >
              <option value="u0-mini">u0-mini</option>
              <option value="u0-pro">u0-pro</option>
              <option value="u0-max">u0-max</option>
            </select>
          </div>
          <label htmlFor="prompt" className="sr-only">
            Message
          </label>
          <div className="flex items-end gap-2">
            <textarea
              id="prompt"
              name="prompt"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Type your message…"
              className="min-h-24 flex-1 rounded-md border border-border bg-background px-3 py-2 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="submit"
              disabled={!canSend}
              className="inline-flex min-h-11 items-center rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {requestState === "loading" ? "Sending…" : "Send"}
            </button>
          </div>
        </form>
      ) : (
        <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          This is a shared read-only conversation.
        </p>
      )}
    </section>
  );
}
