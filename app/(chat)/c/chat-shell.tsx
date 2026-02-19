"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type ConversationSummary = {
  chatId: string;
  lastMessageAt: string;
  messageCount: number;
};

function formatLastMessageAt(value: string) {
  const date = new Date(value);
  return date.toLocaleString();
}

export default function ChatShell({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    let disposed = false;
    async function loadConversations() {
      setLoading(true);
      try {
        const response = await fetch("/api/chat/conversations", {
          cache: "no-store",
        });
        if (!response.ok) {
          setConversations([]);
          return;
        }
        const payload = (await response.json()) as {
          conversations?: ConversationSummary[];
        };
        if (!disposed) {
          setConversations(Array.isArray(payload.conversations) ? payload.conversations : []);
        }
      } finally {
        if (!disposed) {
          setLoading(false);
        }
      }
    }

    void loadConversations();
    return () => {
      disposed = true;
    };
  }, [pathname]);

  const createHref = useMemo(() => `/c/${crypto.randomUUID()}`, [pathname]);

  return (
    <section className="grid h-full w-full grid-cols-1 md:grid-cols-[18rem_1fr]">
      <aside className="border-b border-border md:border-r md:border-b-0">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium">Chats</h2>
            <Link
              href={createHref}
              className="inline-flex min-h-11 items-center rounded-md border border-border px-3 text-xs hover:bg-accent"
            >
              New
            </Link>
          </div>
          <nav aria-label="Conversation list" className="min-h-0 flex-1 overflow-y-auto p-2">
            {loading ? (
              <p className="px-2 py-3 text-xs text-muted-foreground">Loading…</p>
            ) : conversations.length === 0 ? (
              <p className="px-2 py-3 text-xs text-muted-foreground">No conversations yet.</p>
            ) : (
              <ul className="space-y-1">
                {conversations.map((item) => {
                  const href = `/c/${item.chatId}`;
                  const active = pathname === href;
                  return (
                    <li key={item.chatId}>
                      <Link
                        href={href}
                        className={[
                          "block rounded-md border px-3 py-2 text-xs transition",
                          active
                            ? "border-foreground/30 bg-accent"
                            : "border-transparent hover:border-border hover:bg-accent",
                        ].join(" ")}
                      >
                        <p className="truncate font-mono">{item.chatId}</p>
                        <p className="mt-1 text-muted-foreground">
                          {item.messageCount} messages • {formatLastMessageAt(item.lastMessageAt)}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>
        </div>
      </aside>
      <div className="min-h-0">{children}</div>
    </section>
  );
}

